import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import type { FlowTemplate } from "@/constants/assistant";
import { INTEGRATION_FLOW_TEMPLATES, INTEGRATION_METADATA } from "@/constants/assistant";
import type { AgentIntegrationTool } from "@/types/assistant";

interface AddFlowTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: FlowTemplate) => void;
  integrationTools?: AgentIntegrationTool[];
}

export function AddFlowTemplateModal({ 
  isOpen, 
  onClose, 
  onSelect,
  integrationTools = [] 
}: AddFlowTemplateModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get available templates filtered by enabled integrations
  const availableTemplates = useMemo(() => {
    const templates: FlowTemplate[] = [];
    
    // Get enabled integration types
    const enabledIntegrationTypes = new Set(
      integrationTools
        .filter(tool => tool.enabled)
        .map(tool => tool.integration_type)
    );

    // Add templates for enabled integrations
    Object.entries(INTEGRATION_FLOW_TEMPLATES).forEach(([integrationType, templateList]) => {
      if (enabledIntegrationTypes.has(integrationType)) {
        templates.push(...templateList);
      }
    });

    return templates;
  }, [integrationTools]);

  // Filter templates by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return availableTemplates;
    const query = searchQuery.toLowerCase();
    return availableTemplates.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.integrationType.toLowerCase().includes(query)
    );
  }, [availableTemplates, searchQuery]);

  const handleSelectTemplate = (template: FlowTemplate) => {
    onSelect(template);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const getIntegrationMetadata = (integrationType: string) => {
    return INTEGRATION_METADATA[integrationType] || {
      name: integrationType,
      icon: "🔗",
      iconBg: "bg-gray-500"
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Flow Template</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select a pre-configured flow template to add to your workflow
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>

        {/* Templates List */}
        <div className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                {availableTemplates.length === 0
                  ? "No flow templates available. Enable integrations to see templates."
                  : "No templates match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.map((template) => {
                const metadata = getIntegrationMetadata(template.integrationType);
                const isStringIcon = typeof metadata.icon === 'string';
                
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left group"
                  >
                    {/* Integration Icon */}
                    <div className={`p-3 rounded-lg ${metadata.iconBg} flex-shrink-0`}>
                      {isStringIcon ? (
                        <span className="text-white text-lg">{metadata.icon}</span>
                      ) : (
                        <metadata.icon className="h-5 w-5 text-white" />
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            {template.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>

                      {/* Flow Preview */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.nodes.map((node, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-secondary rounded text-xs font-medium text-foreground">
                              {node.name}
                            </div>
                            {index < template.nodes.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Template Metadata */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>{template.nodes.length} {template.nodes.length === 1 ? 'node' : 'nodes'}</span>
                        <span>•</span>
                        <span>{template.connections.length} {template.connections.length === 1 ? 'connection' : 'connections'}</span>
                        <span>•</span>
                        <span className="capitalize">{metadata.name}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

