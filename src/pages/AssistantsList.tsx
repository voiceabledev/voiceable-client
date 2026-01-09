import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Loader2,
  Bot
} from "lucide-react";
import { agentsApi, Agent, voicesApi, Voice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Template-related code moved to wizard


export default function AssistantsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceNameMap, setVoiceNameMap] = useState<Record<string, string>>({});

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

  useEffect(() => {
    fetchAgents();
    fetchVoices();
  }, [fetchAgents, fetchVoices]);

  const filteredAssistants = assistants.filter((assistant) =>
    (assistant.name || 'Unnamed Agent').toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAssistantClick = (assistant: Agent) => {
    const identifier = assistant.slug || assistant.id;
    navigate(`/assistants/${identifier}`);
  };

  const handleCreateAssistant = () => {
    // Navigate directly to wizard instead of showing modal
    navigate("/assistants/create", {
      state: {
        templateId: null,
        assistantName: "New Assistant",
      }
    });
  };

  // Template selection and modal logic removed - now handled in wizard

  const handleDeleteAssistant = async (assistant: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${assistant.name || 'this assistant'}"? This will delete the agent from both ElevenLabs and your local database.`)) {
      return;
    }

    try {
      const identifier = assistant.slug || assistant.id;
      await agentsApi.delete(identifier);
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
            {/* <a 
              href="https://docs.voiceable.dev/" 
              className="text-muted-foreground hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center gap-1 text-xs">
                Docs <ExternalLink className="h-3 w-3" />
              </span>
            </a> */}
          </div>
          {assistants.length > 0 && (
            <Button 
              variant="default" 
              className="gap-2"
              onClick={handleCreateAssistant}
            >
              <Plus className="h-4 w-4" />
              Create Assistant
            </Button>
          )}
        </div>
        
        {/* Search - Only show when there are assistants */}
        {assistants.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Assistants" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        )}
      </div>

      {/* Assistants List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading agents...</p>
          </div>
        ) : filteredAssistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {searchQuery ? (
              // Search results empty state
              <>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No assistants found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search query
                </p>
              </>
            ) : (
              // No assistants empty state
              <>
                <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Assistants</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-2 max-w-md">
                  Assistants are voice AI chat bots used for phone calls and widget integrations.
                </p>
                <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
                  You can fully configure them to your business's needs, and we support all major models and providers.
                </p>
                <Button 
                  onClick={handleCreateAssistant}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Assistant
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleAssistantClick(assistant)}
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
                        handleAssistantClick(assistant);
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

      {/* Modal and confirmation dialogs removed - template selection now happens in wizard */}
    </div>
  );
}
