"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  ChevronDown,
  Copy,
  ExternalLink,
  ZoomOut,
  ZoomIn,
  User,
  Flag,
  Scissors,
  Trash2,
  LayoutGrid,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddNodeModal } from "@/components/workflows/AddNodeModal";
import { NodeConfigPanel } from "@/components/workflows/NodeConfigPanel";
import { GlobalSettingsPanel } from "@/components/workflows/GlobalSettingsPanel";
import { useToast } from "@/hooks/use-toast";

export interface WorkflowNode {
  id: string;
  type: "start" | "conversation" | "api-request" | "transfer-call" | "end-call" | "tool" | "subagent";
  name: string;
  prompt?: string;
  message?: string;
  x: number;
  y: number;
  extracting?: string[];
  cost?: string;
  latency?: string;
}

const initialNodes: WorkflowNode[] = [
  {
    id: "start",
    type: "start",
    name: "Start",
    prompt: "Add a prompt to qualify users. Example: Ask the user about their issue to determine if they need technical support or billing support. Experiment with different eagerness settings - try more eager to qualify the user quicker.",
    x: 800,
    y: 100,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "qualification",
    type: "conversation",
    name: "Qualification Agent",
    prompt: "Add a prompt to qualify users. Example: Ask the user about their issue to determine if they need technical support or billing support.",
    x: 800,
    y: 350,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "technical",
    type: "conversation",
    name: "Technical Support",
    prompt: "Add a prompt for your technical support agent. Example: Help users with technical issues...",
    x: 400,
    y: 650,
    cost: "$0.09/min",
    latency: "1.1s"
  },
  {
    id: "billing",
    type: "conversation",
    name: "Billing Support",
    prompt: "Add a prompt for your billing support agent. Example: Help users with billing issues...",
    x: 1200,
    y: 650,
    cost: "$0.09/min",
    latency: "1.1s"
  }
];

