import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeft, MessageSquare, Mail, Calendar, FileText, FileSpreadsheet, Users, Cloud, Box, Hash, Phone, Headphones, ShoppingCart, Brain, Mic } from "lucide-react";
import type { TriggerType } from "@/types/workflow-v1";
import { INTEGRATION_METADATA, getAvailableIntegrationTypes } from "@/constants/assistant";

interface AddTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TriggerType, app?: string, triggerName?: string) => void;
}

interface AppTrigger {
  id: string;
  name: string;
  icon: string | React.ComponentType<{ className?: string }>;
  iconBg: string;
  triggers?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

// Build integration triggers from available integrations
const buildIntegrationTriggers = (): AppTrigger[] => {
  const integrations = getAvailableIntegrationTypes();
  const triggers: AppTrigger[] = [];

  // Add Google Sheets as a special case (not in integration metadata but has specific triggers)
  triggers.push({
    id: "google-sheets",
    name: "Google Sheets",
    icon: FileSpreadsheet,
    iconBg: "bg-green-500",
    triggers: [
      {
        id: "google-sheets-new-row",
        name: "New row added",
        description: "Triggers when a new row is added to Google Sheets"
      },
      {
        id: "google-sheets-row-updated",
        name: "Row updated",
        description: "Triggers when a row is updated in Google Sheets"
      }
    ]
  });

  // Add all other integrations from the Integrations page
  integrations.forEach(integration => {
    const metadata = INTEGRATION_METADATA[integration.id];
    if (!metadata) {
      // For integrations without metadata, use the integration data directly
      triggers.push({
        id: integration.id,
        name: integration.name,
        icon: integration.icon,
        iconBg: integration.iconBg,
        triggers: [
          {
            id: "webhook",
            name: `${integration.name} webhook`,
            description: `Triggers when a webhook is received from ${integration.name}`
          }
        ]
      });
      return;
    }

    // Skip Google Sheets as we already added it above
    if (integration.id === "google-sheets" || integration.id === "google_sheets") {
      return;
    }

    // Other integrations use webhook triggers
    triggers.push({
      id: integration.id,
      name: integration.name,
      icon: metadata.icon,
      iconBg: metadata.iconBg,
      triggers: [
        {
          id: "webhook",
          name: `${integration.name} webhook`,
          description: `Triggers when a webhook is received from ${integration.name}`
        }
      ]
    });
  });

  return triggers;
};

const integrationTriggers = buildIntegrationTriggers();

// Manual and webhook triggers
const systemTriggers: AppTrigger[] = [
  {
    id: "manual",
    name: "Manual trigger",
    icon: "👆",
    iconBg: "bg-gray-500",
    triggers: [
      {
        id: "manual",
        name: "Manual trigger",
        description: "Manually triggered workflow"
      }
    ]
  },
  {
    id: "webhook",
    name: "Webhook",
    icon: "🔗",
    iconBg: "bg-blue-500",
    triggers: [
      {
        id: "webhook",
        name: "Webhook trigger",
        description: "Triggers when a webhook is called"
      }
    ]
  }
];

const chatTriggers: AppTrigger[] = [
  {
    id: "chat-with-agent",
    name: "Chat with this Agent",
    icon: MessageSquare,
    iconBg: "bg-yellow-500",
    triggers: [
      {
        id: "webhook",
        name: "Chat webhook",
        description: "Triggers when a chat message is received"
      }
    ]
  }
];

export function AddTriggerModal({ isOpen, onClose, onSelect }: AddTriggerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppTrigger | null>(null);
  const [activeTab, setActiveTab] = useState("integrations"); // Default to integrations tab

  const handleSelectApp = (app: AppTrigger) => {
    if (app.triggers && app.triggers.length > 0) {
      setSelectedApp(app);
    } else {
      // For apps without specific triggers, use generic trigger type
      const triggerType = app.id === "google-sheets" ? "google-sheets-new-row" : 
                         app.id === "google-calendar" ? "webhook" : "webhook";
      onSelect(triggerType as TriggerType, app.id, app.name);
      handleClose();
    }
  };

  const handleSelectTrigger = (app: AppTrigger, trigger: { id: string; name: string; description: string }) => {
    // Map app-specific triggers to our trigger types
    let triggerType: TriggerType = "webhook";
    if (trigger.id === "google-sheets-new-row") {
      triggerType = "google-sheets-new-row";
    } else if (trigger.id === "google-sheets-row-updated") {
      triggerType = "google-sheets-row-updated";
    } else if (trigger.id === "manual") {
      triggerType = "manual";
    } else {
      triggerType = "webhook";
    }
    
    onSelect(triggerType, app.id, trigger.name);
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

  const filteredIntegrationTriggers = filterItems(integrationTriggers);
  const filteredSystemTriggers = filterItems(systemTriggers);
  const filteredChatTriggers = filterItems(chatTriggers);

  // If an app with specific triggers is selected, show trigger selection
  if (selectedApp && selectedApp.triggers) {
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
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Triggers</h3>
            <div className="space-y-2">
              {selectedApp.triggers.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => handleSelectTrigger(selectedApp, trigger)}
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
                    <div className="font-medium text-sm">{trigger.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {trigger.description}
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
          <DialogTitle className="text-xl font-semibold">Add trigger</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select a trigger that will initiate a response from your agent
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Available Integrations ({filteredIntegrationTriggers.length})
              </h3>
              {filteredIntegrationTriggers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No integrations available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredIntegrationTriggers.map((app) => {
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
                          {app.triggers && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {app.triggers.length} {app.triggers.length === 1 ? 'trigger' : 'triggers'} available
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

          <TabsContent value="system" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">System Triggers</h3>
              <div className="space-y-2">
                {filteredSystemTriggers.map((app) => {
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
                        {app.triggers && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {app.triggers[0]?.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Chat Triggers</h3>
              <div className="space-y-2">
                {filteredChatTriggers.map((trigger) => {
                  const Icon = trigger.icon;
                  const isStringIcon = typeof Icon === 'string';
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => handleSelectApp(trigger)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${trigger.iconBg}`}>
                        {isStringIcon ? (
                          <span className="text-white text-sm">{Icon}</span>
                        ) : (
                          <Icon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{trigger.name}</div>
                        {trigger.triggers && trigger.triggers[0] && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {trigger.triggers[0].description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="by-lindy" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No Lindy-specific triggers available</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
