import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Zap, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddNodeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrigger: () => void;
  onSelectAction: () => void;
  onSelectAgentStep: () => void;
  children: React.ReactNode;
}

export function AddNodeMenu({
  isOpen,
  onClose,
  onSelectTrigger,
  onSelectAction,
  onSelectAgentStep,
  children
}: AddNodeMenuProps) {
  const handleSelectTrigger = () => {
    onSelectTrigger();
    onClose();
  };

  const handleSelectAction = () => {
    onSelectAction();
    onClose();
  };

  const handleSelectAgentStep = () => {
    onSelectAgentStep();
    onClose();
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2 bg-card border-border z-50"
        align="center"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-1">
          <button
            onClick={handleSelectTrigger}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-yellow-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">Add trigger</div>
              <div className="text-xs text-muted-foreground">
                Start your workflow
              </div>
            </div>
          </button>

          <button
            onClick={handleSelectAction}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">Add action</div>
              <div className="text-xs text-muted-foreground">
                Integration tools
              </div>
            </div>
          </button>

          <button
            onClick={handleSelectAgentStep}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">Add agent step</div>
              <div className="text-xs text-muted-foreground">
                AI agent with skills
              </div>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

