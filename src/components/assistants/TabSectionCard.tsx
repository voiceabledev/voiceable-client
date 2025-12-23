import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabSectionCardProps {
  title: string;
  description: string;
  count?: string;
  actionButton?: React.ReactNode;
  actionButtons?: React.ReactNode; // For buttons inside the card (below header)
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export function TabSectionCard({
  title,
  description,
  count,
  actionButton,
  actionButtons,
  collapsible = false,
  expanded = true,
  onToggle,
  children,
}: TabSectionCardProps) {
  const content = (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      {collapsible ? (
        <button
          className="w-full flex items-start justify-between gap-2"
          onClick={onToggle}
        >
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            {count && (
              <p className="text-xs text-muted-foreground mt-2">{count}</p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              expanded && "rotate-180"
            )}
          />
        </button>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            {count && (
              <p className="text-xs text-muted-foreground mt-2">{count}</p>
            )}
          </div>
          {actionButton}
        </div>
      )}

      {actionButtons && (!collapsible || expanded) && (
        <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
          {actionButtons}
        </div>
      )}

      {(!collapsible || expanded) && (
        <div className="mt-4 md:mt-6">{children}</div>
      )}
    </div>
  );

  return content;
}

