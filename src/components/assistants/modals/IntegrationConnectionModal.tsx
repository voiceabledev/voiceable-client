import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  ShieldCheck, 
  Wrench,
  Info,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentIntegrationTool } from "@/types/assistant";
import type { UserIntegration, IntegrationSchema } from "@/types/integrations";
import { INTEGRATION_TOOLS_DISPLAY, INTEGRATION_METADATA, actionNameToDisplayName } from "@/constants/assistant";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import { integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  setUserIntegrations?: (updater: (prev: UserIntegration[]) => UserIntegration[]) => void;
  connectingIntegrationType: string | null;
  integrationSchemas: Record<string, IntegrationSchema>;
  integrationModalTab: "about" | "credentials" | "tools";
  setIntegrationModalTab: (tab: "about" | "credentials" | "tools") => void;
  editingIntegrationConfig: UserIntegration | null;
  setEditingIntegrationConfig?: (config: UserIntegration | null) => void;
  handleIntegrationConnect: (config: Record<string, string>) => void;
  closeIntegrationConnectionModal: () => void;
  selectedIntegrationToolsForModal: string[];
  toggleModalToolSelection: (toolName: string) => void;
  setSelectedIntegrationToolsForModal: (tools: string[]) => void;
  saveSelectedIntegrationTools: () => Promise<void>;
  isWizardMode?: boolean; // If true, automatically add all tools without selection
  fetchUserIntegrations?: () => Promise<void>; // Function to refresh user integrations in the hook
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
  setUserIntegrations,
  connectingIntegrationType,
  integrationSchemas,
  integrationModalTab,
  setIntegrationModalTab,
  editingIntegrationConfig,
  setEditingIntegrationConfig,
  handleIntegrationConnect,
  closeIntegrationConnectionModal,
  selectedIntegrationToolsForModal,
  toggleModalToolSelection,
  setSelectedIntegrationToolsForModal,
  saveSelectedIntegrationTools,
  isWizardMode = false,
  fetchUserIntegrations,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const isClosingRef = useRef(false);
  const prevOpenRef = useRef(open);
  const isSavingRef = useRef(false);
  const isOpeningRef = useRef(false);
  const { toast } = useToast();

  // Track when the open prop changes
  useEffect(() => {
    if (prevOpenRef.current !== open) {
      console.log('[IntegrationModal] open prop changed', {
        from: prevOpenRef.current,
        to: open,
        isClosingRef: isClosingRef.current,
        timestamp: new Date().toISOString()
      });
      
      // If opening, set the opening flag temporarily
      if (open && !prevOpenRef.current) {
        isOpeningRef.current = true;
        // Clear the opening flag after a short delay to allow the modal to fully open
        setTimeout(() => {
          isOpeningRef.current = false;
        }, 100);
      }
      
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

  // Populate selected tools when switching to tools tab for existing integrations only
  useEffect(() => {
    if (connectingIntegrationType && integrationModalTab === "tools") {
      // Check if this integration is already connected to the agent
      const hasIntegrationInAgent = agentIntegrationTools.some(
        tool => tool.integration_type === connectingIntegrationType
      );
      
      // Only pre-select tools for existing integrations (not new ones)
      if (hasIntegrationInAgent && selectedIntegrationToolsForModal.length === 0) {
        // If the integration is already connected to the agent, pre-select only enabled tools
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationModalTab, connectingIntegrationType, agentIntegrationTools]);

  const integrationMeta = INTEGRATION_METADATA[connectingIntegrationType || ''] || { name: 'Integration', icon: '🔌', iconBg: 'bg-gray-500' };

  // Compute which tools to display based on whether we're adding or editing
  const toolsToDisplay = useMemo(() => {
    if (!connectingIntegrationType) return [];
    
    const allAvailableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
    
    // Check if this integration is already connected to the agent
    const hasIntegrationInAgent = agentIntegrationTools.some(
      tool => tool.integration_type === connectingIntegrationType
    );
    
    // If the integration is already connected to the agent, only show enabled tools
    if (hasIntegrationInAgent) {
      const enabledToolsForIntegration = agentIntegrationTools
        .filter(tool => tool.integration_type === connectingIntegrationType && tool.enabled)
        .map(tool => {
          const displayName = actionNameToDisplayName(tool.tool_name, connectingIntegrationType);
          return displayName;
        })
        .filter(displayName => allAvailableTools.includes(displayName));
      
      return enabledToolsForIntegration;
    }
    
    // If adding for the first time (even if integration exists in userIntegrations), show all available tools
    return allAvailableTools;
  }, [connectingIntegrationType, agentIntegrationTools]);

  // Determine if this is a new integration (not yet connected to agent)
  const isNewIntegration = useMemo(() => {
    if (!connectingIntegrationType) return false;
    return !agentIntegrationTools.some(
      tool => tool.integration_type === connectingIntegrationType
    );
  }, [connectingIntegrationType, agentIntegrationTools]);

  // Wrap onOpenChange to prevent double close and accidental closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    console.log('[IntegrationModal] handleOpenChange called', {
      newOpen,
      isClosingRef: isClosingRef.current,
      isOpeningRef: isOpeningRef.current,
      currentOpen: open,
      timestamp: new Date().toISOString()
    });
    
    // If we're currently opening, ignore any close events (prevent accidental closes during opening animation)
    if (isOpeningRef.current && !newOpen) {
      console.log('[IntegrationModal] handleOpenChange: Blocked - modal is currently opening');
      return;
    }
    
    // If we're programmatically closing via our close handler, ignore the Dialog's onOpenChange
    // This prevents the Dialog from calling onOpenChange again after we've already closed it
    if (isClosingRef.current && !newOpen) {
      console.log('[IntegrationModal] handleOpenChange: Blocked - already closing programmatically');
      return;
    }
    
    // If the state already matches what we're trying to set, ignore (prevent unnecessary updates)
    if (newOpen === open) {
      console.log('[IntegrationModal] handleOpenChange: Blocked - state already matches', { newOpen, open });
      return;
    }
    
    console.log('[IntegrationModal] handleOpenChange: Calling onOpenChange', newOpen);
    onOpenChange(newOpen);
  }, [onOpenChange, open]);

  // Wrap closeIntegrationConnectionModal to set the flag
  const handleClose = useCallback(() => {
    // Prevent closing if modal is not actually open
    if (!open) {
      console.log('[IntegrationModal] handleClose: Blocked - modal not open');
      return;
    }
    
    // Prevent closing if we're currently opening
    if (isOpeningRef.current) {
      console.log('[IntegrationModal] handleClose: Blocked - modal is currently opening');
      return;
    }
    
    // Prevent closing if we're already closing
    if (isClosingRef.current) {
      console.log('[IntegrationModal] handleClose: Blocked - already closing');
      return;
    }
    
    console.log('[IntegrationModal] handleClose called', {
      timestamp: new Date().toISOString(),
      isOpen: open
    });
    isClosingRef.current = true;
    console.log('[IntegrationModal] handleClose: Set isClosingRef to true, calling closeIntegrationConnectionModal');
    closeIntegrationConnectionModal();
    // Reset flag after a delay
    setTimeout(() => {
      console.log('[IntegrationModal] handleClose: Resetting isClosingRef to false');
      isClosingRef.current = false;
    }, 200);
  }, [closeIntegrationConnectionModal, open]);

  // Wrap saveSelectedIntegrationTools to handle closing after save
  // closeAfterSave: if true, close modal after saving (for manual saves). If false, keep modal open (for auto-saves after connection)
  const handleSaveSelectedIntegrationTools = useCallback(async (closeAfterSave: boolean = true) => {
    // Prevent duplicate saves
    if (isSavingRef.current || isSaving) {
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Already saving, ignoring duplicate call');
      return;
    }

    console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Starting save operation', {
      timestamp: new Date().toISOString(),
      isClosingRef: isClosingRef.current,
      closeAfterSave
    });
    
    // Set flags BEFORE save starts
    isSavingRef.current = true;
    setIsSaving(true);
    if (closeAfterSave) {
      isClosingRef.current = true;
    }
    console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Set flags to true BEFORE save');
    
    try {
      // Wait for save to complete (this includes onSave and onPublish)
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Calling saveSelectedIntegrationTools...');
      await saveSelectedIntegrationTools();
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Save completed successfully');
      
      // Only close the modal if closeAfterSave is true (manual save from tools tab)
      if (closeAfterSave) {
        // Close the modal after successful save
        // The flag is already set, so Dialog's onOpenChange will be blocked
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Closing modal after successful save');
        closeIntegrationConnectionModal();
        
        // Reset flags after a delay to allow the close to complete
        setTimeout(() => {
          console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting flags to false');
          isClosingRef.current = false;
          isSavingRef.current = false;
          setIsSaving(false);
        }, 300);
      } else {
        // Keep modal open, just reset saving flag
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Keeping modal open after auto-save');
        isSavingRef.current = false;
        setIsSaving(false);
      }
    } catch (error) {
      console.error('[IntegrationModal] handleSaveSelectedIntegrationTools: Error occurred', error);
      // On error, still close the modal but reset the flags
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Closing modal after error');
      closeIntegrationConnectionModal();
      setTimeout(() => {
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting flags to false (error case)');
        isClosingRef.current = false;
        isSavingRef.current = false;
        setIsSaving(false);
      }, 300);
      // Don't re-throw - we've already closed the modal and shown an error toast
    }
  }, [saveSelectedIntegrationTools, closeIntegrationConnectionModal, isSaving]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0">
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
            <ScrollArea className="h-[600px] p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableIntegrationTypes.map((type, idx) => {
                  const isConnected = userIntegrations.some(i => i.integration_type === type.id);
                  const isUpcoming = type.status === "upcoming";
                  // Default to available if status is not set
                  const isAvailable = type.status !== "upcoming";
                  
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
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0",
                          type.iconBg || "bg-secondary"
                        )}>
                          {type.icon || type.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{type.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isUpcoming && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 whitespace-nowrap">
                            Upcoming
                          </Badge>
                        )}
                        {isConnected && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap">
                            Connected
                          </Badge>
                        )}
                        {isAvailable && !isConnected && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <Tabs value={integrationModalTab} onValueChange={(val) => setIntegrationModalTab(val as "about" | "credentials" | "tools")} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 border-b bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <TabsList className="h-12 bg-transparent gap-6">
                  <TabsTrigger value="credentials" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1">
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1">
                    Tools
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-6">
                  <TabsContent value="credentials" className="mt-0 space-y-6">
                    {(() => {
                      const schema = connectingIntegrationType 
                        ? integrationSchemas[connectingIntegrationType] 
                        : null;
                      const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
                      const isOAuthIntegration = schema?.auth_type === 'oauth' || oauthIntegrations.includes(connectingIntegrationType || '');
                      
                      // Use IntegrationForm for OAuth integrations
                      if (isOAuthIntegration) {
                        // If schema isn't loaded yet, create a minimal schema for OAuth integrations
                        // IntegrationForm can work with a minimal schema since it checks the hardcoded OAuth list
                        const oauthSchema = schema || (isOAuthIntegration ? {
                          type: connectingIntegrationType || '',
                          auth_type: 'oauth' as const,
                          fields: {},
                          required: [],
                          optional: [],
                        } : null);
                        
                        // Only show loading if we're still loading and it's not a known OAuth integration
                        if (!oauthSchema && connectingIntegrationLoading) {
                          return (
                            <div className="flex items-center justify-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Loading integration details...</p>
                              </div>
                            </div>
                          );
                        }
                        
                        // If we still don't have a schema after loading, something went wrong
                        if (!oauthSchema) {
                          return (
                            <div className="flex items-center justify-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <p className="text-sm text-destructive">Failed to load integration details. Please try again.</p>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <IntegrationForm
                            schema={oauthSchema}
                            initialConfig={editingIntegrationConfig?.config || {}}
                            onSubmit={async (config) => {
                              try {
                                // Convert config values to strings for handleIntegrationConnect
                                const stringConfig: Record<string, string> = {};
                                Object.entries(config).forEach(([key, value]) => {
                                  stringConfig[key] = String(value);
                                });
                                
                                // Connect the integration
                                await handleIntegrationConnect(stringConfig);
                                
                                // Switch to tools tab (handleIntegrationConnect does this, but ensure it happens)
                                setIntegrationModalTab("tools");
                                
                                // Wait a bit for the modal to switch to tools tab
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // Automatically select all available tools (but don't save yet)
                                const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                                if (availableTools.length > 0) {
                                  setSelectedIntegrationToolsForModal(availableTools);
                                  
                                  toast({
                                    title: "Success",
                                    description: `Integration connected successfully. ${availableTools.length} tool(s) selected. Click "Add Integration" to add them to your agent.`,
                                  });
                                } else {
                                  toast({
                                    title: "Success",
                                    description: "Integration connected successfully. No tools available for this integration.",
                                  });
                                }
                                // Note: Modal stays open - user must click "Add Integration" button to save
                              } catch (error) {
                                // Error is already handled by handleIntegrationConnect
                                console.error('Error in onSubmit:', error);
                                // Don't re-throw - prevent any form submission
                              }
                            }}
                            onDisconnect={async () => {
                              if (!connectingIntegrationType || !editingIntegrationConfig) return;
                              setDisconnecting(true);
                              try {
                                await integrationsApi.delete(connectingIntegrationType);
                                
                                // Update userIntegrations to remove the disconnected integration
                                if (setUserIntegrations) {
                                  setUserIntegrations(prev => 
                                    prev.filter(i => i.integration_type !== connectingIntegrationType)
                                  );
                                }
                                
                                // Refresh user integrations in the hook to ensure state is synced
                                if (fetchUserIntegrations) {
                                  await fetchUserIntegrations();
                                }
                                
                                // Clear editingIntegrationConfig
                                if (setEditingIntegrationConfig) {
                                  setEditingIntegrationConfig(null);
                                }
                                
                                // Close the modal after successful disconnect
                                closeIntegrationConnectionModal();
                                toast({
                                  title: "Success",
                                  description: "Integration disconnected successfully.",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: error instanceof Error ? error.message : "Failed to disconnect integration.",
                                  variant: "destructive",
                                });
                                throw error;
                              } finally {
                                setDisconnecting(false);
                              }
                            }}
                            isLoading={connectingIntegrationLoading}
                            hasSavedValues={!!editingIntegrationConfig}
                            submitButtonText={editingIntegrationConfig ? "Update" : "Connect"}
                            hideSubmitButton={true}
                            integrationType={connectingIntegrationType || undefined}
                          />
                        );
                      }
                      
                      // Use simple API key form for non-OAuth integrations
                      return (
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
                      );
                    })()}
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
                            {(isNewIntegration || isWizardMode)
                              ? "All tools will be added to your assistant" 
                              : "Select the tools you want to enable for your assistant"}
                          </p>
                        </div>
                        {!(isNewIntegration || isWizardMode) && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedIntegrationToolsForModal.length} selected
                          </Badge>
                        )}
                        {(isNewIntegration || isWizardMode) && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {toolsToDisplay.length} tools
                          </Badge>
                        )}
                      </div>

                      <div className={cn(
                        "max-h-[400px] overflow-y-auto grid gap-2",
                        (isNewIntegration || isWizardMode) 
                          ? "grid-cols-2 md:grid-cols-3" 
                          : "grid-cols-3"
                      )}>
                        {toolsToDisplay.map((toolName) => {
                          // For new integrations or wizard mode, show as simple list (no selection)
                          const showAsList = isNewIntegration || isWizardMode;
                          
                          if (showAsList) {
                            // Simple list view - no interaction, no selection state
                            return (
                              <div
                                key={toolName}
                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
                                  integrationMeta.iconBg
                                )}>
                                  {integrationMeta.icon}
                                </div>
                                <span className="font-medium text-sm">
                                  {toolName}
                                </span>
                              </div>
                            );
                          }
                          
                          // Selection view for existing integrations
                          const isSelected = selectedIntegrationToolsForModal.includes(toolName);
                          return (
                            <div
                              key={toolName}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-primary/30 hover:bg-accent/30"
                              )}
                              onClick={() => toggleModalToolSelection(toolName)}
                            >
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
                                integrationMeta.iconBg
                              )}>
                                {integrationMeta.icon}
                              </div>
                              <span className="font-medium text-sm">
                                {toolName}
                              </span>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleModalToolSelection(toolName)}
                                className="ml-auto"
                              />
                            </div>
                          );
                        })}
                        {toolsToDisplay.length === 0 && (
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

        <div className="px-6 py-4 border-t bg-gradient-to-r from-background to-secondary/5 flex justify-end items-center flex-shrink-0">
          <div className="flex gap-3">
            {integrationModalStep !== "select" && (
              <>
                {integrationModalTab === "tools" ? (
                  <Button 
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // For new integrations/wizard mode, ensure all tools are selected before saving
                      if (isNewIntegration || isWizardMode) {
                        const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                        setSelectedIntegrationToolsForModal(availableTools);
                      }
                      await handleSaveSelectedIntegrationTools();
                    }}
                    disabled={isSaving}
                    className="min-w-32"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Add Integration
                      </>
                    )}
                  </Button>
                ) : (
                  (() => {
                    const schema = connectingIntegrationType 
                      ? integrationSchemas[connectingIntegrationType] 
                      : null;
                    const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
                    const isOAuthIntegration = schema?.auth_type === 'oauth' || oauthIntegrations.includes(connectingIntegrationType || '');
                    
                    // Check if integration is already connected (either via editingIntegrationConfig or in userIntegrations)
                    const existingUserIntegration = userIntegrations.find(
                      ui => ui.integration_type === connectingIntegrationType
                    );
                    const hasOAuthToken = editingIntegrationConfig?.config?.api_key || 
                                         editingIntegrationConfig?.config?.access_token ||
                                         existingUserIntegration?.config?.api_key ||
                                         existingUserIntegration?.config?.access_token;
                    
                    // For OAuth integrations, IntegrationForm is always used (even with minimal schema)
                    // IntegrationForm handles its own buttons (OAuth connect, disconnect, etc.), so don't show footer buttons
                    if (isOAuthIntegration) {
                      // IntegrationForm handles its own buttons, so return null here
                      return null;
                    }
                    
                    // For OAuth integrations with existing token (but not using IntegrationForm), show Add Integration button
                    // This allows users to add the integration to the agent even if it's already connected to their account
                    if (isOAuthIntegration && hasOAuthToken) {
                      return (
                        <Button 
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // For new integrations (not yet added to agent) or wizard mode, automatically add all tools and save
                            if (isWizardMode || isNewIntegration) {
                              const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                              setSelectedIntegrationToolsForModal(availableTools);
                              await handleSaveSelectedIntegrationTools();
                            } else {
                              // For existing integrations (already added to agent), move to tools tab to select tools
                              setIntegrationModalTab("tools");
                            }
                          }}
                          disabled={isSaving}
                          className="min-w-32"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Add Integration
                            </>
                          )}
                        </Button>
                      );
                    }
                    
                    // For OAuth integrations without token, show OAuth connect button
                    if (isOAuthIntegration && !hasOAuthToken) {
                      const handleOAuthConnect = async () => {
                        const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
                        if (oauthIntegrations.includes(connectingIntegrationType || '')) {
                          setOAuthLoading(true);
                          try {
                            // Get current page URL to redirect back after OAuth
                            // Preserve the tab parameter so user returns to the same tab
                            // Add oauth_success parameter to indicate modal should stay open and switch to tools tab
                            // Use the full frontend URL (not backend URL)
                            const currentUrl = new URL(window.location.href);
                            const tab = currentUrl.searchParams.get('tab');
                            // Build return URL with full frontend URL, tab parameter, and oauth_success flag
                            let returnUrl = `${currentUrl.origin}${currentUrl.pathname}`;
                            const params = new URLSearchParams();
                            if (tab) {
                              params.append('tab', tab);
                            }
                            params.append('oauth_success', 'true');
                            params.append('integration_type', connectingIntegrationType || '');
                            returnUrl += `?${params.toString()}`;
                            
                            const response = await integrationsApi.getOAuthUrl(connectingIntegrationType || '', returnUrl);
                            if (response.data?.authorization_url) {
                              window.location.href = response.data.authorization_url;
                            } else {
                              toast({
                                title: "Error",
                                description: "Failed to get OAuth authorization URL.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error('OAuth error:', error);
                            toast({
                              title: "Error",
                              description: error instanceof Error ? error.message : "Failed to initiate OAuth flow.",
                              variant: "destructive",
                            });
                          } finally {
                            setOAuthLoading(false);
                          }
                        }
                      };

                      // Get OAuth button text based on integration type
                      const getOAuthButtonText = () => {
                        switch (connectingIntegrationType) {
                          case 'google_calendar':
                            return 'Connect with Google';
                          case 'calendly':
                            return 'Connect with Calendly';
                          case 'outlook_calendar':
                            return 'Connect with Microsoft';
                          default:
                            return 'Connect';
                        }
                      };

                      return (
                        <Button 
                          type="button"
                          onClick={handleOAuthConnect}
                          disabled={oauthLoading || connectingIntegrationLoading || isSaving || disconnecting}
                          className="min-w-32"
                        >
                          {oauthLoading || connectingIntegrationLoading || isSaving || disconnecting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              {getOAuthButtonText()}
                            </>
                          )}
                        </Button>
                      );
                    }
                    
                    // For non-OAuth integrations, show the API key submit button
                    return (
                      <Button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Save/update the API key first
                          await handleIntegrationConnect({ api_key: apiKey });
                          // In wizard mode or for new integrations, automatically add all tools and save
                          if (isWizardMode || isNewIntegration) {
                            // Automatically add all available tools
                            const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                            setSelectedIntegrationToolsForModal(availableTools);
                            // Save and close
                            await handleSaveSelectedIntegrationTools();
                          } else {
                            // For existing integrations, move to tools tab to select tools
                            setIntegrationModalTab("tools");
                          }
                        }}
                        disabled={connectingIntegrationLoading || isSaving || (!apiKey && !editingIntegrationConfig)}
                        className="min-w-32"
                      >
                        {connectingIntegrationLoading || isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Add Integration
                          </>
                        )}
                      </Button>
                    );
                  })()
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
