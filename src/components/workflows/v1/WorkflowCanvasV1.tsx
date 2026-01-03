import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { WorkflowNodeV1, WorkflowConnectionV1 } from "@/types/workflow-v1";
import { WorkflowNodeV1Component } from "./WorkflowNodeV1";
import { ConnectionLine } from "./ConnectionLine";
import { AddNodeMenu } from "./AddNodeMenu";
import { SelectNextStepMenu } from "./SelectNextStepMenu";

interface WorkflowCanvasV1Props {
  nodes: WorkflowNodeV1[];
  connections: WorkflowConnectionV1[];
  selectedNode: WorkflowNodeV1 | null;
  onNodesChange: (nodes: WorkflowNodeV1[]) => void;
  onConnectionsChange: (connections: WorkflowConnectionV1[]) => void;
  onNodeSelect: (node: WorkflowNodeV1 | null) => void;
  onNodeUpdate?: (node: WorkflowNodeV1) => void;
  onAddNodeClick: () => void;
  onAddTrigger?: () => void;
  onAddAction?: (fromNodeId?: string) => void;
  onAddAgentStep?: (fromNodeId?: string) => void;
  onAddKnowledgeBase?: (fromNodeId: string) => void;
  onAddCondition?: (fromNodeId: string) => void;
  onAddLoop?: (fromNodeId: string) => void;
  onAddFlowTemplate?: (fromNodeId?: string) => void;
  onNodeRename?: (nodeId: string) => void;
  onNodeReplace?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeEmail?: (nodeId: string) => void;
  onNodeMoveUp?: (nodeId: string) => void;
  onNodeMoveDown?: (nodeId: string) => void;
  readOnly?: boolean;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const GRID_SIZE = 20;
const FIXED_X_POSITION = 400; // Fixed X coordinate for all nodes (vertical layout)

export function WorkflowCanvasV1({
  nodes,
  connections,
  selectedNode,
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onNodeUpdate,
  onAddNodeClick,
  onAddTrigger,
  onAddAction,
  onAddAgentStep,
  onAddKnowledgeBase,
  onAddCondition,
  onAddLoop,
  onAddFlowTemplate,
  onNodeRename,
  onNodeReplace,
  onNodeDelete,
  onNodeEmail,
  onNodeMoveUp,
  onNodeMoveDown,
  readOnly = false
}: WorkflowCanvasV1Props) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [connectionMousePos, setConnectionMousePos] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [isAddNodeMenuOpen, setIsAddNodeMenuOpen] = useState(false);
  const [nextStepMenuNodeId, setNextStepMenuNodeId] = useState<string | null>(null);
  const [nextStepMenuPosition, setNextStepMenuPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<SVGSVGElement>(null);
  const hasAutoFittedRef = useRef(false);

  // Handle mouse wheel zoom and pan (using native event for passive: false)
  const handleWheelNative = useCallback((e: WheelEvent) => {
    // Always prevent default to stop browser navigation
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + wheel
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    } else {
      // Pan with wheel (scroll)
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, []);

  // Register wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheelNative);
    };
  }, [handleWheelNative]);

  // Calculate node positions for connections
  const getNodeConnectionPoint = useCallback((nodeId: string, isOutput: boolean = true, conditionIndex?: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.warn(`[WorkflowCanvas] getNodeConnectionPoint: Node not found: ${nodeId}`, {
        availableNodeIds: nodes.map(n => n.id)
      });
      return { x: 0, y: 0 };
    }

    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 100;

    // Account for drag offset if node is being dragged
    const dragOffset = draggedNodeId === nodeId ? nodeDragOffset : { x: 0, y: 0 };
    const actualX = node.position.x + dragOffset.x;
    const actualY = node.position.y + dragOffset.y;
    
    console.log(`[WorkflowCanvas] getNodeConnectionPoint for ${nodeId}:`, {
      nodePosition: node.position,
      dragOffset,
      actualX,
      actualY,
      isOutput
    });

    if (isOutput) {
      // For condition nodes, calculate position based on condition index (spread horizontally at bottom)
      if (node.type === "condition" && conditionIndex !== undefined) {
        const conditionConfig = node.config as unknown as Record<string, unknown> | undefined;
        const conditions = conditionConfig?.conditions as Array<{ id: string }> | undefined;
        const conditionCount = conditions?.length || 1;
        const spacing = NODE_WIDTH / (conditionCount + 1);
        const outputX = actualX + spacing * (conditionIndex + 1);
        return {
          x: outputX,
          y: actualY + NODE_HEIGHT
        };
      }
      // Output point at bottom center
      return {
        x: actualX + NODE_WIDTH / 2,
        y: actualY + NODE_HEIGHT
      };
    } else {
      // Input point at top center
      return {
        x: actualX + NODE_WIDTH / 2,
        y: actualY
      };
    }
  }, [nodes, draggedNodeId, nodeDragOffset]);

  // Calculate position for next step menu button
  const getNextStepButtonPosition = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return { x: 0, y: 0 };

    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 100;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Account for drag offset if node is being dragged
    const dragOffset = draggedNodeId === nodeId ? nodeDragOffset : { x: 0, y: 0 };
    const actualX = node.position.x + dragOffset.x;
    const actualY = node.position.y + dragOffset.y;
    
    // Position of the "+" button (bottom center of node, slightly below)
    const buttonX = actualX + NODE_WIDTH / 2;
    const buttonY = actualY + NODE_HEIGHT + 8;
    
    // Convert to screen coordinates
    return {
      x: rect.left + (buttonX * zoom) + pan.x,
      y: rect.top + (buttonY * zoom) + pan.y
    };
  }, [nodes, draggedNodeId, nodeDragOffset, zoom, pan]);


  // Handle canvas panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    const target = e.target as HTMLElement;
    const isNodeClick = target.closest('[data-node-id]') !== null;
    if (!isNodeClick && !draggedNodeId) {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        // Middle mouse or Shift + Left click for panning
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  }, [readOnly, draggedNodeId, pan]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }

    if (connectingFromNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionMousePos({ x, y });
    }

    if (draggedNodeId) {
      // Only allow vertical movement (Y-axis only)
      const deltaY = (e.clientY - dragStart.y) / zoom;
      const distance = Math.abs(deltaY);
      if (distance > 3) { // Threshold for considering it a drag (3 pixels)
        setHasDragged(true);
      }
      // Set deltaX to 0 to prevent horizontal movement
      setNodeDragOffset({ x: 0, y: deltaY });
    }
  }, [isPanning, panStart, pan, connectingFromNodeId, zoom, draggedNodeId, dragStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    const wasDragging = draggedNodeId && hasDragged;
    if (draggedNodeId) {
      // Update node position only if it was actually dragged
      if (hasDragged) {
        const draggedNode = nodes.find(n => n.id === draggedNodeId);
        if (draggedNode) {
          const newY = draggedNode.position.y + nodeDragOffset.y;
          
          // Find the node that the dragged node overlaps with (for reordering)
          const overlappingNode = nodes.find(n => {
            if (n.id === draggedNodeId) return false;
            const nodeCenterY = n.position.y + 50; // Assuming node height is ~100, center is at +50
            const draggedCenterY = newY + 50;
            // Check if dragged node center is within the other node's bounds
            return Math.abs(draggedCenterY - nodeCenterY) < 50;
          });
          
          if (overlappingNode) {
            // Swap positions: reorder nodes
            const updatedNodes = nodes.map(n => {
              if (n.id === draggedNodeId) {
                return {
                  ...n,
                  position: {
                    x: FIXED_X_POSITION,
                    y: overlappingNode.position.y
                  }
                };
              } else if (n.id === overlappingNode.id) {
                return {
                  ...n,
                  position: {
                    x: FIXED_X_POSITION,
                    y: draggedNode.position.y
                  }
                };
              }
              return n;
            });
            onNodesChange(updatedNodes);
          } else {
            // Just update the dragged node's position
            const updatedNode = {
              ...draggedNode,
              position: {
                x: FIXED_X_POSITION, // Always snap to fixed X position
                y: newY
              }
            };
            onNodesChange(nodes.map(n => n.id === draggedNodeId ? updatedNode : n));
          }
        }
      }
      // Reset drag state after a short delay to allow click handler to check hasDragged
      setTimeout(() => {
        setDraggedNodeId(null);
        setNodeDragOffset({ x: 0, y: 0 });
        setHasDragged(false);
      }, 0);
    }
    setConnectingFromNodeId(null);
  }, [draggedNodeId, nodes, nodeDragOffset, onNodesChange, hasDragged]);

  // Global mouse handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      }

      if (connectingFromNodeId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setConnectionMousePos({ x, y });
      }

      if (draggedNodeId) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 3) { // Threshold for considering it a drag (3 pixels)
          setHasDragged(true);
        }
        setNodeDragOffset({ x: deltaX, y: deltaY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      if (draggedNodeId) {
        // Update node position only if it was actually dragged
        if (hasDragged) {
          const node = nodes.find(n => n.id === draggedNodeId);
          if (node) {
            const updatedNode = {
              ...node,
              position: {
                x: node.position.x + nodeDragOffset.x,
                y: node.position.y + nodeDragOffset.y
              }
            };
            onNodesChange(nodes.map(n => n.id === draggedNodeId ? updatedNode : n));
          }
        }
        setDraggedNodeId(null);
        setNodeDragOffset({ x: 0, y: 0 });
      }
      setConnectingFromNodeId(null);
    };

    if (isPanning || connectingFromNodeId || draggedNodeId) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isPanning, connectingFromNodeId, draggedNodeId, panStart, dragStart, nodeDragOffset, pan, zoom, nodes, onNodesChange, hasDragged]);

  // Handle node click
  const handleNodeClick = useCallback((node: WorkflowNodeV1, wasDragged: boolean = false) => {
    if (!readOnly && !wasDragged) {
      onNodeSelect(node);
    }
  }, [readOnly, onNodeSelect]);

  // Handle node drag start
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNodeV1) => {
    if (readOnly) return;
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target.closest('.connection-point')) {
      return;
    }
    setDraggedNodeId(node.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    setNodeDragOffset({ x: 0, y: 0 });
  }, [readOnly]);

  // Handle connection point interactions
  const handleConnectionPointMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNodeV1) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setConnectingFromNodeId(node.id);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionMousePos({ x, y });
    }
  }, [readOnly, pan, zoom]);

  const handleConnectionPointMouseUp = useCallback((e: React.MouseEvent, targetNode: WorkflowNodeV1) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    
    if (connectingFromNodeId && connectingFromNodeId !== targetNode.id) {
      const connectionExists = connections.some(
        c => c.from === connectingFromNodeId && c.to === targetNode.id
      );
      if (!connectionExists) {
        const newConnection: WorkflowConnectionV1 = {
          from: connectingFromNodeId,
          to: targetNode.id
        };
        onConnectionsChange([...connections, newConnection]);
      }
    }
    setConnectingFromNodeId(null);
  }, [readOnly, connectingFromNodeId, connections, onConnectionsChange]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (nodes.length === 0) return;
    
    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 100;
    
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + NODE_HEIGHT));
    
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const viewportWidth = rect.width;
      const viewportHeight = rect.height;
      
      const scaleX = viewportWidth / (width + 200);
      const scaleY = viewportHeight / (height + 200);
      const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
      
      setZoom(newZoom);
      setPan({
        x: viewportWidth / 2 - centerX * newZoom,
        y: viewportHeight / 2 - centerY * newZoom
      });
    }
  }, [nodes]);
  
  // Auto-fit viewport when nodes are first loaded
  useEffect(() => {
    if (nodes.length > 0 && !hasAutoFittedRef.current && canvasRef.current) {
      // Small delay to ensure canvas is rendered
      setTimeout(() => {
        handleFitToScreen();
        hasAutoFittedRef.current = true;
      }, 100);
    }
  }, [nodes.length, handleFitToScreen]);

  // Render grid
  const renderGrid = () => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const startX = -pan.x % (GRID_SIZE * zoom);
    const startY = -pan.y % (GRID_SIZE * zoom);
    
    const lines = [];
    for (let x = startX; x < width; x += GRID_SIZE * zoom) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    for (let y = startY; y < height; y += GRID_SIZE * zoom) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    return lines;
  };

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <svg
        ref={canvasRef}
        className="w-full h-full workflow-canvas-content"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : connectingFromNodeId ? 'crosshair' : 'default' }}
      >
        <defs>
          <pattern
            id="grid"
            width={GRID_SIZE * zoom}
            height={GRID_SIZE * zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle 
              cx={GRID_SIZE * zoom / 2} 
              cy={GRID_SIZE * zoom / 2} 
              r={1.5} 
              fill="hsl(var(--muted-foreground))" 
              opacity={0.15}
              className="dark:opacity-10"
            />
          </pattern>
        </defs>
        
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid background */}
          <rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="url(#grid)"
            className="bg-background"
          />

          {/* Connections */}
          {connections.map((connection, idx) => {
            // For condition nodes, we might need to get the specific output point
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            // Skip rendering if nodes aren't found
            if (!fromNode || !toNode) {
              console.warn(`[WorkflowCanvas] Connection ${idx} skipped - nodes not found:`, {
                from: connection.from,
                to: connection.to,
                fromNodeFound: !!fromNode,
                toNodeFound: !!toNode,
                availableNodeIds: nodes.map(n => n.id)
              });
              return null;
            }
            
            let conditionIndex: number | undefined;
            if (fromNode.type === "condition" && connection.condition) {
              const conditionConfig = fromNode.config as unknown as Record<string, unknown> | undefined;
              const conditions = conditionConfig?.conditions as Array<{ id: string }> | undefined;
              const conditionId = connection.condition;
              conditionIndex = conditions?.findIndex((c) => c.id === conditionId);
            }
            const fromPoint = getNodeConnectionPoint(connection.from, true, conditionIndex);
            const toPoint = getNodeConnectionPoint(connection.to, false);
            
            // Skip if connection points are invalid (0,0 means node not found)
            if ((fromPoint.x === 0 && fromPoint.y === 0) || (toPoint.x === 0 && toPoint.y === 0)) {
              console.warn(`[WorkflowCanvas] Connection ${idx} has invalid points:`, {
                from: connection.from,
                to: connection.to,
                fromPoint,
                toPoint,
                fromNodePosition: fromNode?.position,
                toNodePosition: toNode?.position
              });
              return null;
            }
            
            return (
              <ConnectionLine
                key={`${connection.from}-${connection.to}-${idx}`}
                connection={connection}
                fromX={fromPoint.x}
                fromY={fromPoint.y}
                toX={toPoint.x}
                toY={toPoint.y}
                condition={connection.condition}
                isVertical={Math.abs(toPoint.x - fromPoint.x) < 20 && Math.abs(toPoint.y - fromPoint.y) > 30}
                readOnly={readOnly}
              />
            );
          })}

          {/* Temporary connection line while dragging */}
          {connectingFromNodeId && (() => {
            const fromPoint = getNodeConnectionPoint(connectingFromNodeId, true);
            return (
              <ConnectionLine
                connection={{ from: connectingFromNodeId, to: "" }}
                fromX={fromPoint.x}
                fromY={fromPoint.y}
                toX={connectionMousePos.x}
                toY={connectionMousePos.y}
                readOnly={readOnly}
              />
            );
          })()}

          {/* Nodes */}
          {(() => {
            // Sort nodes by Y position to determine order
            const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
            
            return sortedNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const displayNode = draggedNodeId === node.id
                ? { ...node, position: { x: FIXED_X_POSITION, y: node.position.y + nodeDragOffset.y } }
                : node;
              
              const canMoveUp = index > 0;
              const canMoveDown = index < sortedNodes.length - 1;

              return (
                <WorkflowNodeV1Component
                  key={node.id}
                  node={displayNode}
                  isSelected={isSelected}
                  isHovered={isHovered || connectingFromNodeId === node.id}
                  onClick={() => handleNodeClick(node, draggedNodeId === node.id && hasDragged)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onConnectionPointMouseDown={(e) => handleConnectionPointMouseDown(e, node)}
                  onConnectionPointMouseUp={(e) => handleConnectionPointMouseUp(e, node)}
                  onAddNextStep={(nodeId) => {
                    setNextStepMenuNodeId(nodeId);
                    const pos = getNextStepButtonPosition(nodeId);
                    setNextStepMenuPosition(pos);
                  }}
                  onRename={onNodeRename}
                  onReplace={onNodeReplace}
                  onDelete={onNodeDelete}
                  onEmail={onNodeEmail}
                  onMoveUp={onNodeMoveUp}
                  onMoveDown={onNodeMoveDown}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  readOnly={readOnly}
                  isLastNode={!connections.some(c => c.from === node.id)}
                />
              );
            });
          })()}
        </g>
      </svg>

      {/* Select Next Step Menu - rendered outside SVG */}
      {nextStepMenuNodeId && !readOnly && (
        <div
          style={{
            position: 'fixed',
            left: `${nextStepMenuPosition.x}px`,
            top: `${nextStepMenuPosition.y}px`,
            zIndex: 50
          }}
        >
          <SelectNextStepMenu
            isOpen={true}
            onClose={() => setNextStepMenuNodeId(null)}
            onSelectAction={() => {
              const nodeId = nextStepMenuNodeId;
              setNextStepMenuNodeId(null);
              if (onAddAction && nodeId) {
                onAddAction(nodeId);
              }
            }}
            onSelectKnowledgeBase={() => {
              const nodeId = nextStepMenuNodeId;
              setNextStepMenuNodeId(null);
              if (onAddKnowledgeBase && nodeId) {
                onAddKnowledgeBase(nodeId);
              }
            }}
            onSelectLoop={() => {
              const nodeId = nextStepMenuNodeId;
              setNextStepMenuNodeId(null);
              if (onAddLoop && nodeId) {
                onAddLoop(nodeId);
              }
            }}
            onSelectCondition={() => {
              const nodeId = nextStepMenuNodeId;
              setNextStepMenuNodeId(null);
              if (onAddCondition && nodeId) {
                onAddCondition(nodeId);
              }
            }}
            onSelectAgentStep={() => {
              const nodeId = nextStepMenuNodeId;
              setNextStepMenuNodeId(null);
              if (onAddAgentStep && nodeId) {
                onAddAgentStep(nodeId);
              }
            }}
          >
            <div />
          </SelectNextStepMenu>
        </div>
      )}

      {/* Toolbar */}
      <div className="workflow-toolbar absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg z-10">
        {onAddTrigger && onAddAction && onAddAgentStep ? (
          <AddNodeMenu
            isOpen={isAddNodeMenuOpen}
            onClose={() => setIsAddNodeMenuOpen(false)}
            onSelectTrigger={() => {
              setIsAddNodeMenuOpen(false);
              onAddTrigger();
            }}
            onSelectAction={() => {
              setIsAddNodeMenuOpen(false);
              onAddAction();
            }}
            onSelectAgentStep={() => {
              setIsAddNodeMenuOpen(false);
              onAddAgentStep();
            }}
            onSelectFlowTemplate={onAddFlowTemplate ? () => {
              setIsAddNodeMenuOpen(false);
              onAddFlowTemplate();
            } : undefined}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAddNodeMenuOpen(!isAddNodeMenuOpen);
              }}
              className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={readOnly}
            >
              + Add Node
            </button>
          </AddNodeMenu>
        ) : (
          <button
            onClick={onAddNodeClick}
            className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            disabled={readOnly}
          >
            + Add Node
          </button>
        )}
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
          disabled={zoom <= MIN_ZOOM}
        >
          <span className="text-sm">−</span>
        </button>
        <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
          disabled={zoom >= MAX_ZOOM}
        >
          <span className="text-sm">+</span>
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={handleFitToScreen}
          className="px-3 py-1.5 text-sm hover:bg-secondary rounded transition-colors"
        >
          Fit
        </button>
      </div>
    </div>
  );
}

