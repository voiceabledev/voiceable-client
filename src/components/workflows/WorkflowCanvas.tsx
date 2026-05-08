import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ZoomOut,
  ZoomIn,
  LayoutGrid,
  User,
  Flag,
  Scissors,
  Trash2,
  Pencil,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "@/views/WorkflowEditor";

export interface WorkflowConnection {
  from: string;
  to: string;
  condition: string;
  position?: number;
}

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNode: WorkflowNode | null;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onConnectionsChange: (connections: WorkflowConnection[]) => void;
  onNodeSelect: (node: WorkflowNode | null) => void;
  onNodeUpdate: (node: WorkflowNode) => void;
  onAddNodeClick: () => void;
  onNodeDelete?: (nodeId: string) => void;
  readOnly?: boolean;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNode,
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onNodeUpdate,
  onAddNodeClick,
  onNodeDelete,
  readOnly = false,
}: WorkflowCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [connectionMousePos, setConnectionMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showConnectionMenu, setShowConnectionMenu] = useState<string | null>(null);
  const [editingCondition, setEditingCondition] = useState<{ from: string; to: string } | null>(null);
  const [conditionInput, setConditionInput] = useState("");
  const [draggingCondition, setDraggingCondition] = useState<{ from: string; to: string } | null>(null);

  // Calculate point on bezier curve at position t (0 to 1)
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
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const point = getPointOnBezier(fromX, fromY, toX, toY, controlPointOffset, t);
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestT = t;
      }
    }
    
    return Math.max(0.1, Math.min(0.9, closestT));
  }, [getPointOnBezier]);

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (connectingFromNodeId) {
        const canvasElement = document.querySelector('.workflow-canvas-content');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          setConnectionMousePos({ x, y });
        }
      } else if (draggingCondition) {
        const canvasElement = document.querySelector('.workflow-canvas-content');
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
              const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
                ? { width: 120, height: 120 } 
                : { width: 240, height: 100 };
              const toDims = (toNode.type === "start" || toNode.type === "end-call")
                ? { width: 120, height: 120 } 
                : { width: 240, height: 100 };
              
              const fromX = fromNode.x + fromDims.width / 2;
              const fromY = fromNode.type === "end-call" 
                ? fromNode.y 
                : fromNode.y + fromDims.height;
              const toX = toNode.x + toDims.width / 2;
              const toY = toNode.type === "end-call" ? toNode.y : toNode.y;
              
              const deltaY = toY - fromY;
              const controlPointOffset = Math.max(50, Math.abs(deltaY) * 0.5);
              
              const newPosition = findClosestPointOnBezier(
                fromX, fromY, toX, toY, controlPointOffset, targetX, targetY
              );
              
              onConnectionsChange(connections.map(c =>
                c.from === draggingCondition.from && c.to === draggingCondition.to
                  ? { ...c, position: newPosition }
                  : c
              ));
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
          const newX = (e.clientX - dragStart.x) / zoom + nodeDragOffset.x - pan.x / zoom;
          const newY = (e.clientY - dragStart.y) / zoom + nodeDragOffset.y - pan.y / zoom;
          const deltaX = Math.abs(e.clientX - dragStart.x);
          const deltaY = Math.abs(e.clientY - dragStart.y);
          if (deltaX > 3 || deltaY > 3) {
            setHasDragged(true);
          }
          onNodesChange(nodes.map(n => 
            n.id === draggedNodeId 
              ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
              : n
          ));
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
  }, [isPanning, draggedNodeId, connectingFromNodeId, draggingCondition, panStart, dragStart, nodeDragOffset, pan, nodes, zoom, connections, findClosestPointOnBezier, onNodesChange, onConnectionsChange]);

  const handleNodeClick = (node: WorkflowNode) => {
    if (!readOnly) {
      onNodeSelect(node);
      setShowConnectionMenu(null);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    const target = e.target as HTMLElement;
    const isNodeClick = target.closest('[data-node-id]') !== null;
    if (!isNodeClick && !draggedNodeId) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
      setTimeout(() => setHasDragged(false), 0);
    }
  };

  const handleConnectionPointMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setConnectingFromNodeId(node.id);
    const canvasElement = document.querySelector('.workflow-canvas-content');
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionMousePos({ x, y });
    }
  };

  const handleConnectionPointMouseUp = (e: React.MouseEvent, targetNode: WorkflowNode) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    if (connectingFromNodeId && connectingFromNodeId !== targetNode.id) {
      const connectionExists = connections.some(
        c => c.from === connectingFromNodeId && c.to === targetNode.id
      );
      if (!connectionExists) {
        const newConnection: WorkflowConnection = { 
          from: connectingFromNodeId, 
          to: targetNode.id, 
          condition: "Always", 
          position: 0.5 
        };
        onConnectionsChange([...connections, newConnection]);
      }
    }
    setConnectingFromNodeId(null);
  };

  const handleConditionClick = (connection: WorkflowConnection) => {
    if (readOnly) return;
    setEditingCondition({ from: connection.from, to: connection.to });
    setConditionInput(connection.condition);
  };

  const handleConditionSave = useCallback(() => {
    if (editingCondition) {
      onConnectionsChange(connections.map(c => 
        c.from === editingCondition.from && c.to === editingCondition.to
          ? { ...c, condition: conditionInput.trim() || "Always" }
          : c
      ));
      setEditingCondition(null);
      setConditionInput("");
    }
  }, [editingCondition, conditionInput, connections, onConnectionsChange]);

  const handleConditionCancel = () => {
    setEditingCondition(null);
    setConditionInput("");
  };

  const handleConditionLabelMouseDown = (e: React.MouseEvent, connection: WorkflowConnection) => {
    if (readOnly) return;
    e.stopPropagation();
    setDraggingCondition({ from: connection.from, to: connection.to });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

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

  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (readOnly) return;
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target.closest('.connection-point')) {
      return;
    }
    setDraggedNodeId(node.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setNodeDragOffset({ x: node.x + pan.x / zoom, y: node.y + pan.y / zoom });
    setHasDragged(false);
    onNodeSelect(node);
  };

  const handleCreateEndCall = (fromNodeId: string) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return;

    const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
      ? { width: 120, height: 120 }
      : { width: 240, height: 100 };

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: "end-call",
      name: "End Call",
      x: fromNode.x,
      y: fromNode.y + fromDims.height + 150,
    };

    onNodesChange([...nodes, newNode]);
    onConnectionsChange([...connections, { from: fromNodeId, to: newNode.id, condition: "Always", position: 0.5 }]);
    setShowConnectionMenu(null);
    onNodeSelect(newNode);
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

  return (
    <div 
      className="flex-1 relative overflow-hidden bg-muted/30 cursor-grab active:cursor-grabbing"
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onWheel={handleWheel}
    >
      {/* Canvas Toolbar */}
      {!readOnly && (
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-auto">
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
            onClick={onAddNodeClick}
          >
            <LayoutGrid className="h-4 w-4 mr-2 text-black" />
            Add Node
          </Button>
        </div>
      )}

      {/* Canvas content wrapper */}
      <div 
        className="absolute inset-0 workflow-canvas-content"
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

        {/* Connection Lines */}
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
              ? fromNode.y 
              : fromNode.y + fromDims.height;
            
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

            const fromDims = (fromNode.type === "start" || fromNode.type === "end-call")
              ? { width: 120, height: 120 } 
              : { width: 240, height: 100 };
            const toDims = (toNode.type === "start" || toNode.type === "end-call")
              ? { width: 120, height: 120 } 
              : { width: 240, height: 100 };
            
            const fromX = fromNode.x + fromDims.width / 2;
            const fromY = fromNode.type === "end-call"
              ? fromNode.y 
              : fromNode.y + fromDims.height;
            const toX = toNode.x + toDims.width / 2;
            const toY = toNode.type === "end-call" ? toNode.y : toNode.y;

            const deltaY = toY - fromY;
            const controlPointOffset = Math.max(50, Math.abs(deltaY) * 0.5);
            
            const path = `M ${fromX} ${fromY} 
              C ${fromX} ${fromY + controlPointOffset}, 
                ${toX} ${toY - controlPointOffset}, 
                ${toX} ${toY}`;

            const position = connection.position ?? 0.5;
            const labelPoint = getPointOnBezier(fromX, fromY, toX, toY, controlPointOffset, position);
            const midX = labelPoint.x;
            const midY = labelPoint.y;
            
            const isEditing = editingCondition?.from === connection.from && editingCondition?.to === connection.to;
            const isDragging = draggingCondition?.from === connection.from && draggingCondition?.to === connection.to;
            
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
                        if (!isDragging && !readOnly) {
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
                {hoveredNodeId === node.id && !readOnly && (
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
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 connection-point cursor-crosshair z-10"
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleConnectionPointMouseDown(e, node);
                  }}
                  onMouseUp={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleConnectionPointMouseUp(e, node);
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg hover:scale-125 transition-transform" />
                </div>
                {showConnectionMenu === node.id && !readOnly && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-40 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateEndCall(node.id);
                      }}
                    >
                      End Call
                    </button>
                  </div>
                )}
              </div>
            ) : node.type === "end-call" ? (
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
                  if ((e.target as HTMLElement).closest('button[title="Add connection"]')) return;
                  handleNodeMouseDown(e, node);
                }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button[title="Add connection"]')) return;
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
                  if ((e.target as HTMLElement).closest('button[title="Add connection"]')) return;
                  handleNodeMouseDown(e, node);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0 border border-primary/20">
                    {getNodeIcon(node.type)}
                  </div>
                  <div 
                    className="flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="font-semibold text-sm text-foreground">{node.name}</h3>
                    {node.prompt && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {node.prompt}
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button 
                        className="hover:text-foreground p-1.5 rounded hover:bg-accent transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeClick(node);
                        }}
                        title="Edit node"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="hover:text-destructive p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNodeDelete) {
                            onNodeDelete(node.id);
                          } else {
                            onNodesChange(nodes.filter(n => n.id !== node.id));
                            onConnectionsChange(connections.filter(c => c.from !== node.id && c.to !== node.id));
                            if (selectedNode?.id === node.id) {
                              onNodeSelect(null);
                            }
                          }
                        }}
                        title="Delete node"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {hoveredNodeId === node.id && !readOnly && (
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
                
                {showConnectionMenu === node.id && !readOnly && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-40 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateEndCall(node.id);
                      }}
                    >
                      End Call
                    </button>
                  </div>
                )}
                
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 connection-point cursor-crosshair z-10"
                  onMouseUp={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
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
                
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 connection-point cursor-crosshair z-10"
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleConnectionPointMouseDown(e, node);
                  }}
                  onMouseUp={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
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
  );
}

