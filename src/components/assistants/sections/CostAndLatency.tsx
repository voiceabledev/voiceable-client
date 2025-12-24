import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Segment = {
  className: string;
  tooltip: { label: string; value: string };
  width?: string;
};

type IndicatorProps = {
  value: string;
  unit: string;
  segments: Segment[];
};

type CostAndLatencyProps = {
  cost: IndicatorProps;
  latency: IndicatorProps;
};

const Indicator: React.FC<IndicatorProps & { label: string }> = ({ label, value, unit, segments }) => (
  <div className="flex-1 bg-card border border-border rounded-lg p-3 md:p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg md:text-xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
    <div className="flex gap-1 h-2">
      <TooltipProvider>
        {segments.map((segment, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div className={segment.className} style={segment.width ? { width: segment.width } : undefined} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">{segment.tooltip.label}</p>
              <p className="text-[10px] text-muted-foreground">{segment.tooltip.value}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  </div>
);

export const CostAndLatency: React.FC<CostAndLatencyProps> = ({ cost, latency }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Indicator label="Estimated Cost" {...cost} />
      <Indicator label="Average Latency" {...latency} />
    </div>
  );
};
