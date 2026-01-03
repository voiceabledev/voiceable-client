import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { WorkflowCanvasV1 } from "@/components/workflows/v1/WorkflowCanvasV1";
import { NodeConfigPanelV1 } from "@/components/workflows/v1/NodeConfigPanelV1";
import { AddNodeMenu } from "@/components/workflows/v1/AddNodeMenu";
import { AddTriggerModal } from "@/components/workflows/v1/AddTriggerModal";
import { AddActionModal } from "@/components/workflows/v1/AddActionModal";
import { AddFlowTemplateModal } from "@/components/workflows/v1/AddFlowTemplateModal";
import { AgentStepConfigModal } from "@/components/workflows/v1/AgentStepConfigModal";
import { RenameNodeDialog } from "@/components/workflows/v1/RenameNodeDialog";
import { VersionHistoryPanel } from "@/components/workflows/v1/VersionHistoryPanel";
import type { WorkflowNodeV1, WorkflowConnectionV1, WorkflowV1, NodeType, TriggerType, ActionType, AgentStepConfig, NodeConfig } from "@/types/workflow-v1";
import { getDefaultConfigForNodeType, getDefaultNameForNodeType } from "@/types/workflow-v1";
import { workflowVersionsApi } from "@/lib/api";
import { workflowsV1Api } from "@/lib/api/workflows-v1";
import type { WebhookTool, AgentIntegrationTool } from "@/types/assistant";
import type { FlowTemplate } from "@/constants/assistant";

const FIXED_X_POSITION = 400; // Fixed X coordinate for all nodes (vertical layout)
const VERTICAL_SPACING = 150; // Vertical spacing between nodes

interface WorkflowTabProps {
  agentId: string;
  webhookTools: WebhookTool[];
  integrationTools: AgentIntegrationTool[];
  workflow?: WorkflowV1 | null; // Workflow loaded from agent metadata
  onSaveAgent?: (workflow?: WorkflowV1) => Promise<void>; // Save workflow to agent metadata
  onUpdateWebhookTools?: (tools: WebhookTool[]) => void;
  onUpdateIntegrationTools?: (tools: AgentIntegrationTool[]) => void;
  onVersionRestore?: () => Promise<void>; // Callback when a version is restored
}

