import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { WorkflowNodeV1, NodeType } from "@/types/workflow-v1";
import {
  FileSpreadsheet,
  Phone,
  Database,
  GitBranch,
  User,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Type
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface WorkflowNodeV1Props {
  node: WorkflowNodeV1;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onConnectionPointMouseDown: (e: React.MouseEvent) => void;
  onConnectionPointMouseUp: (e: React.MouseEvent) => void;
  onAddNextStep?: (nodeId: string) => void;
  onRename?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  readOnly?: boolean;
  isLastNode?: boolean; // Whether this node has no outgoing connections
}

const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;
const CONNECTION_POINT_SIZE = 12;

function getNodeIcon(type: NodeType) {
  switch (type) {
    case "select-trigger":
      return Zap;
    case "select-action":
      return Sparkles;
    case "google-sheets-new-row":
    case "google-sheets-row-updated":
    case "google-sheets-action":
      return FileSpreadsheet;
    case "make-call":
      return Phone;
    case "knowledge-base":
      return Database;
    case "condition":
      return GitBranch;
    case "agent-step":
      return User;
    case "api-request":
      return Zap;
    default:
      return Zap;
  }
}

function getNodeBackgroundColor(type: NodeType): { fill: string; stroke: string } {
  // Triggers: yellow/orange
  if (type === "select-trigger" || type === "google-sheets-new-row" || type === "google-sheets-row-updated" || type === "webhook" || type === "manual") {
    return { 
      fill: "rgb(254 252 232)", // yellow-50
      stroke: "rgb(253 224 71)" // yellow-300
    };
  }
  // Select action placeholder: purple/pink
  if (type === "select-action") {
    return { 
      fill: "rgb(253 244 255)", // pink-50
      stroke: "rgb(249 168 212)" // pink-300
    };
  }
  // Condition: purple/blue
  if (type === "condition") {
    return { 
      fill: "rgb(250 245 255)", // purple-50
      stroke: "rgb(196 181 253)" // purple-300
    };
  }
  // Actions: blue/white
  return { 
    fill: "rgb(239 246 255)", // blue-50
    stroke: "rgb(147 197 253)" // blue-300
  };
}

function getNodeBackgroundColorDark(type: NodeType): { fill: string; stroke: string } {
  // Triggers: yellow/orange
  if (type === "select-trigger" || type === "google-sheets-new-row" || type === "google-sheets-row-updated" || type === "webhook" || type === "manual") {
    return { 
      fill: "rgba(113, 63, 18, 0.4)", // yellow-950/40
      stroke: "rgb(113, 63, 18)" // yellow-700
    };
  }
  // Select action placeholder: purple/pink
  if (type === "select-action") {
    return { 
      fill: "rgba(80, 7, 36, 0.4)", // pink-950/40
      stroke: "rgb(157, 23, 77)" // pink-700
    };
  }
  // Condition: purple/blue
  if (type === "condition") {
    return { 
      fill: "rgba(88, 28, 135, 0.4)", // purple-950/40
      stroke: "rgb(126, 34, 206)" // purple-700
    };
  }
  // Actions: blue/white
  return { 
    fill: "rgba(30, 58, 138, 0.4)", // blue-950/40
    stroke: "rgb(29, 78, 216)" // blue-700
  };
}

function getNodeIconColor(type: NodeType): string {
  if (type === "select-trigger") {
    return "text-yellow-600 dark:text-yellow-400";
  }
  if (type === "select-action") {
    return "text-pink-600 dark:text-pink-400";
  }
  if (type === "google-sheets-new-row" || type === "google-sheets-row-updated" || type === "google-sheets-action") {
    return "text-green-600 dark:text-green-400";
  }
  if (type === "make-call") {
    return "text-orange-600 dark:text-orange-400";
  }
  if (type === "knowledge-base") {
    return "text-blue-600 dark:text-blue-400";
  }
  if (type === "condition") {
    return "text-purple-600 dark:text-purple-400";
  }
  if (type === "agent-step") {
    return "text-indigo-600 dark:text-indigo-400";
  }
  return "text-gray-600 dark:text-gray-400";
}

function isNodeConfigured(node: WorkflowNodeV1): boolean {
  // Basic validation - check if required fields are filled
  const { type, config } = node;
  
  if (type === "select-trigger" || type === "select-action") {
    return false; // Always show warning for placeholder
  }
  
  if (type === "google-sheets-new-row" || type === "google-sheets-row-updated") {
    const c = config as any;
    return !!(c.connection && c.spreadsheetId);
  }
  
  if (type === "make-call") {
    const c = config as any;
    return !!c.agentId;
  }
  
  if (type === "knowledge-base") {
    const c = config as any;
    return !!(c.knowledgeBaseIds && c.knowledgeBaseIds.length > 0);
  }
  
  if (type === "condition") {
    const c = config as any;
    return !!(c.conditions && c.conditions.length > 0 && c.conditions[0].expression);
  }
  
  if (type === "google-sheets-action") {
    const c = config as any;
    return !!(c.connection && c.spreadsheetId && c.sheetTitle);
  }
  
  if (type === "api-request") {
    const c = config as any;
    return !!c.url;
  }
  
  if (type === "agent-step") {
    const c = config as any;
    return !!c.agentId;
  }
  
  return false;
}

export function WorkflowNodeV1Component({
  node,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onConnectionPointMouseDown,
  onConnectionPointMouseUp,
  onAddNextStep,
  onRename,
  onReplace,
  onDelete,
  readOnly = false,
  isLastNode = false
}: WorkflowNodeV1Props) {
  const Icon = useMemo(() => getNodeIcon(node.type), [node.type]);
  const bgColor = useMemo(() => getNodeBackgroundColor(node.type), [node.type]);
  const bgColorDark = useMemo(() => getNodeBackgroundColorDark(node.type), [node.type]);
  const iconColor = useMemo(() => getNodeIconColor(node.type), [node.type]);
  const isConfigured = useMemo(() => isNodeConfigured(node), [node]);

  const x = node.position.x;
  const y = node.position.y;

  // Connection points - top (input) and bottom (output) for vertical flow
  const inputPoint = { x: x + NODE_WIDTH / 2, y: y };
  const outputPoint = { x: x + NODE_WIDTH / 2, y: y + NODE_HEIGHT };

  // For condition nodes, multiple output points
  const isCondition = node.type === "condition";
  const conditionConfig = isCondition ? (node.config as any) : null;
  const conditionCount = conditionConfig?.conditions?.length || 1;

  return (
    <g
      data-node-id={node.id}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Node rectangle with shadow */}
      <defs>
        <filter id={`node-shadow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <rect
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx={12}
            fill={bgColor.fill}
            stroke={bgColor.stroke}
            strokeWidth={2}
            className={cn(
              "transition-all",
              readOnly ? "cursor-default" : "cursor-move",
              isSelected
                ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                : isHovered
                ? "ring-1 ring-primary/50 shadow-md"
                : "shadow-sm",
              readOnly && "opacity-75"
            )}
            style={{
              filter: isSelected || isHovered ? `url(#node-shadow-${node.id})` : "drop-shadow(0 1px 2px rgba(0,0,0,0.05))"
            }}
            onClick={(e) => {
              // Only trigger onClick if it wasn't a drag
              if (!readOnly) {
                onClick();
              }
            }}
            onMouseDown={(e) => {
              if (onMouseDown && !readOnly) {
                e.preventDefault(); // Prevent text selection
                onMouseDown(e);
              }
            }}
          />
        </ContextMenuTrigger>
        {!readOnly && (onRename || onReplace || onDelete) && (
          <ContextMenuContent onClick={(e) => e.stopPropagation()}>
            {onRename && (
              <ContextMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(node.id);
                }}
              >
                <Type className="h-4 w-4 mr-2" />
                Rename
              </ContextMenuItem>
            )}
            {onReplace && (
              <ContextMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace(node.id);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Replace
              </ContextMenuItem>
            )}
            {onDelete && (
              <ContextMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        )}
      </ContextMenu>

      {/* Node content */}
      <foreignObject x={0} y={0} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={cn(
            "h-full p-3 flex flex-col",
            readOnly ? "cursor-default" : "cursor-move"
          )}
          onClick={onClick}
          onMouseDown={(e) => {
            if (onMouseDown && !readOnly) {
              e.stopPropagation();
              onMouseDown(e);
            }
          }}
        >
          <div className="flex items-start gap-3 flex-1 relative">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              node.type === "select-trigger" && "bg-yellow-100 dark:bg-yellow-900/50",
              node.type === "select-action" && "bg-pink-100 dark:bg-pink-900/50",
              node.type === "google-sheets-new-row" && "bg-green-100 dark:bg-green-900/50",
              node.type === "google-sheets-row-updated" && "bg-green-100 dark:bg-green-900/50",
              node.type === "google-sheets-action" && "bg-green-100 dark:bg-green-900/50",
              node.type === "make-call" && "bg-orange-100 dark:bg-orange-900/50",
              node.type === "knowledge-base" && "bg-blue-100 dark:bg-blue-900/50",
              node.type === "condition" && "bg-purple-100 dark:bg-purple-900/50",
              node.type === "agent-step" && "bg-indigo-100 dark:bg-indigo-900/50",
              !["select-trigger", "select-action", "google-sheets-new-row", "google-sheets-row-updated", "google-sheets-action", "make-call", "knowledge-base", "condition", "agent-step"].includes(node.type) && "bg-gray-100 dark:bg-gray-900/50"
            )}>
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="font-semibold text-sm truncate text-foreground">{node.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                {node.type.replace(/-/g, " ")}
              </div>
            </div>
            <div className="absolute top-0 right-0 flex items-center gap-1.5 flex-shrink-0">
              {!readOnly && (onRename || onReplace || onDelete) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "h-6 w-6 rounded flex items-center justify-center transition-all",
                        "hover:bg-secondary/80 active:bg-secondary",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        "cursor-pointer z-10",
                        !isConfigured && "text-yellow-600 dark:text-yellow-400",
                        isConfigured && "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      title="Node options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {onRename && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(node.id);
                        }}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                    )}
                    {onReplace && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplace(node.id);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Replace
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(node.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {!isConfigured && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                  {isConfigured && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </foreignObject>

      {/* Input connection point */}
      {!isCondition && (
        <circle
          cx={inputPoint.x - x}
          cy={inputPoint.y - y}
          r={CONNECTION_POINT_SIZE / 2}
          className={cn(
            "connection-point fill-primary stroke-2 stroke-background transition-opacity",
            readOnly ? "cursor-not-allowed" : "cursor-crosshair",
            isHovered ? "opacity-100" : "opacity-30 hover:opacity-70"
          )}
          onMouseDown={(e) => {
            e.stopPropagation();
            onConnectionPointMouseDown(e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onConnectionPointMouseUp(e);
          }}
        />
      )}

      {/* Output connection points */}
      {!isCondition && (
        <>
          <circle
            cx={outputPoint.x - x}
            cy={outputPoint.y - y}
            r={CONNECTION_POINT_SIZE / 2}
            className={cn(
              "connection-point fill-primary stroke-2 stroke-background transition-opacity",
              readOnly ? "cursor-not-allowed" : "cursor-crosshair",
              isHovered ? "opacity-100" : "opacity-30 hover:opacity-70"
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionPointMouseDown(e);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              onConnectionPointMouseUp(e);
            }}
          />
          {/* Add next step button */}
          {!readOnly && onAddNextStep && (
            <>
              {/* Dots before the + button (only for last node) */}
              {isLastNode && (
                <g>
                  <circle
                    cx={outputPoint.x - x - 32}
                    cy={outputPoint.y - y + 12}
                    r={2}
                    className="fill-muted-foreground opacity-60"
                  />
                  <circle
                    cx={outputPoint.x - x - 28}
                    cy={outputPoint.y - y + 12}
                    r={2}
                    className="fill-muted-foreground opacity-60"
                  />
                  <circle
                    cx={outputPoint.x - x - 24}
                    cy={outputPoint.y - y + 12}
                    r={2}
                    className="fill-muted-foreground opacity-60"
                  />
                </g>
              )}
              <foreignObject
                x={outputPoint.x - x - 12}
                y={outputPoint.y - y + 8}
                width={24}
                height={24}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNextStep?.(node.id);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600",
                    "flex items-center justify-center text-white",
                    "transition-all shadow-md hover:shadow-lg",
                    "cursor-pointer"
                  )}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </foreignObject>
            </>
          )}
        </>
      )}

      {/* Condition node - multiple output points */}
      {isCondition && conditionCount > 0 && (
        <>
          {/* Input point */}
          <circle
            cx={inputPoint.x - x}
            cy={inputPoint.y - y}
            r={CONNECTION_POINT_SIZE / 2}
            className={cn(
              "connection-point fill-primary stroke-2 stroke-background transition-opacity",
              readOnly ? "cursor-not-allowed" : "cursor-crosshair",
              isHovered ? "opacity-100" : "opacity-30 hover:opacity-70"
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionPointMouseDown(e);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              onConnectionPointMouseUp(e);
            }}
          />
          
          {/* Output points - one for each condition, spread horizontally at bottom */}
          {Array.from({ length: conditionCount }).map((_, idx) => {
            const spacing = NODE_WIDTH / (conditionCount + 1);
            const outputX = spacing * (idx + 1);
            return (
              <circle
                key={`output-${idx}`}
                cx={outputX}
                cy={outputPoint.y - y}
                r={CONNECTION_POINT_SIZE / 2}
                className={cn(
                  "connection-point fill-primary stroke-2 stroke-background transition-opacity",
                  readOnly ? "cursor-not-allowed" : "cursor-crosshair",
                  isHovered ? "opacity-100" : "opacity-30 hover:opacity-70"
                )}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onConnectionPointMouseDown(e);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  onConnectionPointMouseUp(e);
                }}
                data-condition-index={idx}
              />
            );
          })}
        </>
      )}
    </g>
  );
}

