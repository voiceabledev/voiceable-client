import React from "react";
import { Globe, Code, Edit, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type WebhookToolSummary = {
  id: string;
  name: string;
};

type ClientToolSummary = {
  id: string;
  name: string;
};

type ExternalToolsSectionProps = {
  webhooks: WebhookToolSummary[];
  clientTools: ClientToolSummary[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddWebhook: () => void;
  onEditWebhook: (id: string) => void;
  onDeleteWebhook: (id: string) => void;
  onEditClientTool: (id: string) => void;
  onDeleteClientTool: (id: string) => void;
};

export const ExternalToolsSection: React.FC<ExternalToolsSectionProps> = ({
  webhooks = [],
  clientTools = [],
  expanded,
  onToggleExpanded,
  onAddWebhook,
  onEditWebhook,
  onDeleteWebhook,
  onEditClientTool,
  onDeleteClientTool,
}) => {
  const totalCount = (webhooks?.length || 0) + (clientTools?.length || 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <button
        className="w-full flex items-start justify-between gap-2"
        onClick={onToggleExpanded}
      >
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">External integration tools</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Allow the agent to perform client-side and external integrations.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalCount} tool{totalCount !== 1 ? "s" : ""} configured
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="flex mt-3 justify-end">
          <Button variant="outline" size="sm" onClick={onAddWebhook}>
            <Plus className="h-4 w-4 mr-2" />
            Webhook Tool
          </Button>
        </div>
      )}

      {expanded && (
        <div className="mt-4 md:mt-6">
          {((webhooks?.length || 0) > 0 || (clientTools?.length || 0) > 0) ? (
            <div className="space-y-2">
              {webhooks?.map((tool, index) => (
                <div
                  key={tool.id || `webhook-${index}`}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{tool.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">Webhook</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditWebhook(tool.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDeleteWebhook(tool.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {clientTools?.map((tool, index) => (
                <div
                  key={tool.id || `client-tool-${index}`}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{tool.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">Client</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditClientTool(tool.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDeleteClientTool(tool.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No external tools configured yet.</p>
              <p className="text-xs mt-1">
                Add webhook or client tools to extend your agent&apos;s capabilities.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


