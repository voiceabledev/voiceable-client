import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Play,
  Square,
  AudioLines,
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { voicesApi, Voice, VoiceFilters } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function VoiceLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all-gender");
  const [accentFilter, setAccentFilter] = useState<string>("all-accent");
  const [providerFilter, setProviderFilter] = useState<string>("11labs");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoices();
  }, [genderFilter, accentFilter]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: VoiceFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (genderFilter && genderFilter !== 'all-gender') filters.gender = genderFilter;
      if (accentFilter && accentFilter !== 'all-accent') filters.accent = accentFilter;

      const response = await voicesApi.list(filters);
      
      if (response.data) {
        setVoices(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voices';
      setError(errorMessage);
      
      // Check if it's a missing API key error
      if (errorMessage.includes('API key')) {
        toast({
          title: 'ElevenLabs API key required',
          description: 'Please add your ElevenLabs API key in settings to view voices.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error loading voices',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchVoices();
  };

  const handlePlayPreview = (voice: Voice) => {
    if (!voice.preview_url) return;

    // Stop currently playing audio if any
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    // Create and play new audio
    const audio = new Audio(voice.preview_url);
    currentAudioRef.current = audio;
    setPlayingVoiceId(voice.id || null);

    // Handle when audio ends
    audio.addEventListener('ended', () => {
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', () => {
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });

    audio.play().catch((err) => {
      console.error('Error playing preview:', err);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });
  };

  const getGenderLabel = (voice: Voice): string => {
    return voice.labels?.gender?.toUpperCase() || '';
  };

  const getAccentLabel = (voice: Voice): string => {
    return voice.labels?.accent?.toUpperCase() || '';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <AudioLines className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Voice Library</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search voices..." 
              className="pl-9 bg-secondary/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11labs">11labs</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-gender">Gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accentFilter} onValueChange={setAccentFilter}>
            <SelectTrigger className="w-28 bg-secondary/50 border-border">
              <SelectValue placeholder="Accent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-accent">Accent</SelectItem>
              <SelectItem value="american">American</SelectItem>
              <SelectItem value="british">British</SelectItem>
              <SelectItem value="australian">Australian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading voices...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading voices</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
              {error.includes('API key') && (
                <Button onClick={() => navigate('/settings')} variant="default">
                  Go to Settings
                </Button>
              )}
            </div>
          ) : voices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AudioLines className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No voices found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'Try adjusting your search or filters.' : 'No voices available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {voices.map((voice, index) => {
                const gender = getGenderLabel(voice);
                const accent = getAccentLabel(voice);
                
                return (
                  <div
                    key={voice.id || index}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <AudioLines className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{voice.name}</h3>
                        {voice.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {voice.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {gender && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                              {gender}
                            </span>
                          )}
                          {accent && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                              {accent}
                            </span>
                          )}
                          {voice.category && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                              {voice.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {voice.preview_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(voice);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-secondary rounded-md"
                          title={playingVoiceId === voice.id ? "Stop preview" : "Play preview"}
                        >
                          {playingVoiceId === voice.id ? (
                            <Square className="h-4 w-4 text-primary fill-primary" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
