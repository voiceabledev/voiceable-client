import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeft, MessageSquare, Mail, Calendar, FileText, FileSpreadsheet, Users, Cloud, Box, Hash, Linkedin, Youtube, Music, Zap, GitBranch, Repeat, Sparkles, Phone, Database } from "lucide-react";
import type { ActionType } from "@/types/workflow-v1";
import type { AgentIntegrationTool } from "@/types/assistant";
import { INTEGRATION_TOOLS_DISPLAY, INTEGRATION_METADATA, displayNameToActionName, getAvailableIntegrationTypes } from "@/constants/assistant";

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ActionType, app?: string, actionName?: string) => void;
  integrationTools?: AgentIntegrationTool[]; // Agent's enabled integration tools
}

interface AppAction {
  id: string;
  name: string;
  icon: any;
  iconBg: string;
  actions?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

const googleSheetsActions: AppAction = {
  id: "google-sheets",
  name: "Google Sheets",
  icon: FileSpreadsheet,
  iconBg: "bg-green-500",
  actions: [
    {
      id: "append-row",
      name: "Append row",
      description: "Append a new row to a spreadsheet."
    },
    {
      id: "append-rows",
      name: "Append rows",
      description: "Appends multiple rows to a spreadsheet."
    },
    {
      id: "clear-cell",
      name: "Clear Cell",
      description: "Clear the contents of a specific cell in a Google Sheets worksheet."
    },
    {
      id: "clear-rows",
      name: "Clear Rows",
      description: "Clear cell contents from specified rows in a Google Sheets worksheet."
    },
    {
      id: "copy-sheet",
      name: "Copy sheet",
      description: "Creates a copy of a Sheet."
    },
    {
      id: "copy-worksheet",
      name: "Copy Worksheet",
      description: "Copy a worksheet from one spreadsheet to another in Google Sheets."
    },
    {
      id: "create-column",
      name: "Create Column",
      description: "Insert a new column in a Google Sheets worksheet."
    }
  ]
};

const apps: AppAction[] = [
  googleSheetsActions,
  {
    id: "google-drive",
    name: "Google Drive",
    icon: Cloud,
    iconBg: "bg-blue-500"
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: Calendar,
    iconBg: "bg-blue-500"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    icon: Users,
    iconBg: "bg-orange-500"
  }
];

const chatActions: AppAction[] = [
  {
    id: "slack",
    name: "Slack",
    icon: Hash,
    iconBg: "bg-purple-500"
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    iconBg: "bg-red-500"
  },
  {
    id: "microsoft-outlook",
    name: "Microsoft Outlook",
    icon: Mail,
    iconBg: "bg-blue-500"
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageSquare,
    iconBg: "bg-blue-500"
  }
];

const aiActions = [
  {
    id: "knowledge-base",
    name: "Knowledge base",
    icon: Database,
    iconBg: "bg-blue-500",
    type: "knowledge-base" as ActionType
  }
];

const logicActions = [
  {
    id: "condition",
    name: "Condition",
    icon: GitBranch,
    iconBg: "bg-purple-500",
    type: "condition" as ActionType
  },
  {
    id: "enter-loop",
    name: "Enter loop",
    icon: Repeat,
    iconBg: "bg-purple-500",
    type: "api-request" as ActionType // Placeholder type
  }
];

const scrapersActions = [
  {
    id: "scrape-creators",
    name: "Scrape Creators",
    icon: Box,
    iconBg: "bg-black",
    type: "api-request" as ActionType
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    iconBg: "bg-blue-600",
    type: "api-request" as ActionType
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    iconBg: "bg-red-500",
    type: "api-request" as ActionType
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music,
    iconBg: "bg-black",
    type: "api-request" as ActionType
  }
];

const topActions = [
  {
    id: "make-call",
    name: "Make Call",
    icon: Phone,
    iconBg: "bg-orange-500",
    type: "make-call" as ActionType
  },
  {
    id: "knowledge-base",
    name: "Search knowledge base",
    icon: Database,
    iconBg: "bg-blue-500",
    type: "knowledge-base" as ActionType
  }
];

const linkedActions = [
  {
    id: "chat-with-agent",
    name: "Chat with this Agent",
    icon: MessageSquare,
    iconBg: "bg-yellow-500",
    type: "api-request" as ActionType
  }
];

export function AddActionModal({ isOpen, onClose, onSelect, integrationTools = [] }: AddActionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppAction | null>(null);
  const [activeTab, setActiveTab] = useState("integrations"); // Default to integrations tab

  // Build integration actions from all available integrations (like in Integrations page)
  const integrationActions = useMemo(() => {
    const actions: AppAction[] = [];
    
    // Get all available integrations from the Integrations page
    const integrations = getAvailableIntegrationTypes();
    
    // Group enabled integration tools by integration_type for filtering
    const toolsByIntegration: Record<string, AgentIntegrationTool[]> = {};
    integrationTools.forEach(tool => {
      if (tool.enabled) {
        if (!toolsByIntegration[tool.integration_type]) {
          toolsByIntegration[tool.integration_type] = [];
        }
        toolsByIntegration[tool.integration_type].push(tool);
      }
    });

    // Add Google Sheets as a special case
    actions.push({
      id: "google-sheets",
      name: "Google Sheets",
      icon: FileSpreadsheet,
      iconBg: "bg-green-500",
      actions: [
        {
          id: "append-row",
          name: "Append row",
          description: "Append a new row to a spreadsheet."
        },
        {
          id: "append-rows",
          name: "Append rows",
          description: "Appends multiple rows to a spreadsheet."
        },
        {
          id: "update-cell",
          name: "Update cell",
          description: "Update a specific cell in a Google Sheets worksheet."
        },
        {
          id: "clear-cell",
          name: "Clear Cell",
          description: "Clear the contents of a specific cell in a Google Sheets worksheet."
        }
      ]
    });

    // Add all integrations from the Integrations page
    integrations.forEach(integration => {
      const metadata = INTEGRATION_METADATA[integration.id];
      if (!metadata) return;

      // Get available actions for this integration type
      const availableActions = INTEGRATION_TOOLS_DISPLAY[integration.id] || [];
      
      if (availableActions.length > 0) {
        // Show all available actions for this integration (from Integrations page)
        // If integration has enabled tools, we could filter, but for now show all
        actions.push({
          id: integration.id,
          name: integration.name,
          icon: metadata.icon,
          iconBg: metadata.iconBg,
          actions: availableActions.map(displayName => ({
            id: displayName.toLowerCase().replace(/\s+/g, '-'),
            name: displayName,
            description: `${displayName} action for ${integration.name}`
          }))
        });
      } else {
        // Integration has no specific actions defined, show as generic webhook action
        actions.push({
          id: integration.id,
          name: integration.name,
          icon: metadata.icon,
          iconBg: metadata.iconBg,
          actions: [
            {
              id: "webhook",
              name: `${integration.name} action`,
              description: `Execute an action via ${integration.name} webhook`
            }
          ]
        });
      }
    });

    return actions;
  }, [integrationTools]);

  const handleSelectApp = (app: AppAction) => {
    if (app.actions && app.actions.length > 0) {
      setSelectedApp(app);
    } else {
      // For apps without specific actions, use generic action type
      const actionType = app.id === "google-sheets" ? "google-sheets-action" : "api-request";
      onSelect(actionType as ActionType, app.id, app.name);
      handleClose();
    }
  };

  const handleSelectAction = (app: AppAction, action: { id: string; name: string; description: string }) => {
    // Map app-specific actions to our action types
    let actionType: ActionType = "api-request";
    if (app.id === "google-sheets") {
      actionType = "google-sheets-action";
    } else if (INTEGRATION_METADATA[app.id]) {
      // For integration actions, use api-request type with integration type as app
      actionType = "api-request";
    }
    
    onSelect(actionType, app.id, action.name);
    handleClose();
  };

  const handleSelectGenericAction = (action: { id: string; name: string; type: ActionType }) => {
    onSelect(action.type, undefined, action.name);
    handleClose();
  };

  const handleBack = () => {
    setSelectedApp(null);
  };

  const handleClose = () => {
    setSelectedApp(null);
    setSearchQuery("");
    onClose();
  };

  const filterItems = <T extends { name: string }>(items: T[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // If an app with specific actions is selected, show action selection
  if (selectedApp && selectedApp.actions) {
    const Icon = selectedApp.icon;
    const isStringIcon = typeof Icon === 'string';
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${selectedApp.iconBg}`}>
                  {isStringIcon ? (
                    <span className="text-white text-sm">{Icon}</span>
                  ) : (
                    <Icon className="h-4 w-4 text-white" />
                  )}
                </div>
                <DialogTitle className="text-xl font-semibold">{selectedApp.name}</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Actions</h3>
            <div className="space-y-2">
              {selectedApp.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSelectAction(selectedApp, action)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${selectedApp.iconBg} mt-0.5`}>
                    {isStringIcon ? (
                      <span className="text-white text-sm">{Icon}</span>
                    ) : (
                      <Icon className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{action.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add action</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select an action to add to your agent
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
            <TabsTrigger value="scrapers">Scrapers</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Enabled Integrations ({integrationActions.length})
              </h3>
              {integrationActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No integrations enabled. Enable integrations in the Tools tab to use them in workflows.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filterItems(integrationActions).map((app) => {
                    const Icon = app.icon;
                    const isStringIcon = typeof Icon === 'string';
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg ${app.iconBg}`}>
                          {isStringIcon ? (
                            <span className="text-white text-sm">{Icon}</span>
                          ) : (
                            <Icon className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{app.name}</div>
                          {app.actions && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {app.actions.length} {app.actions.length === 1 ? 'action' : 'actions'} available
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-4">
            <div className="space-y-4">
              {/* Linked actions */}
              {filterItems(linkedActions).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Linked actions</h3>
                  <div className="space-y-2">
                    {filterItems(linkedActions).map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleSelectGenericAction(action)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          <div className={`p-2 rounded-lg ${action.iconBg}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{action.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top actions */}
              <div>
                <div className="space-y-2">
                  {filterItems(topActions).map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleSelectGenericAction(action)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg ${action.iconBg}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{action.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apps" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Apps</h3>
              <div className="space-y-2">
                {filterItems(apps).map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${app.iconBg}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{app.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Chat</h3>
              <div className="space-y-2">
                {filterItems(chatActions).map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${app.iconBg}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{app.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">AI</h3>
              <div className="space-y-2">
                {filterItems(aiActions).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectGenericAction(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${action.iconBg}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{action.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Logic</h3>
              <div className="space-y-2">
                {filterItems(logicActions).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectGenericAction(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${action.iconBg}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{action.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scrapers" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Scrapers</h3>
              <div className="space-y-2">
                {filterItems(scrapersActions).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectGenericAction(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${action.iconBg}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{action.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="by-lindy" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No Lindy-specific actions available</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
