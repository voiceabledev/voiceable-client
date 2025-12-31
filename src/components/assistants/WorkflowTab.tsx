import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowCanvasV1 } from "@/components/workflows/v1/WorkflowCanvasV1";
import { NodeConfigPanelV1 } from "@/components/workflows/v1/NodeConfigPanelV1";
import { AddNodeMenu } from "@/components/workflows/v1/AddNodeMenu";
import { AddTriggerModal } from "@/components/workflows/v1/AddTriggerModal";
import { AddActionModal } from "@/components/workflows/v1/AddActionModal";
import { AddFlowTemplateModal } from "@/components/workflows/v1/AddFlowTemplateModal";
import { AgentStepConfigModal } from "@/components/workflows/v1/AgentStepConfigModal";
import { RenameNodeDialog } from "@/components/workflows/v1/RenameNodeDialog";
import type { WorkflowNodeV1, WorkflowConnectionV1, WorkflowV1, NodeType, TriggerType, ActionType, AgentStepConfig, NodeConfig } from "@/types/workflow-v1";
import { getDefaultConfigForNodeType, getDefaultNameForNodeType } from "@/types/workflow-v1";
import { workflowsV1Api } from "@/lib/api/workflows-v1";
import type { WebhookTool, AgentIntegrationTool } from "@/types/assistant";
import type { FlowTemplate } from "@/constants/assistant";

interface WorkflowTabProps {
  agentId: string;
  webhookTools: WebhookTool[];
  integrationTools: AgentIntegrationTool[];
  workflow?: WorkflowV1 | null; // Workflow loaded from agent metadata
  onSaveAgent?: (workflow?: WorkflowV1) => Promise<void>; // Save workflow to agent metadata
  onUpdateWebhookTools?: (tools: WebhookTool[]) => void;
  onUpdateIntegrationTools?: (tools: AgentIntegrationTool[]) => void;
}

