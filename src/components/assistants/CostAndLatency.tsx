import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Segment {
  className: string;
  tooltip?: {
    label: string;
    value: string;
  };
}

interface CostAndLatencyProps {
  cost: {
    value: string;
    unit: string;
    segments: Segment[];
  };
  latency: {
    value: string;
    unit: string;
    segments: Segment[];
  };
  className?: string;
}

export default function CostAndLatency({ cost, latency, className = "" }: CostAndLatencyProps) {
  const renderSegment = (segment: Segment, index: number) => {
    const segmentElement = (
      <div key={index} className={`${segment.className} ${segment.tooltip ? 'cursor-pointer' : ''}`} />
    );

    if (segment.tooltip) {
      return (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            {segmentElement}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div>{segment.tooltip.label}</div>
              <div>{segment.tooltip.value}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return segmentElement;
  };

  return (
    <>
    {/* <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 ${className}`}>
      <div className="bg-card border border-border rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm text-muted-foreground">Cost</span>
          <span className="text-base md:text-lg font-semibold">
            {cost.value} <span className="text-xs md:text-sm text-muted-foreground font-normal">{cost.unit}</span>
          </span>
        </div>
        <div className="flex gap-1">
          {cost.segments.map((segment, index) => renderSegment(segment, index))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm text-muted-foreground">Latency</span>
          <span className="text-base md:text-lg font-semibold">
            {latency.value} <span className="text-xs md:text-sm text-muted-foreground font-normal">{latency.unit}</span>
          </span>
        </div>
        <div className="flex gap-1">
          {latency.segments.map((segment, index) => renderSegment(segment, index))}
        </div>
      </div>
     </div> */}
    </>
  );
}
