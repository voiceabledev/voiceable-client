import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Puzzle, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Wrench,
  Info,
  Loader2,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentIntegrationTool } from "@/types/assistant";
import type { UserIntegration, IntegrationSchema } from "@/types/integrations";
import { INTEGRATION_TOOLS_DISPLAY, INTEGRATION_METADATA, actionNameToDisplayName } from "@/constants/assistant";

type AvailableIntegrationType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  status?: "available" | "upcoming";
};

type IntegrationConnectionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectingIntegrationLoading: boolean;
  integrationModalStep: "select" | "connect" | "tools";
  availableIntegrationTypes: AvailableIntegrationType[];
  agentIntegrationTools: AgentIntegrationTool[];
  selectIntegrationToAdd: (type: string) => void;
  userIntegrations: UserIntegration[];
  connectingIntegrationType: string | null;
  goBackToIntegrationSelect: () => void;
  integrationSchemas: Record<string, IntegrationSchema>;
  integrationModalTab: "about" | "credentials" | "tools";
  setIntegrationModalTab: (tab: "about" | "credentials" | "tools") => void;
  editingIntegrationConfig: UserIntegration | null;
  handleIntegrationConnect: (config: Record<string, string>) => void;
  closeIntegrationConnectionModal: () => void;
  handleDeleteIntegration: (id: string | number) => Promise<void>;
  selectedIntegrationToolsForModal: string[];
  toggleModalToolSelection: (toolName: string) => void;
  setSelectedIntegrationToolsForModal: (tools: string[]) => void;
  saveSelectedIntegrationTools: () => Promise<void>;
};

