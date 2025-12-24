import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Globe,
  Loader2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Components
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";
import PhoneNumbersTab from "@/components/assistants/PhoneNumbersTab";
import { ConfigurationTab } from "@/components/assistants/ConfigurationTab";
import { PromptLogicTab } from "@/components/assistants/PromptLogicTab";
import { AdvancedTab } from "@/components/assistants/AdvancedTab";
import { ToolsTab } from "@/components/assistants/ToolsTab";
import { SystemToolSettingsPanel } from "@/components/assistants/SystemToolSettingsPanel";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";

// Modals
import { WebhookToolModal } from "@/components/assistants/modals/WebhookToolModal";
import { ClientToolModal } from "@/components/assistants/modals/ClientToolModal";
import { IntegrationConnectionModal } from "@/components/assistants/modals/IntegrationConnectionModal";
import { SectionEntryModal } from "@/components/assistants/modals/SectionEntryModal";
import { PromptPreviewModal } from "@/components/assistants/modals/PromptPreviewModal";
import { ChooseFilesDialog } from "@/components/assistants/modals/ChooseFilesDialog";

// Hooks
import { useWebhookTools } from "@/hooks/assistants/useWebhookTools";
import { useClientTools } from "@/hooks/assistants/useClientTools";
import { useIntegrationTools } from "@/hooks/assistants/useIntegrationTools";
import { useSectionEntries } from "@/hooks/assistants/useSectionEntries";
import { useAgentFiles } from "@/hooks/assistants/useAgentFiles";
import { useAgentData } from "@/hooks/assistants/useAgentData";

// Constants/Types/Utils
import {
  tabs,
  VALID_TABS,
  getAvailableIntegrationTypes,
  displayNameToActionName,
} from "@/constants/assistant";
import { voicesApi, type Voice } from "@/lib/api";
import type { SystemToolsState, SystemToolSetting, SystemToolKey, TransferRule, HumanTransferRule } from "@/types/assistant";

