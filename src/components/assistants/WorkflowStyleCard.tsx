import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStyleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const WorkflowStyleCard: React.FC<WorkflowStyleCardProps> = ({
  title,
  description,
  icon: Icon,
  expanded,
  onToggle,
  count,
  actionButton,
  children,
  className,
}) => {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300",
      expanded && "shadow-md",
      className
    )}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        {/* Icon Box */}
        <div className={cn(
          "p-3 rounded-xl transition-all duration-300 ring-2 shadow-sm flex-shrink-0",
          expanded
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-primary/20 shadow-primary/20"
            : "bg-card text-muted-foreground ring-border group-hover:text-primary group-hover:ring-primary/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {count !== undefined && count > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center min-w-[24px] h-5 px-2 text-xs font-medium rounded-full transition-all duration-300",
                expanded
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-tight">{description}</p>
        </div>

        {/* Action Button (only shown when expanded) */}
        {expanded && actionButton && (
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            {actionButton}
          </div>
        )}

        {/* Chevron */}
        <div className={cn(
          "flex-shrink-0 p-1.5 rounded-full transition-all duration-300",
          expanded
            ? "bg-primary/10 text-primary rotate-180"
            : "bg-muted text-muted-foreground"
        )}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Content Area */}
      {expanded && children && (
        <div className="p-5 bg-muted/30 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
};
