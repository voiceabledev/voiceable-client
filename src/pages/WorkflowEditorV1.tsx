import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2, Play, Save, Settings, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorkflowCanvasV1 } from "@/components/workflows/v1/WorkflowCanvasV1";
import { NodeConfigPanelV1 } from "@/components/workflows/v1/NodeConfigPanelV1";
import { AddNodeMenu } from "@/components/workflows/v1/AddNodeMenu";
import { AddTriggerModal } from "@/components/workflows/v1/AddTriggerModal";
import { AddActionModal } from "@/components/workflows/v1/AddActionModal";
import { AgentStepConfigModal } from "@/components/workflows/v1/AgentStepConfigModal";
import { ShareModal } from "@/components/workflows/v1/ShareModal";
import { WorkflowSettingsView } from "@/components/workflows/v1/WorkflowSettingsView";
import { RenameNodeDialog } from "@/components/workflows/v1/RenameNodeDialog";
import type { WorkflowNodeV1, WorkflowConnectionV1, WorkflowV1, NodeType, TriggerType, ActionType, AgentStepConfig, NodeConfig } from "@/types/workflow-v1";
import { getDefaultConfigForNodeType, getDefaultNameForNodeType } from "@/types/workflow-v1";
import { workflowsV1Api } from "@/lib/api/workflows-v1";

