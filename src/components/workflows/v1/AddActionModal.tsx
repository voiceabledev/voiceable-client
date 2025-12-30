import { useState } from "react";
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

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ActionType, app?: string, actionName?: string) => void;
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

export function AddActionModal({ isOpen, onClose, onSelect }: AddActionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppAction | null>(null);
  const [activeTab, setActiveTab] = useState("top");

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
                  <Icon className="h-4 w-4 text-white" />
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
                    <Icon className="h-4 w-4 text-white" />
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
            <TabsTrigger value="scrapers">Scrapers</TabsTrigger>
            <TabsTrigger value="by-lindy">By Lindy</TabsTrigger>
          </TabsList>

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