export function WorkflowTab({
  agentId,
  webhookTools,
  integrationTools,
  workflow: workflowProp,
  onSaveAgent,
  onUpdateWebhookTools,
  onUpdateIntegrationTools,
}: WorkflowTabProps) {
  const { toast } = useToast();

  const [workflow, setWorkflow] = useState<WorkflowV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNodeV1[]>([]);
  const [connections, setConnections] = useState<WorkflowConnectionV1[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeV1 | null>(null);

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
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [replaceNodeId, setReplaceNodeId] = useState<string | null>(null);
  const [workflowGreetingMessage, setWorkflowGreetingMessage] = useState("");
  const [workflowContext, setWorkflowContext] = useState("");
  const [workflowMemories, setWorkflowMemories] = useState<Array<{ id: string; content: string }>>([]);
  const [workflowDefaultModel, setWorkflowDefaultModel] = useState("Balanced Currently Gemini 3.0 Flash");
  const [workflowSafeMode, setWorkflowSafeMode] = useState(false);

  // Load workflow from agent metadata prop
  useEffect(() => {
    setLoading(true);
    try {
      if (workflowProp) {
        setWorkflow(workflowProp);
        setWorkflowName(workflowProp.name || "Workflow");
        setNodes(workflowProp.nodes || []);
        setConnections(workflowProp.connections || []);
        setWorkflowGreetingMessage(workflowProp.greetingMessage || "");
        setWorkflowContext(workflowProp.context || "");
        setWorkflowMemories(workflowProp.memories || []);
        setWorkflowDefaultModel(workflowProp.defaultModel || "Balanced Currently Gemini 3.0 Flash");
        setWorkflowSafeMode(workflowProp.safeMode || false);
      } else {
        // No workflow exists yet, create empty state
        setWorkflow(null);
        setWorkflowName("Workflow");
        setNodes([]);
        setConnections([]);
        setWorkflowGreetingMessage("");
        setWorkflowContext("");
        setWorkflowMemories([]);
        setWorkflowDefaultModel("Balanced Currently Gemini 3.0 Flash");
        setWorkflowSafeMode(false);
      }
    } catch (err) {
      console.error("Failed to load workflow:", err);
      // Create empty workflow state
      setWorkflow(null);
      setWorkflowName("Workflow");
      setNodes([]);
      setConnections([]);
      setWorkflowGreetingMessage("");
      setWorkflowContext("");
      setWorkflowMemories([]);
      setWorkflowDefaultModel("Balanced Currently Gemini 3.0 Flash");
      setWorkflowSafeMode(false);
    } finally {
      setLoading(false);
    }
  }, [workflowProp]);

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
        const newNode: WorkflowNodeV1 = {
          id: `node-${Date.now()}`,
          type,
          name: nodeName,
          position: {
            x: 400 + (prev.length * 50),
            y: 200 + (prev.length * 150)
          },
          config: getDefaultConfigForNodeType(type)
        };
        setSelectedNode(newNode);
        return [...prev, newNode];
      }
    });
    
    setHasChanges(true);
  }, []);

  const handleAddAction = useCallback((type: ActionType, app?: string, actionName?: string, fromNodeId?: string) => {
    const nodeName = actionName || getDefaultNameForNodeType(type);
    
    setActionJustSelected(true);
    
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
        let actualFromNodeId = fromNodeId;
        let sourceNode = actualFromNodeId ? prev.find(n => n.id === actualFromNodeId) : null;
        const NODE_HEIGHT = 100;
        const VERTICAL_SPACING = 150;
        
        const existingConnections = actualFromNodeId 
          ? connections.filter(c => c.from === actualFromNodeId)
          : [];
        
        let position;
        
        if (sourceNode && existingConnections.length > 0) {
          const firstTargetNode = prev.find(n => n.id === existingConnections[0].to);
          if (firstTargetNode) {
            const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
            const targetTop = firstTargetNode.position.y;
            const currentDistance = targetTop - sourceBottom;
            const spacing = Math.max(VERTICAL_SPACING, currentDistance / 2.5);
            const newY = sourceBottom + spacing;
            position = {
              x: sourceNode.position.x,
              y: newY
            };
          } else {
            position = {
              x: sourceNode.position.x,
              y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
          }
        } else if (sourceNode) {
          position = {
            x: sourceNode.position.x,
            y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
          };
        } else {
          const lastNode = prev.length > 0 
            ? prev.reduce((last, current) => {
                return current.position.y > last.position.y ? current : last;
              })
            : null;
          
          if (lastNode) {
            position = {
              x: lastNode.position.x,
              y: lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
            actualFromNodeId = lastNode.id;
            sourceNode = lastNode;
          } else {
            position = {
              x: 400,
              y: 200
            };
          }
        }
        
        const newNode: WorkflowNodeV1 = {
          id: `node-${Date.now()}`,
          type,
          name: nodeName,
          position,
          config: getDefaultConfigForNodeType(type)
        };
        
        if (actualFromNodeId) {
          setConnections(prevConnections => {
            const existingConnection = prevConnections.find(
              c => c.from === actualFromNodeId && c.to === newNode.id
            );
            if (!existingConnection) {
              return [...prevConnections, { from: actualFromNodeId, to: newNode.id }];
            }
            return prevConnections;
          });
        }
        
        setSelectedNode(newNode);
        return [...prev, newNode];
      }
    });
    
    setHasChanges(true);
  }, [connections]);

  const handleAddFlowTemplate = useCallback((template: FlowTemplate, fromNodeId?: string) => {
    const NODE_HEIGHT = 100;
    const VERTICAL_SPACING = 150;
    
    setNodes(prev => {
      let sourceNode = fromNodeId ? prev.find(n => n.id === fromNodeId) : null;
      let startPosition;
      
      if (sourceNode) {
        // Position template after the source node
        const existingConnections = connections.filter(c => c.from === fromNodeId);
        
        if (existingConnections.length > 0) {
          const firstTargetNode = prev.find(n => n.id === existingConnections[0].to);
          if (firstTargetNode) {
            const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
            const targetTop = firstTargetNode.position.y;
            const currentDistance = targetTop - sourceBottom;
            const spacing = Math.max(VERTICAL_SPACING, currentDistance / (template.nodes.length + 1));
            startPosition = {
              x: sourceNode.position.x,
              y: sourceBottom + spacing
            };
          } else {
            startPosition = {
              x: sourceNode.position.x,
              y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
          }
        } else {
          startPosition = {
            x: sourceNode.position.x,
            y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
          };
        }
      } else {
        // Position template at the end or center
        const lastNode = prev.length > 0 
          ? prev.reduce((last, current) => {
              return current.position.y > last.position.y ? current : last;
            })
          : null;
        
        if (lastNode) {
          startPosition = {
            x: lastNode.position.x,
            y: lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
          };
        } else {
          startPosition = {
            x: 400,
            y: 200
          };
        }
      }
      
      // Create all nodes from template
      const templateNodes: WorkflowNodeV1[] = template.nodes.map((templateNode, index) => ({
        id: `node-${Date.now()}-${index}`,
        type: templateNode.type,
        name: templateNode.name,
        position: {
          x: startPosition.x,
          y: startPosition.y + (index * (NODE_HEIGHT + VERTICAL_SPACING))
        },
        config: templateNode.config || getDefaultConfigForNodeType(templateNode.type)
      }));
      
      // Create connections between template nodes
      const templateConnections: WorkflowConnectionV1[] = template.connections.map(conn => ({
        from: templateNodes[conn.from].id,
        to: templateNodes[conn.to].id
      }));
      
      // Connect first template node to source node if provided
      if (fromNodeId && sourceNode) {
        templateConnections.push({
          from: fromNodeId,
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
  }, [connections]);

  const handleSaveAgentStep = useCallback((config: AgentStepConfig, fromNodeId?: string) => {
    const NODE_HEIGHT = 100;
    const VERTICAL_SPACING = 150;
    
    const sourceNode = fromNodeId ? nodes.find(n => n.id === fromNodeId) : null;
    
    const existingConnections = fromNodeId 
      ? connections.filter(c => c.from === fromNodeId)
      : [];
    
    let position;
    
    if (sourceNode && existingConnections.length > 0) {
      const firstTargetNode = nodes.find(n => n.id === existingConnections[0].to);
      if (firstTargetNode) {
        const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
        const targetTop = firstTargetNode.position.y;
        const currentDistance = targetTop - sourceBottom;
        const spacing = Math.max(VERTICAL_SPACING, currentDistance / 2.5);
        const newY = sourceBottom + spacing;
        position = {
          x: sourceNode.position.x,
          y: newY
        };
      } else {
        position = {
          x: sourceNode.position.x,
          y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
        };
      }
    } else if (sourceNode) {
      position = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
      };
    } else {
      position = {
        x: 400 + (nodes.length * 50),
        y: 200 + (nodes.length * 150)
      };
    }
    
    const newNode: WorkflowNodeV1 = {
      id: `node-${Date.now()}`,
      type: "agent-step",
      name: "Agent Step",
      position,
      config
    };

    setNodes(prev => [...prev, newNode]);
    
    if (fromNodeId) {
      setConnections(prevConnections => {
        const existingConnection = prevConnections.find(
          c => c.from === fromNodeId && c.to === newNode.id
        );
        if (!existingConnection) {
          return [...prevConnections, { from: fromNodeId, to: newNode.id }];
        }
        return prevConnections;
      });
    }
    
    setHasChanges(true);
    setSelectedNode(newNode);
  }, [nodes, connections]);

  const handleNodeUpdate = useCallback((updatedNode: WorkflowNodeV1) => {
    setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
    setHasChanges(true);
  }, []);

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
    if (!workflowName.trim() || !onSaveAgent) {
      return;
    }

    setIsSaving(true);
    try {
      // Create workflow object to save in agent metadata
      const workflowToSave: WorkflowV1 = {
        id: workflow?.id || `workflow-${agentId}`,
        name: workflowName,
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
      
      setWorkflow(workflowToSave);
      await onSaveAgent(workflowToSave);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save workflow:", err);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, workflowName, nodes, connections, workflowGreetingMessage, workflowContext, workflowMemories, workflowDefaultModel, workflowSafeMode, agentId, onSaveAgent]);

  // Auto-save when changes are made (debounced)
  useEffect(() => {
    if (!hasChanges || isSaving) return;
    
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [hasChanges, isSaving, handleSave]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const updatedNodes = prev.filter(n => n.id !== nodeId);
      setConnections(prevConnections => cleanupConnections(updatedNodes, prevConnections));
      return updatedNodes;
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setHasChanges(true);
  }, [selectedNode, cleanupConnections]);

  const handleRenameNode = useCallback((nodeId: string) => {
    setRenameNodeId(nodeId);
  }, []);

  const handleRenameNodeConfirm = useCallback((newName: string) => {
    if (renameNodeId) {
      setNodes(prev => prev.map(n => 
        n.id === renameNodeId ? { ...n, name: newName } : n
      ));
      if (selectedNode?.id === renameNodeId) {
        setSelectedNode({ ...selectedNode, name: newName });
      }
      setHasChanges(true);
      setRenameNodeId(null);
    }
  }, [renameNodeId, selectedNode]);

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
      {/* Main Content Area - Flow Editor Only */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 transition-all">
          <WorkflowCanvasV1
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            onNodesChange={(newNodes) => {
              setNodes(newNodes);
              setHasChanges(true);
            }}
            onConnectionsChange={(newConnections) => {
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
                    x: 400,
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
                    x: 400,
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
    </div>
  );
}

