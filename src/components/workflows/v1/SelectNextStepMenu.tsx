import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Database, Repeat, GitBranch, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectNextStepMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: () => void;
  onSelectKnowledgeBase: () => void;
  onSelectLoop: () => void;
  onSelectCondition: () => void;
  onSelectAgentStep: () => void;
  children: React.ReactNode;
}

export function SelectNextStepMenu({
  isOpen,
  onClose,
  onSelectAction,
  onSelectKnowledgeBase,
  onSelectLoop,
  onSelectCondition,
  onSelectAgentStep,
  children
}: SelectNextStepMenuProps) {
  const handleSelectAction = () => {
    onSelectAction();
    onClose();
  };

  const handleSelectKnowledgeBase = () => {
    onSelectKnowledgeBase();
    onClose();
  };

  const handleSelectLoop = () => {
    onSelectLoop();
    onClose();
  };

  const handleSelectCondition = () => {
    onSelectCondition();
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
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select next step
          </div>
          
          <button
            onClick={handleSelectAction}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-pink-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Perform an action</div>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleSelectKnowledgeBase}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Search knowledge base</div>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleSelectLoop}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-gray-500">
              <Repeat className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Enter loop</div>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleSelectCondition}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-purple-500">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Condition</div>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleSelectAgentStep}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              "hover:bg-secondary/50"
            )}
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Enter agent step</div>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

