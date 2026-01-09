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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Puzzle, 
  ChevronRight, 
  ShieldCheck, 
  Wrench,
  Info,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AgentIntegrationTool } from "@/types/assistant";
import type { UserIntegration, IntegrationSchema } from "@/types/integrations";
import { INTEGRATION_TOOLS_DISPLAY, INTEGRATION_METADATA, actionNameToDisplayName } from "@/constants/assistant";
import { IntegrationForm, type IntegrationFormRef } from "@/components/integrations/IntegrationForm";
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
  onRemoveIntegration?: (integrationType: string) => Promise<void>; // Function to remove integration from agent
  agentId?: string | number; // Agent ID for removing integration
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
  onRemoveIntegration,
  agentId,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [originalApiKey, setOriginalApiKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isIntegrationFormValid, setIsIntegrationFormValid] = useState(false);
  const isClosingRef = useRef(false);
  const prevOpenRef = useRef(open);
  const isSavingRef = useRef(false);
  const isOpeningRef = useRef(false);
  const integrationFormRef = useRef<IntegrationFormRef | null>(null);
  const { toast } = useToast();

  // Auto-switch to tools tab for integrations with no fields (like Twilio)
  useEffect(() => {
    if (open && connectingIntegrationType) {
      // Direct check for Twilio (always has no fields)
      const isTwilio = connectingIntegrationType === 'twilio';
      const schema = integrationSchemas[connectingIntegrationType];
      const hasNoFields = isTwilio || (schema && 
        schema.required.length === 0 && 
        schema.optional.length === 0 &&
        Object.keys(schema.fields || {}).length === 0);
      
      if (hasNoFields && integrationModalTab === 'credentials') {
        // Automatically switch to tools tab for integrations with no fields
        setIntegrationModalTab('tools');
      }
    }
  }, [open, connectingIntegrationType, integrationSchemas, integrationModalTab, setIntegrationModalTab]);

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

  // Load API key when editing (store original, show masked)
  // Check both editingIntegrationConfig and userIntegrations
  useEffect(() => {
    // First check editingIntegrationConfig
    let apiKeyValue: string | null = null;
    
    if (editingIntegrationConfig?.config?.api_key) {
      apiKeyValue = String(editingIntegrationConfig.config.api_key);
    } else if (connectingIntegrationType) {
      // If not in editingIntegrationConfig, check userIntegrations
      const existingIntegration = userIntegrations.find(
        ui => ui.integration_type === connectingIntegrationType
      );
      if (existingIntegration?.config?.api_key) {
        apiKeyValue = String(existingIntegration.config.api_key);
      }
    }
    
    if (apiKeyValue) {
      // Store the original API key
      setOriginalApiKey(apiKeyValue);
      // Show masked version by default
      const masked = apiKeyValue.length > 8 
        ? apiKeyValue.substring(0, 4) + '*'.repeat(apiKeyValue.length - 8) + apiKeyValue.substring(apiKeyValue.length - 4)
        : '*'.repeat(apiKeyValue.length);
      setApiKey(masked);
      setShowApiKey(false);
    } else {
      setApiKey("");
      setOriginalApiKey(null);
      setShowApiKey(false);
    }
  }, [editingIntegrationConfig, userIntegrations, connectingIntegrationType]);

  // Populate selected tools for existing integrations only
  useEffect(() => {
    if (connectingIntegrationType) {
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
  }, [connectingIntegrationType, agentIntegrationTools]);

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

  // Check if integration actually exists (not just in local state)
  const actuallyHasIntegration = useMemo(() => {
    if (!connectingIntegrationType) return false;
    const existingUserIntegration = userIntegrations.find(
      ui => ui.integration_type === connectingIntegrationType
    );
    return !!existingUserIntegration || !!editingIntegrationConfig;
  }, [connectingIntegrationType, userIntegrations, editingIntegrationConfig]);

  // Check if integration has no fields (like Twilio - uses environment variables)
  const hasNoFields = useMemo(() => {
    if (!connectingIntegrationType) return false;
    
    // Direct check for Twilio (always has no fields)
    if (connectingIntegrationType === 'twilio') return true;
    
    const schema = integrationSchemas[connectingIntegrationType];
    return schema && 
      schema.required.length === 0 && 
      schema.optional.length === 0 &&
      Object.keys(schema.fields || {}).length === 0;
  }, [connectingIntegrationType, integrationSchemas]);

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
      
      // Reset saving flags immediately after successful save
      // This prevents the button from showing "Removing..." if the state changes
      isSavingRef.current = false;
      setIsSaving(false);
      
      // Only close the modal if closeAfterSave is true (manual save from tools tab)
      if (closeAfterSave) {
        // Close the modal after successful save
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Closing modal after successful save');
        // Set closing flag before closing
        isClosingRef.current = true;
        closeIntegrationConnectionModal();
        
        // Reset closing flag after a delay to allow the close to complete
        setTimeout(() => {
          console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting closing flag to false');
          isClosingRef.current = false;
        }, 300);
      } else {
        // Keep modal open, just reset saving flag (already done above)
        console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Keeping modal open after auto-save');
      }
    } catch (error) {
      console.error('[IntegrationModal] handleSaveSelectedIntegrationTools: Error occurred', error);
      // On error, reset flags immediately and close the modal
      console.log('[IntegrationModal] handleSaveSelectedIntegrationTools: Resetting flags and closing modal after error');
      isClosingRef.current = false;
      isSavingRef.current = false;
      setIsSaving(false);
      closeIntegrationConnectionModal();
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

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
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
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-8 space-y-8">
                  {/* Credentials Section - Hide for integrations with no fields (like Twilio) or when already connected to agent */}
                  {/* Show API key field when adding integration to agent, even if it exists in userIntegrations */}
                  {!hasNoFields && isNewIntegration && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">Credentials</h3>
                          <p className="text-sm text-muted-foreground">
                            Connect your {integrationMeta.name} account to enable tools for your assistant.
                          </p>
                        </div>
                      </div>
                      {(() => {
                      const schema = connectingIntegrationType 
                        ? integrationSchemas[connectingIntegrationType] 
                        : null;
                      const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
                      const isOAuthIntegration = schema?.auth_type === 'oauth' || oauthIntegrations.includes(connectingIntegrationType || '');
                      
                      // Check if integration has multiple fields (more than just api_key)
                      const hasMultipleFields = schema && (
                        schema.required.length > 1 || 
                        (schema.required.length === 1 && schema.required[0] !== 'api_key') ||
                        Object.keys(schema.fields || {}).length > 1
                      );
                      
                      // Use IntegrationForm for OAuth integrations or integrations with multiple fields
                      // Note: hasNoFields integrations skip the entire credentials section, so IntegrationForm is not rendered
                      if (isOAuthIntegration || (schema && hasMultipleFields)) {
                        // If schema isn't loaded yet, create a minimal schema for OAuth integrations
                        // IntegrationForm can work with a minimal schema since it checks the hardcoded OAuth list
                        const formSchema = schema || (isOAuthIntegration ? {
                          type: connectingIntegrationType || '',
                          auth_type: 'oauth' as const,
                          fields: {},
                          required: [],
                          optional: [],
                        } : null);
                        
                        // Only show loading if we're still loading and it's not a known OAuth integration
                        if (!formSchema && connectingIntegrationLoading) {
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
                        if (!formSchema) {
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
                            ref={integrationFormRef}
                            schema={formSchema}
                            initialConfig={editingIntegrationConfig?.config || {}}
                            onValidationChange={setIsIntegrationFormValid}
                            onSubmit={async (config) => {
                              try {
                                // Convert config values to strings for handleIntegrationConnect
                                const stringConfig: Record<string, string> = {};
                                Object.entries(config).forEach(([key, value]) => {
                                  stringConfig[key] = String(value);
                                });
                                
                                // Connect the integration
                                await handleIntegrationConnect(stringConfig);
                                
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
                            onDisconnect={connectingIntegrationType === 'twilio' ? undefined : async () => {
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
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Credential Type
                              </h4>
                              <div className="p-4 border-2 border-primary/20 rounded-xl bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
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
                            
                            <div className="flex items-start gap-3 p-4 rounded-lg border-l-4 border-primary/30 bg-primary/5">
                              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-foreground mb-1">Secure API Connection</p>
                                <p className="text-muted-foreground">
                                  Your API key is encrypted and stored securely. It will never be exposed in logs or shared with third parties.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="api-key" className="text-base font-semibold flex items-center gap-2">
                              API Key
                              {originalApiKey && (
                                <Badge variant="outline" className="font-normal">
                                  Currently configured
                                </Badge>
                              )}
                            </Label>
                            <div className="relative">
                              <Input
                                id="api-key"
                                type={showApiKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  // If we have an original API key and user is typing, they're changing it
                                  if (originalApiKey) {
                                    // If user starts typing, they're modifying the key
                                    setApiKey(newValue);
                                    // If they clear it completely, reset to masked original
                                    if (newValue === "") {
                                      const masked = originalApiKey.length > 8 
                                        ? originalApiKey.substring(0, 4) + '*'.repeat(originalApiKey.length - 8) + originalApiKey.substring(originalApiKey.length - 4)
                                        : '*'.repeat(originalApiKey.length);
                                      setApiKey(masked);
                                      setShowApiKey(false);
                                    } else {
                                      // User is typing a new value, keep it visible
                                      setShowApiKey(true);
                                    }
                                  } else {
                                    // New API key entry
                                    setApiKey(newValue);
                                  }
                                }}
                                placeholder={originalApiKey ? "Enter new API key to update" : `Enter your ${integrationMeta.name} API key`}
                                className="font-mono text-sm h-11 pr-10"
                              />
                              {originalApiKey && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isCurrentlyMasked = apiKey.includes('*');
                                    if (isCurrentlyMasked) {
                                      // Currently showing masked, switch to actual key
                                      setApiKey(originalApiKey);
                                      setShowApiKey(true);
                                    } else {
                                      // Currently showing actual key, check if it's been modified
                                      if (apiKey === originalApiKey) {
                                        // Not modified, just hide it
                                        const masked = originalApiKey.length > 8 
                                          ? originalApiKey.substring(0, 4) + '*'.repeat(originalApiKey.length - 8) + originalApiKey.substring(originalApiKey.length - 4)
                                          : '*'.repeat(originalApiKey.length);
                                        setApiKey(masked);
                                        setShowApiKey(false);
                                      } else {
                                        // User has modified it, keep showing the modified value
                                        setShowApiKey(true);
                                      }
                                    }
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                                >
                                  {showApiKey && apiKey === originalApiKey ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
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
                      );
                    })()}
                    </div>
                  )}

                  {/* Tools Section */}
                  <div className="space-y-5 border-t border-border/50 pt-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">Available Tools</h3>
                          <p className="text-sm text-muted-foreground">
                            {(isNewIntegration || isWizardMode || hasNoFields)
                              ? "All tools will be added to your assistant" 
                              : "Select the tools you want to enable for your assistant"}
                          </p>
                        </div>
                      </div>
                      {!(isNewIntegration || isWizardMode || hasNoFields) && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {selectedIntegrationToolsForModal.length} selected
                        </Badge>
                      )}
                      {(isNewIntegration || isWizardMode || hasNoFields) && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary flex-shrink-0">
                          {toolsToDisplay.length} tools
                        </Badge>
                      )}
                    </div>

                      <div className={cn(
                        "grid gap-3",
                        (isNewIntegration || isWizardMode) 
                          ? "grid-cols-2 md:grid-cols-3" 
                          : "grid-cols-3"
                      )}>
                        {toolsToDisplay.map((toolName) => {
                          // For new integrations, wizard mode, or integrations with no fields (like Twilio), show as simple list (no selection)
                          const showAsList = isNewIntegration || isWizardMode || hasNoFields;
                          
                          if (showAsList) {
                            // Simple list view - no interaction, no selection state
                            return (
                              <div
                                key={toolName}
                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border shadow-sm"
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
                                "hover:shadow-md hover:scale-[1.02]",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border hover:border-primary/50 hover:bg-accent/50"
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
                          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-secondary/30 border border-dashed border-border">
                            <div className="p-4 rounded-full bg-muted mb-4">
                              <Wrench className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-foreground mb-1">No tools available</p>
                            <p className="text-sm text-muted-foreground text-center">
                              This integration doesn't provide any tools for your assistant.
                            </p>
                          </div>
                        )}
                      </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gradient-to-r from-background to-secondary/5 flex justify-end items-center flex-shrink-0">
          <div className="flex gap-3">
            {integrationModalStep !== "select" && (
              <>
                {(() => {
                  // Check if we should show the tools save button (when credentials are already connected)
                  const schema = connectingIntegrationType 
                    ? integrationSchemas[connectingIntegrationType] 
                    : null;
                  const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
                  const isOAuthIntegration = schema?.auth_type === 'oauth' || oauthIntegrations.includes(connectingIntegrationType || '');
                  
                  const existingUserIntegration = userIntegrations.find(
                    ui => ui.integration_type === connectingIntegrationType
                  );
                  const hasOAuthToken = editingIntegrationConfig?.config?.api_key || 
                                       editingIntegrationConfig?.config?.access_token ||
                                       existingUserIntegration?.config?.api_key ||
                                       existingUserIntegration?.config?.access_token;
                  
                  // If credentials are already connected, show tools save button
                  const credentialsConnected = hasOAuthToken || editingIntegrationConfig || existingUserIntegration;
                  
                  // If integration is connected to the agent, show Remove Integration button
                  // Check if integration is already connected to the agent (not just in userIntegrations)
                  if (!isNewIntegration && onRemoveIntegration && connectingIntegrationType) {
                    return (
                      <Button 
                        type="button"
                        variant="destructive"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to remove ${integrationMeta.name} from this agent?`)) {
                            setIsSaving(true);
                            try {
                              await onRemoveIntegration(connectingIntegrationType);
                              closeIntegrationConnectionModal();
                              toast({
                                title: "Success",
                                description: `${integrationMeta.name} has been removed from this agent.`,
                              });
                            } catch (error) {
                              console.error('Error removing integration:', error);
                              // Error is already handled by onRemoveIntegration
                            } finally {
                              setIsSaving(false);
                            }
                          }
                        }}
                        disabled={isSaving}
                        className="min-w-32"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Wrench className="h-4 w-4 mr-2" />
                            Remove Integration
                          </>
                        )}
                      </Button>
                    );
                  }
                  
                  // For integrations with no fields (like Twilio), show Add/Remove Integration button
                  if (hasNoFields) {
                    // If integration is already connected, show Remove button
                    if (!isNewIntegration && onRemoveIntegration && connectingIntegrationType) {
                      return (
                        <Button 
                          type="button"
                          variant="destructive"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to remove ${connectingIntegrationType === 'twilio' ? 'Twilio' : 'this integration'} from this agent?`)) {
                              setIsSaving(true);
                              try {
                                await onRemoveIntegration(connectingIntegrationType);
                                closeIntegrationConnectionModal();
                              } catch (error) {
                                console.error('Error removing integration:', error);
                                // Error is already handled by onRemoveIntegration
                              } finally {
                                setIsSaving(false);
                              }
                            }
                          }}
                          disabled={isSaving}
                          className="min-w-32"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <Wrench className="h-4 w-4 mr-2" />
                              Remove Integration
                            </>
                          )}
                        </Button>
                      );
                    }
                    
                    // Otherwise show Add Integration button
                    return (
                      <Button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            // Ensure all tools are selected
                            const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                            setSelectedIntegrationToolsForModal(availableTools);
                            
                            // Connect integration first (with empty config for Twilio)
                            if (!existingUserIntegration) {
                              await handleIntegrationConnect({});
                            }
                            
                            // Then save the tools
                            await handleSaveSelectedIntegrationTools();
                          } catch (error) {
                            console.error('Error connecting Twilio integration:', error);
                            // Error is already handled by handleIntegrationConnect
                          }
                        }}
                        disabled={isSaving}
                        className="min-w-32"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
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
                  
                  // Check if user is on credentials tab and has entered a new API key to update
                  // Only update if the API key is different from the original (user actually changed it)
                  const isUpdatingApiKey = originalApiKey && 
                                           integrationModalTab === 'credentials' && 
                                           apiKey && 
                                           apiKey !== '' &&
                                           apiKey !== originalApiKey && // Different from original
                                           !apiKey.includes('*'); // Not masked (contains actual value)
                  
                  // Show Add Integration button when credentials are connected but integration not yet added to agent
                  // This handles the case where integration exists in userIntegrations but hasn't been added to the agent yet
                  if (credentialsConnected && !isOAuthIntegration && !isUpdatingApiKey && actuallyHasIntegration && isNewIntegration) {
                    return (
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
                    );
                  }
                  
                  // If credentials are connected but integration doesn't actually exist, 
                  // we need to create it first (this handles the case where originalApiKey exists 
                  // but integration was deleted or doesn't exist on server)
                  if (credentialsConnected && !isOAuthIntegration && !isUpdatingApiKey && !actuallyHasIntegration && originalApiKey) {
                    // Show connect button to create the integration
                    return (
                      <Button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Determine the actual API key value to use
                          let actualApiKey = apiKey;
                          if (apiKey.includes('*')) {
                            actualApiKey = originalApiKey;
                          }
                          
                          // Create the integration with the API key
                          await handleIntegrationConnect({ api_key: actualApiKey });
                          // Automatically select all available tools
                          const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                          setSelectedIntegrationToolsForModal(availableTools);
                        }}
                        disabled={connectingIntegrationLoading || isSaving || !apiKey}
                        className="min-w-32"
                      >
                        {connectingIntegrationLoading || isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    );
                  }
                  
                  // Otherwise show credentials connection button
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
                            // For existing integrations, just save the selected tools
                            await handleSaveSelectedIntegrationTools();
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
                    // Check if this integration uses IntegrationForm (multiple fields)
                    const formSchemaForButton = connectingIntegrationType 
                      ? integrationSchemas[connectingIntegrationType] 
                      : null;
                    const hasMultipleFieldsForButton = formSchemaForButton && (
                      formSchemaForButton.required.length > 1 || 
                      (formSchemaForButton.required.length === 1 && formSchemaForButton.required[0] !== 'api_key') ||
                      Object.keys(formSchemaForButton.fields || {}).length > 1
                    );
                    const usesIntegrationFormForButton = isOAuthIntegration || (formSchemaForButton && hasMultipleFieldsForButton);
                    
                    // If using IntegrationForm (multiple fields), check form validity instead of apiKey
                    const isButtonDisabled = connectingIntegrationLoading || isSaving || 
                      (usesIntegrationFormForButton 
                        ? !isIntegrationFormValid 
                        : (!apiKey && !editingIntegrationConfig));
                    
                    return (
                      <Button 
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // For IntegrationForm, trigger form submission via ref
                          if (usesIntegrationFormForButton) {
                            if (integrationFormRef.current) {
                              try {
                                await integrationFormRef.current.submit();
                              } catch (error) {
                                // Error is already handled by the form's onSubmit
                                console.error('Error submitting integration form:', error);
                              }
                            }
                            return;
                          }
                          
                          // Determine the actual API key value to use
                          let actualApiKey = apiKey;
                          
                          // If API key is masked, use original (check both editingIntegrationConfig and userIntegrations)
                          if (originalApiKey && apiKey.includes('*')) {
                            actualApiKey = originalApiKey;
                          }
                          
                          // Validate API key is not empty
                          if (!actualApiKey || actualApiKey.trim() === '') {
                            toast({
                              title: "Validation Error",
                              description: "Please enter an API key.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Check if API key hasn't changed (only if we have an original to compare)
                          if (originalApiKey) {
                            if (actualApiKey === originalApiKey) {
                              // No change, just show a message
                              toast({
                                title: "No changes",
                                description: "The API key hasn't been changed.",
                                variant: "default",
                              });
                              return;
                            }
                          }
                          
                          try {
                            // Only save/update the API key - don't save tools or close modal
                            // The modal will dynamically update to show "Add Integration" button
                            // after handleIntegrationConnect updates editingIntegrationConfig
                            await handleIntegrationConnect({ api_key: actualApiKey });
                            // Automatically select all available tools for when user clicks "Add Integration"
                            const availableTools = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType || ''] || [];
                            setSelectedIntegrationToolsForModal(availableTools);
                          } catch (error: any) {
                            // Error is already handled by handleIntegrationConnect, but log for debugging
                            console.error('Error connecting integration:', error);
                            // If it's a 404, it might mean the integration doesn't exist
                            // The handleIntegrationConnect should handle this, but just in case
                            if (error?.response?.status === 404) {
                              toast({
                                title: "Integration not found",
                                description: "The integration was not found. Please try connecting again.",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        disabled={isButtonDisabled}
                        className="min-w-32"
                      >
                        {connectingIntegrationLoading || isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingIntegrationConfig ? "Updating..." : "Connecting..."}
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            {editingIntegrationConfig ? "Update API Key" : "Connect"}
                          </>
                        )}
                      </Button>
                    );
                  })()}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
