import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { integrationsApi, functionsApi, agentFunctionsApi, agentsApi } from "@/lib/api";
import type { UserIntegration } from "@/types/integrations";
import type { Function } from "@/types/functions";

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
  onFunctionEnabled?: () => void; // Callback to trigger UI refresh after function is enabled
  onMinimizedChange?: (minimized: boolean) => void; // Callback when minimized state changes
  disableInput?: boolean; // Hide input field and send button when true
}

const STEP_NAMES = [
  "Template & Name",
  "Model Selection",
  "Voice & Language",
  "Call Outcomes",
  "Agent Behaviour",
  "Integrations"
];

export const GuidedSetupChat: React.FC<GuidedSetupChatProps> = ({
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
}) => {
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
  // Function enablement state
  const [currentIntegrationForFunctions, setCurrentIntegrationForFunctions] = useState<string | null>(null);
  const [functionsToAsk, setFunctionsToAsk] = useState<Function[]>([]);
  const [currentFunctionIndex, setCurrentFunctionIndex] = useState(0);
  const [functionsAsked, setFunctionsAsked] = useState<Set<number>>(new Set());
  // Flag to track if we're waiting for ChatGPT response
  const [awaitingChatGPTResponse, setAwaitingChatGPTResponse] = useState(false);
  
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

  // Mapping of integration types to specific functions to ask about
  const INTEGRATION_FUNCTIONS_TO_ASK: Record<string, string[]> = {
    'pipedrive': ['Manage info on CRM'],
    'calcom': ['SMS Booking', 'SMS Booking with CRM Sync'],
  };

  // Helper function to start function enablement flow
  const startFunctionEnablementFlow = useCallback(async (integrationType: string) => {
    try {
      // Fetch available functions for this integration
      const functionsResponse = await functionsApi.listByIntegration(integrationType);
      const availableFunctions = functionsResponse.data || [];
      
      if (availableFunctions.length === 0) {
        // No functions available, skip function enablement
        return false;
      }
      
      // Get the specific functions to ask about for this integration
      const functionsToAskNames = INTEGRATION_FUNCTIONS_TO_ASK[integrationType];
      if (!functionsToAskNames || functionsToAskNames.length === 0) {
        // No specific functions configured for this integration, skip
        return false;
      }
      
      // Filter to only the functions we want to ask about
      let functionsToEnable = availableFunctions.filter(func => 
        functionsToAskNames.includes(func.name)
      );
      
      // Sort functions in the order specified in INTEGRATION_FUNCTIONS_TO_ASK
      functionsToEnable.sort((a, b) => {
        const indexA = functionsToAskNames.indexOf(a.name);
        const indexB = functionsToAskNames.indexOf(b.name);
        return indexA - indexB;
      });
      
      if (functionsToEnable.length === 0) {
        // None of the specified functions found, skip
        return false;
      }
      
      // If agentId exists, filter out already enabled functions
      if (agentId) {
        try {
          const agentFunctionsResponse = await agentFunctionsApi.list(agentId);
          const enabledFunctionIds = new Set<number>();
          
          if (agentFunctionsResponse.data) {
            agentFunctionsResponse.data.forEach((group) => {
              if (group.integration_type === integrationType) {
                group.functions.forEach((af) => {
                  if (af.enabled) {
                    enabledFunctionIds.add(af.function_id);
                  }
                });
              }
            });
          }
          
          // Filter out already enabled functions
          functionsToEnable = functionsToEnable.filter(
            (func) => !enabledFunctionIds.has(func.id)
          );
        } catch (error) {
          console.error('Error fetching agent functions:', error);
          // Continue with all functions if we can't check
        }
      }
      
      if (functionsToEnable.length === 0) {
        // All specified functions already enabled, skip
        return false;
      }
      
      // Set up function enablement flow
      setCurrentIntegrationForFunctions(integrationType);
      setFunctionsToAsk(functionsToEnable);
      setCurrentFunctionIndex(0);
      setFunctionsAsked(new Set());

      // Use the new phase system
      setIntegrationFlowPhase('functions');
      previousFlowPhaseRef.current = 'functions';

      // Ask about first function
      const firstFunction = functionsToEnable[0];
      const messageId = `msg-${Date.now()}-${Math.random()}`;
      // Customize message based on integration type
      let messageText = '';
      if (integrationType === 'pipedrive') {
        messageText = `Great! Your Pipedrive integration is connected. Would you like to enable "Manage info on CRM"? This allows your assistant to update contact information automatically.`;
      } else if (integrationType === 'calcom') {
        messageText = `Great! Your Cal.com integration is connected. Would you like to enable "${firstFunction.name}"?`;
      } else {
        messageText = `Great! Your ${integrationType} integration is connected. Would you like to enable "${firstFunction.name}"? ${firstFunction.description}`;
      }

      addSystemMessage(
        messageText,
        messageId,
        [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      );

      return true;
    } catch (error) {
      console.error('Error starting function enablement flow:', error);
      return false;
    }
  }, [agentId, addSystemMessage]);

  // Start integration flow with ChatGPT - determines initial phase based on connected integrations
  const startIntegrationFlowWithChatGPT = useCallback(async (loadedIntegrations: Set<string>) => {
    const hasCrm = loadedIntegrations.has('pipedrive') || loadedIntegrations.has('hubspot') || loadedIntegrations.has('kommo');
    const hasScheduling = loadedIntegrations.has('calcom') || loadedIntegrations.has('calendly') || loadedIntegrations.has('google_calendar');

    // Set initial phase based on existing integrations
    let initialPhase: IntegrationFlowPhase = 'crm';
    let initialMessage = "Would you like to connect a CRM system to manage your contacts and deals?";
    let initialButtons: ChatButton[] = [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" }
    ];

    if (hasCrm && hasScheduling) {
      // Both connected, go to recommendations
      initialPhase = 'recommendations';
      initialMessage = "I see you already have both CRM and scheduling tools connected. Would you like to recommend any other tools we should support?";
      initialButtons = [
        { label: "Yes", value: "yes" },
        { label: "No, I'm done", value: "no" }
      ];
    } else if (hasCrm) {
      // CRM connected, check for functions then ask about scheduling
      const crmType = Array.from(loadedIntegrations).find(type => ['pipedrive', 'hubspot', 'kommo'].includes(type));
      if (crmType) {
        // Try to start function enablement for CRM
        const flowStarted = await startFunctionEnablementFlow(crmType);
        if (flowStarted) {
          return; // Function flow started, don't ask another question
        }
      }
      initialPhase = 'scheduling';
      initialMessage = "I see you have a CRM connected. Would you like to connect a scheduling tool for booking appointments?";
      initialButtons = [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" }
      ];
    } else if (hasScheduling) {
      // Scheduling connected, skip CRM and go to recommendations
      setCrmSkipped(true);
      initialPhase = 'recommendations';
      initialMessage = "I see you have a scheduling tool connected. Would you like to recommend any other tools we should support?";
      initialButtons = [
        { label: "Yes", value: "yes" },
        { label: "No, I'm done", value: "no" }
      ];
    }

    setIntegrationFlowPhase(initialPhase);
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    addSystemMessage(initialMessage, messageId, initialButtons);
  }, [addSystemMessage, startFunctionEnablementFlow]);

  // Monitor step 5 and start integration flow with ChatGPT
  useEffect(() => {
    if (wizardContext?.currentStep === 5 && !integrationFlowStartedRef.current && messages.length === 0) {
      integrationFlowStartedRef.current = true;

      // Load integrations first, then start the ChatGPT-driven flow
      loadConnectedIntegrations().then((loadedIntegrations) => {
        setConnectedIntegrations(loadedIntegrations);

        setTimeout(() => {
          // Send welcome message
          if (!welcomeMessageSentRef.current) {
            welcomeMessageSentRef.current = true;
            addSystemMessage("Hello! I'm here to help you set up your Voiceable assistant. Let me guide you through the process on how to integrate tools.");
          }

          // Start the ChatGPT-driven flow after welcome message
          setTimeout(() => {
            startIntegrationFlowWithChatGPT(loadedIntegrations);
          }, 800);
        }, 500);
      });
    } else if (wizardContext?.currentStep !== 5) {
      // Reset flow state when leaving step 5
      integrationFlowStartedRef.current = false;
      welcomeMessageSentRef.current = false;
      setIntegrationFlowPhase('initial');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardContext?.currentStep, messages.length, loadConnectedIntegrations]);

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
      currentIntegration: currentIntegrationForFunctions || undefined,
      pendingFunctions: functionsToAsk.map(f => ({ id: f.id, name: f.name, description: f.description || '' })),
      currentFunctionIndex: currentFunctionIndex,
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
  }, [wizardContext, agentId, integrationFlowPhase, connectedIntegrations, currentIntegrationForFunctions, functionsToAsk, currentFunctionIndex, crmSkipped, schedulingSkipped]);

  // Handle function enablement responses
  const handleFunctionEnablementResponse = useCallback(async (userMessage: string, integrationType: string) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const currentFunction = functionsToAsk[currentFunctionIndex];

    if (!currentFunction) {
      // No more functions, proceed to next step
      return;
    }

    // Mark this function as asked
    setFunctionsAsked(prev => new Set(prev).add(currentFunction.id));

    if (lowerMessage === 'yes' || lowerMessage.includes('yes')) {
      try {
        if (agentId) {
          await agentFunctionsApi.enable(agentId, currentFunction.id, true);
          addSystemMessage(`✓ "${currentFunction.name}" has been enabled.`);
          if (onFunctionEnabled) {
            onFunctionEnabled();
          }
        } else {
          addSystemMessage(`✓ I'll enable "${currentFunction.name}" when your agent is created.`);
        }
      } catch (error) {
        console.error('Error enabling function:', error);
        addSystemMessage(`I encountered an error enabling "${currentFunction.name}". You can enable it later from the settings.`);
      }
    } else if (lowerMessage === 'no' || lowerMessage.includes('no')) {
      addSystemMessage(`Skipped "${currentFunction.name}".`);
    }

    // Move to next function
    const nextIndex = currentFunctionIndex + 1;

    if (nextIndex < functionsToAsk.length) {
      // Ask about next function
      setTimeout(() => {
        const nextFunction = functionsToAsk[nextIndex];
        setCurrentFunctionIndex(nextIndex);

        const messageId = `msg-${Date.now()}-${Math.random()}`;
        let messageText = '';
        if (integrationType === 'pipedrive') {
          messageText = `Would you like to enable "Manage info on CRM"?`;
        } else if (integrationType === 'calcom') {
          messageText = `Would you like to enable "${nextFunction.name}"?`;
        } else {
          messageText = `Would you like to enable "${nextFunction.name}"? ${nextFunction.description}`;
        }

        addSystemMessage(messageText, messageId, [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]);
      }, 300);
    } else {
      // All functions processed - advance to next phase
      setCurrentIntegrationForFunctions(null);
      setFunctionsToAsk([]);
      setCurrentFunctionIndex(0);
      setFunctionsAsked(new Set());

      const isCrm = ['pipedrive', 'hubspot', 'kommo'].includes(integrationType);
      const hasScheduling = connectedIntegrations.has('calcom') || connectedIntegrations.has('calendly') || connectedIntegrations.has('google_calendar');

      setTimeout(() => {
        if (isCrm) {
          if (hasScheduling || schedulingSkipped) {
            setIntegrationFlowPhase('recommendations');
            addSystemMessage("All done! Would you like to recommend any other tools we should support?", undefined, [
              { label: "Yes", value: "yes" },
              { label: "No, I'm done", value: "no" }
            ]);
          } else {
            setIntegrationFlowPhase('scheduling');
            addSystemMessage("All done! Now let's set up scheduling tools. Would you like to connect a scheduling tool?", undefined, [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]);
          }
        } else {
          setIntegrationFlowPhase('recommendations');
          addSystemMessage("All done! Would you like to recommend any other tools we should support?", undefined, [
            { label: "Yes", value: "yes" },
            { label: "No, I'm done", value: "no" }
          ]);
        }
      }, 500);
    }
  }, [functionsToAsk, currentFunctionIndex, agentId, addSystemMessage, connectedIntegrations, onFunctionEnabled, schedulingSkipped]);

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
        setIntegrationFlowPhase('crm_options');
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
        setIntegrationFlowPhase('scheduling_options');
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

  // Execute Step 5 specific actions from ChatGPT
  const executeStep5Action = useCallback(async (action: WizardAction): Promise<void> => {
    switch (action.type) {
      case "OPEN_INTEGRATION_MODAL":
        if (action.value && wizardContext) {
          const integrationType = action.value.toLowerCase();
          const isCRM = ['pipedrive', 'hubspot', 'kommo'].includes(integrationType);
          const isScheduling = ['calcom', 'calendly', 'google_calendar'].includes(integrationType);

          if (isCRM) {
            setIntegrationFlowPhase('crm_connecting');
          } else if (isScheduling) {
            setIntegrationFlowPhase('scheduling_connecting');
          }

          setCurrentIntegrationForFunctions(integrationType);
          await wizardContext.openIntegrationModal(integrationType);
        }
        break;

      case "ENABLE_FUNCTION":
        if (action.value && agentId) {
          try {
            const functionId = parseInt(action.value);
            if (!isNaN(functionId)) {
              await agentFunctionsApi.enable(agentId, functionId, true);
              if (onFunctionEnabled) {
                onFunctionEnabled();
              }
              // Move to next function or next phase
              if (currentFunctionIndex < functionsToAsk.length - 1) {
                setCurrentFunctionIndex(prev => prev + 1);
              } else {
                // All functions done, move to next phase
                advanceFromFunctionsPhase();
              }
            }
          } catch (error) {
            console.error('Error enabling function:', error);
          }
        }
        break;

      case "SKIP_PHASE":
        if (action.value) {
          const phase = action.value.toLowerCase();
          if (phase === 'crm') {
            setCrmSkipped(true);
            setIntegrationFlowPhase('scheduling');
          } else if (phase === 'scheduling') {
            setSchedulingSkipped(true);
            setIntegrationFlowPhase('recommendations');
          } else if (phase === 'functions') {
            advanceFromFunctionsPhase();
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
  }, [wizardContext, agentId, onFunctionEnabled, currentFunctionIndex, functionsToAsk.length]);

  // Helper to advance from functions phase
  const advanceFromFunctionsPhase = useCallback(() => {
    const isCRM = currentIntegrationForFunctions && ['pipedrive', 'hubspot', 'kommo'].includes(currentIntegrationForFunctions);
    const isScheduling = currentIntegrationForFunctions && ['calcom', 'calendly', 'google_calendar'].includes(currentIntegrationForFunctions);

    setCurrentIntegrationForFunctions(null);
    setFunctionsToAsk([]);
    setCurrentFunctionIndex(0);

    if (isCRM) {
      // Check if scheduling is already connected
      const hasScheduling = connectedIntegrations.has('calcom') ||
                           connectedIntegrations.has('calendly') ||
                           connectedIntegrations.has('google_calendar');
      if (hasScheduling || schedulingSkipped) {
        setIntegrationFlowPhase('recommendations');
      } else {
        setIntegrationFlowPhase('scheduling');
      }
    } else if (isScheduling) {
      setIntegrationFlowPhase('recommendations');
    } else {
      setIntegrationFlowPhase('recommendations');
    }
  }, [currentIntegrationForFunctions, connectedIntegrations, schedulingSkipped]);

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
      case 'crm':
        if (hasCRM || crmSkipped) {
          setIntegrationFlowPhase(hasScheduling || schedulingSkipped ? 'recommendations' : 'scheduling');
        } else {
          setIntegrationFlowPhase('crm');
        }
        break;
      case 'crm_options':
      case 'crm_connecting':
        if (hasCRM) {
          // Check if there are functions to enable
          if (functionsToAsk.length > 0) {
            setIntegrationFlowPhase('functions');
          } else {
            setIntegrationFlowPhase(hasScheduling || schedulingSkipped ? 'recommendations' : 'scheduling');
          }
        }
        break;
      case 'scheduling':
      case 'scheduling_options':
      case 'scheduling_connecting':
        if (hasScheduling) {
          if (functionsToAsk.length > 0) {
            setIntegrationFlowPhase('functions');
          } else {
            setIntegrationFlowPhase('recommendations');
          }
        }
        break;
      case 'functions':
        advanceFromFunctionsPhase();
        break;
      case 'recommendations':
        setIntegrationFlowPhase('complete');
        break;
    }
  }, [integrationFlowPhase, connectedIntegrations, crmSkipped, schedulingSkipped, functionsToAsk.length, advanceFromFunctionsPhase]);

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
        if (crmIntegrations.includes(lowerValue) || schedulingIntegrations.includes(lowerValue)) {
          const isCRM = crmIntegrations.includes(lowerValue);
          setIntegrationFlowPhase(isCRM ? 'crm_connecting' : 'scheduling_connecting');
          setCurrentIntegrationForFunctions(lowerValue);
          addUserMessage(buttonValue);
          if (wizardContext) {
            await wizardContext.openIntegrationModal(lowerValue);
          }
          setIsProcessing(false);
          setWaitingForUser(false);
          return;
        }

        // For function enablement flow, handle yes/no directly
        if (integrationFlowPhase === 'functions') {
          const integrationType = currentIntegrationForFunctions;
          if (integrationType) {
            addUserMessage(buttonValue);
            await handleFunctionEnablementResponse(buttonValue, integrationType);
            setIsProcessing(false);
            setWaitingForUser(false);
            return;
          }
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
  }, [isProcessing, waitingForUser, wizardContext, integrationFlowPhase, addUserMessage, currentIntegrationForFunctions, handleFunctionEnablementResponse, handleStep5ChatGPTMessage]);

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

          // Try to start function enablement flow
          const functionFlowStarted = connectedCrmType && integrationFlowPhase !== 'functions'
            ? await startFunctionEnablementFlow(connectedCrmType)
            : false;

          if (!functionFlowStarted) {
            // No functions, move to scheduling or recommendations
            if (hasScheduling || schedulingSkipped) {
              setIntegrationFlowPhase('recommendations');
              previousFlowPhaseRef.current = 'recommendations';
              addSystemMessage("Great! Your CRM integration is connected. Would you like to recommend any other tools?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No, I'm done", value: "no" }
              ]);
            } else {
              setIntegrationFlowPhase('scheduling');
              previousFlowPhaseRef.current = 'scheduling';
              addSystemMessage("Great! Your CRM integration is connected. Would you like to connect a scheduling tool?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }
          }
          return;
        } else if (currentPhase === 'crm_connecting' && !hasCrm && previousPhase === 'crm_connecting') {
          // CRM connection was cancelled
          setIntegrationFlowPhase('crm_options');
          previousFlowPhaseRef.current = 'crm_options';
        } else if (currentPhase === 'scheduling_connecting' && hasScheduling && !hadScheduling) {
          // Scheduling was successfully connected
          previousConnectedIntegrationsRef.current = newConnected;
          setConnectedIntegrations(newConnected);

          // Determine which scheduling integration was connected
          let connectedSchedulingType = '';
          if (newConnected.has('calcom')) connectedSchedulingType = 'calcom';
          else if (newConnected.has('calendly')) connectedSchedulingType = 'calendly';
          else if (newConnected.has('google_calendar')) connectedSchedulingType = 'google_calendar';

          // Try to start function enablement flow
          const functionFlowStarted = connectedSchedulingType && integrationFlowPhase !== 'functions'
            ? await startFunctionEnablementFlow(connectedSchedulingType)
            : false;

          if (!functionFlowStarted) {
            setIntegrationFlowPhase('recommendations');
            previousFlowPhaseRef.current = 'recommendations';
            addSystemMessage("Excellent! Your scheduling integration is connected. Would you like to recommend any other tools?", undefined, [
              { label: "Yes", value: "yes" },
              { label: "No, I'm done", value: "no" }
            ]);
          }
          return;
        } else if (currentPhase === 'scheduling_connecting' && !hasScheduling && previousPhase === 'scheduling_connecting') {
          // Scheduling connection was cancelled
          setIntegrationFlowPhase('scheduling_options');
          previousFlowPhaseRef.current = 'scheduling_options';
        }
      }

      // Update refs and state
      previousConnectedIntegrationsRef.current = newConnected;
      previousFlowPhaseRef.current = currentPhase;
      setConnectedIntegrations(newConnected);
    } catch (error) {
      console.error('Error checking integration connection:', error);
    }
  }, [integrationFlowPhase, addSystemMessage, startFunctionEnablementFlow, agentId, agent, wizardContext, schedulingSkipped]);

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
        const isInFunctionFlow = currentPhase === 'functions';
        const newCrm = newIntegrations.find(type => ['pipedrive', 'hubspot', 'kommo'].includes(type));
        const newScheduling = newIntegrations.find(type => ['calcom', 'calendly', 'google_calendar'].includes(type));

        // Don't trigger if we're already in function flow
        if (isInFunctionFlow) {
          previousConnectedIntegrationsRef.current = currentWizardIntegrations;
          setConnectedIntegrations(currentWizardIntegrations);
          return;
        }

        const isConnecting = currentPhase === 'crm_connecting' || currentPhase === 'scheduling_connecting';
        const hasFunctionQuestion = messages.some(msg => msg.text.includes("Would you like to enable"));

        // Handle new CRM integration
        if (newCrm && !isInFunctionFlow && !isConnecting && !hasFunctionQuestion && currentPhase !== 'complete' && currentPhase !== 'recommendations') {
          setIntegrationFlowPhase('crm_connecting');

          // Send welcome if not sent
          if (!welcomeMessageSentRef.current) {
            welcomeMessageSentRef.current = true;
            addSystemMessage("Hello! I'm here to help you set up your Voiceable assistant. Let me guide you through the process on how to integrate tools.");
          }

          // Start function flow
          setTimeout(async () => {
            const flowStarted = await startFunctionEnablementFlow(newCrm);
            if (!flowStarted) {
              const hasScheduling = currentWizardIntegrations.has('calcom') || currentWizardIntegrations.has('calendly') || currentWizardIntegrations.has('google_calendar');
              if (hasScheduling || schedulingSkipped) {
                setIntegrationFlowPhase('recommendations');
                addSystemMessage("Great! Your CRM integration is connected. Would you like to recommend any other tools?", undefined, [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" }
                ]);
              } else {
                setIntegrationFlowPhase('scheduling');
                addSystemMessage("Great! Your CRM integration is connected. Would you like to connect a scheduling tool?", undefined, [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" }
                ]);
              }
            }
          }, welcomeMessageSentRef.current ? 0 : 500);

          previousConnectedIntegrationsRef.current = currentWizardIntegrations;
          setConnectedIntegrations(currentWizardIntegrations);
          return;
        } else if (newScheduling && !isInFunctionFlow && currentPhase !== 'complete') {
          setIntegrationFlowPhase('scheduling_connecting');

          (async () => {
            const flowStarted = await startFunctionEnablementFlow(newScheduling);
            if (!flowStarted) {
              setIntegrationFlowPhase('recommendations');
              addSystemMessage("Excellent! Your scheduling integration is connected. Would you like to recommend any other tools?", undefined, [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]);
            }
          })();

          previousConnectedIntegrationsRef.current = currentWizardIntegrations;
          setConnectedIntegrations(currentWizardIntegrations);
          return;
        }

        previousConnectedIntegrationsRef.current = currentWizardIntegrations;
        setConnectedIntegrations(currentWizardIntegrations);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardContext?.formValues?.integrationTools, wizardContext?.currentStep, integrationFlowPhase]);

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
      // Handle function enablement responses directly (for better UX with yes/no)
      if (integrationFlowPhase === 'functions') {
        const integrationType = currentIntegrationForFunctions;
        if (integrationType) {
          await handleFunctionEnablementResponse(userInput, integrationType);
          setIsProcessing(false);
          setWaitingForUser(false);
          return;
        }
      }

      // Route all other Step 5 messages through ChatGPT
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
};
