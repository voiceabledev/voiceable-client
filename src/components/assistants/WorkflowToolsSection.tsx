import React, { useMemo } from "react";
import { Workflow } from "lucide-react";
import { TabSectionCard } from "./TabSectionCard";
import { Badge } from "@/components/ui/badge";
import type { WorkflowV1 } from "@/types/workflow-v1";

type WorkflowToolsSectionProps = {
  workflow: WorkflowV1 | null;
  expanded: boolean;
  onToggleExpanded: () => void;
};

interface WorkflowTool {
  id: string;
  name: string;
  type: string;
  nodeType: string;
  description?: string;
}

export const WorkflowToolsSection: React.FC<WorkflowToolsSectionProps> = ({
  workflow,
  expanded,
  onToggleExpanded,
}) => {
  const workflowTools = useMemo(() => {
    if (!workflow || !workflow.nodes) return [];

    const tools: WorkflowTool[] = [];
    
    workflow.nodes.forEach((node) => {
      const nodeType = node.type;
      const config = node.config || {};

      // Extract tools based on node type
      switch (nodeType) {
        case 'api-request':
          tools.push({
            id: node.id,
            name: node.name || `API Request ${node.id}`,
            type: 'webhook',
            nodeType: 'api-request',
            description: (config as Record<string, unknown>).description as string || 'Workflow API request'
          });
          break;
        case 'google-sheets-action':
        case 'google-sheets-new-row':
        case 'google-sheets-row-updated':
          tools.push({
            id: node.id,
            name: node.name || `Google Sheets ${node.id}`,
            type: 'integration',
            nodeType: nodeType,
            description: (config as Record<string, unknown>).description as string || 'Workflow Google Sheets action'
          });
          break;
        case 'make-call':
          tools.push({
            id: node.id,
            name: node.name || `Make Call ${node.id}`,
            type: 'system',
            nodeType: 'make-call',
            description: (config as Record<string, unknown>).description as string || 'Workflow make call action'
          });
          break;
      }
    });

    return tools;
  }, [workflow]);

  const toolCount = workflowTools.length;

  if (toolCount === 0) {
    return null; // Don't show section if no workflow tools
  }

  return (
    <TabSectionCard
      title="Workflow tools"
      description="Tools defined in the workflow. These are automatically synced to the agent."
      count={`${toolCount} tool${toolCount !== 1 ? "s" : ""}`}
      collapsible={true}
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      <div className="space-y-2">
        {workflowTools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-start justify-between p-3 rounded-lg border border-border bg-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{tool.name}</span>
                <Badge variant="outline" className="text-xs">
                  {tool.type}
                </Badge>
              </div>
              {tool.description && (
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Node type: {tool.nodeType}
              </p>
            </div>
          </div>
        ))}
      </div>
    </TabSectionCard>
  );
};