export const IntegrationConnectionModal: React.FC<IntegrationConnectionModalProps> = ({
  open,
  onOpenChange,
  connectingIntegrationLoading,
  integrationModalStep,
  availableIntegrationTypes,
  agentIntegrationTools,
  selectIntegrationToAdd,
  userIntegrations,
  connectingIntegrationType,
  goBackToIntegrationSelect,
  integrationSchemas,
  integrationModalTab,
  setIntegrationModalTab,
  editingIntegrationConfig,
  handleIntegrationConnect,
  closeIntegrationConnectionModal,
  handleDeleteIntegration,
  selectedIntegrationToolsForModal,
  toggleModalToolSelection,
  setSelectedIntegrationToolsForModal,
  saveSelectedIntegrationTools,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isClosingRef = useRef(false);
  const prevOpenRef = useRef(open);

  // Track when the open prop changes
  useEffect(() => {
    if (prevOpenRef.current !== open) {
      console.log('[IntegrationModal] open prop changed', {
        from: prevOpenRef.current,
        to: open,
        isClosingRef: isClosingRef.current,
        timestamp: new Date().toISOString()
      });
      prevOpenRef.current = open;
    }
  }, [open]);

  // Load API key when editing (mask it)
  useEffect(() => {
    if (editingIntegrationConfig?.config?.api_key) {
      // Mask the API key for security
      const key = String(editingIntegrationConfig.config.api_key);
      const masked = key.length > 8 
        ? key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
        : '*'.repeat(key.length);
      setApiKey(masked);
    } else {
      setApiKey("");
    }
  }, [editingIntegrationConfig]);

  // Populate selected tools when switching to tools tab if not already populated
  useEffect(() => {
    if (integrationModalTab === "tools" && connectingIntegrationType && selectedIntegrationToolsForModal.length === 0) {
      // Find currently enabled tools for this integration type
      const enabledToolsForIntegration = agentIntegrationTools
        .filter(tool => tool.integration_type === connectingIntegrationType && tool.enabled)
        .map(tool => {
          // Convert action name (snake_case) back to display name
          const displayName = actionNameToDisplayName(tool.tool_name, connectingIntegrationType);
          return displayName;
        })
        .filter(displayName => {
          // Only include display names that exist in INTEGRATION_TOOLS_DISPLAY
          const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
          return availableTools.includes(displayName);
        });
      
      if (enabledToolsForIntegration.length > 0) {
        setSelectedIntegrationToolsForModal(enabledToolsForIntegration);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationModalTab, connectingIntegrationType, agentIntegrationTools]);

  const integrationMeta = INTEGRATION_METADATA[connectingIntegrationType || ''] || { name: 'Integration', icon: '🔌', iconBg: 'bg-gray-500' };

  // Wrap onOpenChange to prevent double close
  const handleOpenChange = useCallback((newOpen: boolean) => {
    console.log('[IntegrationModal] handleOpenChange called', {
      newOpen,
      isClosingRef: isClosingRef.current,
      timestamp: new Date().toISOString()
    });
    // If we're programmatically closing, ignore the Dialog's onOpenChange
    if (isClosingRef.current && !newOpen) {
      console.log('[IntegrationModal] handleOpenChange: Blocked - already closing programmatically');
      return;
    }
    console.log('[IntegrationModal] handleOpenChange: Calling onOpenChange', newOpen);
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Wrap closeIntegrationConnectionModal to set the flag
  const handleClose = useCallback(() => {
    console.log('[IntegrationModal] handleClose called', {
      timestamp: new Date().toISOString()
    });
    isClosingRef.current = true;
    console.log('[IntegrationModal] handleClose: Set isClosingRef to true, calling closeIntegrationConnectionModal');
    closeIntegrationConnectionModal();
    // Reset flag after a delay
    setTimeout(() => {
      console.log('[IntegrationModal] handleClose: Resetting isClosingRef to false');
      isClosingRef.current = false;
    }, 200);
  }, [closeIntegrationConnectionModal]);

  // Wrap saveSelectedIntegrationTools to set the flag right before closing
  const handleSaveSelectedIntegrationTools = useCallback(async () => {
    console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Starting save operation', {
      timestamp: new Date().toISOString(),
      isClosingRef: isClosingRef.current
    });
    // Set flag BEFORE save starts - this ensures it's set when closeIntegrationConnectionModal is called
    // The flag doesn't prevent the modal from staying open during save, it only prevents double-close
    isClosingRef.current = true;
    console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Set isClosingRef to true BEFORE save');
    try {
      // Wait for save to complete (this includes onSave and onPublish)
      // The hook will call closeIntegrationConnectionModal() after this completes
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Calling saveSelectedIntegrationTools...');
      await saveSelectedIntegrationTools();
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Save completed successfully');
      // Flag is already set, so Dialog's onOpenChange will be blocked when closeIntegrationConnectionModal is called
      // Use a microtask to ensure the flag is set before any state updates propagate
      await Promise.resolve();
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Microtask completed');
      // Reset flag after a delay to allow the close to complete
      setTimeout(() => {
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting isClosingRef to false');
        isClosingRef.current = false;
      }, 300);
    } catch (error) {
      console.error('[IntegrationModal] handleSaveSelectedIntegrationTools: Error occurred', error);
      // Flag is already set, so Dialog's onOpenChange will be blocked
      await Promise.resolve();
      setTimeout(() => {
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting isClosingRef to false (error case)');
        isClosingRef.current = false;
      }, 300);
      throw error;
    }
  }, [saveSelectedIntegrationTools]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-background to-secondary/10 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {integrationModalStep === "select" ? (
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Puzzle className="h-6 w-6" />
                  </div>
                ) : (
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md",
                    integrationMeta.iconBg
                  )}>
                    {integrationMeta.icon}
                  </div>
                )}
                <div>
                  <DialogTitle className="text-xl">
                    {integrationModalStep === "select" ? "Add Integration" : integrationMeta.name}
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-0.5">
                    {integrationModalStep === "select" 
                      ? "Connect your assistant to external services" 
                      : editingIntegrationConfig 
                        ? "Update your integration settings"
                        : "Set up your integration"}
                  </DialogDescription>
                </div>
              </div>
              {editingIntegrationConfig && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {integrationModalStep === "select" ? (
            <ScrollArea className="h-[400px] p-6">
              <div className="grid grid-cols-2 gap-4">
                {availableIntegrationTypes.map((type, idx) => {
                  const isConnected = userIntegrations.some(i => i.integration_type === type.id);
                  const isUpcoming = type.status === "upcoming";
                  const isAvailable = type.status === "available";
                  
                  return (
                    <button
                      key={type.id || idx}
                      onClick={() => {
                        if (isAvailable) {
                          selectIntegrationToAdd(type.id);
                        }
                      }}
                      disabled={isUpcoming}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group",
                        isAvailable && "hover:bg-secondary/50 cursor-pointer",
                        isUpcoming && "opacity-60 cursor-not-allowed",
                        "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold",
                          type.iconBg || "bg-secondary"
                        )}>
                          {type.icon || type.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{type.name}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
                            Coming Soon
                          </Badge>
                        )}
                        {isConnected && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            Connected
                          </Badge>
                        )}
                        {isAvailable && !isConnected && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <Tabs value={integrationModalTab} onValueChange={(val) => setIntegrationModalTab(val as "about" | "credentials" | "tools")} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 border-b bg-secondary/20 flex items-center justify-between flex-shrink-0">
                <TabsList className="h-12 bg-transparent gap-6">
                  <TabsTrigger value="credentials" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1">
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1">
                    Tools
                  </TabsTrigger>
                </TabsList>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goBackToIntegrationSelect}
                  className="h-8"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                  Back
                </Button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-6">
                  <TabsContent value="credentials" className="mt-0 space-y-6">
                    <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Secure API Connection</p>
                          <p className="text-blue-700">
                            Your API key is encrypted and stored securely. It will never be exposed in logs or shared with third parties.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Credential Type
                        </h3>
                        <div className="p-4 border-2 border-primary/20 rounded-xl bg-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">API Key</div>
                              <div className="text-xs text-muted-foreground">Secure token-based authentication</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="api-key" className="text-base font-semibold flex items-center gap-2">
                          API Key
                          {editingIntegrationConfig && (
                            <Badge variant="outline" className="font-normal">
                              Currently configured
                            </Badge>
                          )}
                        </Label>
                        <Input
                          id="api-key"
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={editingIntegrationConfig ? "Enter new API key to update" : `Enter your ${integrationMeta.name} API key`}
                          className="font-mono text-sm h-11"
                        />
                        <div className="bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">Where to find your API key:</p>
                          {connectingIntegrationType === 'calcom' && (
                            <p>Navigate to Settings → Developer → API Keys in your Cal.com dashboard</p>
                          )}
                          {connectingIntegrationType === 'pipedrive' && (
                            <p>Go to Settings → Personal Preferences → API in your Pipedrive account</p>
                          )}
                          {connectingIntegrationType === 'calendly' && (
                            <p>Access Integrations & Apps → API & Webhooks → Personal Access Tokens</p>
                          )}
                          {connectingIntegrationType === 'hubspot' && (
                            <p>Create a private app in Settings → Integrations → Private Apps</p>
                          )}
                          {!['calcom', 'pipedrive', 'calendly', 'hubspot'].includes(connectingIntegrationType || '') && (
                            <p>Check your {integrationMeta.name} account settings for API credentials</p>
                          )}
                        </div>
                      </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="mt-0 space-y-5">
                    <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-primary" />
                          Available Tools
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Select the tools you want to enable for your assistant
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {selectedIntegrationToolsForModal.length} selected
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                      {connectingIntegrationType && INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType]?.map((toolName) => {
                        const isSelected = selectedIntegrationToolsForModal.includes(toolName);
                        return (
                          <div
                            key={toolName}
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                              isSelected 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/30 hover:bg-accent/30"
                            )}
                            onClick={() => toggleModalToolSelection(toolName)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleModalToolSelection(toolName)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
                                  integrationMeta.iconBg
                                )}>
                                  {integrationMeta.icon}
                                </div>
                                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {toolName}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(!connectingIntegrationType || !INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType]?.length) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Wrench className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No tools available for this integration</p>
                        </div>
                      )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gradient-to-r from-background to-secondary/5 flex justify-between items-center flex-shrink-0">
          <div>
            {editingIntegrationConfig && !showDeleteConfirm && (
              <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Integration
              </Button>
            )}
            {editingIntegrationConfig && showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Are you sure?</span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[IntegrationModal] Delete button clicked', {
                      integrationId: editingIntegrationConfig?.id,
                      timestamp: new Date().toISOString()
                    });
                    if (editingIntegrationConfig) {
                      setShowDeleteConfirm(false);
                      // Set flag before async operation
                      isClosingRef.current = true;
                      console.log('[IntegrationModal] Delete: Set isClosingRef to true, calling handleDeleteIntegration');
                      await handleDeleteIntegration(editingIntegrationConfig.id);
                      console.log('[IntegrationModal] Delete: handleDeleteIntegration completed, calling handleClose');
                      handleClose();
                    }
                  }}
                >
                  Yes, Remove
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="min-w-24">
              Cancel
            </Button>
            {integrationModalStep !== "select" && (
              <>
                {integrationModalTab === "tools" ? (
                  <Button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await handleSaveSelectedIntegrationTools();
                    }}
                    className="min-w-32"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Save Tools
                  </Button>
                ) : (
                  <Button 
                    onClick={async () => {
                      // Save/update the API key first
                      await handleIntegrationConnect({ api_key: apiKey });
                      // Then move to tools tab (stay in connect step)
                      setIntegrationModalTab("tools");
                    }}
                    disabled={connectingIntegrationLoading || (!apiKey && !editingIntegrationConfig)}
                    className="min-w-32"
                  >
                    {connectingIntegrationLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
