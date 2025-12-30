import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WorkflowConnectionV1 } from "@/types/workflow-v1";

interface ConnectionLineProps {
  connection: WorkflowConnectionV1;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  condition?: string;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  readOnly?: boolean;
  isVertical?: boolean; // For vertical dotted connections
}

const CONTROL_POINT_OFFSET = 100;

export function ConnectionLine({
  connection,
  fromX,
  fromY,
  toX,
  toY,
  condition,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  readOnly = false,
  isVertical = false
}: ConnectionLineProps) {
  // For vertical connections, use a straight dotted line
  // For horizontal connections, use bezier curve
  // Check if connection is vertical: same X coordinate (or very close) and Y distance is significant
  const isVerticalConnection = isVertical || (Math.abs(toX - fromX) < 20 && Math.abs(toY - fromY) > 30);
  
  // Calculate control points for horizontal bezier curve
  // Determine if connection goes left-to-right or right-to-left
  const isLeftToRight = toX > fromX;
  const horizontalOffset = isLeftToRight ? CONTROL_POINT_OFFSET : -CONTROL_POINT_OFFSET;
  
  const cp1X = fromX + horizontalOffset;
  const cp1Y = fromY;
  const cp2X = toX - horizontalOffset;
  const cp2Y = toY;

  // Calculate midpoint for label positioning
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  // Calculate point on curve at t=0.5 for label
  const t = 0.5;
  const labelX = isVerticalConnection ? midX : Math.pow(1 - t, 3) * fromX +
    3 * Math.pow(1 - t, 2) * t * cp1X +
    3 * (1 - t) * Math.pow(t, 2) * cp2X +
    Math.pow(t, 3) * toX;
  const labelY = isVerticalConnection ? midY : Math.pow(1 - t, 3) * fromY +
    3 * Math.pow(1 - t, 2) * t * cp1Y +
    3 * (1 - t) * Math.pow(t, 2) * cp2Y +
    Math.pow(t, 3) * toY;

  // Path for the connection
  const path = useMemo(() => {
    if (isVerticalConnection) {
      // Straight vertical line
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
    // Bezier curve for horizontal connections
    return `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
  }, [fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y, isVerticalConnection]);

  // Invisible wider path for easier clicking
  const hitPath = useMemo(() => {
    if (isVerticalConnection) {
      const offset = 10;
      return `M ${fromX - offset} ${fromY} L ${toX - offset} ${toY} M ${fromX + offset} ${fromY} L ${toX + offset} ${toY}`;
    }
    const offset = 10;
    const isLeftToRight = toX > fromX;
    const horizontalOffset = isLeftToRight ? offset : -offset;
    return `M ${fromX} ${fromY} C ${cp1X + horizontalOffset} ${cp1Y}, ${cp2X - horizontalOffset} ${cp2Y}, ${toX} ${toY}`;
  }, [fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y, isVerticalConnection]);

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Invisible hit area for easier clicking */}
      <path
        d={hitPath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="pointer-events-auto"
      />

      {/* Visible connection line */}
      <path
        d={path}
        fill="none"
        stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={isHovered ? 2.5 : 2}
        strokeDasharray={isVerticalConnection ? "4 4" : "none"}
        className={cn(
          "transition-all",
          isHovered && "drop-shadow-sm"
        )}
        markerEnd={`url(#arrowhead-${connection.from}-${connection.to})`}
      />

      {/* Arrow marker definition */}
      <defs>
        <marker
          id={`arrowhead-${connection.from}-${connection.to}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 5, 0 10"
            fill={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
            className="transition-colors"
          />
        </marker>
      </defs>

      {/* Condition label */}
      {condition && condition !== "Always" && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-40}
            y={-10}
            width={80}
            height={20}
            rx={4}
            className="fill-background stroke-border"
            strokeWidth={1}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="text-xs fill-foreground pointer-events-none"
          >
            {condition.length > 15 ? condition.substring(0, 15) + "..." : condition}
          </text>
        </g>
      )}
    </g>
  );
}

