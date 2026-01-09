import React, { useState, useMemo } from "react";
import { Settings, Globe, Plug } from "lucide-react";
import { SystemToolsSection } from "./SystemToolsSection";
import { ExternalToolsSection } from "./ExternalToolsSection";
import { AgentIntegrationToolsSection } from "@/components/integrations/AgentIntegrationToolsSection";
import {
  INTEGRATION_TOOLS_DISPLAY,
  getIntegrationIcon,
  formatToolName,
  displayNameToActionName,
} from "@/constants/assistant";
import type { 
  SystemToolsState, 
  WebhookTool, 
  ClientTool, 
  AgentIntegrationTool,
  UserIntegration 
} from "@/types/assistant";

type ToolsTabProps = {
  systemTools: SystemToolsState;
  onToggleSystemTool: (key: keyof SystemToolsState) => void;
  onOpenSystemToolSettings?: (key: keyof SystemToolsState) => void;
  webhookTools: WebhookTool[];
  clientTools: ClientTool[];
  onAddWebhook: () => void;
  onEditWebhook: (tool: WebhookTool) => void;
  onDeleteWebhook: (id: string) => void;
  onAddClientTool: () => void;
  onEditClientTool: (tool: ClientTool) => void;
  onDeleteClientTool: (id: string) => void;
  agentIntegrationTools: AgentIntegrationTool[];
  userIntegrations: UserIntegration[];
  integrationToolsExpanded: Record<string, boolean>;
  onToggleIntegrationExpand: (id: string) => void;
  onToggleIntegrationTool: (integrationId: string, toolName: string, enabled: boolean) => void;
  onDeleteIntegrationTool: (id: string) => void;
  onAddIntegration: () => void;
  onEditIntegration: (integration: UserIntegration | string) => void;
  onDeleteIntegration: (id: string) => Promise<void>;
  agentId?: string;
};

export const ToolsTab: React.FC<ToolsTabProps> = ({
  systemTools,
  onToggleSystemTool,
  onOpenSystemToolSettings,
  webhookTools,
  clientTools,
  onAddWebhook,
  onEditWebhook,
  onDeleteWebhook,
  onAddClientTool,
  onEditClientTool,
  onDeleteClientTool,
  agentIntegrationTools,
  userIntegrations,
  integrationToolsExpanded,
  onToggleIntegrationExpand,
  onToggleIntegrationTool,
  onDeleteIntegrationTool,
  onAddIntegration,
  onEditIntegration,
  onDeleteIntegration,
  agentId,
}) => {
  const [integrationToolsSectionExpanded, setIntegrationToolsSectionExpanded] = useState(false);
  const [systemToolsSectionExpanded, setSystemToolsSectionExpanded] = useState(false);
  const [externalToolsSectionExpanded, setExternalToolsSectionExpanded] = useState(false);

  // Transform agentIntegrationTools array to Record format expected by AgentIntegrationToolsSection
  const agentIntegrationToolsRecord = useMemo(() => {
    const record: Record<string, { enabled: boolean; enabledTools: string[] }> = {};
    
    agentIntegrationTools.forEach(tool => {
      if (!record[tool.integration_type]) {
        record[tool.integration_type] = {
          enabled: true,
          enabledTools: [],
        };
      }
      if (tool.enabled) {
        record[tool.integration_type].enabledTools.push(tool.tool_name);
      }
    });
    
    return record;
  }, [agentIntegrationTools]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Settings className="h-4 w-4" />
          <span>SYSTEM TOOLS</span>
        </div>
        <SystemToolsSection
          systemTools={systemTools}
          onToggleTool={(key, checked) => onToggleSystemTool(key as keyof SystemToolsState)}
          onOpenSettings={onOpenSystemToolSettings ? (key) => onOpenSystemToolSettings(key as keyof SystemToolsState) : undefined}
          expanded={systemToolsSectionExpanded}
          onToggleExpanded={() => setSystemToolsSectionExpanded(prev => !prev)}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Plug className="h-4 w-4" />
          <span>INTEGRATION TOOLS</span>
        </div>
        <AgentIntegrationToolsSection
          agentIntegrationTools={agentIntegrationToolsRecord}
          integrationToolsSectionExpanded={integrationToolsSectionExpanded}
          integrationToolsExpanded={integrationToolsExpanded}
          onToggleSectionExpanded={() => setIntegrationToolsSectionExpanded(prev => !prev)}
          onToggleIntegrationExpanded={onToggleIntegrationExpand}
          onOpenAddIntegrationModal={onAddIntegration}
          onOpenEditIntegrationModal={(integrationType) => {
            // Pass the integration type directly - the hook will handle fetching if needed
            onEditIntegration(integrationType);
          }}
          onDeleteIntegration={async (integrationType) => {
            // Find the user integration by type to get its ID
            const userIntegration = userIntegrations.find(i => i.integration_type === integrationType);
            if (userIntegration?.id) {
              await onDeleteIntegration(String(userIntegration.id));
            }
          }}
          onToggleTool={onToggleIntegrationTool}
          INTEGRATION_TOOLS_DISPLAY={INTEGRATION_TOOLS_DISPLAY}
          getIntegrationIcon={getIntegrationIcon}
          formatToolName={formatToolName}
          displayNameToActionName={displayNameToActionName}
          userIntegrations={userIntegrations}
          agentId={agentId}
        />
      </div>
      
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Globe className="h-4 w-4" />
          <span>EXTERNAL TOOLS</span>
        </div>
        <ExternalToolsSection
          webhooks={webhookTools}
          clientTools={clientTools}
          onAddWebhook={onAddWebhook}
          onEditWebhook={(id) => {
            const tool = webhookTools.find(t => t.id === id);
            if (tool) onEditWebhook(tool);
          }}
          onDeleteWebhook={onDeleteWebhook}
          onEditClientTool={(id) => {
            const tool = clientTools.find(t => t.id === id);
            if (tool) onEditClientTool(tool);
          }}
          onDeleteClientTool={onDeleteClientTool}
          expanded={externalToolsSectionExpanded}
          onToggleExpanded={() => setExternalToolsSectionExpanded(prev => !prev)}
        />
      </div>
    </div>
  );
};
