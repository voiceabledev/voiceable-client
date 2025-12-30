import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileSpreadsheet,
  Phone,
  Database,
  GitBranch,
  User,
  Zap,
  Webhook,
  MousePointerClick
} from "lucide-react";
import type { NodeType } from "@/types/workflow-v1";

interface AddNodeModalV1Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: NodeType) => void;
}

const triggers = [
  {
    type: "google-sheets-new-row" as const,
    name: "New row added",
    description: "Triggers when a new row is added to Google Sheets",
    icon: FileSpreadsheet,
    iconBg: "bg-green-500"
  },
  {
    type: "google-sheets-row-updated" as const,
    name: "Row updated",
    description: "Triggers when a row is updated in Google Sheets",
    icon: FileSpreadsheet,
    iconBg: "bg-green-500"
  },
  {
    type: "webhook" as const,
    name: "Webhook",
    description: "Triggers when a webhook is called",
    icon: Webhook,
    iconBg: "bg-blue-500"
  },
  {
    type: "manual" as const,
    name: "Manual trigger",
    description: "Manually triggered workflow",
    icon: MousePointerClick,
    iconBg: "bg-gray-500"
  }
];

const actions = [
  {
    type: "make-call" as const,
    name: "Make Call",
    description: "Make a voice call using an agent",
    icon: Phone,
    iconBg: "bg-orange-500"
  },
  {
    type: "knowledge-base" as const,
    name: "Search knowledge base",
    description: "Retrieve and utilize information from diverse sources",
    icon: Database,
    iconBg: "bg-blue-500"
  },
  {
    type: "condition" as const,
    name: "Condition",
    description: "Branch workflow based on conditions",
    icon: GitBranch,
    iconBg: "bg-purple-500"
  },
  {
    type: "agent-step" as const,
    name: "Agent Step",
    description: "Execute a step using a sub-agent",
    icon: User,
    iconBg: "bg-indigo-500"
  },
  {
    type: "google-sheets-action" as const,
    name: "Google Sheets",
    description: "Append row, update cell, or other Google Sheets actions",
    icon: FileSpreadsheet,
    iconBg: "bg-green-500"
  },
  {
    type: "api-request" as const,
    name: "API Request",
    description: "Make an HTTP request to an API endpoint",
    icon: Zap,
    iconBg: "bg-purple-600"
  }
];

export function AddNodeModalV1({ isOpen, onClose, onSelect }: AddNodeModalV1Props) {
  const handleSelect = (type: NodeType) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add action</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select an action to add to your agent
          </p>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Triggers Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">TRIGGERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {triggers.map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <button
                    key={trigger.type}
                    onClick={() => handleSelect(trigger.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${trigger.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{trigger.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {trigger.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">ACTIONS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.type}
                    onClick={() => handleSelect(action.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${action.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{action.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {action.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