export default function WorkflowEditorV1() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [workflow, setWorkflow] = useState<WorkflowV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNodeV1[]>([]);
  const [connections, setConnections] = useState<WorkflowConnectionV1[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeV1 | null>(null);

  // Helper function to clean up orphaned connections (connections referencing non-existent nodes)
  const cleanupConnections = useCallback((currentNodes: WorkflowNodeV1[], currentConnections: WorkflowConnectionV1[]): WorkflowConnectionV1[] => {
    const nodeIds = new Set(currentNodes.map(n => n.id));
    return currentConnections.filter(conn => 
      nodeIds.has(conn.from) && nodeIds.has(conn.to)
    );
  }, []);
  const [isAddNodeMenuOpen, setIsAddNodeMenuOpen] = useState(false);
  const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isAgentStepConfigOpen, setIsAgentStepConfigOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [triggerJustSelected, setTriggerJustSelected] = useState(false);
  const [actionJustSelected, setActionJustSelected] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "flow">("flow");
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [replaceNodeId, setReplaceNodeId] = useState<string | null>(null);
  const [workflowGreetingMessage, setWorkflowGreetingMessage] = useState("");
  const [workflowContext, setWorkflowContext] = useState("");
  const [workflowMemories, setWorkflowMemories] = useState<Array<{ id: string; content: string }>>([]);
  const [workflowDefaultModel, setWorkflowDefaultModel] = useState("Balanced Currently Gemini 3.0 Flash");
  const [workflowSafeMode, setWorkflowSafeMode] = useState(false);

  // Load workflow
  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true);
      try {
        if (id && id !== "new") {
          const data = await workflowsV1Api.get(id);
          setWorkflow(data);
          setWorkflowName(data.name);
          setNodes(data.nodes || []);
          setConnections(data.connections || []);
          setWorkflowGreetingMessage(data.greetingMessage || "");
          setWorkflowContext(data.context || "");
          setWorkflowMemories(data.memories || []);
          setWorkflowDefaultModel(data.defaultModel || "Balanced Currently Gemini 3.0 Flash");
          setWorkflowSafeMode(data.safeMode || false);
        } else {
          // New workflow
          setWorkflowName("Untitled Workflow");
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
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch workflow";
        toast({
          title: "Error loading workflow",
          description: errorMessage,
          variant: "destructive",
        });
        // If it's a 404, navigate to new workflow instead
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          navigate("/workflows-v1/new");
        } else {
          // For other errors, create empty workflow
          setWorkflowName("Untitled Workflow");
          setNodes([]);
          setConnections([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id, toast, navigate]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!loading && workflowName) {
      const draft = {
        name: workflowName,
        nodes,
        connections,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(`workflow-draft-${id || 'new'}`, JSON.stringify(draft));
    }
  }, [workflowName, nodes, connections, id, loading]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (id === "new") {
      const draft = localStorage.getItem('workflow-draft-new');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setWorkflowName(parsed.name || "Untitled Workflow");
          setNodes(parsed.nodes || []);
          setConnections(parsed.connections || []);
        } catch {
          // Ignore invalid draft
        }
      }
    }
  }, [id]);

  const handleAddTrigger = useCallback((type: TriggerType, app?: string, triggerName?: string) => {
    const nodeName = triggerName || getDefaultNameForNodeType(type);
    
    // Mark that we just selected a trigger to prevent placeholder creation
    setTriggerJustSelected(true);
    
    // Check if we're replacing a node
    const replaceNodeId = (window as unknown as Record<string, unknown>).__workflowReplaceNodeId as string | undefined;
    
    // If there's a "select-trigger" placeholder, replace it
    setNodes(prev => {
      let nodeToReplace = replaceNodeId ? prev.find(n => n.id === replaceNodeId) : null;
      
      // If no specific node to replace, look for placeholder
      if (!nodeToReplace) {
        nodeToReplace = prev.find(n => n.type === "select-trigger");
      }
      
      if (nodeToReplace) {
        // Replace the node
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
        // Create new node
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
    
    // Mark that we just selected an action to prevent placeholder creation
    setActionJustSelected(true);
    
    // Check if we're replacing a node
    const replaceNodeId = (window as unknown as Record<string, unknown>).__workflowReplaceNodeId as string | undefined;
    
    // If there's a "select-action" placeholder, replace it
    // BUT only if we're not inserting between nodes (i.e., no fromNodeId or fromNodeId doesn't have connections)
    setNodes(prev => {
      // Only replace placeholder if we're not inserting in the middle of a chain
      // Check if fromNodeId has existing connections - if so, we're inserting, not replacing
      const hasExistingConnections = fromNodeId 
        ? connections.some(c => c.from === fromNodeId)
        : false;
      
      // Also check if there's a next node visually (which means we're inserting)
      const sourceNode = fromNodeId ? prev.find(n => n.id === fromNodeId) : null;
      const hasNextNodeVisually = sourceNode && (() => {
        const incomingConnections = connections.filter(c => c.to === fromNodeId);
        if (incomingConnections.length > 0) {
          const nextNode = prev.find(n => {
            if (n.id === fromNodeId) return false;
            const isBelow = n.position.y > sourceNode.position.y + 100;
            const isAligned = Math.abs(n.position.x - sourceNode.position.x) < 50;
            return isBelow && isAligned;
          });
          return !!nextNode;
        }
        return false;
      })();
      
      // Only replace placeholder if we're NOT inserting between nodes
      const shouldReplacePlaceholder = !hasExistingConnections && !hasNextNodeVisually && !replaceNodeId;
      
      // Check if we're replacing a specific node
      let nodeToReplace = replaceNodeId ? prev.find(n => n.id === replaceNodeId) : null;
      
      // If no specific node to replace, look for placeholder
      if (!nodeToReplace) {
        nodeToReplace = shouldReplacePlaceholder ? prev.find(n => n.type === "select-action") : null;
      }
      
      if (nodeToReplace) {
        // Replace the node
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
        // Find the source node if fromNodeId is provided
        let actualFromNodeId = fromNodeId;
        let sourceNode = actualFromNodeId ? prev.find(n => n.id === actualFromNodeId) : null;
        const NODE_HEIGHT = 100;
        const VERTICAL_SPACING = 150;
        
        // Check if source node has existing outgoing connections
        const existingConnections = actualFromNodeId 
          ? connections.filter(c => c.from === actualFromNodeId)
          : [];
        
        let position;
        const nodesToReposition: Array<{ id: string; newY: number }> = [];
        
        if (sourceNode && existingConnections.length > 0) {
          // Insert node in the middle - find the first target node to position between
          const firstTargetNode = prev.find(n => n.id === existingConnections[0].to);
          if (firstTargetNode) {
            // Calculate spacing with increased distance between nodes
            const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
            const targetTop = firstTargetNode.position.y;
            const currentDistance = targetTop - sourceBottom;
            
            // Use VERTICAL_SPACING (150px) as minimum spacing when inserting nodes
            // This ensures good visual separation between nodes
            const spacing = Math.max(VERTICAL_SPACING, currentDistance / 2.5);
            
            // Position new node with increased spacing
            const newY = sourceBottom + spacing;
            position = {
              x: sourceNode.position.x, // Same X position (vertical alignment)
              y: newY
            };
            
            // Reposition ALL subsequent nodes in the chain, not just the immediate target
            // Find all nodes that are below and aligned with the source
            const allNodesBelow = prev.filter(n => {
              if (n.id === actualFromNodeId) return false;
              const isBelow = n.position.y > sourceNode.position.y + NODE_HEIGHT;
              const isAligned = Math.abs(n.position.x - sourceNode.position.x) < 50;
              return isBelow && isAligned;
            }).sort((a, b) => a.position.y - b.position.y); // Sort by Y position
            
            // Reposition all nodes below, starting from the new node's position
            let currentY = newY + NODE_HEIGHT + spacing;
            allNodesBelow.forEach(node => {
              nodesToReposition.push({
                id: node.id,
                newY: currentY
              });
              currentY += NODE_HEIGHT + spacing; // Move to next position
            });
          } else {
            // Fallback: position below source with consistent spacing
            position = {
              x: sourceNode.position.x, // Same X position for vertical alignment (parallel)
              y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
          }
        } else if (sourceNode) {
          // No existing outgoing connections, but check if there's a next node in the chain
          // Find if this node has incoming connections and what comes after it
          const incomingConnections = connections.filter(c => c.to === actualFromNodeId);
          
          // If this node is in the middle of a chain, find the next node
          // Look for nodes that come after this one in the workflow
          let nextNodeInChain = null;
          if (incomingConnections.length > 0) {
            // This node is in a chain, find what comes after it
            // Find the CLOSEST node below this one that's aligned (not just any node)
            const nodesBelow = prev.filter(n => {
              if (n.id === actualFromNodeId) return false;
              // Check if node is below and aligned with source
              const isBelow = n.position.y > sourceNode.position.y + NODE_HEIGHT;
              const isAligned = Math.abs(n.position.x - sourceNode.position.x) < 50; // Allow some tolerance
              return isBelow && isAligned;
            });
            
            // Find the closest node (lowest Y position that's still below)
            if (nodesBelow.length > 0) {
              nextNodeInChain = nodesBelow.reduce((closest, current) => {
                return current.position.y < closest.position.y ? current : closest;
              });
            }
            
            // If found, insert in the middle
            if (nextNodeInChain) {
              const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
              const targetTop = nextNodeInChain.position.y;
              const currentDistance = targetTop - sourceBottom;
              
              // Use VERTICAL_SPACING (150px) as minimum spacing when inserting nodes
              const spacing = Math.max(VERTICAL_SPACING, currentDistance / 2.5);
              
              // Position new node with increased spacing
              const newY = sourceBottom + spacing;
              position = {
                x: sourceNode.position.x, // Same X position (vertical alignment)
                y: newY
              };
              
              // Reposition ALL subsequent nodes in the chain, not just the immediate next one
              // Find all nodes that are below and aligned with the source
              const allNodesBelow = prev.filter(n => {
                if (n.id === actualFromNodeId) return false;
                const isBelow = n.position.y > sourceNode.position.y + NODE_HEIGHT;
                const isAligned = Math.abs(n.position.x - sourceNode.position.x) < 50;
                return isBelow && isAligned;
              }).sort((a, b) => a.position.y - b.position.y); // Sort by Y position
              
              // Reposition all nodes below, starting from the new node's position
              let currentY = newY + NODE_HEIGHT + spacing;
              allNodesBelow.forEach(node => {
                nodesToReposition.push({
                  id: node.id,
                  newY: currentY
                });
                currentY += NODE_HEIGHT + spacing; // Move to next position
              });
            } else {
              // No next node found, position below source with consistent spacing
              position = {
                x: sourceNode.position.x, // Same X position for vertical alignment (parallel)
                y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
              };
            }
          } else {
            // No incoming connections either, just position below source
            position = {
              x: sourceNode.position.x, // Same X position for vertical alignment (parallel)
              y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
          }
        } else {
          // No source node provided - find the last node in the workflow chain
          // This happens when adding action from toolbar instead of "+" button
          const lastNode = prev.length > 0 
            ? prev.reduce((last, current) => {
                // Find node with highest Y position (bottommost node)
                return current.position.y > last.position.y ? current : last;
              })
            : null;
          
          if (lastNode) {
            // Position below the last node with consistent spacing
            position = {
              x: lastNode.position.x, // Same X position for vertical alignment (parallel)
              y: lastNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
            };
            // Set actualFromNodeId to lastNode.id so connection is created
            actualFromNodeId = lastNode.id;
            sourceNode = lastNode;
          } else {
            // No nodes exist, use default position
            position = {
              x: 400,
              y: 200
            };
          }
        }
        
        // Create new node
        const newNode: WorkflowNodeV1 = {
          id: `node-${Date.now()}`,
          type,
          name: nodeName,
          position,
          config: getDefaultConfigForNodeType(type)
        };
        
        // Reposition existing nodes if needed
        const updatedNodes = nodesToReposition.length > 0
          ? prev.map(n => {
              const reposition = nodesToReposition.find(r => r.id === n.id);
              if (reposition) {
                return {
                  ...n,
                  position: {
                    ...n.position,
                    y: reposition.newY
                  }
                };
              }
              return n;
            })
          : prev;
        
        // Always create connection if we have an actualFromNodeId (either provided or found)
        if (actualFromNodeId) {
          setConnections(prevConnections => {
            let newConnections = [...prevConnections];
            
            // Re-check existing connections with the actualFromNodeId
            const finalExistingConnections = connections.filter(c => c.from === actualFromNodeId);
            
            // Check if we found a next node in chain visually (from nodesToReposition)
            // Find the closest node below source that's in nodesToReposition
            let nextNodeInChain = null;
            if (nodesToReposition.length > 0) {
              const sourceNodeForConn = prev.find(n => n.id === actualFromNodeId);
              if (sourceNodeForConn) {
                const nodesBelow = prev.filter(n => {
                  if (n.id === actualFromNodeId) return false;
                  const isInReposition = nodesToReposition.some(r => r.id === n.id);
                  if (!isInReposition) return false;
                  // Check if node is below and aligned with source
                  const isBelow = n.position.y > sourceNodeForConn.position.y + 100; // NODE_HEIGHT
                  const isAligned = Math.abs(n.position.x - sourceNodeForConn.position.x) < 50;
                  return isBelow && isAligned;
                });
                
                // Find the closest node (lowest Y position that's still below)
                if (nodesBelow.length > 0) {
                  nextNodeInChain = nodesBelow.reduce((closest, current) => {
                    return current.position.y < closest.position.y ? current : closest;
                  });
                }
              }
            }
            
            // If source node has existing connections, insert new node in the middle
            if (finalExistingConnections.length > 0) {
              // Remove old connections from source to targets
              newConnections = newConnections.filter(
                c => !(c.from === actualFromNodeId && finalExistingConnections.some(ec => ec.to === c.to))
              );
              
              // Add connection from source to new node
              newConnections.push({ from: actualFromNodeId, to: newNode.id });
              
              // Add connections from new node to all previously connected targets
              finalExistingConnections.forEach(oldConn => {
                newConnections.push({
                  from: newNode.id,
                  to: oldConn.to,
                  condition: oldConn.condition // Preserve condition if any
                });
              });
              
              // IMPORTANT: Preserve all connections FROM the target nodes to other nodes
              // This ensures that if Node 1 -> Node 2 -> Node 3, and we insert between 1 and 2,
              // the connection Node 2 -> Node 3 is preserved
              finalExistingConnections.forEach(oldConn => {
                const connectionsFromTarget = prevConnections.filter(c => c.from === oldConn.to);
                connectionsFromTarget.forEach(connFromTarget => {
                  // Only add if it doesn't already exist (avoid duplicates)
                  const alreadyExists = newConnections.some(
                    c => c.from === connFromTarget.from && c.to === connFromTarget.to
                  );
                  if (!alreadyExists) {
                    newConnections.push(connFromTarget);
                  }
                });
              });
            } else if (nextNodeInChain) {
              // Found next node in chain visually, create connection chain
              // Add connection from source to new node
              newConnections.push({ from: actualFromNodeId, to: newNode.id });
              
              // Check if there's already a connection from source to nextNodeInChain in the original connections
              const existingToNext = prevConnections.find(c => c.from === actualFromNodeId && c.to === nextNodeInChain.id);
              if (existingToNext) {
                // Replace the connection from source to nextNodeInChain with source -> new -> nextNodeInChain
                // Only remove the specific connection from source to nextNodeInChain
                newConnections = newConnections.filter(c => !(c.from === actualFromNodeId && c.to === nextNodeInChain.id));
                newConnections.push({
                  from: newNode.id,
                  to: nextNodeInChain.id,
                  condition: existingToNext.condition
                });
                
                // IMPORTANT: Preserve all connections FROM nextNodeInChain to other nodes
                // This ensures that if Node 1 -> Node 2 -> Node 3, and we insert between 1 and 2,
                // the connection Node 2 -> Node 3 is preserved
                const connectionsFromNext = prevConnections.filter(c => c.from === nextNodeInChain.id);
                connectionsFromNext.forEach(connFromNext => {
                  // Only add if it doesn't already exist (avoid duplicates)
                  const alreadyExists = newConnections.some(
                    c => c.from === connFromNext.from && c.to === connFromNext.to
                  );
                  if (!alreadyExists) {
                    newConnections.push(connFromNext);
                  }
                });
              } else {
                // No direct connection from source to nextNodeInChain
                // Find what connects to nextNodeInChain
                const connectionToNext = prevConnections.find(c => c.to === nextNodeInChain.id);
                if (connectionToNext) {
                  // There's a connection to nextNodeInChain from another node
                  // Check if that node is between source and nextNodeInChain
                  const nodeBeforeNext = prev.find(n => n.id === connectionToNext.from);
                  
                  if (nodeBeforeNext && 
                      nodeBeforeNext.position.y > sourceNode.position.y && 
                      nodeBeforeNext.position.y < nextNodeInChain.position.y &&
                      Math.abs(nodeBeforeNext.position.x - sourceNode.position.x) < 50) {
                    // The node before next is between source and nextNodeInChain
                    // We need to insert: source -> new -> nodeBeforeNext -> nextNodeInChain
                    // Replace connection: nodeBeforeNext -> nextNodeInChain becomes newNode -> nextNodeInChain
                    // And add: nodeBeforeNext -> newNode
                    newConnections = newConnections.filter(c => !(c.from === connectionToNext.from && c.to === nextNodeInChain.id));
                    newConnections.push({ 
                      from: newNode.id, 
                      to: nextNodeInChain.id,
                      condition: connectionToNext.condition
                    });
                    // Add connection from nodeBeforeNext to newNode to maintain chain
                    newConnections.push({ from: connectionToNext.from, to: newNode.id });
                    
                    // IMPORTANT: Preserve all connections FROM nextNodeInChain to other nodes
                    const connectionsFromNext = prevConnections.filter(c => c.from === nextNodeInChain.id);
                    connectionsFromNext.forEach(connFromNext => {
                      // Only add if it doesn't already exist (avoid duplicates)
                      const alreadyExists = newConnections.some(
                        c => c.from === connFromNext.from && c.to === connFromNext.to
                      );
                      if (!alreadyExists) {
                        newConnections.push(connFromNext);
                      }
                    });
                  } else if (connectionToNext.from === actualFromNodeId) {
                    // Connection is from source (should have been caught above, but just in case)
                    newConnections = newConnections.filter(c => !(c.from === actualFromNodeId && c.to === nextNodeInChain.id));
                    newConnections.push({ 
                      from: newNode.id, 
                      to: nextNodeInChain.id,
                      condition: connectionToNext.condition
                    });
                    
                    // IMPORTANT: Preserve all connections FROM nextNodeInChain to other nodes
                    const connectionsFromNext = prevConnections.filter(c => c.from === nextNodeInChain.id);
                    connectionsFromNext.forEach(connFromNext => {
                      // Only add if it doesn't already exist (avoid duplicates)
                      const alreadyExists = newConnections.some(
                        c => c.from === connFromNext.from && c.to === connFromNext.to
                      );
                      if (!alreadyExists) {
                        newConnections.push(connFromNext);
                      }
                    });
                  } else {
                    // Connection is from elsewhere (different branch), just add our connection
                    newConnections.push({ 
                      from: newNode.id, 
                      to: nextNodeInChain.id,
                      condition: connectionToNext.condition
                    });
                    
                    // IMPORTANT: Preserve all connections FROM nextNodeInChain to other nodes
                    const connectionsFromNext = prevConnections.filter(c => c.from === nextNodeInChain.id);
                    connectionsFromNext.forEach(connFromNext => {
                      // Only add if it doesn't already exist (avoid duplicates)
                      const alreadyExists = newConnections.some(
                        c => c.from === connFromNext.from && c.to === connFromNext.to
                      );
                      if (!alreadyExists) {
                        newConnections.push(connFromNext);
                      }
                    });
                  }
                } else {
                  // No connection exists, add new one
                  newConnections.push({ from: newNode.id, to: nextNodeInChain.id });
                  
                  // IMPORTANT: Preserve all connections FROM nextNodeInChain to other nodes
                  const connectionsFromNext = prevConnections.filter(c => c.from === nextNodeInChain.id);
                  connectionsFromNext.forEach(connFromNext => {
                    // Only add if it doesn't already exist (avoid duplicates)
                    const alreadyExists = newConnections.some(
                      c => c.from === connFromNext.from && c.to === connFromNext.to
                    );
                    if (!alreadyExists) {
                      newConnections.push(connFromNext);
                    }
                  });
                }
              }
            } else {
              // No existing connections, just add connection from source to new node
              const existingConnection = newConnections.find(
                c => c.from === actualFromNodeId && c.to === newNode.id
              );
              if (!existingConnection) {
                newConnections.push({ from: actualFromNodeId, to: newNode.id });
              }
            }
            
            return newConnections;
          });
        }
        
        setSelectedNode(newNode);
        return [...updatedNodes, newNode];
      }
    });
    
    setHasChanges(true);
  }, [connections]);

  const handleSaveAgentStep = useCallback((config: AgentStepConfig, fromNodeId?: string) => {
    const NODE_HEIGHT = 100;
    const VERTICAL_SPACING = 150;
    
    // Find the source node if fromNodeId is provided
    const sourceNode = fromNodeId ? nodes.find(n => n.id === fromNodeId) : null;
    
    // Check if source node has existing outgoing connections
    const existingConnections = fromNodeId 
      ? connections.filter(c => c.from === fromNodeId)
      : [];
    
    let position;
    const nodesToReposition: Array<{ id: string; newY: number }> = [];
    
    if (sourceNode && existingConnections.length > 0) {
      // Insert node in the middle - find the first target node to position between
      const firstTargetNode = nodes.find(n => n.id === existingConnections[0].to);
      if (firstTargetNode) {
        // Calculate spacing with increased distance between nodes
        const sourceBottom = sourceNode.position.y + NODE_HEIGHT;
        const targetTop = firstTargetNode.position.y;
        const currentDistance = targetTop - sourceBottom;
        
        // Use VERTICAL_SPACING (150px) as minimum spacing when inserting nodes
        // This ensures good visual separation between nodes
        const spacing = Math.max(VERTICAL_SPACING, currentDistance / 2.5);
        
        // Position new node with increased spacing
        const newY = sourceBottom + spacing;
        position = {
          x: sourceNode.position.x, // Same X position (vertical alignment)
          y: newY
        };
        
        // Reposition target node to maintain spacing
        const targetNewY = newY + NODE_HEIGHT + spacing;
        nodesToReposition.push({
          id: firstTargetNode.id,
          newY: targetNewY
        });
      } else {
        // Fallback: position below source
        position = {
          x: sourceNode.position.x,
          y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
        };
      }
    } else if (sourceNode) {
      // No existing connections, position below source
      position = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + NODE_HEIGHT + VERTICAL_SPACING
      };
    } else {
      // No source node, use default position
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

    // Reposition existing nodes if needed
    setNodes(prev => {
      const updatedNodes = nodesToReposition.length > 0
        ? prev.map(n => {
            const reposition = nodesToReposition.find(r => r.id === n.id);
            if (reposition) {
              return {
                ...n,
                position: {
                  ...n.position,
                  y: reposition.newY
                }
              };
            }
            return n;
          })
        : prev;
      
      return [...updatedNodes, newNode];
    });
    
    // If fromNodeId is provided, update connections
    if (fromNodeId) {
      setConnections(prevConnections => {
        let newConnections = [...prevConnections];
        
        // If source node has existing connections, insert new node in the middle
        if (existingConnections.length > 0) {
          // Remove old connections from source to targets
          newConnections = newConnections.filter(
            c => !(c.from === fromNodeId && existingConnections.some(ec => ec.to === c.to))
          );
          
          // Add connection from source to new node
          newConnections.push({ from: fromNodeId, to: newNode.id });
          
          // Add connections from new node to all previously connected targets
          existingConnections.forEach(oldConn => {
            newConnections.push({
              from: newNode.id,
              to: oldConn.to,
              condition: oldConn.condition // Preserve condition if any
            });
          });
        } else {
          // No existing connections, just add connection from source to new node
          const existingConnection = newConnections.find(
            c => c.from === fromNodeId && c.to === newNode.id
          );
          if (!existingConnection) {
            newConnections.push({ from: fromNodeId, to: newNode.id });
          }
        }
        
        return newConnections;
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
    // If selecting a "select-trigger" placeholder, open the trigger modal
    if (node?.type === "select-trigger") {
      setIsAddTriggerOpen(true);
    }
    // If selecting a "select-action" placeholder, open the action modal
    if (node?.type === "select-action") {
      setIsAddActionOpen(true);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id && id !== "new") {
        // Update existing workflow
        await workflowsV1Api.update(id, {
          name: workflowName,
          nodes,
          connections,
          greetingMessage: workflowGreetingMessage,
          context: workflowContext,
          memories: workflowMemories,
          defaultModel: workflowDefaultModel,
          safeMode: workflowSafeMode
        });
        toast({
          title: "Success",
          description: "Workflow saved successfully",
        });
      } else {
        // Create new workflow
        const newWorkflow = await workflowsV1Api.create({
          name: workflowName,
          nodes,
          connections,
          greetingMessage: workflowGreetingMessage,
          context: workflowContext,
          memories: workflowMemories,
          defaultModel: workflowDefaultModel,
          safeMode: workflowSafeMode
        });
        toast({
          title: "Success",
          description: "Workflow created successfully",
        });
        navigate(`/workflows/${newWorkflow.id}`);
      }
      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [id, workflowName, nodes, connections, workflowGreetingMessage, workflowContext, workflowMemories, workflowDefaultModel, workflowSafeMode, navigate, toast]);

  const handlePublish = useCallback(async () => {
    if (!id || id === "new") {
      await handleSave();
      return;
    }

    try {
      await workflowsV1Api.publish(id);
      toast({
        title: "Success",
        description: "Workflow published successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to publish workflow",
        variant: "destructive",
      });
    }
  }, [id, handleSave, toast]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const updatedNodes = prev.filter(n => n.id !== nodeId);
      // Clean up connections after node deletion
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
      // Determine if it's a trigger or action
      const isTrigger = node.type === "select-trigger" || 
        node.type === "google-sheets-new-row" || 
        node.type === "google-sheets-row-updated" || 
        node.type === "webhook" || 
        node.type === "manual";
      
      if (isTrigger) {
        setIsAddTriggerOpen(true);
      } else {
        // Store the node ID to replace
        (window as unknown as Record<string, unknown>).__workflowReplaceNodeId = nodeId;
        setIsAddActionOpen(true);
      }
    }
  }, [nodes]);

  // Clean up orphaned connections whenever nodes change
  useEffect(() => {
    setConnections(prev => {
      const cleaned = cleanupConnections(nodes, prev);
      // Only update if there are changes to avoid infinite loops
      if (cleaned.length !== prev.length || cleaned.some((c, i) => c.from !== prev[i]?.from || c.to !== prev[i]?.to)) {
        return cleaned;
      }
      return prev;
    });
  }, [nodes, cleanupConnections]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/workflows")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value);
                setHasChanges(true);
              }}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0 h-auto"
              placeholder="Untitled Workflow"
            />
            <Badge variant="secondary" className="bg-secondary text-muted-foreground">
              Draft
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "gap-2",
                activeTab === "settings" && "bg-secondary"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={activeTab === "flow" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("flow")}
              className={cn(
                "gap-2",
                activeTab === "flow" && "bg-secondary"
              )}
            >
              <GitBranch className="h-4 w-4" />
              Flow editor
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Publish Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === "settings" ? (
          <WorkflowSettingsView
            greetingMessage={workflowGreetingMessage}
            context={workflowContext}
            memories={workflowMemories}
            defaultModel={workflowDefaultModel}
            safeMode={workflowSafeMode}
            onGreetingMessageChange={(message) => {
              setWorkflowGreetingMessage(message);
              setHasChanges(true);
            }}
            onContextChange={(context) => {
              setWorkflowContext(context);
              setHasChanges(true);
            }}
            onMemoriesChange={(memories) => {
              setWorkflowMemories(memories);
              setHasChanges(true);
            }}
            onDefaultModelChange={(model) => {
              setWorkflowDefaultModel(model);
              setHasChanges(true);
            }}
            onSafeModeChange={(safeMode) => {
              setWorkflowSafeMode(safeMode);
              setHasChanges(true);
            }}
          />
        ) : (
          <>
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
                    // Store fromNodeId temporarily to pass to handleAddAction
                    (window as unknown as Record<string, unknown>).__workflowFromNodeId = fromNodeId;
                  }
                  setIsAddActionOpen(true);
                }}
                onAddAgentStep={(fromNodeId) => {
                  setIsAddNodeMenuOpen(false);
                  setIsAgentStepConfigOpen(true);
                  // Store fromNodeId temporarily to pass to handleSaveAgentStep
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
                  // TODO: Add loop node type
                  handleAddAction("condition", undefined, undefined, fromNodeId); // Temporary: use condition for loop
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
          </>
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
          
          // Reset the flag after a short delay to allow state updates to complete
          setTimeout(() => {
            setTriggerJustSelected(false);
          }, 0);
          
          // If no trigger was selected and there's no trigger node, create a placeholder
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
        onClose={() => {
          setIsAddActionOpen(false);
          
          // Reset the flag after a short delay to allow state updates to complete
          setTimeout(() => {
            setActionJustSelected(false);
          }, 0);
          
          // If no action was selected and there's no action node, create a placeholder
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

      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        workflowName={workflowName}
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

