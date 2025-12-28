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

const Indicator: React.FC<IndicatorProps & { label: string; explanation?: string }> = ({ label, value, unit, segments, explanation }) => (
  <TooltipProvider>
    <div className="flex-1 bg-card border border-border rounded-lg p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-help">{label}</span>
          </TooltipTrigger>
          {explanation && (
            <TooltipContent>
              <p className="text-xs">{explanation}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-baseline gap-0.5 cursor-help">
              <span className="text-lg md:text-xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </TooltipTrigger>
          {explanation && (
            <TooltipContent>
              <p className="text-xs">{explanation}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      <div className="flex gap-1 h-2">
        {segments.map((segment, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div 
                className={`${segment.className} cursor-pointer transition-opacity hover:opacity-80 min-w-[4px]`} 
                style={segment.width ? { width: segment.width, flex: segment.width ? 'none' : 1 } : { flex: 1 }}
                title={`${segment.tooltip.label}: ${segment.tooltip.value}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{segment.tooltip.label}</p>
                <p className="text-xs text-muted-foreground">{segment.tooltip.value}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  </TooltipProvider>
);

export const CostAndLatency: React.FC<CostAndLatencyProps> = ({ cost, latency }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Indicator 
        label="Estimated Cost" 
        explanation="The estimated cost per minute includes all components: model inference, transcriber, voice synthesis, and hosting. Hover over the colored segments to see the breakdown for each component."
        {...cost} 
      />
      <Indicator 
        label="Average Latency" 
        explanation="The average response time from when the user finishes speaking to when the assistant responds. This includes transcription, model processing, and voice synthesis. Hover over the colored segments to see the breakdown for each component."
        {...latency} 
      />
    </div>
  );
};
