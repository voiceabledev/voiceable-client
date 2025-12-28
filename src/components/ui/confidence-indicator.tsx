import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  score: number; // 0-1
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceIndicator({ score, className, showLabel = true }: ConfidenceIndicatorProps) {
  const percentage = Math.round(score * 100);
  
  const getColor = () => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            {showLabel && <span className="text-xs text-muted-foreground">Confidence:</span>}
            <div className="flex-1 max-w-[100px]">
              <Progress value={percentage} className="h-2" />
            </div>
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Confidence score: {percentage}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