export function WorkflowTab({
  agentId,
  webhookTools,
  integrationTools,
  workflow: workflowProp,
  onSaveAgent,
  onUpdateWebhookTools,
  onUpdateIntegrationTools,
  onVersionRestore,
}: WorkflowTabProps) {
  const { toast } = useToast();

  const [workflow, setWorkflow] = useState<WorkflowV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNodeV1[]>([]);
  const [connections, setConnections] = useState<WorkflowConnectionV1[]>([]);
  const pendingConnectionsRef = useRef<WorkflowConnectionV1[] | null>(null);
  
  // Debug: Log when connections change
  useEffect(() => {
    console.log("[WorkflowTab] Connections state changed:", {
      count: connections.length,
      connections: connections.map(c => ({ from: c.from, to: c.to, condition: c.condition }))
    });
  }, [connections]);
  
  // Set connections after nodes are set (to ensure nodes exist when rendering connections)
  // Only run this when we have pending connections from loading a saved workflow
  // Use a flag to ensure we only run this once per load, not on every node change
  const connectionsSetRef = useRef(false);
  useEffect(() => {
    if (pendingConnectionsRef.current && nodes.length > 0 && !connectionsSetRef.current) {
      const validConnections = pendingConnectionsRef.current.filter(conn => {
        const fromExists = nodes.some(n => n.id === conn.from);
        const toExists = nodes.some(n => n.id === conn.to);
        return fromExists && toExists;
      });
      console.log("[WorkflowTab] Setting pending connections after nodes are set:", {
        pendingCount: pendingConnectionsRef.current.length,
        validCount: validConnections.length,
        nodesCount: nodes.length
      });
      setConnections(validConnections);
      pendingConnectionsRef.current = null; // Clear after setting
      connectionsSetRef.current = true; // Mark as set
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]); // Only depend on nodes.length, not the entire nodes array
  
  // Reset the flag when workflow is loaded
  useEffect(() => {
    if (workflowProp) {
      connectionsSetRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowProp?.id]); // Reset when workflow ID changes
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeV1 | null>(null);
  const workflowLoadedRef = useRef(false); // Track if workflow has been loaded
  const lastWorkflowIdRef = useRef<string | undefined>(undefined); // Track last loaded workflow ID

  // Helper function to clean up orphaned connections
  const cleanupConnections = useCallback((currentNodes: WorkflowNodeV1[], currentConnections: WorkflowConnectionV1[]): WorkflowConnectionV1[] => {
    const nodeIds = new Set(currentNodes.map(n => n.id));
    return currentConnections.filter(conn => 
      nodeIds.has(conn.from) && nodeIds.has(conn.to)
    );
  }, []);

  const [isAddNodeMenuOpen, setIsAddNodeMenuOpen] = useState(false);
  const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isAddFlowTemplateOpen, setIsAddFlowTemplateOpen] = useState(false);
  const [flowTemplateFromNodeId, setFlowTemplateFromNodeId] = useState<string | undefined>(undefined);
  const [isAgentStepConfigOpen, setIsAgentStepConfigOpen] = useState(false);
  const [triggerJustSelected, setTriggerJustSelected] = useState(false);
  const [actionJustSelected, setActionJustSelected] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [replaceNodeId, setReplaceNodeId] = useState<string | null>(null);
  const [workflowGreetingMessage, setWorkflowGreetingMessage] = useState("");
  const [workflowContext, setWorkflowContext] = useState("");
  const [workflowMemories, setWorkflowMemories] = useState<Array<{ id: string; content: string }>>([]);
  const [workflowDefaultModel, setWorkflowDefaultModel] = useState("Balanced Currently Gemini 3.0 Flash");
  const [workflowSafeMode, setWorkflowSafeMode] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const lastAutoSaveVersionRef = useRef<number>(0);

  // Undo/Redo history
  type WorkflowState = {
    nodes: WorkflowNodeV1[];
    connections: WorkflowConnectionV1[];
  };
  const historyRef = useRef<WorkflowState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);

  // Save state to history
  const saveToHistory = useCallback((currentNodes: WorkflowNodeV1[], currentConnections: WorkflowConnectionV1[]) => {
    if (isUndoRedoRef.current) {
      return; // Don't save history during undo/redo operations
    }

    const state: WorkflowState = {
      nodes: JSON.parse(JSON.stringify(currentNodes)), // Deep clone
      connections: JSON.parse(JSON.stringify(currentConnections)), // Deep clone
    };

    // Remove any future history if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    // Add new state to history
    historyRef.current.push(state);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size to prevent memory issues (keep last 50 states)
    if (historyRef.current.length > 50) {
      historyRef.current = historyRef.current.slice(-50);
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      return; // Nothing to undo
    }

    isUndoRedoRef.current = true;
    historyIndexRef.current -= 1;
    const previousState = historyRef.current[historyIndexRef.current];
    
    if (previousState) {
      setNodes(previousState.nodes);
      setConnections(previousState.connections);
      setHasChanges(true);
    }
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, []);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return; // Nothing to redo
    }

    isUndoRedoRef.current = true;
    historyIndexRef.current += 1;
    const nextState = historyRef.current[historyIndexRef.current];
    
    if (nextState) {
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHasChanges(true);
    }
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, []);

  // Keyboard event handler for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we're not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Check for Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac) - Redo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Load workflow from agent metadata prop
  useEffect(() => {
    console.log("[Load] Workflow loading effect triggered", {
      workflowProp: workflowProp ? { id: workflowProp.id, name: workflowProp.name, nodesCount: workflowProp.nodes?.length } : null,
      workflowLoadedRef: workflowLoadedRef.current,
      lastWorkflowId: lastWorkflowIdRef.current
    });
    
    // Skip if workflow has already been loaded and workflowProp hasn't actually changed
    // Compare workflow IDs to detect real changes
    const newWorkflowId = workflowProp?.id;
    const lastWorkflowId = lastWorkflowIdRef.current;
    
    // Only reload if:
    // 1. We haven't loaded yet (workflowLoadedRef.current is false) AND workflowProp exists
    // 2. The workflow ID has changed (different workflow) AND new workflow exists
    // Don't reload if workflowProp becomes null after we've already loaded
    // IMPORTANT: Don't reload if we're currently saving (isSaving) to prevent reload loops
    const shouldReload = (!workflowLoadedRef.current && workflowProp && !isSaving) || 
                        (workflowLoadedRef.current && workflowProp && lastWorkflowId !== newWorkflowId && !isSaving);
    
    console.log("[Load] Should reload?", {
      shouldReload,
      hasNotLoaded: !workflowLoadedRef.current,
      workflowPropExists: !!workflowProp,
      workflowIdChanged: lastWorkflowId !== newWorkflowId,
      isSaving
    });
    
    // If we're currently saving, don't reload (prevents reload loops when auto-saving)
    if (isSaving) {
      console.log("[Load] Currently saving, skipping reload to prevent loop");
      setLoading(false);
      return;
    }
    
    // If we've already loaded and workflowProp is now null, don't reload (preserve current state)
    if (workflowLoadedRef.current && !workflowProp) {
      console.log("[Load] Workflow already loaded, skipping reload when workflowProp becomes null");
      setLoading(false); // Ensure loading is set to false
      return;
    }
    
    if (!shouldReload) {
      console.log("[Load] Skipping reload - nothing meaningful changed");
      setLoading(false); // Ensure loading is set to false
      return; // Skip reloading if nothing meaningful changed
    }
    
    console.log("[Load] Starting to load workflow...");
    setLoading(true);
    try {
      if (workflowProp) {
        console.log("[Load] Loading workflow from prop:", {
          id: workflowProp.id,
          name: workflowProp.name,
          nodesCount: workflowProp.nodes?.length || 0,
          connectionsCount: workflowProp.connections?.length || 0
        });
        setWorkflow(workflowProp);
        setWorkflowName(workflowProp.name || "Workflow");
        const initialNodes = workflowProp.nodes || [];
        const initialConnections = workflowProp.connections || [];
        console.log("[Load] Setting nodes and connections:", {
          nodesCount: initialNodes.length,
          connectionsCount: initialConnections.length,
          nodeIds: initialNodes.map(n => n.id),
          connectionFrom: initialConnections.map(c => c.from),
          connectionTo: initialConnections.map(c => c.to)
        });
        // Set nodes first
        setNodes(initialNodes);
        
        // Reset the connections set flag for this load
        connectionsSetRef.current = false;
        
        // Store connections to be set after nodes are set (via useEffect)
        console.log("[Load] Storing connections to be set after nodes:", {
          connectionsCount: initialConnections.length,
          connections: initialConnections.map(c => ({ from: c.from, to: c.to, condition: c.condition })),
          nodeIds: initialNodes.map(n => n.id)
        });
        pendingConnectionsRef.current = initialConnections;
        setWorkflowGreetingMessage(workflowProp.greetingMessage || "");
        setWorkflowContext(workflowProp.context || "");
        setWorkflowMemories(workflowProp.memories || []);
        setWorkflowDefaultModel(workflowProp.defaultModel || "Balanced Currently Gemini 3.0 Flash");
        setWorkflowSafeMode(workflowProp.safeMode || false);
        
        // Clear localStorage draft when loading from saved workflow
        localStorage.removeItem(`workflow-draft-${agentId}`);
        
        // Initialize history with initial state
        historyRef.current = [{
          nodes: JSON.parse(JSON.stringify(initialNodes)),
          connections: JSON.parse(JSON.stringify(initialConnections)),
        }];
        historyIndexRef.current = 0;
        workflowLoadedRef.current = true; // Mark as loaded
        lastWorkflowIdRef.current = workflowProp.id; // Store the workflow ID
        console.log("[Load] Workflow loaded successfully from prop");
      } else if (!workflowLoadedRef.current) {
        // Only load from localStorage or create empty if we haven't loaded yet
        console.log("[Load] No workflow prop, checking localStorage draft...");
        // Check for localStorage draft as fallback
        const draftKey = `workflow-draft-${agentId}`;
        const draftData = localStorage.getItem(draftKey);
        if (draftData) {
          try {
            const draft = JSON.parse(draftData);
            console.log("Loading workflow from localStorage draft:", draft);
            setWorkflowName(draft.name || "Workflow");
            setNodes(draft.nodes || []);
            setConnections(draft.connections || []);
            setWorkflowGreetingMessage(draft.greetingMessage || "");
            setWorkflowContext(draft.context || "");
            setWorkflowMemories(draft.memories || []);
            setWorkflowDefaultModel(draft.defaultModel || "Balanced Currently Gemini 3.0 Flash");
            setWorkflowSafeMode(draft.safeMode || false);
            
            // Initialize history with draft state
            historyRef.current = [{
              nodes: JSON.parse(JSON.stringify(draft.nodes || [])),
              connections: JSON.parse(JSON.stringify(draft.connections || [])),
            }];
            historyIndexRef.current = 0;
            workflowLoadedRef.current = true; // Mark as loaded
          } catch (draftErr) {
            console.error("Failed to parse localStorage draft:", draftErr);
            // Fall through to empty state
          }
        }
        
        // If no draft either, create empty state
        if (!draftData) {
          console.log("[Load] No draft found, creating empty workflow");
          setWorkflow(null);
          setWorkflowName("Workflow");
          const emptyNodes: WorkflowNodeV1[] = [];
          const emptyConnections: WorkflowConnectionV1[] = [];
          setNodes(emptyNodes);
          setConnections(emptyConnections);
          setWorkflowGreetingMessage("");
          setWorkflowContext("");
          setWorkflowMemories([]);
          setWorkflowDefaultModel("Balanced Currently Gemini 3.0 Flash");
          setWorkflowSafeMode(false);
          
          // Initialize history with empty state
          historyRef.current = [{
            nodes: [],
            connections: [],
          }];
          historyIndexRef.current = 0;
          workflowLoadedRef.current = true; // Mark as loaded
        }
      }
    } catch (err) {
      console.error("[Load] Failed to load workflow:", err);
      // Create empty workflow state
      setWorkflow(null);
      setWorkflowName("Workflow");
      const emptyNodes: WorkflowNodeV1[] = [];
      const emptyConnections: WorkflowConnectionV1[] = [];
      setNodes(emptyNodes);
      setConnections(emptyConnections);
      setWorkflowGreetingMessage("");
      setWorkflowContext("");
      setWorkflowMemories([]);
      setWorkflowDefaultModel("Balanced Currently Gemini 3.0 Flash");
      setWorkflowSafeMode(false);
      
      // Initialize history with empty state
      historyRef.current = [{
        nodes: [],
        connections: [],
      }];
      historyIndexRef.current = 0;
      workflowLoadedRef.current = true; // Mark as loaded even on error
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowProp?.id, agentId, isSaving]); // Only depend on workflow ID, not the entire workflow object

  // Auto-save to localStorage
  useEffect(() => {
    if (!loading && workflowName && agentId) {
      const draft = {
        name: workflowName,
        nodes,
        connections,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(`workflow-draft-${agentId}`, JSON.stringify(draft));
    }
  }, [workflowName, nodes, connections, agentId, loading]);

  // Sync tools to agent - update agent with any new tools created in workflow
  // This is called when workflow nodes create new webhook or integration tools
  const syncToolsToAgent = useCallback(async (newWebhookTools?: WebhookTool[], newIntegrationTools?: AgentIntegrationTool[]) => {
    if (newWebhookTools && onUpdateWebhookTools) {
      onUpdateWebhookTools(newWebhookTools);
    }
    if (newIntegrationTools && onUpdateIntegrationTools) {
      onUpdateIntegrationTools(newIntegrationTools);
    }
    if ((newWebhookTools || newIntegrationTools) && onSaveAgent) {
      await onSaveAgent();
    }
  }, [onUpdateWebhookTools, onUpdateIntegrationTools, onSaveAgent]);

  // Use the same handlers from WorkflowEditorV1
  const handleAddTrigger = useCallback((type: TriggerType, app?: string, triggerName?: string) => {
    const nodeName = triggerName || getDefaultNameForNodeType(type);
    
    setTriggerJustSelected(true);
    
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    const replaceNodeId = (window as unknown as Record<string, unknown>).__workflowReplaceNodeId as string | undefined;
    
    setNodes(prev => {
      let nodeToReplace = replaceNodeId ? prev.find(n => n.id === replaceNodeId) : null;
      
      if (!nodeToReplace) {
        nodeToReplace = prev.find(n => n.type === "select-trigger");
      }
      
      if (nodeToReplace) {
        const updatedNode: WorkflowNodeV1 = {
          ...nodeToReplace,
          type,
          name: nodeName,
          config: getDefaultConfigForNodeType(type)
        };
        const newNodes = prev.map(n => n.id === nodeToReplace!.id ? updatedNode : n);
        setSelectedNode(updatedNode);
        if (replaceNodeId) {
          delete (window as unknown as Record<string, unknown>).__workflowReplaceNodeId;
          setReplaceNodeId(null);
        }
        return newNodes;
      } else {
        // Find the last node (highest Y position) to position new node below it
        const lastNode = prev.length > 0 
          ? prev.reduce((last, current) => current.position.y > last.position.y ? current : last)
          : null;
        
        const newNode: WorkflowNodeV1 = {
          id: `node-${Date.now()}`,
          type,
          name: nodeName,
          position: {
            x: FIXED_X_POSITION,
            y: lastNode ? lastNode.position.y + VERTICAL_SPACING : 200
          },
          config: getDefaultConfigForNodeType(type)
        };
        setSelectedNode(newNode);
        return [...prev, newNode];
      }
    });
    
    setHasChanges(true);
  }, [nodes, connections, saveToHistory]);

  const handleAddAction = useCallback((type: ActionType, app?: string, actionName?: string, fromNodeId?: string) => {
    const nodeName = actionName || getDefaultNameForNodeType(type);
    
    setActionJustSelected(true);
    
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    const replaceNodeId = (window as unknown as Record<string, unknown>).__workflowReplaceNodeId as string | undefined;
    
    setNodes(prev => {
      let nodeToReplace = replaceNodeId ? prev.find(n => n.id === replaceNodeId) : null;
      
      if (!nodeToReplace) {
        nodeToReplace = prev.find(n => n.type === "select-action");
      }
      
      if (nodeToReplace) {
        const updatedNode: WorkflowNodeV1 = {
          ...nodeToReplace,
          type,
          name: nodeName,
          config: getDefaultConfigForNodeType(type)
        };
        const newNodes = prev.map(n => n.id === nodeToReplace!.id ? updatedNode : n);
        setSelectedNode(updatedNode);
        if (replaceNodeId) {
          delete (window as unknown as Record<string, unknown>).__workflowReplaceNodeId;
          setReplaceNodeId(null);
        }
        return newNodes;
      } else {
        // Always connect to the last node (highest Y position)
        const lastNode = prev.length > 0 
          ? prev.reduce((last, current) => current.position.y > last.position.y ? current : last)
          : null;
        
        const NODE_HEIGHT = 100;
        const position = {
          x: FIXED_X_POSITION,
          y: lastNode ? lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING : 200
        };
        
        const newNode: WorkflowNodeV1 = {
          id: `node-${Date.now()}`,
          type,
          name: nodeName,
          position,
          config: getDefaultConfigForNodeType(type)
        };
        
        // Always create connection from last node to new node
        if (lastNode) {
          setConnections(prevConnections => {
            const existingConnection = prevConnections.find(
              c => c.from === lastNode.id && c.to === newNode.id
            );
            if (!existingConnection) {
              return [...prevConnections, { from: lastNode.id, to: newNode.id }];
            }
            return prevConnections;
          });
        }
        
        setSelectedNode(newNode);
        return [...prev, newNode];
      }
    });
    
    setHasChanges(true);
  }, [connections, nodes, saveToHistory]);

  const handleAddFlowTemplate = useCallback((template: FlowTemplate, fromNodeId?: string) => {
    const NODE_HEIGHT = 100;
    
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    setNodes(prev => {
      // Always connect to the last node (highest Y position)
      const lastNode = prev.length > 0 
        ? prev.reduce((last, current) => current.position.y > last.position.y ? current : last)
        : null;
      
      const startPosition = {
        x: FIXED_X_POSITION,
        y: lastNode ? lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING : 200
      };
      
      // Create all nodes from template
      const templateNodes: WorkflowNodeV1[] = template.nodes.map((templateNode, index) => ({
        id: `node-${Date.now()}-${index}`,
        type: templateNode.type,
        name: templateNode.name,
        position: {
          x: FIXED_X_POSITION,
          y: startPosition.y + (index * (NODE_HEIGHT + VERTICAL_SPACING))
        },
        config: templateNode.config || getDefaultConfigForNodeType(templateNode.type)
      }));
      
      // Create connections between template nodes
      const templateConnections: WorkflowConnectionV1[] = template.connections.map(conn => ({
        from: templateNodes[conn.from].id,
        to: templateNodes[conn.to].id
      }));
      
      // Always connect first template node to last node
      if (lastNode) {
        templateConnections.push({
          from: lastNode.id,
          to: templateNodes[0].id
        });
      }
      
      // Update connections state
      setConnections(prev => [...prev, ...templateConnections]);
      
      // Select first node
      setSelectedNode(templateNodes[0]);
      
      return [...prev, ...templateNodes];
    });
    
    setHasChanges(true);
  }, [connections, nodes, saveToHistory]);

  const handleSaveAgentStep = useCallback((config: AgentStepConfig, fromNodeId?: string) => {
    const NODE_HEIGHT = 100;
    
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    // Always connect to the last node (highest Y position)
    const lastNode = nodes.length > 0 
      ? nodes.reduce((last, current) => current.position.y > last.position.y ? current : last)
      : null;
    
    const position = {
      x: FIXED_X_POSITION,
      y: lastNode ? lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING : 200
    };
    
    const newNode: WorkflowNodeV1 = {
      id: `node-${Date.now()}`,
      type: "agent-step",
      name: "Agent Step",
      position,
      config
    };

    setNodes(prev => [...prev, newNode]);
    
    // Always create connection from last node to new node
    if (lastNode) {
      setConnections(prevConnections => {
        const existingConnection = prevConnections.find(
          c => c.from === lastNode.id && c.to === newNode.id
        );
        if (!existingConnection) {
          return [...prevConnections, { from: lastNode.id, to: newNode.id }];
        }
        return prevConnections;
      });
    }
    
    setHasChanges(true);
    setSelectedNode(newNode);
  }, [nodes, connections, saveToHistory]);

  const handleNodeUpdate = useCallback((updatedNode: WorkflowNodeV1) => {
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    // Ensure X position is always fixed
    const nodeWithFixedX = {
      ...updatedNode,
      position: {
        x: FIXED_X_POSITION,
        y: updatedNode.position.y
      }
    };
    setNodes(prev => prev.map(n => n.id === updatedNode.id ? nodeWithFixedX : n));
    setHasChanges(true);
  }, [nodes, connections, saveToHistory]);

  const handleNodeSelect = useCallback((node: WorkflowNodeV1 | null) => {
    setSelectedNode(node);
    if (node?.type === "select-trigger") {
      setIsAddTriggerOpen(true);
    }
    if (node?.type === "select-action") {
      setIsAddActionOpen(true);
    }
  }, []);

  // Auto-save workflow to agent metadata
  const handleSave = useCallback(async () => {
    // Use default name if workflowName is empty
    const nameToUse = workflowName.trim() || "Workflow";
    
    if (!onSaveAgent) {
      console.warn("[Save] Skipping save - onSaveAgent is not available");
      return;
    }
    
    console.log("[Save] Save conditions met", {
      workflowName: nameToUse,
      hasOnSaveAgent: !!onSaveAgent,
      nodesCount: nodes.length,
      connectionsCount: connections.length
    });

    console.log("[Save] Starting save operation...");
    setIsSaving(true);
    
    try {
      // Create workflow object to save in agent metadata
      const workflowToSave: WorkflowV1 = {
        id: workflow?.id || `workflow-${agentId}`,
        name: nameToUse,
        nodes,
        connections,
        greetingMessage: workflowGreetingMessage,
        context: workflowContext,
        memories: workflowMemories,
        defaultModel: workflowDefaultModel,
        safeMode: workflowSafeMode,
        agentId,
        status: workflow?.status || "draft"
      };
      
      console.log("[Save] Workflow object created:", {
        id: workflowToSave.id,
        name: workflowToSave.name,
        nodesCount: workflowToSave.nodes.length,
        connectionsCount: workflowToSave.connections.length
      });
      
      setWorkflow(workflowToSave);
      
      // Save to agent metadata first - this is critical
      console.log("[Save] Calling onSaveAgent...");
      await onSaveAgent(workflowToSave);
      console.log("[Save] onSaveAgent completed successfully");
      
      // Only clear hasChanges after successful save
      setHasChanges(false);
      console.log("[Save] Changes flag cleared");
      
      // Create auto-save version on every save (non-blocking)
      if (nodes.length > 0) {
        try {
          console.log("[Save] Creating auto-save version...");
          await workflowVersionsApi.create(agentId, {
            workflow_data: workflowToSave,
            is_auto_save: true,
          });
          lastAutoSaveVersionRef.current = Date.now();
          console.log("[Save] Auto-save version created successfully");
        } catch (error) {
          console.error("[Save] Failed to create auto-save version (non-critical):", error);
          // Don't show error to user, just log it - version creation failure shouldn't block save
        }
      }
      
      console.log("[Save] Save operation completed successfully");
      setSaveStatus("saved");
      // Clear "saved" status after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("[Save] Failed to save workflow:", err);
      // Don't clear hasChanges on error so user can retry
      setSaveStatus("idle");
      // Show error to user via toast
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      console.log("[Save] Save operation finished");
    }
  }, [workflow, workflowName, nodes, connections, workflowGreetingMessage, workflowContext, workflowMemories, workflowDefaultModel, workflowSafeMode, agentId, onSaveAgent, toast]);

  // Auto-save when changes are made (debounced)
  useEffect(() => {
    if (!hasChanges || isSaving) {
      return;
    }
    
    console.log("[Auto-save] Changes detected, scheduling save in 500ms...");
    setSaveStatus("saving");
    
    const timeoutId = setTimeout(() => {
      console.log("[Auto-save] Triggering save now...");
      handleSave().catch((error) => {
        console.error("[Auto-save] Failed to save workflow:", error);
        setSaveStatus("idle");
      });
    }, 500); // Debounce by 500ms for faster saves

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasChanges, isSaving, handleSave]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    setNodes(prev => {
      const updatedNodes = prev.filter(n => n.id !== nodeId);
      setConnections(prevConnections => cleanupConnections(updatedNodes, prevConnections));
      return updatedNodes;
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setHasChanges(true);
  }, [selectedNode, cleanupConnections, nodes, connections, saveToHistory]);

  const handleRenameNode = useCallback((nodeId: string) => {
    setRenameNodeId(nodeId);
  }, []);

  const handleNodeEmail = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Open email client with node information
      const subject = encodeURIComponent(`Workflow Node: ${node.name}`);
      const body = encodeURIComponent(`Node ID: ${node.id}\nNode Type: ${node.type}\nNode Name: ${node.name}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  }, [nodes]);

  const handleRenameNodeConfirm = useCallback((newName: string) => {
    if (renameNodeId) {
      // Save current state to history before making changes
      saveToHistory(nodes, connections);
      setNodes(prev => prev.map(n => 
        n.id === renameNodeId ? { ...n, name: newName } : n
      ));
      if (selectedNode?.id === renameNodeId) {
        setSelectedNode({ ...selectedNode, name: newName });
      }
      setHasChanges(true);
      setRenameNodeId(null);
    }
  }, [renameNodeId, selectedNode, nodes, connections, saveToHistory]);

  // Reorder functions
  const handleMoveNodeUp = useCallback((nodeId: string) => {
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    // Sort nodes by Y position
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const nodeIndex = sortedNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex > 0) {
      const currentNode = sortedNodes[nodeIndex];
      const previousNode = sortedNodes[nodeIndex - 1];
      
      // Swap Y positions
      const updatedNodes = nodes.map(n => {
        if (n.id === currentNode.id) {
          return { ...n, position: { x: FIXED_X_POSITION, y: previousNode.position.y } };
        } else if (n.id === previousNode.id) {
          return { ...n, position: { x: FIXED_X_POSITION, y: currentNode.position.y } };
        }
        return n;
      });
      
      setNodes(updatedNodes);
      setHasChanges(true);
    }
  }, [nodes, connections, saveToHistory]);

  const handleMoveNodeDown = useCallback((nodeId: string) => {
    // Save current state to history before making changes
    saveToHistory(nodes, connections);
    
    // Sort nodes by Y position
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const nodeIndex = sortedNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex < sortedNodes.length - 1) {
      const currentNode = sortedNodes[nodeIndex];
      const nextNode = sortedNodes[nodeIndex + 1];
      
      // Swap Y positions
      const updatedNodes = nodes.map(n => {
        if (n.id === currentNode.id) {
          return { ...n, position: { x: FIXED_X_POSITION, y: nextNode.position.y } };
        } else if (n.id === nextNode.id) {
          return { ...n, position: { x: FIXED_X_POSITION, y: currentNode.position.y } };
        }
        return n;
      });
      
      setNodes(updatedNodes);
      setHasChanges(true);
    }
  }, [nodes, connections, saveToHistory]);

  const handleReplaceNode = useCallback((nodeId: string) => {
    setReplaceNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const isTrigger = node.type === "select-trigger" || 
        node.type === "google-sheets-new-row" || 
        node.type === "google-sheets-row-updated" || 
        node.type === "webhook" || 
        node.type === "manual";
      
      if (isTrigger) {
        setIsAddTriggerOpen(true);
      } else {
        (window as unknown as Record<string, unknown>).__workflowReplaceNodeId = nodeId;
        setIsAddActionOpen(true);
      }
    }
  }, [nodes]);

  // Versions are now created automatically on every save, no manual creation needed

  const handleVersionRestore = useCallback(async () => {
    // After restore, we need to reload the workflow from the agent
    // The restore creates a new version and updates the agent's conversation_config
    // We'll mark that we need to reload the workflow
    workflowLoadedRef.current = false;
    lastWorkflowIdRef.current = undefined;
    
    // Call parent callback to refresh agent data
    if (onVersionRestore) {
      await onVersionRestore();
    }
  }, [onVersionRestore]);

  // Clean up orphaned connections whenever nodes change
  useEffect(() => {
    setConnections(prev => {
      const cleaned = cleanupConnections(nodes, prev);
      if (cleaned.length !== prev.length || cleaned.some((c, i) => c.from !== prev[i]?.from || c.to !== prev[i]?.to)) {
        return cleaned;
      }
      return prev;
    });
  }, [nodes, cleanupConnections]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with version history button and save status */}
      <div className="flex-shrink-0 border-b border-border p-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Saved
            </span>
          )}
          {saveStatus === "idle" && hasChanges && (
            <span className="text-xs">Unsaved changes</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVersionHistory(true)}
        >
          <History className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Main Content Area - Flow Editor Only */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 transition-all">
          <WorkflowCanvasV1
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            onNodesChange={(newNodes) => {
              // Save previous state to history before updating
              saveToHistory(nodes, connections);
              setNodes(newNodes);
              setHasChanges(true);
            }}
            onConnectionsChange={(newConnections) => {
              // Save previous state to history before updating
              saveToHistory(nodes, connections);
              setConnections(newConnections);
              setHasChanges(true);
            }}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleNodeUpdate}
            onAddNodeClick={() => setIsAddNodeMenuOpen(true)}
            onAddTrigger={() => {
              setIsAddNodeMenuOpen(false);
              setIsAddTriggerOpen(true);
            }}
            onAddAction={(fromNodeId) => {
              setIsAddNodeMenuOpen(false);
              if (fromNodeId) {
                (window as unknown as Record<string, unknown>).__workflowFromNodeId = fromNodeId;
              }
              setIsAddActionOpen(true);
            }}
            onAddAgentStep={(fromNodeId) => {
              setIsAddNodeMenuOpen(false);
              setIsAgentStepConfigOpen(true);
              if (fromNodeId) {
                (window as unknown as Record<string, unknown>).__workflowFromNodeId = fromNodeId;
              }
            }}
            onAddKnowledgeBase={(fromNodeId) => {
              handleAddAction("knowledge-base", undefined, undefined, fromNodeId);
            }}
            onAddCondition={(fromNodeId) => {
              handleAddAction("condition", undefined, undefined, fromNodeId);
            }}
            onAddLoop={(fromNodeId) => {
              handleAddAction("condition", undefined, undefined, fromNodeId);
            }}
            onAddFlowTemplate={(fromNodeId) => {
              setIsAddNodeMenuOpen(false);
              setFlowTemplateFromNodeId(fromNodeId);
              setIsAddFlowTemplateOpen(true);
            }}
            onNodeRename={handleRenameNode}
            onNodeReplace={handleReplaceNode}
            onNodeDelete={handleDeleteNode}
            onNodeEmail={handleNodeEmail}
            onNodeMoveUp={handleMoveNodeUp}
            onNodeMoveDown={handleMoveNodeDown}
          />
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <NodeConfigPanelV1
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleNodeUpdate}
            onOpenTriggerModal={() => setIsAddTriggerOpen(true)}
            onOpenActionModal={() => setIsAddActionOpen(true)}
          />
        )}
      </div>

      {/* Add Node Menu */}
      <AddNodeMenu
        isOpen={isAddNodeMenuOpen}
        onClose={() => setIsAddNodeMenuOpen(false)}
        onSelectTrigger={() => setIsAddTriggerOpen(true)}
        onSelectAction={() => setIsAddActionOpen(true)}
        onSelectAgentStep={() => setIsAgentStepConfigOpen(true)}
      >
        <div />
      </AddNodeMenu>

      {/* Add Trigger Modal */}
      <AddTriggerModal
        isOpen={isAddTriggerOpen}
        onClose={() => {
          setIsAddTriggerOpen(false);
          setTimeout(() => {
            setTriggerJustSelected(false);
          }, 0);
          if (!triggerJustSelected) {
            setNodes(prev => {
              const hasTriggerNode = prev.some(n => 
                n.type === "select-trigger" || 
                n.type === "google-sheets-new-row" || 
                n.type === "google-sheets-row-updated" || 
                n.type === "webhook" || 
                n.type === "manual"
              );
              if (!hasTriggerNode) {
                const placeholderNode: WorkflowNodeV1 = {
                  id: `node-${Date.now()}`,
                  type: "select-trigger",
                  name: "Select trigger",
                  position: {
                    x: FIXED_X_POSITION,
                    y: 200
                  },
                  config: {} as NodeConfig
                };
                setSelectedNode(placeholderNode);
                setHasChanges(true);
                return [...prev, placeholderNode];
              }
              return prev;
            });
          }
        }}
        onSelect={handleAddTrigger}
      />

      {/* Add Action Modal */}
      <AddActionModal
        isOpen={isAddActionOpen}
        integrationTools={integrationTools}
        onClose={() => {
          setIsAddActionOpen(false);
          setTimeout(() => {
            setActionJustSelected(false);
          }, 0);
          if (!actionJustSelected) {
            setNodes(prev => {
              const hasActionNode = prev.some(n => 
                n.type === "select-action" || 
                n.type === "make-call" || 
                n.type === "knowledge-base" || 
                n.type === "condition" || 
                n.type === "agent-step" || 
                n.type === "google-sheets-action" || 
                n.type === "api-request"
              );
              if (!hasActionNode) {
                const placeholderNode: WorkflowNodeV1 = {
                  id: `node-${Date.now()}`,
                  type: "select-action",
                  name: "Select action",
                  position: {
                    x: FIXED_X_POSITION,
                    y: 350
                  },
                  config: {} as NodeConfig
                };
                setSelectedNode(placeholderNode);
                setHasChanges(true);
                return [...prev, placeholderNode];
              }
              return prev;
            });
          }
        }}
        onSelect={(type, app, actionName) => {
          const fromNodeId = (window as unknown as Record<string, unknown>).__workflowFromNodeId as string | undefined;
          handleAddAction(type, app, actionName, fromNodeId);
          delete (window as unknown as Record<string, unknown>).__workflowFromNodeId;
        }}
      />

      {/* Add Flow Template Modal */}
      <AddFlowTemplateModal
        isOpen={isAddFlowTemplateOpen}
        integrationTools={integrationTools}
        onClose={() => {
          setIsAddFlowTemplateOpen(false);
          setFlowTemplateFromNodeId(undefined);
        }}
        onSelect={(template) => {
          handleAddFlowTemplate(template, flowTemplateFromNodeId);
        }}
      />

      {/* Agent Step Config Modal */}
      <AgentStepConfigModal
        isOpen={isAgentStepConfigOpen}
        onClose={() => setIsAgentStepConfigOpen(false)}
        onSave={(config) => {
          const fromNodeId = (window as unknown as Record<string, unknown>).__workflowFromNodeId as string | undefined;
          handleSaveAgentStep(config, fromNodeId);
          delete (window as unknown as Record<string, unknown>).__workflowFromNodeId;
        }}
      />

      {/* Rename Node Dialog */}
      {renameNodeId && (
        <RenameNodeDialog
          open={!!renameNodeId}
          onOpenChange={(open) => {
            if (!open) setRenameNodeId(null);
          }}
          currentName={nodes.find(n => n.id === renameNodeId)?.name || ""}
          onRename={handleRenameNodeConfirm}
        />
      )}

      {/* Version History Panel */}
        <VersionHistoryPanel
          agentId={agentId}
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          onVersionRestore={handleVersionRestore}
        />
    </div>
  );
}
