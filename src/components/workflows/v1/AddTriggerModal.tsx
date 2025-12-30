import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeft, MessageSquare, Mail, Calendar, FileText, FileSpreadsheet, Users, Cloud, Box, Hash } from "lucide-react";
import type { TriggerType } from "@/types/workflow-v1";

interface AddTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: TriggerType, app?: string, triggerName?: string) => void;
}

interface AppTrigger {
  id: string;
  name: string;
  icon: any;
  iconBg: string;
  triggers?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

const apps: AppTrigger[] = [
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    iconBg: "bg-red-500",
    triggers: [
      {
        id: "email-received",
        name: "Email received",
        description: "Triggers when a new email is received in Gmail."
      },
      {
        id: "email-sent",
        name: "Email sent",
        description: "Triggers when a new email is sent through Gmail."
      },
      {
        id: "new-attachment",
        name: "New Attachment Received",
        description: "Trigger when new email attachments are received in Gmail."
      },
      {
        id: "email-matching-search",
        name: "New Email Matching Search",
        description: "Triggers when new emails match specified Gmail search criteria and labels."
      },
      {
        id: "new-labeled-email",
        name: "New Labeled Email",
        description: "Triggers when new emails with specified Gmail labels are received."
      }
    ]
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    icon: FileSpreadsheet,
    iconBg: "bg-green-500"
  },
  {
    id: "google-docs",
    name: "Google Docs",
    icon: FileText,
    iconBg: "bg-blue-500"
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: Calendar,
    iconBg: "bg-blue-500"
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: Cloud,
    iconBg: "bg-yellow-500"
  },
  {
    id: "slack",
    name: "Slack",
    icon: Hash,
    iconBg: "bg-purple-500"
  },
  {
    id: "microsoft-outlook",
    name: "Microsoft Outlook",
    icon: Mail,
    iconBg: "bg-blue-500"
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    icon: Users,
    iconBg: "bg-purple-500"
  },
  {
    id: "salesforce",
    name: "Salesforce",
    icon: Cloud,
    iconBg: "bg-blue-500"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    icon: Users,
    iconBg: "bg-orange-500"
  },
  {
    id: "airtable",
    name: "Airtable",
    icon: FileSpreadsheet,
    iconBg: "bg-purple-500"
  },
  {
    id: "calendly",
    name: "Calendly",
    icon: Calendar,
    iconBg: "bg-blue-500"
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: Box,
    iconBg: "bg-blue-500"
  },
  {
    id: "notion",
    name: "Notion",
    icon: FileText,
    iconBg: "bg-gray-500"
  },
  {
    id: "asana",
    name: "Asana",
    icon: Calendar,
    iconBg: "bg-red-500"
  },
  {
    id: "discord",
    name: "Discord",
    icon: MessageSquare,
    iconBg: "bg-indigo-500"
  }
];

const chatTriggers: AppTrigger[] = [
  {
    id: "chat-with-agent",
    name: "Chat with this Agent",
    icon: MessageSquare,
    iconBg: "bg-yellow-500"
  }
];

export function AddTriggerModal({ isOpen, onClose, onSelect }: AddTriggerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppTrigger | null>(null);
  const [activeTab, setActiveTab] = useState("apps");

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
    if (app.id === "google-sheets") {
      triggerType = trigger.id.includes("new-row") ? "google-sheets-new-row" : "google-sheets-row-updated";
    } else if (app.id === "gmail") {
      triggerType = "webhook"; // Gmail triggers would be webhook-based
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

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChatTriggers = chatTriggers.filter(trigger =>
    trigger.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If an app with specific triggers is selected, show trigger selection
  if (selectedApp && selectedApp.triggers) {
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
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Triggers</h3>
            <div className="space-y-2">
              {selectedApp.triggers.map((trigger) => (
                <button
                  key={trigger.id}
                  onClick={() => handleSelectTrigger(selectedApp, trigger)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${selectedApp.iconBg} mt-0.5`}>
                    <Icon className="h-4 w-4 text-white" />
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="by-lindy">By Lindy</TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="mt-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Popular</h3>
              <div className="grid grid-cols-2 gap-2">
                {filteredApps.map((app) => {
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
            <div className="space-y-2">
              {filteredChatTriggers.map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <button
                    key={trigger.id}
                    onClick={() => handleSelectApp(trigger)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${trigger.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{trigger.name}</div>
                    </div>
                  </button>
                );
              })}
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
