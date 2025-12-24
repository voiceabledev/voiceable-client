import { useState, useCallback, useRef } from "react";
import { agentsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { generateSectionEntryId } from "@/utils/assistantHelpers";
import type { 
  Agent, 
  WebhookTool, 
  ClientTool, 
  AgentIntegrationTool, 
  AgentFile, 
  SectionEntry,
  SystemToolsState,
  SystemToolSetting,
  TransferRule,
  HumanTransferRule
} from "@/types/assistant";

export function useAgentData(
  id: string | undefined,
  setWebhookTools: (tools: WebhookTool[]) => void,
  setClientTools: (tools: ClientTool[]) => void,
  setAgentIntegrationTools: (tools: AgentIntegrationTool[]) => void,
  setAttachedFiles: (files: AgentFile[]) => void,
  setAgentFiles: (files: AgentFile[]) => void,
  setCenarios: (entries: SectionEntry[]) => void,
  setEtapas: (entries: SectionEntry[]) => void,
  setTomDeVoz: (entries: SectionEntry[]) => void,
  setSystemTools: (tools: SystemToolsState) => void,
  setSystemToolSettings: (settings: SystemToolSetting) => void
) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  const handleUpdate = useCallback((updates: Partial<Agent>) => {
    setAgent((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const fetchAgentDetails = useCallback(async () => {
    if (!id || id === "create") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await agentsApi.get(id);
      const raw = response.data as unknown as Record<string, unknown>;

      const conversationConfig = (raw.conversation_config || {}) as Record<string, unknown>;
      const platformSettings = (raw.platform_settings || {}) as Record<string, unknown>;
      const modelConfig = (conversationConfig.model || {}) as Record<string, unknown>;
      const transcriberConfig = (conversationConfig.transcriber || {}) as Record<string, unknown>;
      const voiceConfig = (conversationConfig.voice || {}) as Record<string, unknown>;
      const systemToolsRaw = (conversationConfig.system_tools || {}) as Record<string, unknown>;
      const promptSectionsRaw = (conversationConfig.prompt_sections || {}) as Record<string, unknown>;

      // Map backend response into Assistant Agent shape
      const agentData: Agent = {
        id: (raw.id || "") as string,
        name: (raw.name || "") as string,
        provider: (modelConfig.provider as string) || "openai",
        model: (modelConfig.model as string) || "",
        language:
          (transcriberConfig.language as string) ||
          (platformSettings.language as string) ||
          "english",
        first_message_mode: ((conversationConfig.first_message_mode as string) || "text") as
          | "text"
          | "audio",
        first_message: (conversationConfig.first_message as string) || "",
        voice_id:
          (conversationConfig.voice_id as string) ||
          (voiceConfig.voice_id as string) ||
          (platformSettings.voice_id as string) ||
          "",
        hipaa_compliance: false,
        audio_recording: false,
        logging: false,
        transcript: false,
        video_recording: false,
        // Preserve optional fields for tools and sections (populated below)
        elevenlabs_agent_id: (raw.elevenlabs_agent_id as string) || undefined,
        widget_config: (raw.widget_config as Record<string, unknown>) || undefined,
        webhook_tools: (raw.webhook_tools || conversationConfig.webhook_tools || []) as WebhookTool[],
        client_tools: (raw.client_tools || conversationConfig.client_tools || []) as ClientTool[],
        agent_integrations: undefined,
        agent_files: raw.agent_files as AgentFile[] | undefined,
        prompt_sections: promptSectionsRaw as Agent["prompt_sections"],
        system_tools: systemToolsRaw as Agent["system_tools"],
      };

      setAgent(agentData);

      // Extract tools and settings
      const webhookTools = (raw.webhook_tools || conversationConfig.webhook_tools || []) as WebhookTool[];
      const clientTools = (raw.client_tools || conversationConfig.client_tools || []) as ClientTool[];

      if (webhookTools.length) setWebhookTools(webhookTools);
      if (clientTools.length) setClientTools(clientTools);

      // Map integration_tools hash into AgentIntegrationTool[]
      if (raw.integration_tools) {
        const integrations: AgentIntegrationTool[] = [];
        const integrationHash = raw.integration_tools as Record<
          string,
          { enabled: boolean; enabled_tools: string[] }
        >;

        Object.entries(integrationHash).forEach(([integration_type, cfg]) => {
          (cfg.enabled_tools || []).forEach((tool_name) => {
            integrations.push({
              integration_type,
              tool_name,
              enabled: !!cfg.enabled,
            });
          });
        });

        if (integrations.length) {
          setAgentIntegrationTools(integrations);
        }
      }

      if (raw.agent_files) {
        // Normalize file structure to ensure both name/file_name and size/file_size are available
        const normalizedFiles: AgentFile[] = (raw.agent_files as unknown[]).map((file: unknown) => {
          if (typeof file === "object" && file !== null) {
            const f = file as Record<string, unknown>;
            return {
              id: (typeof f.id === "string" ? f.id : ""),
              name: (typeof f.name === "string" ? f.name : (typeof f.file_name === "string" ? f.file_name : "")),
              size: (typeof f.size === "number" ? f.size : (typeof f.file_size === "number" ? f.file_size : 0)),
              type: (typeof f.type === "string" ? f.type : (typeof f.content_type === "string" ? f.content_type : undefined)),
              file_name: (typeof f.file_name === "string" ? f.file_name : (typeof f.name === "string" ? f.name : "")),
              file_size: (typeof f.file_size === "number" ? f.file_size : (typeof f.size === "number" ? f.size : 0)),
              elevenlabs_document_id: (typeof f.elevenlabs_document_id === "string" ? f.elevenlabs_document_id : undefined),
            };
          }
          return {
            id: "",
            name: "",
            size: 0,
          };
        });
        setAttachedFiles(normalizedFiles);
        setAgentFiles(normalizedFiles);
      }
      
      // Extract prompt sections from conversation_config.prompt_sections
      const sections = promptSectionsRaw as {
        scenarios?: unknown[];
        phases?: unknown[];
        voiceTone?: unknown[];
      };
      const ensureEntryIds = (entries: unknown[] | undefined): SectionEntry[] => {
        return (entries || []).map((entry) => {
          if (typeof entry === "object" && entry !== null) {
            const e = entry as Record<string, unknown>;
            return {
              id: (typeof e.id === "string" ? e.id : generateSectionEntryId()),
              title: (typeof e.title === "string" ? e.title : ""),
              description: (typeof e.description === "string" ? e.description : ""),
              notes: (typeof e.notes === "string" ? e.notes : ""),
            };
          }
          return {
            id: generateSectionEntryId(),
            title: "",
            description: "",
            notes: "",
          };
        });
      };

      setCenarios(ensureEntryIds(sections.scenarios));
      setEtapas(ensureEntryIds(sections.phases));
      setTomDeVoz(ensureEntryIds(sections.voiceTone));

      // Extract system tools from conversation_config.system_tools
      if (Object.keys(systemToolsRaw).length > 0) {
        const st = systemToolsRaw as {
          end_call?: boolean;
          detect_language?: boolean;
          skip_turn?: boolean;
          transfer_to_agent?: { enabled?: boolean; transferRules?: TransferRule[]; transfer_rules?: TransferRule[] };
          transfer_to_number?: { enabled?: boolean; humanTransferRules?: HumanTransferRule[]; human_transfer_rules?: HumanTransferRule[] };
          play_keypad_touch_tone?: boolean;
          voicemail_detection?: boolean;
        };
        const tools: SystemToolsState = {
          end_call: !!st.end_call,
          detect_language: !!st.detect_language,
          skip_turn: !!st.skip_turn,
          transfer_to_agent: !!(st.transfer_to_agent && (st.transfer_to_agent.enabled ?? true)),
          transfer_to_number: !!(st.transfer_to_number && (st.transfer_to_number.enabled ?? true)),
          play_keypad_touch_tone: !!st.play_keypad_touch_tone,
          voicemail_detection: !!st.voicemail_detection,
        };
        setSystemTools(tools);
        
        const settings: SystemToolSetting = {
          transferRules: st.transfer_to_agent?.transferRules || st.transfer_to_agent?.transfer_rules || [],
          humanTransferRules: st.transfer_to_number?.humanTransferRules || st.transfer_to_number?.human_transfer_rules || [],
        };
        setSystemToolSettings(settings);
      }

    } catch (error) {
      console.error("Failed to fetch agent details:", error);
      toast({
        title: "Error",
        description: "Failed to load assistant details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, setWebhookTools, setClientTools, setAgentIntegrationTools, setAttachedFiles, setAgentFiles, setCenarios, setEtapas, setTomDeVoz, setSystemTools, setSystemToolSettings, toast]);

  const buildConfiguration = useCallback((
    webhookTools: WebhookTool[],
    clientTools: ClientTool[],
    agentIntegrationTools: AgentIntegrationTool[],
    scenarios: SectionEntry[],
    phases: SectionEntry[],
    voiceTone: SectionEntry[],
    systemTools: SystemToolsState,
    systemToolSettings: SystemToolSetting
  ) => {
    if (!agent) return null;

    return {
      ...agent,
      webhook_tools: webhookTools,
      client_tools: clientTools,
      agent_integrations: agentIntegrationTools,
      prompt_sections: {
        scenarios,
        phases,
        voiceTone,
      },
      system_tools: {
        ...systemTools,
        transfer_to_agent: {
          enabled: systemTools.transfer_to_agent,
          transferRules: systemToolSettings.transferRules,
        },
        transfer_to_number: {
          enabled: systemTools.transfer_to_number,
          humanTransferRules: systemToolSettings.humanTransferRules,
        }
      }
    };
  }, [agent]);

  const handleSave = useCallback(async (
    webhookTools: WebhookTool[],
    clientTools: ClientTool[],
    agentIntegrationTools: AgentIntegrationTool[],
    scenarios: SectionEntry[],
    phases: SectionEntry[],
    voiceTone: SectionEntry[],
    systemTools: SystemToolsState,
    systemToolSettings: SystemToolSetting,
    attachedFiles: AgentFile[],
    systemToolSettingsMap?: Record<string, SystemToolSetting>
  ) => {
    if (!agent) return;

    try {
      setSaving(true);
      
      // Build system tools payload with description and disableInterruptions for each tool
      const systemToolsForConfig: Record<string, unknown> = {};
      
      // Add each enabled tool with its settings
      Object.entries(systemTools).forEach(([toolKey, enabled]) => {
        if (!enabled) {
          systemToolsForConfig[toolKey] = false;
          return;
        }

        // Get settings from map first, then fall back to systemToolSettings
        // The map should always have the latest settings, but we fall back to systemToolSettings
        // for transfer tools or if the map doesn't have an entry yet
        let toolSettings = systemToolSettingsMap?.[toolKey];
        if (!toolSettings) {
          // For transfer tools, always use systemToolSettings as fallback
          if (toolKey === "transfer_to_agent" || toolKey === "transfer_to_number") {
            toolSettings = systemToolSettings;
          } else if (systemToolSettings) {
            // For non-transfer tools, use systemToolSettings if it exists
            // (it should match the current tool if the settings panel is open for this tool)
            toolSettings = systemToolSettings;
          }
        }
        
        // If still no settings, create default settings
        if (!toolSettings) {
          toolSettings = {
            name: toolKey,
            description: "",
            disableInterruptions: false,
          };
        }

        if (toolKey === "transfer_to_agent") {
          systemToolsForConfig[toolKey] = {
            active: true,
            description: toolSettings?.description ?? "",
            disable_interruptions: toolSettings?.disableInterruptions ?? false,
            transfer_rules: toolSettings?.transferRules ?? [],
          };
        } else if (toolKey === "transfer_to_number") {
          systemToolsForConfig[toolKey] = {
            active: true,
            description: toolSettings?.description ?? "",
            disable_interruptions: toolSettings?.disableInterruptions ?? false,
            human_transfer_rules: toolSettings?.humanTransferRules ?? [],
          };
        } else {
          // For other tools, include active flag, description and disableInterruptions if available
          systemToolsForConfig[toolKey] = {
            active: true,
            description: toolSettings?.description ?? "",
            disable_interruptions: toolSettings?.disableInterruptions ?? false,
          };
        }
      });

      // Build conversation_config with all the nested fields
      const conversationConfig: Record<string, unknown> = {
        voice_id: agent.voice_id || undefined,
        first_message: agent.first_message || undefined,
        first_message_mode: agent.first_message_mode || undefined,
        webhook_tools: webhookTools,
        client_tools: clientTools,
        system_tools: systemToolsForConfig,
        // Preserve structured prompt sections for UI
        prompt_sections: {
          scenarios,
          phases,
          voiceTone,
        },
      };

      // Add model configuration if provider and model are set
      if (agent.provider || agent.model) {
        conversationConfig.model = {
          provider: agent.provider || 'openai',
          model: agent.model || '',
        };
      }

      // Add transcriber configuration if language is set
      if (agent.language) {
        conversationConfig.transcriber = {
          language: agent.language,
        };
      }

      // Build system prompt from prompt sections
      const systemPromptParts: string[] = [];
      if (scenarios.length > 0 || phases.length > 0 || voiceTone.length > 0) {
        scenarios.forEach(s => {
          if (s.title || s.description) {
            systemPromptParts.push(`## ${s.title || 'Untitled'}\n${s.description || ''}`);
          }
        });
        phases.forEach(p => {
          if (p.title || p.description) {
            systemPromptParts.push(`## ${p.title || 'Untitled'}\n${p.description || ''}`);
          }
        });
        voiceTone.forEach(v => {
          if (v.title || v.description) {
            systemPromptParts.push(`## ${v.title || 'Untitled'}\n${v.description || ''}`);
          }
        });
      }

      if (systemPromptParts.length > 0) {
        const modelConfig = (conversationConfig.model as Record<string, unknown>) || {};
        modelConfig.messages = [
          {
            role: 'system',
            content: systemPromptParts.join('\n\n')
          }
        ];
        conversationConfig.model = modelConfig;
      }

      // Build system tools payload with description and disableInterruptions for each tool
      const systemToolsPayload: Record<string, unknown> = {};
      
      // Add each enabled tool with its settings
      Object.entries(systemTools).forEach(([toolKey, enabled]) => {
        if (!enabled) {
          systemToolsPayload[toolKey] = false;
          return;
        }

        const toolSettings = systemToolSettingsMap?.[toolKey] || 
          (toolKey === "transfer_to_agent" || toolKey === "transfer_to_number" ? systemToolSettings : undefined);

        if (toolKey === "transfer_to_agent") {
          systemToolsPayload[toolKey] = {
            active: true,
            description: toolSettings?.description || "",
            disable_interruptions: toolSettings?.disableInterruptions || false,
            transfer_rules: toolSettings?.transferRules || [],
          };
        } else if (toolKey === "transfer_to_number") {
          systemToolsPayload[toolKey] = {
            active: true,
            description: toolSettings?.description || "",
            disable_interruptions: toolSettings?.disableInterruptions || false,
            human_transfer_rules: toolSettings?.humanTransferRules || [],
          };
        } else {
          // For other tools, include active flag, description and disableInterruptions if available
          systemToolsPayload[toolKey] = {
            active: true,
            description: toolSettings?.description || "",
            disable_interruptions: toolSettings?.disableInterruptions || false,
          };
        }
      });

      const basePayload = {
        name: agent.name,
        conversation_config: conversationConfig,
        system_tools: systemToolsPayload,
        webhook_tools: webhookTools,
        client_tools: clientTools,
      };

      // Transform integration_tools array into hash format expected by backend
      // Backend expects: { "pipedrive" => { "enabled_tools" => ["get_deal", ...] }, ... }
      let integrationToolsPayload: Record<string, { enabled_tools: string[] }> | undefined = undefined;
      if (agentIntegrationTools.length > 0) {
        integrationToolsPayload = {};
        agentIntegrationTools.forEach(tool => {
          if (!integrationToolsPayload![tool.integration_type]) {
            integrationToolsPayload![tool.integration_type] = { enabled_tools: [] };
          }
          if (tool.enabled) {
            integrationToolsPayload![tool.integration_type].enabled_tools.push(tool.tool_name);
          }
        });
      }

      // Add integration_tools if there are any (backend handles this separately)
      const payload = integrationToolsPayload
        ? { ...basePayload, integration_tools: integrationToolsPayload }
        : basePayload;

      if (id === "create" || !id) {
        // Use payload (which includes integration_tools) instead of basePayload
        const response = await agentsApi.create(payload as Parameters<typeof agentsApi.create>[0]);
        // If creating, update the agent with the response data
        if (response.data) {
          setAgent(response.data as Agent);
        }
      } else {
        await agentsApi.update(id, payload as unknown as Parameters<typeof agentsApi.update>[1]);
        // Refresh the agent data after saving to ensure UI is in sync
        await fetchAgentDetails();
      }

      toast({
        title: "Success",
        description: "Assistant saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save agent:", error);
      toast({
        title: "Error",
        description: "Failed to save assistant.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [agent, id, fetchAgentDetails, toast]);

  const handlePublish = useCallback(async () => {
    if (!id || id === "create") return;

    try {
      setPublishing(true);
      await agentsApi.publish(id);
      
      // Refresh agent data to get updated webhook tools created by the backend
      await fetchAgentDetails();
      
      toast({
        title: "Success",
        description: "Assistant deployed successfully.",
      });
    } catch (error) {
      console.error("Failed to publish agent:", error);
      toast({
        title: "Error",
        description: "Failed to deploy assistant.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  }, [id, toast, fetchAgentDetails]);

  return {
    agent,
    setAgent,
    loading,
    saving,
    publishing,
    fetchAgentDetails,
    buildConfiguration,
    handleSave,
    handlePublish,
    handleUpdate
  };
}