export default function WorkflowEditor() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [preventInfiniteLoops, setPreventInfiniteLoops] = useState(false);
  const [showConnectionMenu, setShowConnectionMenu] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Pan and drag state - initial pan to center the workflow
  // Calculate center of all nodes to center them in viewport
  const calculateInitialPan = () => {
    if (nodes.length === 0) return { x: 0, y: 0 };
    
    // Find bounding box of all nodes
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => {
      const dims = (n.type === "start" || n.type === "end-call") ? { width: 120 } : { width: 240 };
      return n.x + dims.width;
    }));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => {
      const dims = (n.type === "start" || n.type === "end-call") ? { height: 120 } : { height: 100 };
      return n.y + dims.height;
    }));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Center in viewport (assuming viewport is roughly 1920x1080, adjust as needed)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    // Account for zoom (0.6)
    const zoom = 0.6;
    const panX = viewportWidth / 2 - centerX * zoom;
    const panY = viewportHeight / 2 - centerY * zoom;
    
    return { x: panX, y: panY };
  };
  
  const [pan, setPan] = useState(() => calculateInitialPan());
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  
  // Connection creation state
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [connectionMousePos, setConnectionMousePos] = useState({ x: 0, y: 0 });
  
  // Zoom state
  const [zoom, setZoom] = useState(0.6); // Start with less zoom for better overview
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.1;
  
  // Connections state - tracks connections between nodes
  // position is a value from 0 to 1 representing position along the line (0.5 = midpoint)
  const [connections, setConnections] = useState<Array<{ from: string; to: string; condition: string; position?: number }>>([
    { from: "start", to: "qualification", condition: "Always", position: 0.5 },
    { from: "qualification", to: "technical", condition: "Technical issue", position: 0.5 },
    { from: "qualification", to: "billing", condition: "Billing issue", position: 0.5 },
  ]);
  
  // State for editing connection conditions
  const [editingCondition, setEditingCondition] = useState<{ from: string; to: string } | null>(null);
  const [conditionInput, setConditionInput] = useState("");
  
  // State for dragging condition labels along the line
  const [draggingCondition, setDraggingCondition] = useState<{ from: string; to: string } | null>(null);

  // Fetch workflow data
  useEffect(() => {
    if (id && id !== "new") {
      const fetchWorkflow = async () => {
        try {
          // TODO: Replace with actual workflow API call when backend is ready
          // const response = await workflowsApi.get(id);
          // if (response.data) {
          //   setWorkflow(response.data);
          // }
          
          // Mock data for now
          setWorkflow({
            id: id,
            name: "Customer Support Workflow",
          });
        } catch (err) {
          toast({
            title: "Error loading workflow",
            description: err instanceof Error ? err.message : "Failed to fetch workflow",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchWorkflow();
    } else {
      setLoading(false);
    }
  }, [id, toast]);

  // Recalculate pan when nodes change (on initial load)
  useEffect(() => {
    if (nodes.length > 0 && !loading) {
      const newPan = calculateInitialPan();
      setPan(newPan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only recalculate on initial load

  // Calculate point on bezier curve at position t (0 to 1)
  // Helper function - defined early so it can be used in other functions
  const getPointOnBezier = useCallback((
    fromX: number, fromY: number,
    toX: number, toY: number,
    controlPointOffset: number,
    t: number
  ) => {
    const cp1X = fromX;
    const cp1Y = fromY + controlPointOffset;
    const cp2X = toX;
    const cp2Y = toY - controlPointOffset;
    
    // Cubic bezier formula
    const x = Math.pow(1 - t, 3) * fromX +
              3 * Math.pow(1 - t, 2) * t * cp1X +
              3 * (1 - t) * Math.pow(t, 2) * cp2X +
              Math.pow(t, 3) * toX;
    
    const y = Math.pow(1 - t, 3) * fromY +
              3 * Math.pow(1 - t, 2) * t * cp1Y +
              3 * (1 - t) * Math.pow(t, 2) * cp2Y +
              Math.pow(t, 3) * toY;
    
    return { x, y };
  }, []);

  // Find closest point on bezier curve to a given point
  const findClosestPointOnBezier = useCallback((
    fromX: number, fromY: number,
    toX: number, toY: number,
    controlPointOffset: number,
    targetX: number, targetY: number
  ): number => {
    let closestT = 0.5;
    let minDistance = Infinity;
    
    // Sample multiple points to find closest
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const point = getPointOnBezier(fromX, fromY, toX, toY, controlPointOffset, t);
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestT = t;
      }
    }
    
    return Math.max(0.1, Math.min(0.9, closestT)); // Clamp between 0.1 and 0.9
  }, [getPointOnBezier]);

  // Global mouse event handlers for smooth panning and dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (connectingFromNodeId) {
        // Update connection line position
        const canvasElement = document.querySelector('.canvas-content');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          setConnectionMousePos({ x, y });
        }
      } else if (draggingCondition) {
        // Update condition label position along the line
        const canvasElement = document.querySelector('.canvas-content');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const targetX = (e.clientX - rect.left - pan.x) / zoom;
          const targetY = (e.clientY - rect.top - pan.y) / zoom;
          
          const connection = connections.find(
            c => c.from === draggingCondition.from && c.to === draggingCondition.to
          );
          if (connection) {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (fromNode && toNode) {
              const fromDims = fromNode.type === "start" 
                ? { width: 120, height: 120 } 
                : { width: 240, height: 100 };
              const toDims = toNode.type === "start" 
                ? { width: 120, height: 120 } 
                : { width: 240, height: 100 };
              
              const fromX = fromNode.x + fromDims.width / 2;
              const fromY = fromNode.y + fromDims.height;
              const toX = toNode.x + toDims.width / 2;
              const toY = toNode.y;
              
              const deltaY = toY - fromY;
              const controlPointOffset = Math.max(50, Math.abs(deltaY) * 0.5);
              
              const newPosition = findClosestPointOnBezier(
                fromX, fromY, toX, toY, controlPointOffset, targetX, targetY
              );
              
              setConnections(connections.map(c =>
                c.from === draggingCondition.from && c.to === draggingCondition.to
                  ? { ...c, position: newPosition }
                  : c
              ));
              setHasChanges(true);
            }
          }
        }
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        } else if (draggedNodeId) {
          const node = nodes.find(n => n.id === draggedNodeId);
          if (node) {
            // Account for zoom when calculating new position
            const newX = (e.clientX - dragStart.x) / zoom + nodeDragOffset.x - pan.x / zoom;
            const newY = (e.clientY - dragStart.y) / zoom + nodeDragOffset.y - pan.y / zoom;
            const deltaX = Math.abs(e.clientX - dragStart.x);
            const deltaY = Math.abs(e.clientY - dragStart.y);
            if (deltaX > 3 || deltaY > 3) {
              setHasDragged(true);
            }
            setNodes(nodes.map(n => 
              n.id === draggedNodeId 
                ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
                : n
            ));
            setHasChanges(true);
          }
        }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      if (draggedNodeId) {
        setDraggedNodeId(null);
      }
      if (draggingCondition) {
        setDraggingCondition(null);
      }
      // Cancel connection if released outside a node
      if (connectingFromNodeId) {
        setConnectingFromNodeId(null);
      }
    };

    if (isPanning || draggedNodeId || connectingFromNodeId || draggingCondition) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isPanning, draggedNodeId, connectingFromNodeId, draggingCondition, panStart, dragStart, nodeDragOffset, pan, nodes, zoom, connections, findClosestPointOnBezier]);

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
    setShowConnectionMenu(null);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with Ctrl/Cmd + scroll
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  };

  // Pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking directly on canvas background (not on nodes or their children)
    const target = e.target as HTMLElement;
    // Check if click is on canvas background (not on a node or its children)
    const isNodeClick = target.closest('[data-node-id]') !== null;
    if (!isNodeClick && !draggedNodeId) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggedNodeId) {
      const node = nodes.find(n => n.id === draggedNodeId);
      if (node) {
        // Account for zoom when calculating new position
        const newX = (e.clientX - dragStart.x) / zoom + nodeDragOffset.x - pan.x / zoom;
        const newY = (e.clientY - dragStart.y) / zoom + nodeDragOffset.y - pan.y / zoom;
        const deltaX = Math.abs(e.clientX - dragStart.x);
        const deltaY = Math.abs(e.clientY - dragStart.y);
        if (deltaX > 3 || deltaY > 3) {
          setHasDragged(true);
        }
        setNodes(nodes.map(n => 
          n.id === draggedNodeId 
            ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
            : n
        ));
        setHasChanges(true);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
      // Reset drag flag after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 0);
    }
  };

  // Connection point handlers
  const handleConnectionPointMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    e.preventDefault();
    setConnectingFromNodeId(node.id);
    // Calculate initial mouse position relative to canvas
    const canvasElement = document.querySelector('.canvas-content');
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionMousePos({ x, y });
    }
  };

  const handleConnectionPointMouseUp = (e: React.MouseEvent, targetNode: WorkflowNode) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectingFromNodeId && connectingFromNodeId !== targetNode.id) {
      // Check if connection already exists
      const connectionExists = connections.some(
        c => c.from === connectingFromNodeId && c.to === targetNode.id
      );
      if (!connectionExists) {
        // Create connection with default condition and position
        const newConnection = { from: connectingFromNodeId, to: targetNode.id, condition: "Always", position: 0.5 };
        setConnections([...connections, newConnection]);
        setHasChanges(true);
      }
    }
    setConnectingFromNodeId(null);
  };
  
  const handleConditionClick = (connection: { from: string; to: string; condition: string }) => {
    setEditingCondition({ from: connection.from, to: connection.to });
    setConditionInput(connection.condition);
  };
  
  const handleConditionSave = useCallback(() => {
    if (editingCondition) {
      setConnections(prevConnections => prevConnections.map(c => 
        c.from === editingCondition.from && c.to === editingCondition.to
          ? { ...c, condition: conditionInput.trim() || "Always" }
          : c
      ));
      setHasChanges(true);
      setEditingCondition(null);
      setConditionInput("");
    }
  }, [editingCondition, conditionInput]);
  
  const handleConditionCancel = () => {
    setEditingCondition(null);
    setConditionInput("");
  };

  const handleConditionLabelMouseDown = (e: React.MouseEvent, connection: { from: string; to: string }) => {
    e.stopPropagation();
    setDraggingCondition({ from: connection.from, to: connection.to });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle clicking outside condition input to save
  useEffect(() => {
    if (!editingCondition) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-condition-editor]')) {
        handleConditionSave();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCondition, handleConditionSave]);

  // Node drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    // Only start dragging if not clicking on connection point
    const target = e.target as HTMLElement;
    if (target.closest('.connection-point')) {
      return;
    }
    setDraggedNodeId(node.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    // Account for zoom when setting initial drag offset
    setNodeDragOffset({ x: node.x + pan.x / zoom, y: node.y + pan.y / zoom });
    setHasDragged(false);
    setSelectedNode(node);
  };

  const handleAddNode = (type: WorkflowNode["type"]) => {
    if (type === "end-call") {
      // Find all end nodes (nodes that don't have outgoing connections, excluding start and existing end-call nodes)
      const endNodes = nodes.filter(node => {
        if (node.type === "start" || node.type === "end-call") return false;
        // Check if this node has any outgoing connections
        const hasOutgoing = connections.some(c => c.from === node.id);
        return !hasOutgoing;
      });

      if (endNodes.length === 0) {
        // If no end nodes found, find the node with the lowest Y position (bottom-most)
        const bottomNode = nodes
          .filter(n => n.type !== "start" && n.type !== "end-call")
          .reduce((lowest, current) => 
            (current.y > lowest.y) ? current : lowest,
            nodes.find(n => n.type !== "start" && n.type !== "end-call") || nodes[0]
          );
        
        if (bottomNode) {
          endNodes.push(bottomNode);
        }
      }

      // Calculate position for end-call node
      let endCallX = 800; // Default X position
      let endCallY = 300; // Default Y position

      if (endNodes.length > 0) {
        // Position below the lowest end node
        const lowestNode = endNodes.reduce((lowest, current) => 
          (current.y > lowest.y) ? current : lowest
        );
        
        // Calculate node dimensions
        const nodeDims = (lowestNode.type === "start" || lowestNode.type === "end-call")
          ? { width: 120, height: 120 }
          : { width: 240, height: 100 };
        
        endCallX = lowestNode.x;
        endCallY = lowestNode.y + nodeDims.height + 150; // Position 150px below
      }

      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type: "end-call",
        name: "End Call",
        x: endCallX,
        y: endCallY,
      };

      // Add the new end-call node
      setNodes([...nodes, newNode]);

      // Connect all end nodes to the new end-call node
      const newConnections = endNodes.map(endNode => ({
        from: endNode.id,
        to: newNode.id,
        condition: "Always",
        position: 0.5
      }));

      setConnections([...connections, ...newConnections]);
      setSelectedNode(newNode);
      setIsAddNodeOpen(false);
      setHasChanges(true);
    } else {
      // Regular node creation
      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type,
        name: type === "conversation" ? "New Conversation" : type === "subagent" ? "Subagent" : type,
        x: 400,
        y: 300,
        cost: "$0.09/min",
        latency: "1.1s"
      };
      setNodes([...nodes, newNode]);
      setSelectedNode(newNode);
      setIsAddNodeOpen(false);
      setHasChanges(true);
    }
  };

  // Handler for creating agent transfer from subagent
  const handleCreateAgentTransfer = (fromNodeId: string) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return;

    // Create new conversation node positioned to the right of the subagent
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: "conversation",
      name: "Agent Transfer",
      prompt: "Add a prompt for the transferred agent...",
      x: fromNode.x + 350,
      y: fromNode.y,
      cost: "$0.09/min",
      latency: "1.1s"
    };

    // Add the new node
    setNodes([...nodes, newNode]);
    
    // Add connection from subagent to new node
    setConnections([...connections, { from: fromNodeId, to: newNode.id, condition: "Always", position: 0.5 }]);
    
    // Close the menu
    setShowConnectionMenu(null);
    setSelectedNode(newNode);
    setHasChanges(true);
  };

  // Handler for creating end-call node from any node
  const handleCreateEndCall = (fromNodeId: string) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return;

    // Calculate node dimensions for positioning
    const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
      ? { width: 120, height: 120 }
      : { width: 240, height: 100 };

    // Create end-call node positioned below the subagent
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: "end-call",
      name: "End Call",
      x: fromNode.x,
      y: fromNode.y + fromDims.height + 150, // Position 150px below
    };

    // Add the new node
    setNodes([...nodes, newNode]);
    
    // Add connection from node to end-call node
    setConnections([...connections, { from: fromNodeId, to: newNode.id, condition: "Always", position: 0.5 }]);
    
    // Close the menu
    setShowConnectionMenu(null);
    setSelectedNode(newNode);
    setHasChanges(true);
  };

  const getNodeIcon = (type: WorkflowNode["type"]) => {
    switch (type) {
      case "start":
        return <Flag className="h-4 w-4" />;
      case "conversation":
      case "subagent":
        return <User className="h-4 w-4" />;
      case "end-call":
        return <Scissors className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: WorkflowNode["type"]) => {
    switch (type) {
      case "start":
        return "bg-primary/10 border-primary/50";
      case "conversation":
        return "bg-card border-border";
      case "subagent":
        return "bg-card border-border";
      case "end-call":
        return "bg-destructive/10 border-destructive/50";
      case "transfer-call":
        return "bg-success/10 border-success/50";
      case "tool":
      case "api-request":
        return "bg-purple-500/10 border-purple-500/50";
      default:
        return "bg-card border-border";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/workflows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{workflow?.name || "Workflow"}</h1>
              <Badge variant="secondary" className="text-xs">Public</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{workflow?.id || id}</span>
              <button 
                className="hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(workflow?.id || id || "");
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-3 w-3" />
              </button>
              <button className="hover:text-foreground">
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div 
          className="flex-1 relative overflow-hidden bg-muted/30 cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
        >
          {/* Canvas Toolbar - Top Left - Fixed Position */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-auto">
            {/* Zoom Controls - More Prominent */}
            <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-xs font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-card/80 backdrop-blur-sm text-black"
              onClick={() => setIsAddNodeOpen(true)}
            >
              <LayoutGrid className="h-4 w-4 mr-2 text-black" />
              Templates
            </Button>
          </div>

          {/* Canvas content wrapper with pan and zoom transform */}
          <div 
            className="absolute inset-0 canvas-content"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isPanning || draggedNodeId ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Grid pattern */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                backgroundSize: `${24 / zoom}px ${24 / zoom}px`,
                backgroundPosition: `${(pan.x % (24 / zoom))}px ${(pan.y % (24 / zoom))}px`
              }}
            />

            {/* Connection Lines - Dynamic and Flexible */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="hsl(var(--primary))"
                  />
                </marker>
                <linearGradient id="conditionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                  <stop offset="100%" stopColor="rgb(147, 51, 234)" />
                </linearGradient>
              </defs>
              
              {/* Temporary connection line while dragging */}
              {connectingFromNodeId && (() => {
                const fromNode = nodes.find(n => n.id === connectingFromNodeId);
                if (!fromNode) return null;
                
                const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
                  ? { width: 120, height: 120 } 
                  : { width: 240, height: 100 };
                const fromX = fromNode.x + fromDims.width / 2;
                const fromY = fromNode.type === "end-call" 
                  ? fromNode.y  // Top of end-call node
                  : fromNode.y + fromDims.height; // Bottom of other nodes
                
                const deltaY = connectionMousePos.y - fromY;
                const controlPointOffset = Math.max(50, Math.abs(deltaY) * 0.5);
                const path = `M ${fromX} ${fromY} 
                  C ${fromX} ${fromY + controlPointOffset}, 
                    ${connectionMousePos.x} ${connectionMousePos.y - controlPointOffset}, 
                    ${connectionMousePos.x} ${connectionMousePos.y}`;
                
                return (
                  <path
                    d={path}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="5,5"
                    opacity="0.7"
                  />
                );
              })()}
              
              {connections.map((connection, index) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                
                if (!fromNode || !toNode) return null;

                // Node dimensions (approximate - should match actual node size)
                const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
                  ? { width: 120, height: 120 } 
                  : { width: 240, height: 100 };
                const toDims = (toNode.type === "start" || toNode.type === "end-call")
                  ? { width: 120, height: 120 } 
                  : { width: 240, height: 100 };
                
                // Calculate connection points
                const fromX = fromNode.x + fromDims.width / 2;
                const fromY = fromNode.type === "end-call"
                  ? fromNode.y  // Top of end-call node
                  : fromNode.y + fromDims.height; // Bottom of other nodes
                const toX = toNode.x + toDims.width / 2;
                const toY = toNode.type === "end-call"
                  ? toNode.y  // Top of end-call node
                  : toNode.y; // Top of other nodes

                // Calculate smooth bezier curve path
                const deltaY = toY - fromY;
                const controlPointOffset = Math.max(50, Math.abs(deltaY) * 0.5);
                
                // Use bezier curves for smoother lines
                const path = `M ${fromX} ${fromY} 
                  C ${fromX} ${fromY + controlPointOffset}, 
                    ${toX} ${toY - controlPointOffset}, 
                    ${toX} ${toY}`;

                // Calculate label position along the bezier curve
                const position = connection.position ?? 0.5; // Default to midpoint
                const labelPoint = getPointOnBezier(fromX, fromY, toX, toY, controlPointOffset, position);
                const midX = labelPoint.x;
                const midY = labelPoint.y;
                
                const isEditing = editingCondition?.from === connection.from && editingCondition?.to === connection.to;
                const isDragging = draggingCondition?.from === connection.from && draggingCondition?.to === connection.to;
                
                // Estimate text width (approximate: 7px per character for 12px font)
                const textWidth = Math.max(60, connection.condition.length * 7 + 20);
                const labelWidth = textWidth;
                const labelHeight = 20;

                return (
                  <g key={`${connection.from}-${connection.to}-${index}`}>
                    <path
                      d={path}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      markerEnd="url(#arrowhead)"
                      className="drop-shadow-sm"
                    />
                    {/* Condition label on the line */}
                    {isEditing ? (
                      <foreignObject
                        x={midX - labelWidth / 2}
                        y={midY - 16}
                        width={labelWidth}
                        height="32"
                        className="pointer-events-auto"
                      >
                        <div 
                          data-condition-editor
                          className="flex items-center gap-1 bg-white border-2 border-purple-500 rounded-lg px-2 py-1 shadow-lg z-50"
                        >
                          <input
                            type="text"
                            value={conditionInput}
                            onChange={(e) => setConditionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleConditionSave();
                              } else if (e.key === 'Escape') {
                                handleConditionCancel();
                              }
                            }}
                            className="text-xs font-medium text-gray-900 bg-transparent border-none outline-none min-w-[100px] flex-1"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConditionSave();
                            }}
                            className="text-purple-600 hover:text-purple-700 text-xs"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConditionCancel();
                            }}
                            className="text-gray-500 hover:text-gray-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </foreignObject>
                    ) : (
                      <g>
                        {/* Background rectangle for text */}
                        <rect
                          x={midX - labelWidth / 2}
                          y={midY - labelHeight / 2}
                          width={labelWidth}
                          height={labelHeight}
                          rx="10"
                          fill="url(#conditionGradient)"
                          stroke={isDragging ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.3)"}
                          strokeWidth={isDragging ? "2" : "1"}
                          className="cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleConditionLabelMouseDown(e, connection);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only edit if we didn't drag
                            if (!isDragging) {
                              handleConditionClick(connection);
                            }
                          }}
                        />
                        <text
                          x={midX}
                          y={midY + 4}
                          textAnchor="middle"
                          className="text-xs font-medium fill-white pointer-events-none"
                          style={{ fontSize: '12px', userSelect: 'none' }}
                        >
                          {connection.condition}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div 
                key={node.id} 
                className="absolute"
                data-node-id={node.id}
                style={{ 
                  left: node.x, 
                  top: node.y,
                  transform: draggedNodeId === node.id ? 'scale(1.02)' : 'scale(1)',
                  transition: draggedNodeId === node.id ? 'none' : 'transform 0.2s ease-out',
                  zIndex: draggedNodeId === node.id ? 50 : selectedNode?.id === node.id ? 10 : 1,
                }}
              >
                {node.type === "start" ? (
                  // Start Node - Special Circular Design
                  <div
                    className={cn(
                      "cursor-pointer rounded-full border-2 p-6 bg-gradient-to-br from-primary/20 to-primary/10",
                      "border-primary shadow-lg hover:shadow-xl transition-all duration-200",
                      "flex flex-col items-center justify-center min-w-[120px] min-h-[120px] relative",
                      selectedNode?.id === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      draggedNodeId === node.id && "shadow-2xl scale-105"
                    )}
                    data-node-id={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onClick={(e) => {
                      // Only open modal if we didn't drag
                      if (!hasDragged) {
                        e.stopPropagation();
                        handleNodeClick(node);
                      }
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    <div className="p-3 bg-primary rounded-full mb-2">
                      <Flag className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{node.name}</h3>
                    {/* Hover + button - Bottom center (above connection point) */}
                    {hoveredNodeId === node.id && (
                      <button
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all z-30 pointer-events-auto"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const newMenuState = showConnectionMenu === node.id ? null : node.id;
                          setShowConnectionMenu(newMenuState);
                        }}
                        title="Add connection"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                    {/* Connection Point - Bottom */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 connection-point cursor-crosshair z-10"
                      onMouseDown={(e) => {
                        // Don't trigger if clicking on the + button
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        handleConnectionPointMouseDown(e, node);
                      }}
                      onMouseUp={(e) => {
                        // Don't trigger if clicking on the + button
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        handleConnectionPointMouseUp(e, node);
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg hover:scale-125 transition-transform" />
                    </div>
                    {/* Connection Menu */}
                    {showConnectionMenu === node.id && (
                      <div 
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-40 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateAgentTransfer(node.id);
                          }}
                        >
                          Agent transfer
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-accent text-sm">
                          Phone number transfer
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-accent text-sm">
                          Tool
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateEndCall(node.id);
                          }}
                        >
                          End
                        </button>
                      </div>
                    )}
                  </div>
                ) : node.type === "end-call" ? (
                  // End Call Node - Special Circular Design (similar to start)
                  <div
                    className={cn(
                      "cursor-pointer rounded-full border-2 p-6 bg-gradient-to-br from-destructive/20 to-destructive/10",
                      "border-destructive shadow-lg hover:shadow-xl transition-all duration-200",
                      "flex flex-col items-center justify-center min-w-[120px] min-h-[120px] relative",
                      selectedNode?.id === node.id && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
                      draggedNodeId === node.id && "shadow-2xl scale-105"
                    )}
                    data-node-id={node.id}
                    onMouseDown={(e) => {
                      // Don't trigger if clicking on the + button
                      if ((e.target as HTMLElement).closest('button[title="Add connection"]')) {
                        return;
                      }
                      handleNodeMouseDown(e, node);
                    }}
                    onClick={(e) => {
                      // Don't trigger if clicking on the + button
                      if ((e.target as HTMLElement).closest('button[title="Add connection"]')) {
                        return;
                      }
                      // Only open modal if we didn't drag
                      if (!hasDragged) {
                        e.stopPropagation();
                        handleNodeClick(node);
                      }
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    <div className="p-3 bg-destructive rounded-full mb-2">
                      <Scissors className="h-6 w-6 text-destructive-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{node.name}</h3>
                    {/* Connection Point - Top (for incoming connections only) */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 connection-point cursor-crosshair z-10"
                      onMouseUp={(e) => {
                        if (connectingFromNodeId && connectingFromNodeId !== node.id) {
                          handleConnectionPointMouseUp(e, node);
                        }
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 border-background shadow-lg transition-all",
                        connectingFromNodeId && connectingFromNodeId !== node.id
                          ? "bg-success scale-125"
                          : "bg-destructive/50 hover:bg-destructive hover:scale-125"
                      )} />
                    </div>
                  </div>
                ) : (
                  // Regular Nodes
                  <div
                    className={cn(
                      "cursor-move rounded-xl border-2 p-4 min-w-[240px] max-w-[280px] bg-card shadow-lg",
                      "hover:shadow-xl transition-all duration-200 relative",
                      getNodeColor(node.type),
                      selectedNode?.id === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      draggedNodeId === node.id && "shadow-2xl scale-105"
                    )}
                    data-node-id={node.id}
                    onMouseDown={(e) => {
                      // Don't trigger if clicking on the + button
                      if ((e.target as HTMLElement).closest('button[title="Add connection"]')) {
                        return;
                      }
                      handleNodeMouseDown(e, node);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Node Header */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0 border border-primary/20">
                        {getNodeIcon(node.type)}
                      </div>
                      <div 
                        className="flex-1 min-w-0"
                        onClick={(e) => {
                          // Center area - allow dragging, don't open sidebar
                          e.stopPropagation();
                        }}
                      >
                        <h3 className="font-semibold text-sm text-foreground">{node.name}</h3>
                        {node.prompt && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                            {node.prompt}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          className="hover:text-foreground p-1.5 rounded hover:bg-accent transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit icon - open sidebar
                            handleNodeClick(node);
                          }}
                          title="Edit node"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          className="hover:text-foreground p-1.5 rounded hover:bg-accent transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Copy node
                          }}
                          title="Copy node"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          className="hover:text-destructive p-1.5 rounded hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNodes(nodes.filter(n => n.id !== node.id));
                            setConnections(connections.filter(c => c.from !== node.id && c.to !== node.id));
                            if (selectedNode?.id === node.id) {
                              setSelectedNode(null);
                            }
                            if (editingCondition && (editingCondition.from === node.id || editingCondition.to === node.id)) {
                              setEditingCondition(null);
                              setConditionInput("");
                            }
                            setHasChanges(true);
                          }}
                          title="Delete node"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Hover + button - Bottom center (above connection point) */}
                    {hoveredNodeId === node.id && (
                      <button
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all z-30 pointer-events-auto"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const newMenuState = showConnectionMenu === node.id ? null : node.id;
                          setShowConnectionMenu(newMenuState);
                        }}
                        title="Add connection"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                    
                    {/* Connection Menu - appears when + button is clicked */}
                    {showConnectionMenu === node.id && (
                      <div 
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-40 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateAgentTransfer(node.id);
                          }}
                        >
                          Agent transfer
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-accent text-sm">
                          Phone number transfer
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-accent text-sm">
                          Tool
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateEndCall(node.id);
                          }}
                        >
                          End
                        </button>
                      </div>
                    )}
                    
                    {/* Connection Points */}
                    {/* Top connection point - for incoming connections */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 connection-point cursor-crosshair z-10"
                      onMouseUp={(e) => {
                        // Don't trigger if clicking on the + button
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        if (connectingFromNodeId && connectingFromNodeId !== node.id) {
                          handleConnectionPointMouseUp(e, node);
                        }
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 border-background shadow-lg transition-all",
                        connectingFromNodeId && connectingFromNodeId !== node.id
                          ? "bg-success scale-125"
                          : "bg-primary/50 hover:bg-primary hover:scale-125"
                      )} />
                    </div>
                    
                    {/* Bottom connection point - for outgoing connections */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 connection-point cursor-crosshair z-10"
                      onMouseDown={(e) => {
                        // Don't trigger if clicking on the + button
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        handleConnectionPointMouseDown(e, node);
                      }}
                      onMouseUp={(e) => {
                        // Don't trigger if clicking on the + button
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        if (connectingFromNodeId && connectingFromNodeId !== node.id) {
                          handleConnectionPointMouseUp(e, node);
                        }
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 border-background shadow-lg transition-all",
                        connectingFromNodeId === node.id
                          ? "bg-warning scale-125"
                          : "bg-primary/50 hover:bg-primary hover:scale-125"
                      )} />
                    </div>
                  </div>
                )}
              </div>
          ))}
          </div>
        </div>

        {/* Right Panel - Node Config or Global Settings */}
        {selectedNode && (
          <NodeConfigPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onUpdate={(updated) => {
              setNodes(nodes.map(n => n.id === updated.id ? updated : n));
              setSelectedNode(updated);
              setHasChanges(true);
            }}
          />
        )}
      </div>

      <AddNodeModal 
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onSelect={handleAddNode}
      />
    </div>
  );
}
