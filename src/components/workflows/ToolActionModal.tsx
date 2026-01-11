import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2, Edit, Settings, Key } from "lucide-react";
import type { ToolInChain } from "@/types/functions";

type ToolActionModalProps = {
  open: boolean;
  onClose: () => void;
  tool: ToolInChain | null;
  toolIndex: number | null;
  onRemove: () => void;
  onReplace: () => void;
  onConfigureCredentials?: () => void;
  onConfigureTool?: () => void;
};

const getToolDisplayName = (tool: ToolInChain): string => {
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }
  if (tool.method) {
    return `${tool.type} ${tool.method.toUpperCase()}`;
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ToolActionModal: React.FC<ToolActionModalProps> = ({
  open,
  onClose,
  tool,
  toolIndex,
  onRemove,
  onReplace,
  onConfigureCredentials,
  onConfigureTool,
}) => {
  if (!tool) return null;

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  const handleReplace = () => {
    onReplace();
    onClose();
  };

  const handleConfigureCredentials = () => {
    if (onConfigureCredentials) {
      onConfigureCredentials();
    }
    onClose();
  };

  const handleConfigureTool = () => {
    if (onConfigureTool) {
      onConfigureTool();
    }
    onClose();
  };

  // Determine if tool needs credentials (not Twilio which uses env vars)
  const needsCredentials = tool.type !== 'twilio';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tool Actions</DialogTitle>
          <DialogDescription>
            Manage the <strong>{getToolDisplayName(tool)}</strong> tool in this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {onConfigureTool && (
            <Button
              variant="outline"
              onClick={handleConfigureTool}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure all tools in workflow
            </Button>
          )}

          {needsCredentials && onConfigureCredentials && (
            <Button
              variant="outline"
              onClick={handleConfigureCredentials}
              className="w-full justify-start"
            >
              <Key className="h-4 w-4 mr-2" />
              Change credentials
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleReplace}
            className="w-full justify-start"
          >
            <Edit className="h-4 w-4 mr-2" />
            Replace with another tool
          </Button>

          <Button
            variant="destructive"
            onClick={handleRemove}
            className="w-full justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove from workflow
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
