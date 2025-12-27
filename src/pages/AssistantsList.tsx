import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  Heart,
  Star,
  Calendar,
  FileText,
  MessageCircle,
  Target,
  ClipboardList
} from "lucide-react";
import { agentsApi, Agent, voicesApi, Voice, agentTemplatesApi, AgentTemplate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
  systemPrompt?: string;
  firstMessage?: string;
}

// Icon mapping for built-in icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'plus': Plus,
  'heart': Heart,
  'star': Star,
  'calendar': Calendar,
  'message-circle': MessageCircle,
  'target': Target,
  'clipboard-list': ClipboardList,
};


export default function AssistantsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assistantName, setAssistantName] = useState("New Assistant");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [voiceNameMap, setVoiceNameMap] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agentsApi.list();
      
      if (response.data && Array.isArray(response.data)) {
        setAssistants(response.data);
      } else {
        setAssistants([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setAssistants([]);
      toast({
        title: 'Error loading agents',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchVoices = useCallback(async () => {
    try {
      const response = await voicesApi.list();
      if (response.data && Array.isArray(response.data)) {
        const map: Record<string, string> = {};
        response.data.forEach((voice: Voice) => {
          map[voice.id] = voice.name;
        });
        setVoiceNameMap(map);
      }
    } catch (err) {
      // Silently fail - voice names are not critical for the list view
      console.error('Failed to fetch voices:', err);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const response = await agentTemplatesApi.list();
      if (response.data && Array.isArray(response.data)) {
        const mappedTemplates: Template[] = response.data.map((template: AgentTemplate) => {
          // Map icon_name to React component or use icon_url
          let icon: React.ComponentType<{ className?: string }> | string = Plus; // default
          if (template.icon_name && iconMap[template.icon_name]) {
            icon = iconMap[template.icon_name];
          } else if (template.icon_url) {
            icon = template.icon_url;
          }

          return {
            id: template.id.toString(),
            title: template.title,
            description: template.description,
            icon: icon,
            systemPrompt: template.system_prompt || undefined,
            firstMessage: template.first_message || undefined,
          };
        });
        setTemplates(mappedTemplates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setTemplatesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgents();
    fetchVoices();
    fetchTemplates();
  }, [fetchAgents, fetchVoices, fetchTemplates]);

  const filteredAssistants = assistants.filter((assistant) =>
    (assistant.name || 'Unnamed Agent').toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAssistantClick = (assistantId: string) => {
    navigate(`/assistants/${assistantId}`);
  };

  const handleCreateAssistant = () => {
    setShowCreateModal(true);
    setAssistantName("New Assistant");
    setSelectedTemplate(null);
  };

  const getTemplateDefaultName = (templateId: string): string => {
    // Try to find template by ID and use its title
    const template = templates.find(t => t.id === templateId);
    if (template && template.title !== "Blank Template") {
      return template.title;
    }
    
    // Fallback to legacy mapping for backwards compatibility
    const nameMap: Record<string, string> = {
      "care-coordinator": "Care Coordinator Assistant",
      "customer-support": "Customer Support Assistant",
      "lead-qualification": "Lead Qualification Assistant",
      "appointment-scheduler": "Appointment Scheduler",
      "info-collector": "Info Collector Assistant",
      "feedback-gatherer": "Feedback Collection Assistant",
    };
    return nameMap[templateId] || "New Assistant";
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Auto-generate name based on template (except for blank)
    const template = templates.find(t => t.id === templateId);
    if (template && template.title !== "Blank Template") {
      setAssistantName(template.title);
    } else if (templateId === "blank") {
      setAssistantName("New Assistant");
    } else {
      setAssistantName(getTemplateDefaultName(templateId));
    }
    
    // If blank template is selected, redirect to wizard
    if (templateId === "blank" || (template && template.title === "Blank Template")) {
      setShowCreateModal(false);
      navigate("/assistants/create", {
        state: {
          templateId: null,
          assistantName: "New Assistant",
        }
      });
    } else {
      // For other templates, store the selection but don't navigate yet
      // User needs to click "Create Assistant" button
    }
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate || selectedTemplate === "blank") {
      return;
    }
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      return;
    }
    
    // Navigate to wizard with template data, skipping name step since we already have a name
    setShowCreateModal(false);
    navigate("/assistants/create", {
      state: {
        templateId: selectedTemplate,
        assistantName: assistantName,
        systemPrompt: template.systemPrompt,
        firstMessage: template.firstMessage,
        skipNameStep: true, // Skip name step since we already have a name
      }
    });
  };

  const handleDeleteAssistant = async (assistant: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${assistant.name || 'this assistant'}"? This will delete the agent from both ElevenLabs and your local database.`)) {
      return;
    }

    try {
      await agentsApi.delete(assistant.id);
      toast({
        title: 'Success',
        description: 'Agent deleted successfully.',
      });
      // Refresh the list
      fetchAgents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold">Assistants</h1>
            <a 
              href="https://docs.voiceable.dev/" 
              className="text-muted-foreground hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-1 text-xs">
                Docs <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          </div>
          <Button 
            variant="default" 
            className="gap-2"
            onClick={handleCreateAssistant}
          >
            <Plus className="h-4 w-4" />
            Create Assistant
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Assistants" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Assistants List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading agents...</p>
          </div>
        ) : filteredAssistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No assistants found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search query" : "Get started by creating your first assistant"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateAssistant}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assistant
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleAssistantClick(assistant.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{assistant.name || 'Unnamed Agent'}</h3>
                    {assistant.tags && assistant.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {assistant.tags.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssistantClick(assistant.id);
                      }}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteAssistant(assistant, e)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2">
                  {(() => {
                    const config = assistant.conversation_config as Record<string, unknown> | undefined;
                    const platformSettings = assistant.platform_settings as Record<string, unknown> | undefined;
                    
                    // Extract model info
                    let modelInfo = "N/A";
                    if (config?.model && typeof config.model === 'object') {
                      const modelConfig = config.model as Record<string, unknown>;
                      if (typeof modelConfig.model === 'string') {
                        modelInfo = modelConfig.model;
                      }
                    }
                    
                    // Extract transcriber info
                    let transcriberInfo = "N/A";
                    if (config?.transcriber && typeof config.transcriber === 'object') {
                      const transcriberConfig = config.transcriber as Record<string, unknown>;
                      if (typeof transcriberConfig.language === 'string') {
                        // Capitalize first letter of language
                        const language = transcriberConfig.language;
                        const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1);
                        transcriberInfo = capitalizedLanguage;
                      } else if (typeof transcriberConfig.provider === 'string') {
                        transcriberInfo = transcriberConfig.provider;
                      }
                    }
                    
                    // Extract voice info
                    let voiceInfo = "N/A";
                    let voiceId: string | undefined;
                    let hasNameFromConfig = false;
                    
                    if (config?.voice_id && typeof config.voice_id === 'string') {
                      voiceId = config.voice_id;
                    } else if (config?.voice && typeof config.voice === 'object') {
                      const voiceConfig = config.voice as Record<string, unknown>;
                      if (typeof voiceConfig.voice_id === 'string') {
                        voiceId = voiceConfig.voice_id;
                      }
                      if (typeof voiceConfig.name === 'string') {
                        voiceInfo = voiceConfig.name;
                        hasNameFromConfig = true;
                      }
                    } else if (platformSettings?.voice_id && typeof platformSettings.voice_id === 'string') {
                      voiceId = platformSettings.voice_id;
                    }
                    
                    // If we have a voice ID and no name from config, try to get the name from the map
                    if (voiceId && !hasNameFromConfig) {
                      voiceInfo = voiceNameMap[voiceId] || voiceId.slice(0, 15) + '...';
                    }
                    
                    return (
                      <>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">Model:</span>
                          <span className="truncate">{modelInfo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">Transcriber:</span>
                          <span className="truncate">{transcriberInfo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">Voice:</span>
                          <span className="truncate">{voiceInfo}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assistant Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle>Create Assistant</DialogTitle>
            </div>
            <DialogDescription className="text-left pt-2">
              Choose a template
            </DialogDescription>
            <p className="text-sm text-muted-foreground text-left pt-1">
              Here's a few templates to get you started, or you can create your own template and use it to create a new assistant.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Assistant Name Input */}
            <div className="space-y-2">
              <Label htmlFor="assistant-name">Assistant Name</Label>
              <p className="text-xs text-muted-foreground">
                (This can be adjusted at any time after creation.)
              </p>
              <Input
                id="assistant-name"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="New Assistant"
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Blank Template */}
            {templates.length > 0 && templates[0]?.title === "Blank Template" && (
              <div>
                <button
                  onClick={() => handleTemplateSelect(templates[0].id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    selectedTemplate === templates[0].id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                      selectedTemplate === templates[0].id ? "bg-primary/10" : "bg-secondary/50"
                    )}>
                      {(() => {
                        const blankTemplate = templates[0];
                        if (typeof blankTemplate.icon === 'string') {
                          return (
                            <img 
                              src={blankTemplate.icon} 
                              alt={blankTemplate.title}
                              className={cn(
                                "h-6 w-6 object-contain",
                                selectedTemplate === blankTemplate.id ? "opacity-100" : "opacity-70"
                              )}
                            />
                          );
                        } else if (blankTemplate.icon) {
                          const IconComponent = blankTemplate.icon;
                          return (
                            <IconComponent className={cn(
                              "h-6 w-6",
                              selectedTemplate === blankTemplate.id ? "text-primary" : "text-muted-foreground"
                            )} />
                          );
                        } else {
                          return (
                            <Plus className={cn(
                              "h-6 w-6",
                              selectedTemplate === blankTemplate.id ? "text-primary" : "text-muted-foreground"
                            )} />
                          );
                        }
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 text-base">{templates[0].title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {templates[0].description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Quickstart Templates */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                QUICKSTART
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templatesLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  templates.slice(1).map((template) => {
                    const Icon = typeof template.icon === 'string' ? null : template.icon;
                    const iconUrl = typeof template.icon === 'string' ? template.icon : null;
                    
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 transition-all text-left",
                          selectedTemplate === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0",
                            selectedTemplate === template.id ? "bg-primary/10" : "bg-secondary/50"
                          )}>
                            {Icon ? (
                              <Icon className={cn(
                                "h-5 w-5",
                                selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                              )} />
                            ) : iconUrl ? (
                              <img 
                                src={iconUrl} 
                                alt={template.title}
                                className={cn(
                                  "h-5 w-5 object-contain",
                                  selectedTemplate === template.id ? "opacity-100" : "opacity-70"
                                )}
                              />
                            ) : (
                              <Plus className={cn(
                                "h-5 w-5",
                                selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                              )} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 text-sm">{template.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplate || selectedTemplate === "blank" || templatesLoading}
            >
              Create Assistant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
