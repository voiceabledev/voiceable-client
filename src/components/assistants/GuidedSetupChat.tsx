import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Send, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/api";
import { sendChatGPTMessage, type ChatMessage as ChatGPTMessage } from "@/services/chatgptService";
import { parseActionFromResponse, validateAction, type WizardAction } from "@/utils/wizardActions";
import { executeAction } from "@/utils/wizardActionExecutor";
import { useWizardContext, WizardContextValue } from "./wizard/WizardContextProvider";
import type { WizardContext, IntegrationFlowContext } from "@/utils/setupAssistantPrompts";
import { crmProviders, schedulingProviders } from "@/constants/integrations";
import { integrationsApi, agentFunctionsApi, agentsApi, workflowsApi } from "@/lib/api";
import type { UserIntegration } from "@/types/integrations";
import type { ToolInChain } from "@/types/functions";

type ChatButton = {
  label: string;
  value: string;
  action?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
  showTyping?: boolean;
  actionPerformed?: string;
  buttons?: ChatButton[];
};

interface GuidedSetupChatProps {
  agentId?: string;
  agent: Agent | null;
  onComplete?: () => void;
  onClose?: () => void;
  wizardContext?: WizardContextValue;
  renderMode?: "portal" | "inline";
  startMinimized?: boolean;
  onFunctionEnabled?: () => void; // Callback to trigger UI refresh (kept for backward compatibility)
  onMinimizedChange?: (minimized: boolean) => void; // Callback when minimized state changes
  disableInput?: boolean; // Hide input field and send button when true
  onIntegrationSaved?: (integrationType: string) => void; // Callback when integration is saved to trigger workflow update
}

const STEP_NAMES = [
  "Template & Name",
  "Model Selection",
  "Voice & Language",
  "Call Outcomes",
  "Agent Behaviour",
  "Integrations"
];

export interface GuidedSetupChatRef {
  handleIntegrationSaved: (integrationType: string) => Promise<void>;
}

