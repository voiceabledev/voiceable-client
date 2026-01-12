import React, { useState, useMemo } from "react";

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
  const [integrationToolsSectionExpanded, setIntegrationToolsSectionExpanded] = useState(true);


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
  );
};
