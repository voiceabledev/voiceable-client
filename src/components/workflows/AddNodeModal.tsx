import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Zap, PhoneForwarded, PhoneOff, Wrench, User } from "lucide-react";
import type { WorkflowNode } from "@/pages/WorkflowEditor";

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: WorkflowNode["type"]) => void;
}

const nodeTypes = [
  {
    type: "conversation" as const,
    name: "Conversation",
    shortcut: "⌘ + shift + C",
    icon: MessageSquare,
    iconBg: "bg-orange-500"
  },
  {
    type: "subagent" as const,
    name: "Subagent",
    shortcut: "⌘ + shift + S",
    icon: User,
    iconBg: "bg-blue-500"
  },
  {
    type: "api-request" as const,
    name: "API Request",
    shortcut: "⌘ + shift + A",
    icon: Zap,
    iconBg: "bg-purple-500"
  },
  {
    type: "transfer-call" as const,
    name: "Transfer Call",
    shortcut: "⌘ + shift + F",
    icon: PhoneForwarded,
    iconBg: "bg-success"
  },
  {
    type: "end-call" as const,
    name: "End call",
    shortcut: "⌘ + shift + E",
    icon: PhoneOff,
    iconBg: "bg-destructive"
  },
  {
    type: "tool" as const,
    name: "Tool",
    shortcut: "⌘ + shift + O",
    icon: Wrench,
    iconBg: "bg-purple-600"
  }
];

export function AddNodeModal({ isOpen, onClose, onSelect }: AddNodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add a Node</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 mt-4">
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => onSelect(node.type)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <div className={`p-2 rounded-lg ${node.iconBg}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="flex-1 font-medium">{node.name}</span>
                <span className="text-xs text-muted-foreground">{node.shortcut}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