export const GuidedSetupChat = forwardRef<GuidedSetupChatRef, GuidedSetupChatProps>(({
  agentId,
  agent,
  onComplete,
  onClose,
  wizardContext: externalWizardContext,
  renderMode = "portal",
  startMinimized = false,
  onFunctionEnabled,
  onMinimizedChange,
  disableInput = false,
  onIntegrationSaved: externalOnIntegrationSaved,
}, ref) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(startMinimized);
  
  // Wrapper to notify parent of minimized state changes
  const handleMinimizedChange = useCallback((minimized: boolean) => {
    setIsMinimized(minimized);
    onMinimizedChange?.(minimized);
  }, [onMinimizedChange]);

  // Sync initial minimized state with parent
  useEffect(() => {
    onMinimizedChange?.(startMinimized);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProactiveStepRef = useRef<number | null>(null);
  const isProvidingGuidanceRef = useRef(false);
  const initializationDoneRef = useRef<string | null>(null); // Track agentId we initialized for
  const welcomeMessageSentRef = useRef(false); // Track if welcome message for step 5 has been sent
  
  // Integration flow state - now using ChatGPT-driven phases
  type IntegrationFlowPhase = IntegrationFlowContext['phase'];
  const [integrationFlowPhase, setIntegrationFlowPhase] = useState<IntegrationFlowPhase>('initial');
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  const [previousModalState, setPreviousModalState] = useState(false);
  const integrationFlowStartedRef = useRef(false);
  // Track what has been asked/answered to prevent re-asking
  const [crmSkipped, setCrmSkipped] = useState(false);
  const [schedulingSkipped, setSchedulingSkipped] = useState(false);
  // Workflow creation state
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null);
  const [workflowTools, setWorkflowTools] = useState<Set<string>>(new Set());
  // Flag to track if we're waiting for ChatGPT response
  const [awaitingChatGPTResponse, setAwaitingChatGPTResponse] = useState(false);
  // Track when integration is saved to trigger workflow update
  const [savedIntegrationType, setSavedIntegrationType] = useState<string | null>(null);
  
  // Try to use wizard context if available
  let wizardContext: WizardContextValue | null = externalWizardContext || null;
  try {
    if (!wizardContext) {
      wizardContext = useWizardContext();
    }
  } catch {
    // Context not available, will work without it
    wizardContext = null;
  }

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset refs when agentId changes
  useEffect(() => {
    const currentAgentId = agentId || 'no-agent';
    if (initializationDoneRef.current && initializationDoneRef.current !== currentAgentId) {
      // Agent changed, reset refs
      lastProactiveStepRef.current = null;
      isProvidingGuidanceRef.current = false;
    }
  }, [agentId]);

  // Load connected integrations for THIS agent (not all user integrations)
  const loadConnectedIntegrations = useCallback(async () => {
    try {
      const connected = new Set<string>();
      
      // If we have an agent, check its integration_tools
      if (agentId && agent) {
        if (agent.integration_tools) {
          const integrationTools = agent.integration_tools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
          Object.keys(integrationTools).forEach((integrationType) => {
            connected.add(integrationType);
          });
        }
        console.log('[GuidedSetupChat] Loaded integrations from agent:', Array.from(connected), 'agentId:', agentId);
      } else if (wizardContext?.formValues?.integrationTools) {
        // For new agents, check wizard context form values
        const integrationTools = wizardContext.formValues.integrationTools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
        Object.keys(integrationTools).forEach((integrationType) => {
          connected.add(integrationType);
        });
        console.log('[GuidedSetupChat] Loaded integrations from wizard context:', Array.from(connected));
      } else {
        // No agent yet and no wizard context, return empty
        console.log('[GuidedSetupChat] No agent or wizard context, no integrations connected');
      }
      
      setConnectedIntegrations(connected);
      return connected;
    } catch (error) {
      console.error('Error loading connected integrations:', error);
      return new Set<string>();
    }
  }, [agentId, agent, wizardContext]);

  useEffect(() => {
    loadConnectedIntegrations();
  }, [loadConnectedIntegrations, agentId, agent]);

  // Initialize chat with welcome message (only once per agentId, but not for step 5)
  useEffect(() => {
    const currentAgentId = agentId || 'no-agent';
    if (messages.length === 0 && initializationDoneRef.current !== currentAgentId && wizardContext?.currentStep !== 5) {
      initializationDoneRef.current = currentAgentId;
      setTimeout(() => {
        addSystemMessage("Hello! I'm here to help you set up your Voiceable assistant. Let me guide you through the process.");
        setTimeout(() => {
          if (!isProvidingGuidanceRef.current && wizardContext?.currentStep !== 5) {
            provideProactiveGuidance();
          }
        }, 1000);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, agent, messages.length, wizardContext?.currentStep]);

  // Monitor wizard state changes for proactive guidance (disabled to prevent multiple calls)
  // Only provide proactive guidance when explicitly requested or on initial load
  // useEffect(() => {
  //   if (wizardContext && messages.length > 0 && !waitingForUser && !isProcessing) {
  //     const currentStep = wizardContext.currentStep;
  //     // Only provide guidance if step actually changed and we haven't provided guidance for this step
  //     if (currentStep !== undefined && 
  //         currentStep !== lastProactiveStepRef.current &&
  //         !isProvidingGuidanceRef.current) {
  //       lastProactiveStepRef.current = currentStep;
  //       // Provide guidance when step changes (but not immediately after user action)
  //       setTimeout(() => {
  //         if (!waitingForUser && !isProcessing && !isProvidingGuidanceRef.current) {
  //           provideProactiveGuidance();
  //         }
  //       }, 2000);
  //     }
  //   }
  // }, [wizardContext?.currentStep, waitingForUser, isProcessing]);

  const addSystemMessage = useCallback((text: string, messageId?: string, buttons?: ChatButton[], delay: number = 0) => {
    const message: ChatMessage = {
      id: messageId || `msg-${Date.now()}-${Math.random()}`,
      role: "system",
      text,
      timestamp: new Date(),
      buttons,
    };

    if (delay > 0) {
      setTimeout(() => {
        setMessages((prev) => [...prev, message]);
      }, delay);
    } else {
      setMessages((prev) => [...prev, message]);
    }
  }, []);

  // Generate workflow name based on tools
  const generateWorkflowName = useCallback((tools: ToolInChain[]): string => {
    const toolNames = tools.map(t => {
      if (t.type === 'twilio') return 'SMS';
      if (t.type === 'calcom') return 'Cal.com';
      if (t.type === 'calendly') return 'Calendly';
      if (t.type === 'google_calendar') return 'Google Calendar';
      if (t.type === 'pipedrive') return 'Pipedrive';
      if (t.type === 'hubspot') return 'HubSpot';
      if (t.type === 'kommo') return 'Kommo';
      return t.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    });
    return toolNames.join(' + ');
  }, []);

  // Load existing workflow if it exists
  const loadExistingWorkflow = useCallback(async () => {
    if (!agentId || currentWorkflowId) {
      return false; // Already loaded or no agent
    }

    try {
      const agentFunctionsResponse = await agentFunctionsApi.list(agentId);
      if (agentFunctionsResponse.data) {
        // Find the first workflow (we'll use the first one for now)
        const workflow = agentFunctionsResponse.data.find((af: any) => 
          af.is_custom_workflow || af.custom_tool_chain || af.effective_tool_chain
        );
        
        if (workflow) {
          setCurrentWorkflowId(workflow.id);
          const toolChain = workflow.effective_tool_chain || workflow.custom_tool_chain || [];
          const tools = new Set(toolChain.map((t: ToolInChain) => t.type));
          setWorkflowTools(tools);
          console.log('[GuidedSetupChat] Loaded existing workflow:', workflow.id, 'with tools:', Array.from(tools));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[GuidedSetupChat] Error loading existing workflow:', error);
      return false;
    }
  }, [agentId, currentWorkflowId]);

  // Create initial workflow with SMS
  const createInitialWorkflow = useCallback(async () => {
    if (!agentId || currentWorkflowId) {
      return false; // Already created or no agent
    }

    // First check if workflow already exists
    const existing = await loadExistingWorkflow();
    if (existing) {
      return true; // Workflow already exists
    }

    try {
      const smsTool: ToolInChain = {
        type: 'twilio',
        role: 'communication',
        method: 'sms',
        config: {}
      };
      
      const workflowName = generateWorkflowName([smsTool]);
      
      const response = await workflowsApi.create(agentId, {
        name: workflowName,
        description: 'Main workflow with SMS communication',
        tool_chain: [smsTool],
        enabled: true
      });

      if (response.data) {
        setCurrentWorkflowId(response.data.id);
        setWorkflowTools(new Set(['twilio']));
        console.log('[GuidedSetupChat] Created initial workflow with SMS:', response.data.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[GuidedSetupChat] Error creating initial workflow:', error);
      return false;
    }
  }, [agentId, currentWorkflowId, generateWorkflowName, loadExistingWorkflow]);

  // Map integration type to ToolInChain
  const mapIntegrationToTool = useCallback((integrationType: string, toolName?: string): ToolInChain | null => {
    if (integrationType === 'calcom') {
      return {
        type: 'calcom',
        role: 'scheduling',
        method: toolName || 'create_booking',
        config: {}
      };
    }
    if (integrationType === 'calendly') {
      return {
        type: 'calendly',
        role: 'scheduling',
        method: toolName || 'create_booking',
        config: {}
      };
    }
    if (integrationType === 'google_calendar') {
      return {
        type: 'google_calendar',
        role: 'scheduling',
        method: toolName || 'create_event',
        config: {}
      };
    }
    if (integrationType === 'pipedrive') {
      return {
        type: 'pipedrive',
        role: 'crm',
        method: toolName || 'create_deal',
        config: {}
      };
    }
    if (integrationType === 'hubspot') {
      return {
        type: 'hubspot',
        role: 'crm',
        method: toolName || 'create_contact',
        config: {}
      };
    }
    if (integrationType === 'kommo') {
      return {
        type: 'kommo',
        role: 'crm',
        method: toolName || 'create_contact',
        config: {}
      };
    }
    return null;
  }, []);

  // Update workflow with new tool
  const updateWorkflowWithTool = useCallback(async (tool: ToolInChain) => {
    if (!agentId || !currentWorkflowId) {
      console.warn('[GuidedSetupChat] Cannot update workflow: missing agentId or workflowId');
      return false;
    }

    try {
      // Get current workflow to fetch existing tool chain
      const agentFunctionsResponse = await agentFunctionsApi.list(agentId);
      let currentToolChain: ToolInChain[] = [];
      
      if (agentFunctionsResponse.data) {
        const workflow = agentFunctionsResponse.data.find((af: any) => af.id === currentWorkflowId);
        if (workflow?.effective_tool_chain) {
          currentToolChain = [...workflow.effective_tool_chain];
        } else if (workflow?.custom_tool_chain) {
          currentToolChain = [...workflow.custom_tool_chain];
        }
      }

      // Check if tool already exists (avoid duplicates)
      const toolKey = `${tool.type}_${tool.method || ''}`;
      const existingTool = currentToolChain.find(t => 
        t.type === tool.type && t.method === tool.method
      );
      
      if (existingTool) {
        console.log('[GuidedSetupChat] Tool already in workflow, skipping:', toolKey);
        return false;
      }

      // Add new tool to chain
      const updatedToolChain = [...currentToolChain, tool];
      
      // Update workflow tool chain
      await agentFunctionsApi.updateToolChain(agentId, currentWorkflowId, updatedToolChain);
      
      // Update workflow name
      const newWorkflowName = generateWorkflowName(updatedToolChain);
      await agentFunctionsApi.updateWorkflowConfig(agentId, currentWorkflowId, {
        name: newWorkflowName
      });

      // Update state
      setWorkflowTools(prev => new Set([...prev, tool.type]));
      
      console.log('[GuidedSetupChat] Updated workflow with tool:', tool.type, 'workflowId:', currentWorkflowId);
      
      // Trigger workflow refresh in parent component
      // Use a small delay to ensure backend has fully processed the update
      if (onFunctionEnabled) {
        console.log('[GuidedSetupChat] Scheduling workflow refresh callback');
        // Use requestAnimationFrame to ensure DOM updates are complete, then trigger refresh
        requestAnimationFrame(() => {
          setTimeout(() => {
            console.log('[GuidedSetupChat] Triggering workflow refresh now');
            onFunctionEnabled();
          }, 300); // Small delay to ensure backend persistence
        });
      } else {
        console.warn('[GuidedSetupChat] onFunctionEnabled callback not available')
      }
      
      return true;
    } catch (error) {
      console.error('[GuidedSetupChat] Error updating workflow:', error);
      return false;
    }
  }, [agentId, currentWorkflowId, generateWorkflowName, onFunctionEnabled]);


  // Start integration flow - create workflow with SMS first, then offer scheduling and CRM
  const startIntegrationFlowWithChatGPT = useCallback(async (loadedIntegrations: Set<string>) => {
    // First, ensure we have the latest workflow state
    if (agentId && !currentWorkflowId) {
      const workflowLoaded = await loadExistingWorkflow();
      if (!workflowLoaded) {
        // No workflow exists, create one with SMS
        const workflowCreated = await createInitialWorkflow();
        if (workflowCreated) {
          setIntegrationFlowPhase('sms_created');
          // Offer scheduling after SMS is created
          setTimeout(() => {
            addSystemMessage(
              "Great! I've created a workflow with SMS communication. Would you like to add a scheduling tool for booking appointments?",
              undefined,
              [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]
            );
            setIntegrationFlowPhase('scheduling_offered');
          }, 500);
          return;
        }
      }
    }

    // Check what tools are actually in the workflow (not just connected integrations)
    const hasScheduling = workflowTools.has('calcom') || workflowTools.has('calendly') || workflowTools.has('google_calendar');
    const hasCrm = workflowTools.has('pipedrive') || workflowTools.has('hubspot') || workflowTools.has('kommo');
    const hasSms = workflowTools.has('twilio');

    // If workflow is complete (has SMS + scheduling + CRM), just show completion message
    if (hasSms && hasScheduling && hasCrm) {
      setIntegrationFlowPhase('complete');
      addSystemMessage("Your workflow is complete!", undefined, [
        { label: "Done", value: "done" }
      ]);
      return;
    }

    // If workflow already exists, check what tools are already added
    if (hasScheduling && hasCrm) {
      // Both already added, complete
      setIntegrationFlowPhase('complete');
      addSystemMessage("Your workflow is complete!", undefined, [
        { label: "Done", value: "done" }
      ]);
    } else if (hasScheduling && !hasCrm) {
      // Scheduling added, offer CRM
      setIntegrationFlowPhase('crm_offered');
      addSystemMessage(
        "Would you like to add a CRM system to manage your contacts and deals?",
        undefined,
        [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      );
    } else if (!hasScheduling) {
      // Offer scheduling
      setIntegrationFlowPhase('scheduling_offered');
      addSystemMessage(
        "Would you like to add a scheduling tool for booking appointments?",
        undefined,
        [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      );
    }
  }, [agentId, currentWorkflowId, workflowTools, createInitialWorkflow, loadExistingWorkflow, addSystemMessage]);

  // Monitor step 5 and create workflow with SMS immediately
  useEffect(() => {
    if (wizardContext?.currentStep === 5 && !integrationFlowStartedRef.current && messages.length === 0) {
      integrationFlowStartedRef.current = true;

      // First, load existing workflow to check if it's already complete
      const initializeFlow = async () => {
        if (!agentId) {
          return;
        }

        // Load existing workflow first
        const workflowExists = await loadExistingWorkflow();
        
        // Wait a bit for state to update after loading workflow
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Re-check workflow tools after loading (they might have been updated)
        // We need to fetch the workflow again to get the latest tools
        let currentTools = new Set<string>();
        if (currentWorkflowId) {
          try {
            const agentFunctionsResponse = await agentFunctionsApi.list(agentId);
            if (agentFunctionsResponse.data) {
              const workflow = agentFunctionsResponse.data.find((af: any) => 
                af.id === currentWorkflowId && (af.is_custom_workflow || af.custom_tool_chain || af.effective_tool_chain)
              );
              if (workflow) {
                const toolChain = workflow.effective_tool_chain || workflow.custom_tool_chain || [];
                currentTools = new Set(toolChain.map((t: ToolInChain) => t.type));
                setWorkflowTools(currentTools);
              }
            }
          } catch (error) {
            console.error('[GuidedSetupChat] Error fetching workflow tools:', error);
          }
        } else {
          // Use workflowTools state if we don't have a workflow ID yet
          currentTools = workflowTools;
        }
        
        // Check if workflow is already complete
        const hasScheduling = currentTools.has('calcom') || currentTools.has('calendly') || currentTools.has('google_calendar');
        const hasCrm = currentTools.has('pipedrive') || currentTools.has('hubspot') || currentTools.has('kommo');
        const hasSms = currentTools.has('twilio');
        
        if (hasSms && hasScheduling && hasCrm) {
          // Workflow is complete, just show completion message
          setIntegrationFlowPhase('complete');
          addSystemMessage("Your workflow is complete!", undefined, [
            { label: "Done", value: "done" }
          ]);
          return;
        }

        // If workflow doesn't exist, create it with SMS
        if (!workflowExists && !currentWorkflowId) {
          const created = await createInitialWorkflow();
          if (created) {
            // Reload workflow to get updated tools
            await loadExistingWorkflow();
            // Update currentTools after creating
            await new Promise(resolve => setTimeout(resolve, 100));
            if (currentWorkflowId) {
              try {
                const agentFunctionsResponse = await agentFunctionsApi.list(agentId);
                if (agentFunctionsResponse.data) {
                  const workflow = agentFunctionsResponse.data.find((af: any) => 
                    af.id === currentWorkflowId && (af.is_custom_workflow || af.custom_tool_chain || af.effective_tool_chain)
                  );
                  if (workflow) {
                    const toolChain = workflow.effective_tool_chain || workflow.custom_tool_chain || [];
                    currentTools = new Set(toolChain.map((t: ToolInChain) => t.type));
                    setWorkflowTools(currentTools);
                  }
                }
              } catch (error) {
                console.error('[GuidedSetupChat] Error fetching workflow tools after creation:', error);
              }
            }
          }
        }

        // Load integrations and start flow
        const loadedIntegrations = await loadConnectedIntegrations();
        setConnectedIntegrations(loadedIntegrations);

        // Re-check if workflow is complete after all loading
        const finalHasScheduling = currentTools.has('calcom') || currentTools.has('calendly') || currentTools.has('google_calendar');
        const finalHasCrm = currentTools.has('pipedrive') || currentTools.has('hubspot') || currentTools.has('kommo');
        const finalHasSms = currentTools.has('twilio');
        
        if (finalHasSms && finalHasScheduling && finalHasCrm) {
          // Workflow is complete, just show completion message
          setIntegrationFlowPhase('complete');
          addSystemMessage("Your workflow is complete!", undefined, [
            { label: "Done", value: "done" }
          ]);
          return;
        }
        
        // Only send welcome message if workflow is not complete
        setTimeout(() => {
          if (!welcomeMessageSentRef.current) {
            welcomeMessageSentRef.current = true;
            if (currentWorkflowId) {
              addSystemMessage("Hello! I'm here to help you set up your Voiceable assistant. I've created a workflow with SMS communication.");
            } else {
              addSystemMessage("Hello! I'm here to help you set up your Voiceable assistant. Let me guide you through the process on how to integrate tools.");
            }
          }

          // Start the flow after welcome message
          setTimeout(() => {
            startIntegrationFlowWithChatGPT(loadedIntegrations);
          }, 800);
        });
      };

      initializeFlow();
    } else if (wizardContext?.currentStep !== 5) {
      // Reset flow state when leaving step 5
      integrationFlowStartedRef.current = false;
      welcomeMessageSentRef.current = false;
      setIntegrationFlowPhase('initial');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardContext?.currentStep, messages.length, loadConnectedIntegrations, agentId, currentWorkflowId, workflowTools, createInitialWorkflow, loadExistingWorkflow, addSystemMessage, startIntegrationFlowWithChatGPT]);

  const addUserMessage = useCallback((text: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    setWaitingForUser(false);
    return message;
  }, []);

  const addAssistantMessage = useCallback((text: string, actionPerformed?: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: "assistant",
      text,
      timestamp: new Date(),
      actionPerformed,
    };
    setMessages((prev) => [...prev, message]);
    if (actionPerformed) {
      setLastActionTime(new Date());
    }
  }, []);

  const buildWizardContext = useCallback((): WizardContext => {
    // Build integration flow context for Step 5
    const integrationFlowContext: IntegrationFlowContext | undefined = wizardContext?.currentStep === 5 ? {
      phase: integrationFlowPhase,
      connectedIntegrations: Array.from(connectedIntegrations),
      currentIntegration: undefined,
      currentWorkflowId: currentWorkflowId || undefined,
      workflowTools: Array.from(workflowTools),
      crmSkipped: crmSkipped,
      schedulingSkipped: schedulingSkipped,
    } : undefined;

    if (!wizardContext) {
      return {
        currentStep: 0,
        stepName: "Unknown",
        formValues: {},
        availableActions: [],
        isAgentCreated: !!agentId,
        agentId: agentId,
        integrationFlow: integrationFlowContext,
      };
    }

    return {
      currentStep: wizardContext.currentStep,
      stepName: STEP_NAMES[wizardContext.currentStep] || "Unknown",
      formValues: wizardContext.formValues || {},
      availableActions: wizardContext.availableActions || [],
      isAgentCreated: wizardContext.isAgentCreated,
      agentId: wizardContext.agentId || undefined,
      integrationFlow: integrationFlowContext,
    };
  }, [wizardContext, agentId, integrationFlowPhase, connectedIntegrations, currentWorkflowId, workflowTools, crmSkipped, schedulingSkipped]);

  // Ref to store handleStep5ChatGPTMessage function to avoid dependency order issues
  const handleStep5ChatGPTMessageRef = useRef<((userInput: string, isButtonClick?: boolean) => Promise<void>) | null>(null);


  // Handle Step 5 messages through ChatGPT
  const handleStep5ChatGPTMessage = useCallback(async (userInput: string, isButtonClick: boolean = false): Promise<void> => {
    setAwaitingChatGPTResponse(true);

    try {
      // Build chat history
      const chatHistory: ChatGPTMessage[] = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        }));

      // Add current user message
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (!lastMessage || lastMessage.content !== userInput) {
        chatHistory.push({
          role: "user",
          content: userInput,
        });
      }

      // Get ChatGPT response with integration flow context
      const context = buildWizardContext();
      const response = await sendChatGPTMessage(chatHistory, context);

      // Parse for actions
      const action = parseActionFromResponse(response);

      // Extract text response (remove action JSON if present)
      let textResponse = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        textResponse = response.replace(/```json\s*[\s\S]*?\s*```/g, "").trim();
      }

      // Add assistant message with buttons for common options
      let responseButtons: ChatButton[] | undefined;

      // Detect if ChatGPT is asking about CRM options
      if (textResponse.toLowerCase().includes('pipedrive') &&
          textResponse.toLowerCase().includes('hubspot') &&
          textResponse.toLowerCase().includes('kommo')) {
        responseButtons = [
          { label: "Pipedrive", value: "pipedrive" },
          { label: "HubSpot", value: "hubspot" },
          { label: "Kommo", value: "kommo" },
          { label: "Skip", value: "no" }
        ];
        setIntegrationFlowPhase('crm_offered');
      }
      // Detect if asking about scheduling options
      else if (textResponse.toLowerCase().includes('cal.com') &&
               (textResponse.toLowerCase().includes('calendly') || textResponse.toLowerCase().includes('google calendar'))) {
        responseButtons = [
          { label: "Cal.com", value: "calcom" },
          { label: "Calendly", value: "calendly" },
          { label: "Google Calendar", value: "google_calendar" },
          { label: "Skip", value: "no" }
        ];
        setIntegrationFlowPhase('scheduling_offered');
      }
      // Detect yes/no questions
      else if (textResponse.toLowerCase().includes('would you like') ||
               textResponse.toLowerCase().includes('do you want')) {
        responseButtons = [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ];
      }

      // Add the message with buttons
      const messageId = `msg-${Date.now()}-${Math.random()}`;
      addSystemMessage(textResponse || response, messageId, responseButtons);

      // Execute action if present and valid
      if (action && action.type !== "NONE") {
        await executeStep5Action(action);
      }
    } catch (error) {
      console.error("Error in Step 5 ChatGPT flow:", error);
      addSystemMessage("I'm having trouble processing that. Could you try rephrasing your question?");
    } finally {
      setAwaitingChatGPTResponse(false);
      setIsProcessing(false);
      setWaitingForUser(false);
    }
  }, [messages, buildWizardContext, addSystemMessage]);

  // Update ref when handleStep5ChatGPTMessage changes
  useEffect(() => {
    handleStep5ChatGPTMessageRef.current = handleStep5ChatGPTMessage;
  }, [handleStep5ChatGPTMessage]);

  // Normalize integration type from ChatGPT (handles variations like "cal", "cal.com", "calcom")
  const normalizeIntegrationType = useCallback((type: string): string => {
    const normalized = type.toLowerCase().trim();
    
    // Map common variations to correct integration types
    if (normalized === 'cal' || normalized === 'cal.com' || normalized === 'calcom') {
      return 'calcom';
    }
    if (normalized === 'google calendar' || normalized === 'googlecalendar') {
      return 'google_calendar';
    }
    if (normalized === 'outlook calendar' || normalized === 'outlookcalendar') {
      return 'outlook_calendar';
    }
    
    return normalized;
  }, []);

  // Execute Step 5 specific actions from ChatGPT
  const executeStep5Action = useCallback(async (action: WizardAction): Promise<void> => {
    switch (action.type) {
      case "OPEN_INTEGRATION_MODAL":
        if (action.value && wizardContext) {
          const integrationType = normalizeIntegrationType(action.value);
          const isCRM = ['pipedrive', 'hubspot', 'kommo'].includes(integrationType);
          const isScheduling = ['calcom', 'calendly', 'google_calendar'].includes(integrationType);

          if (isCRM) {
            setIntegrationFlowPhase('crm_connecting');
          } else if (isScheduling) {
            setIntegrationFlowPhase('scheduling_connecting');
          }

          await wizardContext.openIntegrationModal(integrationType);
        }
        break;

      case "SKIP_PHASE":
        if (action.value) {
          const phase = action.value.toLowerCase();
          if (phase === 'crm') {
            setCrmSkipped(true);
            setIntegrationFlowPhase('scheduling_offered');
          } else if (phase === 'scheduling') {
            setSchedulingSkipped(true);
            setIntegrationFlowPhase('crm_offered');
          } else if (phase === 'recommendations') {
            setIntegrationFlowPhase('complete');
          }
        }
        break;

      case "ADVANCE_FLOW":
        advanceIntegrationFlow();
        break;

      default:
        // Handle other action types through regular executor
        if (wizardContext) {
          switch (action.type) {
            case "NAVIGATE_STEP":
              if (action.target === "next") {
                wizardContext.goToNextStep();
              } else if (action.value) {
                wizardContext.navigateToStep(parseInt(action.value));
              }
              break;
            case "CLICK_BUTTON":
              await wizardContext.clickButton(action.target);
              break;
          }
        }
    }
  }, [wizardContext, agentId, normalizeIntegrationType]);

  // Helper to advance the integration flow
  const advanceIntegrationFlow = useCallback(() => {
    const hasCRM = connectedIntegrations.has('pipedrive') ||
                  connectedIntegrations.has('hubspot') ||
                  connectedIntegrations.has('kommo');
    const hasScheduling = connectedIntegrations.has('calcom') ||
                         connectedIntegrations.has('calendly') ||
                         connectedIntegrations.has('google_calendar');

    switch (integrationFlowPhase) {
      case 'initial':
        // Should create SMS workflow first
        if (currentWorkflowId) {
          setIntegrationFlowPhase('sms_created');
        }
        break;
      case 'sms_created':
        if (hasScheduling || schedulingSkipped) {
          setIntegrationFlowPhase(hasCRM || crmSkipped ? 'complete' : 'crm_offered');
        } else {
          setIntegrationFlowPhase('scheduling_offered');
        }
        break;
      case 'scheduling_offered':
      case 'scheduling_connecting':
        if (hasScheduling) {
          setIntegrationFlowPhase(hasCRM || crmSkipped ? 'complete' : 'crm_offered');
        }
        break;
      case 'crm_offered':
      case 'crm_connecting':
        if (hasCRM) {
          setIntegrationFlowPhase('complete');
        }
        break;
      case 'complete':
        // Already complete
        break;
    }
  }, [integrationFlowPhase, connectedIntegrations, crmSkipped, schedulingSkipped, currentWorkflowId]);

  // Handle button clicks - now routes through ChatGPT for Step 5
  const handleButtonClick = useCallback(async (buttonValue: string) => {
    if (isProcessing || waitingForUser) return;

    setIsProcessing(true);
    setWaitingForUser(true);

    try {
      // Check if we're on Step 5 (Integrations)
      if (wizardContext?.currentStep === 5) {
        // Handle quick actions for integration selection directly (for better UX)
        const lowerValue = buttonValue.toLowerCase();
        const crmIntegrations = ['pipedrive', 'hubspot', 'kommo'];
        const schedulingIntegrations = ['calcom', 'calendly', 'google_calendar'];

        // If user clicks an integration button directly, open the modal
        // Normalize the integration type first
        const normalizedValue = normalizeIntegrationType(buttonValue);
        if (crmIntegrations.includes(normalizedValue) || schedulingIntegrations.includes(normalizedValue)) {
          const isCRM = crmIntegrations.includes(normalizedValue);
          setIntegrationFlowPhase(isCRM ? 'crm_connecting' : 'scheduling_connecting');
          addUserMessage(buttonValue);
          if (wizardContext) {
            await wizardContext.openIntegrationModal(normalizedValue);
          }
          setIsProcessing(false);
          setWaitingForUser(false);
          return;
        }

        // For other Step 5 interactions, route through ChatGPT
        addUserMessage(buttonValue);
        await handleStep5ChatGPTMessage(buttonValue, true);
      } else {
        // For non-Step 5 flows, treat button click as user input
        addUserMessage(buttonValue);
      }
    } catch (error) {
      console.error("Error handling button click:", error);
    } finally {
      // Always reset processing state so buttons can be clicked again
      setIsProcessing(false);
      setWaitingForUser(false);
    }
  }, [isProcessing, waitingForUser, wizardContext, integrationFlowPhase, addUserMessage, handleStep5ChatGPTMessage]);

  // Use refs to track previous state to avoid infinite loops
  const previousConnectedIntegrationsRef = useRef<Set<string>>(new Set());
  const previousFlowPhaseRef = useRef<IntegrationFlowPhase>('initial');

  // Check for newly connected integrations after modal interaction
  // This checks the agent's integration_tools, not all user integrations
  const checkIntegrationConnection = useCallback(async () => {
    try {
      const newConnected = new Set<string>();

      // Priority 1: Check wizard context form values (most up-to-date for new agents)
      if (wizardContext?.formValues?.integrationTools) {
        const wizardIntegrations = wizardContext.formValues.integrationTools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
        Object.keys(wizardIntegrations).forEach((integrationType) => {
          newConnected.add(integrationType);
        });
      }

      // Priority 2: Check agent's integration_tools if agent exists (for existing agents)
      if (agentId && agent?.integration_tools) {
        const integrationTools = agent.integration_tools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
        Object.keys(integrationTools).forEach((integrationType) => {
          newConnected.add(integrationType);
        });
      }

      // If we still don't have any, try refreshing agent data
      if (newConnected.size === 0 && agentId && agentId !== "new") {
        try {
          const agentResponse = await agentsApi.get(agentId);
          if (agentResponse.data?.integration_tools) {
            const integrationTools = agentResponse.data.integration_tools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
            Object.keys(integrationTools).forEach((integrationType) => {
              newConnected.add(integrationType);
            });
          }
        } catch (error) {
          console.error('Error refreshing agent data:', error);
        }
      }

      const currentPhase = integrationFlowPhase;
      const previousPhase = previousFlowPhaseRef.current;
      const previousConnected = previousConnectedIntegrationsRef.current;

      // Check if we have new connections
      const wasConnecting = currentPhase === 'crm_connecting' || currentPhase === 'scheduling_connecting';
      if (wasConnecting) {
        const hadCrm = previousConnected.has('pipedrive') || previousConnected.has('hubspot') || previousConnected.has('kommo');
        const hasCrm = newConnected.has('pipedrive') || newConnected.has('hubspot') || newConnected.has('kommo');
        const hadScheduling = previousConnected.has('calcom') || previousConnected.has('calendly') || previousConnected.has('google_calendar');
        const hasScheduling = newConnected.has('calcom') || newConnected.has('calendly') || newConnected.has('google_calendar');

        if (currentPhase === 'crm_connecting' && hasCrm && !hadCrm) {
          // CRM was successfully connected
          previousConnectedIntegrationsRef.current = newConnected;
          setConnectedIntegrations(newConnected);

          // Determine which CRM integration was connected
          let connectedCrmType = '';
          if (newConnected.has('pipedrive')) connectedCrmType = 'pipedrive';
          else if (newConnected.has('hubspot')) connectedCrmType = 'hubspot';
          else if (newConnected.has('kommo')) connectedCrmType = 'kommo';

          // Update workflow with CRM tool
          if (connectedCrmType && currentWorkflowId) {
            const tool = mapIntegrationToTool(connectedCrmType);
            if (tool) {
              const updated = await updateWorkflowWithTool(tool);
              if (updated) {
                addSystemMessage(`✓ ${connectedCrmType.charAt(0).toUpperCase() + connectedCrmType.slice(1)} added to workflow!`);
              }
            }
          }

          // Move to complete or offer scheduling if not already added
          if (hasScheduling || schedulingSkipped) {
            setIntegrationFlowPhase('complete');
            previousFlowPhaseRef.current = 'complete';
            addSystemMessage("Your workflow is complete with SMS, scheduling, and CRM tools!", undefined, [
              { label: "Done", value: "done" }
            ]);
          } else {
            setIntegrationFlowPhase('scheduling_offered');
            previousFlowPhaseRef.current = 'scheduling_offered';
            addSystemMessage("Great! Your CRM has been added to the workflow. Would you like to add a scheduling tool?", undefined, [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]);
          }
          return;
        } else if (currentPhase === 'crm_connecting' && !hasCrm && previousPhase === 'crm_connecting') {
          // CRM connection was cancelled, go back to offering
          setIntegrationFlowPhase('crm_offered');
          previousFlowPhaseRef.current = 'crm_offered';
        } else if (currentPhase === 'scheduling_connecting' && hasScheduling && !hadScheduling) {
          // Scheduling was successfully connected
          previousConnectedIntegrationsRef.current = newConnected;
          setConnectedIntegrations(newConnected);

          // Determine which scheduling integration was connected
          let connectedSchedulingType = '';
          if (newConnected.has('calcom')) connectedSchedulingType = 'calcom';
          else if (newConnected.has('calendly')) connectedSchedulingType = 'calendly';
          else if (newConnected.has('google_calendar')) connectedSchedulingType = 'google_calendar';

          // Update workflow with scheduling tool
          if (connectedSchedulingType && currentWorkflowId) {
            const tool = mapIntegrationToTool(connectedSchedulingType);
            if (tool) {
              try {
                const updated = await updateWorkflowWithTool(tool);
                if (updated) {
                  addSystemMessage(`✓ ${connectedSchedulingType.charAt(0).toUpperCase() + connectedSchedulingType.slice(1)} added to workflow!`);
                }
              } catch (error) {
                console.error('[GuidedSetupChat] Error updating workflow with scheduling tool:', error);
                addSystemMessage(`Failed to add ${connectedSchedulingType} to workflow. Please try again.`);
              }
            }
          }

          // Move to CRM offer or complete
          const hasCrm = newConnected.has('pipedrive') || newConnected.has('hubspot') || newConnected.has('kommo');
          if (hasCrm || crmSkipped) {
            setIntegrationFlowPhase('complete');
            previousFlowPhaseRef.current = 'complete';
            addSystemMessage("Your workflow is complete!", undefined, [
              { label: "Done", value: "done" }
            ]);
          } else {
            setIntegrationFlowPhase('crm_offered');
            previousFlowPhaseRef.current = 'crm_offered';
            addSystemMessage("Excellent! Your scheduling tool has been added. Would you like to add a CRM system?", undefined, [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]);
          }
          return;
        } else if (currentPhase === 'scheduling_connecting' && !hasScheduling && previousPhase === 'scheduling_connecting') {
          // Scheduling connection was cancelled, go back to offering
          setIntegrationFlowPhase('scheduling_offered');
          previousFlowPhaseRef.current = 'scheduling_offered';
        }
      }

      // Update refs and state
      previousConnectedIntegrationsRef.current = newConnected;
      previousFlowPhaseRef.current = currentPhase;
      setConnectedIntegrations(newConnected);
    } catch (error) {
      console.error('Error checking integration connection:', error);
    }
  }, [integrationFlowPhase, addSystemMessage, agentId, agent, wizardContext, schedulingSkipped, currentWorkflowId, mapIntegrationToTool, updateWorkflowWithTool, crmSkipped]);

  // Watch for changes in wizard context integration tools (when integration is added to agent)
  useEffect(() => {
    if (wizardContext?.formValues?.integrationTools && wizardContext?.currentStep === 5) {
      const wizardIntegrations = wizardContext.formValues.integrationTools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
      const currentWizardIntegrations = new Set(Object.keys(wizardIntegrations));
      const previousWizardIntegrations = previousConnectedIntegrationsRef.current;

      // Check if we have new integrations that weren't there before
      const newIntegrations = Array.from(currentWizardIntegrations).filter(
        type => !previousWizardIntegrations.has(type)
      );

      if (newIntegrations.length > 0) {
        console.log('[GuidedSetupChat] Detected new integrations from wizard context:', newIntegrations);

        const currentPhase = integrationFlowPhase;
        const newCrm = newIntegrations.find(type => ['pipedrive', 'hubspot', 'kommo'].includes(type));
        const newScheduling = newIntegrations.find(type => ['calcom', 'calendly', 'google_calendar'].includes(type));

        const isConnecting = currentPhase === 'crm_connecting' || currentPhase === 'scheduling_connecting';

        // Handle new CRM integration
        if (newCrm && !isConnecting && currentPhase !== 'complete') {
          // Update workflow with CRM tool - use async function properly
          const handleCrmIntegration = async () => {
            if (currentWorkflowId) {
              const tool = mapIntegrationToTool(newCrm);
              if (tool) {
                try {
                  const updated = await updateWorkflowWithTool(tool);
                  if (updated) {
                    addSystemMessage(`✓ ${newCrm.charAt(0).toUpperCase() + newCrm.slice(1)} added to workflow!`);
                  }
                } catch (error) {
                  console.error('[GuidedSetupChat] Error updating workflow with CRM tool:', error);
                  addSystemMessage(`Failed to add ${newCrm} to workflow. Please try again.`);
                }
              }
            }

            const hasScheduling = currentWizardIntegrations.has('calcom') || currentWizardIntegrations.has('calendly') || currentWizardIntegrations.has('google_calendar');
            if (hasScheduling || schedulingSkipped) {
              setIntegrationFlowPhase('complete');
              addSystemMessage("Your workflow is complete!", undefined, [
                { label: "Done", value: "done" }
              ]);
            } else {
              setIntegrationFlowPhase('scheduling_offered');
              addSystemMessage("Great! Your CRM has been added. Would you like to add a scheduling tool?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }

            previousConnectedIntegrationsRef.current = currentWizardIntegrations;
            setConnectedIntegrations(currentWizardIntegrations);
          };

          handleCrmIntegration();
          return;
        } else if (newScheduling && !isConnecting && currentPhase !== 'complete') {
          // Update workflow with scheduling tool - use async function properly
          const handleSchedulingIntegration = async () => {
            if (currentWorkflowId) {
              const tool = mapIntegrationToTool(newScheduling);
              if (tool) {
                try {
                  const updated = await updateWorkflowWithTool(tool);
                  if (updated) {
                    addSystemMessage(`✓ ${newScheduling.charAt(0).toUpperCase() + newScheduling.slice(1)} added to workflow!`);
                  }
                } catch (error) {
                  console.error('[GuidedSetupChat] Error updating workflow with scheduling tool:', error);
                  addSystemMessage(`Failed to add ${newScheduling} to workflow. Please try again.`);
                }
              }
            }

            const hasCrm = currentWizardIntegrations.has('pipedrive') || currentWizardIntegrations.has('hubspot') || currentWizardIntegrations.has('kommo');
            if (hasCrm || crmSkipped) {
              setIntegrationFlowPhase('complete');
              addSystemMessage("Your workflow is complete!", undefined, [
                { label: "Done", value: "done" }
              ]);
            } else {
              setIntegrationFlowPhase('crm_offered');
              addSystemMessage("Excellent! Your scheduling tool has been added. Would you like to add a CRM system?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }

            previousConnectedIntegrationsRef.current = currentWizardIntegrations;
            setConnectedIntegrations(currentWizardIntegrations);
          };

          handleSchedulingIntegration();
          return;
        }

        previousConnectedIntegrationsRef.current = currentWizardIntegrations;
        setConnectedIntegrations(currentWizardIntegrations);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardContext?.formValues?.integrationTools, wizardContext?.currentStep, integrationFlowPhase, currentWorkflowId, mapIntegrationToTool, updateWorkflowWithTool, crmSkipped, schedulingSkipped, addSystemMessage]);

  // Handle integration saved callback - directly update workflow when integration is saved
  const handleIntegrationSaved = useCallback(async (integrationType: string) => {
    console.log('[GuidedSetupChat] Integration saved callback received:', integrationType);
    
    if (!currentWorkflowId || !agentId) {
      console.warn('[GuidedSetupChat] Cannot update workflow: missing workflowId or agentId');
      return;
    }

    // Check if this integration should be added to workflow
    const isCrm = ['pipedrive', 'hubspot', 'kommo'].includes(integrationType);
    const isScheduling = ['calcom', 'calendly', 'google_calendar'].includes(integrationType);
    
    if (!isCrm && !isScheduling) {
      console.log('[GuidedSetupChat] Integration type not relevant for workflow:', integrationType);
      return;
    }

    // Check if integration is already in workflow
    if (workflowTools.has(integrationType)) {
      console.log('[GuidedSetupChat] Integration already in workflow:', integrationType);
      return;
    }

    // Small delay to ensure backend has processed the integration save
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update workflow with the new tool
    const tool = mapIntegrationToTool(integrationType);
    if (tool) {
      try {
        console.log('[GuidedSetupChat] Updating workflow with tool:', integrationType);
        const updated = await updateWorkflowWithTool(tool);
        if (updated) {
          addSystemMessage(`✓ ${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)} added to workflow!`);
          
          // Update phase based on what was added
          if (isCrm) {
            const hasScheduling = workflowTools.has('calcom') || workflowTools.has('calendly') || workflowTools.has('google_calendar');
            if (hasScheduling || schedulingSkipped) {
              setIntegrationFlowPhase('complete');
              addSystemMessage("Your workflow is complete!", undefined, [
                { label: "Done", value: "done" }
              ]);
            } else {
              setIntegrationFlowPhase('scheduling_offered');
              addSystemMessage("Great! Your CRM has been added. Would you like to add a scheduling tool?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }
          } else if (isScheduling) {
            const hasCrm = workflowTools.has('pipedrive') || workflowTools.has('hubspot') || workflowTools.has('kommo');
            if (hasCrm || crmSkipped) {
              setIntegrationFlowPhase('complete');
              addSystemMessage("Your workflow is complete!", undefined, [
                { label: "Done", value: "done" }
              ]);
            } else {
              setIntegrationFlowPhase('crm_offered');
              addSystemMessage("Excellent! Your scheduling tool has been added. Would you like to add a CRM system?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }
          }
        }
      } catch (error) {
        console.error('[GuidedSetupChat] Error updating workflow with saved integration:', error);
        addSystemMessage(`Failed to add ${integrationType} to workflow. Please try again.`);
      }
    }
  }, [currentWorkflowId, agentId, workflowTools, mapIntegrationToTool, updateWorkflowWithTool, addSystemMessage, schedulingSkipped, crmSkipped, setIntegrationFlowPhase]);

  // Expose handleIntegrationSaved via ref using useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleIntegrationSaved,
  }), [handleIntegrationSaved]);

  // Poll for integration changes when in connecting state
  useEffect(() => {
    if (integrationFlowPhase === 'crm_connecting' || integrationFlowPhase === 'scheduling_connecting') {
      previousFlowPhaseRef.current = integrationFlowPhase;
      previousConnectedIntegrationsRef.current = new Set(connectedIntegrations);

      checkIntegrationConnection();
      const interval = setInterval(() => {
        checkIntegrationConnection();
      }, 2000);

      return () => clearInterval(interval);
    } else {
      previousFlowPhaseRef.current = integrationFlowPhase;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationFlowPhase]);

  const provideProactiveGuidance = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (!wizardContext || isProcessing || waitingForUser || isProvidingGuidanceRef.current) {
      return;
    }

    // Don't provide proactive guidance on step 5 (integration flow is handled manually)
    if (wizardContext.currentStep === 5) {
      return;
    }

    // Check if we already provided guidance for this step
    const currentStep = wizardContext.currentStep;
    if (lastProactiveStepRef.current === currentStep) {
      return; // Already provided guidance for this step
    }

    isProvidingGuidanceRef.current = true;
    lastProactiveStepRef.current = currentStep;
    setIsProcessing(true);
    
    try {
      const context = buildWizardContext();
      const chatMessages: ChatGPTMessage[] = [
        {
          role: "user",
          content: `I'm currently on step ${context.currentStep} (${context.stepName}). What should I do next?`,
        },
      ];

      const response = await sendChatGPTMessage(chatMessages, context);
      addAssistantMessage(response);
    } catch (error) {
      console.error("Error getting proactive guidance:", error);
      addSystemMessage("I'm having trouble connecting right now. You can continue setting up your assistant manually.");
      // Reset the step ref on error so we can try again
      lastProactiveStepRef.current = null;
    } finally {
      setIsProcessing(false);
      isProvidingGuidanceRef.current = false;
    }
  }, [wizardContext, isProcessing, waitingForUser, buildWizardContext, addAssistantMessage, addSystemMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!textInput.trim() || isProcessing || waitingForUser || isProvidingGuidanceRef.current) return;

    const userInput = textInput.trim();
    setTextInput("");
    addUserMessage(userInput);
    setIsProcessing(true);
    setWaitingForUser(true);

    // For Step 5, route ALL messages through ChatGPT for conversational handling
    if (wizardContext?.currentStep === 5) {
      // Route all Step 5 messages through ChatGPT
      await handleStep5ChatGPTMessage(userInput);
      return;
    }

    try {
      // Build chat history (exclude system messages and ensure no duplicates)
      const chatHistory: ChatGPTMessage[] = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        }));

      // Add current user message only if it's not already the last message
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (!lastMessage || lastMessage.content !== userInput) {
        chatHistory.push({
          role: "user",
          content: userInput,
        });
      }

      // Get ChatGPT response
      const context = buildWizardContext();
      const response = await sendChatGPTMessage(chatHistory, context);

      // Parse for actions
      const action = parseActionFromResponse(response);

      // Extract text response (remove action JSON if present)
      let textResponse = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        textResponse = response.replace(/```json\s*[\s\S]*?\s*```/g, "").trim();
      }

      // Add assistant message
      addAssistantMessage(textResponse || response, action ? action.message : undefined);

      // Execute action if present and valid
      if (action && action.type !== "NONE") {
        const availableActions = wizardContext?.availableActions || [];
        if (validateAction(action, availableActions)) {
          await executeWizardAction(action);
        }
      }

      setWaitingForUser(false);
    } catch (error) {
      console.error("Error processing message:", error);
      addSystemMessage(
        "I'm having trouble processing that. Could you try rephrasing your question?"
      );
      setWaitingForUser(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // MessageButtons component
  const MessageButtons: React.FC<{ buttons: ChatButton[], messageId: string }> = ({ buttons, messageId }) => {
    if (!buttons || buttons.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {buttons.map((button, index) => (
          <Button
            key={`${messageId}-button-${index}`}
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick(button.value)}
            disabled={isProcessing || waitingForUser}
            className="text-xs"
          >
            {button.label}
          </Button>
        ))}
      </div>
    );
  };

  const executeWizardAction = async (action: WizardAction) => {
    if (!wizardContext) {
      // Try to execute via DOM if no context
      const result = await executeAction(action);
      if (result.success) {
        addSystemMessage(`I ${result.message || "performed the action"}.`);
      } else {
        addSystemMessage(`I tried to ${action.message || "perform an action"}, but encountered an issue: ${result.message}`);
      }
      return;
    }

    try {
      switch (action.type) {
        case "CLICK_BUTTON":
          if (action.target === "next" || action.target === "save") {
            // Use context to navigate or save
            if (action.target === "next") {
              wizardContext.goToNextStep();
            } else {
              // Trigger save button click
              await wizardContext.clickButton("save");
            }
          } else {
            await wizardContext.clickButton(action.target);
          }
          break;

        case "FILL_FIELD":
          if (action.value) {
            await wizardContext.fillField(action.target, action.value);
          }
          break;

        case "SELECT_OPTION":
          if (action.value) {
            await wizardContext.selectOption(action.target, action.value);
          }
          break;

        case "NAVIGATE_STEP":
          if (action.target === "next") {
            wizardContext.goToNextStep();
          } else if (action.target === "previous" || action.target === "back") {
            wizardContext.goToPreviousStep();
          } else if (action.value) {
            const step = parseInt(action.value);
            if (!isNaN(step)) {
              wizardContext.navigateToStep(step);
            }
          }
          break;

        case "OPEN_INTEGRATION_MODAL":
          if (action.value) {
            await wizardContext.openIntegrationModal(action.value);
          } else {
            addSystemMessage("I need to know which integration you'd like to connect. Please specify the integration type.");
          }
          break;

        default:
          // Fallback to DOM execution
          const result = await executeAction(action);
          if (!result.success) {
            addSystemMessage(`I tried to ${action.message || "perform an action"}, but encountered an issue: ${result.message}`);
          }
      }
    } catch (error) {
      console.error("Error executing action:", error);
      addSystemMessage(`I encountered an error while trying to ${action.message || "perform an action"}.`);
    }
  };

  const chatContent = isMinimized ? (
    <div className={cn(
        "fixed bottom-4 right-4 z-[9999]"
    )}>
      <Button
        onClick={() => handleMinimizedChange(false)}
        className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative"
        size="icon"
        style={{
          animation: 'sparklePulse 2s ease-in-out infinite, sparkleGlow 2s ease-in-out infinite',
        }}
      >
        <Sparkles 
          className="h-5 w-5" 
          style={{
            animation: 'sparkleBlink 1.5s ease-in-out infinite, sparkleScale 2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes sparklePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          @keyframes sparkleBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes sparkleGlow {
            0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4); }
          }
          @keyframes sparkleScale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </Button>
    </div>
  ) : (
    <div className={cn(
      renderMode === "inline" 
        ? "fixed bottom-4 right-4 left-4 lg:left-auto lg:bottom-auto lg:top-24 lg:right-6 w-[calc(100vw-2rem)] md:w-[350px] lg:w-[400px] h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] z-50 bg-card border border-border rounded-lg shadow-lg flex flex-col"
        : "fixed bottom-4 right-4 z-[9999] w-[calc(100vw-2rem)] md:w-full md:max-w-md h-[600px] max-h-[calc(100vh-2rem)] bg-card border border-border rounded-lg shadow-2xl flex flex-col"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full bg-green-500 relative"
            style={{
              animation: 'greenPulse 2s ease-in-out infinite, greenBlink 1.5s ease-in-out infinite, greenGlow 2s ease-in-out infinite, greenScale 2s ease-in-out infinite',
            }}
          />
          <h3 className="font-semibold">Voiceable Assistant</h3>
          <style>{`
            @keyframes greenPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
            @keyframes greenBlink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
            @keyframes greenGlow {
              0%, 100% { box-shadow: 0 0 6px rgba(34, 197, 94, 0.5), 0 0 12px rgba(34, 197, 94, 0.3); }
              50% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.9), 0 0 20px rgba(34, 197, 94, 0.5); }
            }
            @keyframes greenScale {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.3); }
            }
          `}</style>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleMinimizedChange(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className={cn(
        "p-4 space-y-4",
        renderMode === "inline" ? "flex-1 overflow-y-auto min-h-0" : "flex-1 overflow-y-auto min-h-0"
      )}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : message.role === "assistant"
                  ? "bg-muted text-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {message.actionPerformed && (
                <p className="text-xs mt-1 opacity-70 italic">
                  ✓ {message.actionPerformed}
                </p>
              )}
              {message.buttons && message.buttons.length > 0 && (
                <MessageButtons buttons={message.buttons} messageId={message.id} />
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!disableInput && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask anything"
              disabled={isProcessing || waitingForUser}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={!textInput.trim() || isProcessing || waitingForUser} 
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  // Render based on mode
  if (typeof window === "undefined") {
    return null;
  }

  if (renderMode === "inline") {
    return chatContent;
  }

  return createPortal(chatContent, document.body);
});