export default function AssistantDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Tab State
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number]) ? tabFromUrl : "configuration";
  const [activeTab, setActiveTab] = useState(initialTab);
  const lastSetTabRef = useRef<string | null>(null);

  // Sync activeTab with URL
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && VALID_TABS.includes(currentTab as (typeof VALID_TABS)[number])) {
      if (currentTab === lastSetTabRef.current) {
        lastSetTabRef.current = null;
        return;
      }
      if (currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    }
  }, [searchParams, activeTab]);

  const isNew = location.pathname === "/assistants/create" || id === "create";

  // Initialize Hooks
  const webhookHook = useWebhookTools();
  const clientHook = useClientTools();
  const sectionHook = useSectionEntries();
  const filesHook = useAgentFiles();
  const integrationHook = useIntegrationTools(webhookHook.webhookTools, webhookHook.setWebhookTools);

  const [systemTools, setSystemTools] = useState<SystemToolsState>({
    end_call: false,
    detect_language: false,
    skip_turn: false,
    transfer_to_agent: false,
    transfer_to_number: false,
    play_keypad_touch_tone: false,
    voicemail_detection: false,
  });
  const [systemToolSettings, setSystemToolSettings] = useState<SystemToolSetting>({
    transferRules: [],
    humanTransferRules: [],
  });
  // Store settings per tool to preserve description and disableInterruptions for all tools
  const [systemToolSettingsMap, setSystemToolSettingsMap] = useState<Record<string, SystemToolSetting>>({});
  const [selectedSystemTool, setSelectedSystemTool] = useState<string | null>(null);

  const agentData = useAgentData(
    id,
    webhookHook.setWebhookTools,
    clientHook.setClientTools,
    integrationHook.setAgentIntegrationTools,
    filesHook.setAttachedFiles,
    filesHook.setAgentFiles,
    sectionHook.setCenarios,
    sectionHook.setEtapas,
    sectionHook.setTomDeVoz,
    setSystemTools,
    setSystemToolSettings
  );

  const { fetchAgentDetails } = agentData;

  // Core Data Loading
  useEffect(() => {
    fetchAgentDetails();
  }, [id, fetchAgentDetails]);

  // Derived Values
  const agentId = agentData.agent?.id || (isNew ? "new" : "");

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (agentData.agent?.name && !tempName) {
      setTempName(agentData.agent.name);
    }
  }, [agentData.agent?.name, tempName]);

  // Voice Selector State
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [selectedVoiceNameState, setSelectedVoiceNameState] = useState<string>("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        setVoices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, []);

  // Track if we've attempted to fetch the voice to avoid multiple requests
  const fetchedVoiceRef = useRef<string | null>(null);

  // Reset fetched voice ref when voice_id changes
  useEffect(() => {
    if (agentData.agent?.voice_id !== fetchedVoiceRef.current) {
      fetchedVoiceRef.current = null;
      // Reset voice name when voice_id changes
      setSelectedVoiceNameState("");
    }
  }, [agentData.agent?.voice_id]);

  // Update selected voice name when voice is found in the list
  useEffect(() => {
    const voiceId = agentData.agent?.voice_id;
    if (!voiceId) {
      setSelectedVoiceNameState("");
      return;
    }
    
    const voice = voices.find(v => v.id === voiceId);
    if (voice?.name) {
      setSelectedVoiceNameState(voice.name);
    }
  }, [agentData.agent?.voice_id, voices]);

  // Fetch voice details if voice_id is set but voice is not in the list
  useEffect(() => {
    const voiceId = agentData.agent?.voice_id;
    if (!voiceId || loadingVoices) return;
    
    // Check if voice is already in the list
    const voiceExists = voices.some(v => v.id === voiceId);
    if (voiceExists) {
      fetchedVoiceRef.current = voiceId;
      return;
    }
    
    // Don't fetch if we've already attempted to fetch this voice
    if (fetchedVoiceRef.current === voiceId) return;
    
    // Fetch the voice
    const fetchVoice = async () => {
      try {
        fetchedVoiceRef.current = voiceId; // Mark as attempted
        const response = await voicesApi.get(voiceId);
        if (response.data) {
          setVoices(prev => {
            // Check if voice is already in the list to avoid duplicates
            if (prev.some(v => v.id === response.data.id)) {
              return prev;
            }
            return [...prev, response.data];
          });
          // Voice name will be set by the effect above when voices updates
        }
      } catch (error) {
        console.error("Failed to fetch voice details:", error);
        // Reset fetched ref on error so we can retry
        if (fetchedVoiceRef.current === voiceId) {
          fetchedVoiceRef.current = null;
        }
      }
    };
    
    fetchVoice();
  }, [agentData.agent?.voice_id, loadingVoices, voices]);

  // Use state for selected voice name
  const selectedVoiceName = selectedVoiceNameState;

  const handlePlayPreview = async (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    if (!voice?.preview_url) return;

    if (playingVoiceId === voiceId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(voice.preview_url);
    await audio.play();
    currentAudioRef.current = audio;
    setPlayingVoiceId(voiceId);

    audio.onended = () => {
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    };
  };

  // Handlers
  const handleSystemToolToggle = (key: keyof SystemToolsState) => {
    setSystemTools((prev) => ({ ...prev, [key]: !prev[key] }));
    // Only open the settings panel automatically for transfer_to_agent and transfer_to_number
    const toolsWithSettings = ["transfer_to_agent", "transfer_to_number"];
    if (!systemTools[key]) {
      // Only set selected tool if it's one that has settings
      if (toolsWithSettings.includes(key)) {
        setSelectedSystemTool(key);
      }
    } else if (selectedSystemTool === key) {
      setSelectedSystemTool(null);
    }
  };

  const handleOpenSystemToolSettings = (key: keyof SystemToolsState) => {
    setSelectedSystemTool(key);
  };

  // Load all tool settings into map when agent data is loaded
  useEffect(() => {
    if (!agentData.agent?.system_tools) return;

    const systemToolsData = agentData.agent.system_tools;
    const settingsMap: Record<string, SystemToolSetting> = {};

    // Extract settings for all tools
    Object.entries(systemToolsData).forEach(([toolKey, toolData]) => {
      const settings: SystemToolSetting = {
        name: toolKey,
        description: "",
        disableInterruptions: false,
      };

      if (typeof toolData === "object" && toolData !== null) {
        if ("description" in toolData) {
          settings.description = toolData.description as string || "";
        }
        if ("disable_interruptions" in toolData) {
          settings.disableInterruptions = toolData.disable_interruptions as boolean || false;
        }

        if (toolKey === "transfer_to_agent") {
          const transferData = toolData as { transferRules?: TransferRule[]; transfer_rules?: TransferRule[] };
          settings.transferRules = (transferData.transferRules || transferData.transfer_rules || []) as TransferRule[];
        } else if (toolKey === "transfer_to_number") {
          const humanTransferData = toolData as { humanTransferRules?: HumanTransferRule[]; human_transfer_rules?: HumanTransferRule[] };
          settings.humanTransferRules = (humanTransferData.humanTransferRules || humanTransferData.human_transfer_rules || []) as HumanTransferRule[];
        }
      }

      settingsMap[toolKey] = settings;
    });

    setSystemToolSettingsMap(settingsMap);
  }, [agentData.agent?.system_tools]);

  // Sync settings when a tool is selected
  useEffect(() => {
    if (!selectedSystemTool || !agentData.agent?.system_tools) return;

    const toolKey = selectedSystemTool as keyof SystemToolsState;
    const systemToolsData = agentData.agent.system_tools;
    
    // Check if we already have settings for this tool in the map
    // If map has settings, use them (they're the most up-to-date, including unsaved changes)
    const existingSettings = systemToolSettingsMap[toolKey];
    if (existingSettings) {
      setSystemToolSettings(existingSettings);
      return;
    }
    
    // If no settings in map, initialize from agent data
    const newSettings: SystemToolSetting = {
      name: toolKey,
      description: "",
      disableInterruptions: false,
    };

    if (toolKey === "transfer_to_agent" && systemToolsData.transfer_to_agent) {
      const toolData = systemToolsData.transfer_to_agent;
      if (typeof toolData === "object") {
        const transferData = toolData as { transferRules?: TransferRule[]; transfer_rules?: TransferRule[] };
        newSettings.transferRules = (transferData.transferRules || transferData.transfer_rules || []) as TransferRule[];
      }
      // Load description and disableInterruptions if they exist
      if (typeof toolData === "object" && "description" in toolData) {
        newSettings.description = toolData.description as string || "";
      }
      if (typeof toolData === "object" && "disable_interruptions" in toolData) {
        newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
      }
    } else if (toolKey === "transfer_to_number" && systemToolsData.transfer_to_number) {
      const toolData = systemToolsData.transfer_to_number;
      if (typeof toolData === "object") {
        const humanTransferData = toolData as { humanTransferRules?: HumanTransferRule[]; human_transfer_rules?: HumanTransferRule[] };
        newSettings.humanTransferRules = (humanTransferData.humanTransferRules || humanTransferData.human_transfer_rules || []) as HumanTransferRule[];
      }
      // Load description and disableInterruptions if they exist
      if (typeof toolData === "object" && "description" in toolData) {
        newSettings.description = toolData.description as string || "";
      }
      if (typeof toolData === "object" && "disable_interruptions" in toolData) {
        newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
      }
    } else {
      // For other tools, try to load description and disableInterruptions from the tool data
      const toolData = systemToolsData[toolKey];
      if (typeof toolData === "object" && toolData !== null) {
        if ("description" in toolData) {
          newSettings.description = toolData.description as string || "";
        }
        if ("disable_interruptions" in toolData) {
          newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
        }
      }
    }

    setSystemToolSettings(newSettings);
  }, [selectedSystemTool, agentData.agent?.system_tools, systemToolSettingsMap]);


  const promptToolsSummary = useMemo(() => {
    const activeSystemTools = Object.entries(systemTools)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    const clientToolNames = clientHook.clientTools.map((t) => t.name);
    const webhookToolNames = webhookHook.webhookTools.map((t) => t.name);
    const enabledIntegrations = integrationHook.agentIntegrationTools
      .filter((t) => t.enabled)
      .map((t) => t.integration_type);

    return JSON.stringify({
      activeSystemTools,
      clientToolNames,
      webhookToolNames,
      enabledIntegrations,
    }, null, 2);
  }, [systemTools, clientHook.clientTools, webhookHook.webhookTools, integrationHook.agentIntegrationTools]);

  if (agentData.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading assistant details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assistants")}
              className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 group">
                {editingName ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <Input
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          agentData.handleUpdate({ name: tempName });
                          setEditingName(false);
                        } else if (e.key === "Escape") {
                          setTempName(agentData.agent?.name || "");
                          setEditingName(false);
                        }
                      }}
                      onBlur={() => {
                        agentData.handleUpdate({ name: tempName });
                        setEditingName(false);
                      }}
                      className="h-8 md:h-9 text-lg md:text-xl font-bold bg-background border-primary"
                    />
                  </div>
                ) : (
                  <>
                    <h1
                      className="text-lg md:text-xl font-bold truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        setTempName(agentData.agent?.name || "");
                        setEditingName(true);
                      }}
                    >
                      {agentData.agent?.name || "Untitled Assistant"}
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                      onClick={() => {
                        setTempName(agentData.agent?.name || "");
                        setEditingName(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                <span className="truncate">ID: {agentId}</span>
                {!isNew && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                agentData.handleSave(
                  webhookHook.webhookTools,
                  clientHook.clientTools,
                  integrationHook.agentIntegrationTools,
                  sectionHook.cenarios,
                  sectionHook.etapas,
                  sectionHook.tomDeVoz,
                  systemTools,
                  systemToolSettings,
                  filesHook.attachedFiles,
                  systemToolSettingsMap
                )
              }
              disabled={agentData.saving}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              {agentData.saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              size="sm"
              onClick={agentData.handlePublish}
              disabled={agentData.publishing || isNew}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              {agentData.publishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 md:mt-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 md:gap-8 border-b border-border min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  lastSetTabRef.current = tab.id;
                  setSearchParams({ tab: tab.id });
                }}
                className={cn(
                  "pb-3 md:pb-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative">
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          {agentData.agent && (
            <>
              {activeTab === "widget" ? (
                <WidgetTab agent={agentData.agent} agentId={agentId} />
              ) : activeTab === "conversations" ? (
                <ConversationsTab assistantName={agentData.agent.name} agentId={agentData.agent.id} />
              ) : activeTab === "phone-numbers" ? (
                <PhoneNumbersTab agent={agentData.agent} agentId={agentId} />
              ) : activeTab === "tools" ? (
                <ToolsTab
                  systemTools={systemTools}
                  onToggleSystemTool={handleSystemToolToggle}
                  onOpenSystemToolSettings={handleOpenSystemToolSettings}
                  webhookTools={webhookHook.webhookTools}
                  clientTools={clientHook.clientTools}
                  onAddWebhook={() => webhookHook.openWebhookModal()}
                  onEditWebhook={(tool) => webhookHook.openWebhookModal(tool)}
                  onDeleteWebhook={webhookHook.deleteWebhookTool}
                  onAddClientTool={() => clientHook.openClientToolModal()}
                  onEditClientTool={(tool) => clientHook.openClientToolModal(tool)}
                  onDeleteClientTool={clientHook.deleteClientTool}
                  agentIntegrationTools={integrationHook.agentIntegrationTools}
                  userIntegrations={integrationHook.userIntegrations}
                  integrationToolsExpanded={integrationHook.integrationToolsExpanded}
                  onToggleIntegrationExpand={integrationHook.toggleIntegrationToolsExpanded}
                  onToggleIntegrationTool={(type, displayName, enabled) => {
                    // Convert display name to action name
                    const actionName = displayNameToActionName(displayName, type);
                    integrationHook.handleIntegrationToolToggleWithWebhook(type, actionName, enabled, agentData.agent);
                  }}
                  onDeleteIntegrationTool={integrationHook.handleDeleteIntegrationTool}
                  onAddIntegration={integrationHook.openAddIntegrationModal}
                  onEditIntegration={integrationHook.openEditIntegrationModal}
                  onDeleteIntegration={async (id) => {
                    await integrationHook.handleDeleteIntegration(
                      id,
                      agentData.agent,
                      async (updatedIntegrationTools, updatedWebhookTools) => {
                        await agentData.handleSave(
                          updatedWebhookTools,
                          clientHook.clientTools,
                          updatedIntegrationTools,
                          sectionHook.cenarios,
                          sectionHook.etapas,
                          sectionHook.tomDeVoz,
                          systemTools,
                          systemToolSettings,
                          filesHook.attachedFiles,
                          systemToolSettingsMap
                        );
                      },
                      agentData.handlePublish
                    );
                  }}
                />
              ) : activeTab === "configuration" ? (
                <ConfigurationTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                  onPlayPreview={handlePlayPreview}
                  loadingVoices={loadingVoices}
                  selectedVoiceId={agentData.agent?.voice_id || null}
                  selectedVoiceName={selectedVoiceName}
                  setShowVoiceSelector={setShowVoiceSelector}
                />
              ) : activeTab === "prompt-logic" ? (
                <PromptLogicTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                  scenarios={sectionHook.cenarios}
                  phases={sectionHook.etapas}
                  voiceTone={sectionHook.tomDeVoz}
                  onAddSectionEntry={sectionHook.addSectionEntry}
                  onEditSectionEntry={sectionHook.openSectionModal}
                  onRemoveSectionEntry={sectionHook.removeSectionEntryById}
                  attachedFiles={filesHook.attachedFiles}
                  onFileUpload={(e) => filesHook.handleFileUpload(e, agentId)}
                  onFileDelete={filesHook.handleFileDelete}
                  onOpenChooseFiles={() => filesHook.setShowChooseFilesDialog(true)}
                  uploadingFiles={filesHook.uploadingFiles}
                  isNew={isNew}
                  agentFiles={filesHook.agentFiles}
                  loadingAvailableFiles={filesHook.loadingAvailableFiles}
                  assigningFile={filesHook.assigningFile}
                  fetchAllAvailableFiles={filesHook.fetchAllAvailableFiles}
                  setShowChooseFilesDialog={filesHook.setShowChooseFilesDialog}
                />
              ) : activeTab === "advanced" ? (
                <AdvancedTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                />
              ) : null}
            </>
          )}
        </div>

        {/* System Tool Settings Right Panel */}
        {selectedSystemTool && (
          <div className="w-[400px]">
            <SystemToolSettingsPanel
              toolKey={selectedSystemTool as SystemToolKey}
              settings={systemToolSettings}
              currentAgentId={agentData.agent?.id}
              onUpdate={(updates) => {
                const updatedSettings = { ...systemToolSettings, ...updates };
                setSystemToolSettings(updatedSettings);
                // Always save to map for all tools so description and disableInterruptions are preserved
                if (selectedSystemTool) {
                  setSystemToolSettingsMap(prev => ({
                    ...prev,
                    [selectedSystemTool]: updatedSettings
                  }));
                }
              }}
              onSave={() => {
                agentData.handleSave(
                  webhookHook.webhookTools,
                  clientHook.clientTools,
                  integrationHook.agentIntegrationTools,
                  sectionHook.cenarios,
                  sectionHook.etapas,
                  sectionHook.tomDeVoz,
                  systemTools,
                  systemToolSettings,
                  filesHook.attachedFiles,
                  systemToolSettingsMap
                );
              }}
              saving={agentData.saving}
              onClose={() => {
                // If user closes the panel without adding any info for transfer tools, toggle them off.
                // If there is already configuration (rules), keep the toggle on.
                if (selectedSystemTool === "transfer_to_agent") {
                  const hasRules =
                    (systemToolSettings.transferRules || []).length > 0;
                  if (!hasRules) {
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_agent: false,
                    }));
                  }
                } else if (selectedSystemTool === "transfer_to_number") {
                  const hasHumanRules =
                    (systemToolSettings.humanTransferRules || []).length > 0;
                  if (!hasHumanRules) {
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_number: false,
                    }));
                  }
                }
                setSelectedSystemTool(null);
              }}
            />
          </div>
        )}

      </div>

      <VoiceSelectorDialog
        open={showVoiceSelector}
        onOpenChange={(open) => {
          setShowVoiceSelector(open);
          if (!open) {
            setVoiceSearchQuery("");
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
              setPlayingVoiceId(null);
            }
          }
        }}
        voices={voices}
        selectedVoiceId={agentData.agent?.voice_id || ""}
        onSelectVoice={(voiceId) => {
          agentData.handleUpdate({ voice_id: voiceId });
          setShowVoiceSelector(false);
        }}
        playingVoiceId={playingVoiceId}
        onPlayPreview={(voice) => handlePlayPreview(voice.id)}
        searchQuery={voiceSearchQuery}
        onSearchChange={setVoiceSearchQuery}
      />

      {/* Modals */}
      <WebhookToolModal
        open={webhookHook.showWebhookModal}
        onOpenChange={webhookHook.setShowWebhookModal}
        editingWebhookTool={webhookHook.editingWebhookTool}
        webhookForm={webhookHook.webhookForm}
        setWebhookForm={webhookHook.setWebhookForm}
        onSave={webhookHook.saveWebhookTool}
        onClose={webhookHook.closeWebhookModal}
      />

      <ClientToolModal
        open={clientHook.showClientToolModal}
        onOpenChange={clientHook.setShowClientToolModal}
        editingClientTool={clientHook.editingClientTool}
        clientToolForm={clientHook.clientToolForm}
        setClientToolForm={clientHook.setClientToolForm}
        onSave={clientHook.saveClientTool}
        onClose={clientHook.closeClientToolModal}
      />

      <IntegrationConnectionModal
        open={integrationHook.showIntegrationModal}
        onOpenChange={integrationHook.setShowIntegrationModal}
        connectingIntegrationLoading={integrationHook.connectingIntegrationLoading}
        integrationModalStep={integrationHook.integrationModalStep}
        availableIntegrationTypes={getAvailableIntegrationTypes()}
        agentIntegrationTools={integrationHook.agentIntegrationTools}
        selectIntegrationToAdd={integrationHook.selectIntegrationToAdd}
        userIntegrations={integrationHook.userIntegrations}
        connectingIntegrationType={integrationHook.connectingIntegrationType}
        goBackToIntegrationSelect={integrationHook.goBackToIntegrationSelect}
        integrationSchemas={integrationHook.integrationSchemas}
        integrationModalTab={integrationHook.integrationModalTab}
        setIntegrationModalTab={integrationHook.setIntegrationModalTab}
        editingIntegrationConfig={integrationHook.editingIntegrationConfig}
        handleIntegrationConnect={integrationHook.handleIntegrationConnect}
        closeIntegrationConnectionModal={integrationHook.closeIntegrationConnectionModal}
        handleDeleteIntegration={async (id) => {
          await integrationHook.handleDeleteIntegration(
            id,
            agentData.agent,
            async (updatedIntegrationTools, updatedWebhookTools) => {
              // Save agent with updated integration tools and webhook tools
              await agentData.handleSave(
                updatedWebhookTools,
                clientHook.clientTools,
                updatedIntegrationTools,
                sectionHook.cenarios,
                sectionHook.etapas,
                sectionHook.tomDeVoz,
                systemTools,
                systemToolSettings,
                filesHook.attachedFiles,
                systemToolSettingsMap
              );
            },
            agentData.handlePublish
          );
        }}
        selectedIntegrationToolsForModal={integrationHook.selectedIntegrationToolsForModal}
        toggleModalToolSelection={integrationHook.toggleModalToolSelection}
        setSelectedIntegrationToolsForModal={integrationHook.setSelectedIntegrationToolsForModal}
        saveSelectedIntegrationTools={async () => {
          await integrationHook.saveSelectedIntegrationTools(
            agentData.agent,
            async (updatedIntegrationTools, updatedWebhookTools) => {
              // Save agent with updated integration tools and webhook tools
              await agentData.handleSave(
                updatedWebhookTools, // Use the updated webhook tools that include new integration webhooks
                clientHook.clientTools,
                updatedIntegrationTools,
                sectionHook.cenarios,
                sectionHook.etapas,
                sectionHook.tomDeVoz,
                systemTools,
                systemToolSettings,
                filesHook.attachedFiles,
                systemToolSettingsMap
              );
            },
            agentData.handlePublish
          );
        }}
      />

      <SectionEntryModal
        open={sectionHook.showSectionModal}
        onClose={sectionHook.closeSectionModal}
        editingSectionEntry={sectionHook.editingSectionEntry}
        sectionForm={sectionHook.sectionForm}
        setSectionForm={sectionHook.setSectionForm}
        onSave={sectionHook.saveSectionEntry}
      />

      <PromptPreviewModal
        open={sectionHook.showPromptPreviewModal}
        onOpenChange={sectionHook.setShowPromptPreviewModal}
        promptToolsSummary={promptToolsSummary}
        derivedSystemPrompt={sectionHook.derivedSystemPrompt}
      />

      <ChooseFilesDialog
        open={filesHook.showChooseFilesDialog}
        onOpenChange={filesHook.setShowChooseFilesDialog}
        assigningFile={filesHook.assigningFile}
        loadingAvailableFiles={filesHook.loadingAvailableFiles}
        allAvailableFiles={filesHook.allAvailableFiles}
        attachedFiles={filesHook.attachedFiles}
        onSelectExistingFile={(fileId) => filesHook.handleSelectExistingFile(fileId, agentId)}
      />
    </div>
  );
}
