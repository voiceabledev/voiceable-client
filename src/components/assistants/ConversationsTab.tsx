import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Loader2,
  Phone,
  Layout,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationsApi, Conversation, phoneNumbersApi, PhoneNumber, apiKeysApi, ApiKey } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ConversationDisplay extends Conversation {
  date: string;
  duration: string;
  messages: number;
  status: "Successful" | "Failed" | "In Progress";
  summary: string;
  userId: string;
}

interface ConversationsTabProps {
  assistantName: string;
  agentId?: string;
  onNavigateToPhoneNumber?: () => void;
  onNavigateToWidget?: () => void;
  onMakeFirstCall?: () => void;
}

export default function ConversationsTab({ 
  assistantName, 
  agentId, 
  onNavigateToPhoneNumber, 
  onNavigateToWidget,
  onMakeFirstCall
}: ConversationsTabProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDisplay | null>(null);
  const [conversationDetails, setConversationDetails] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [hasWidgetApiKey, setHasWidgetApiKey] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Default to last 30 days to match DashboardTab behavior
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
      
      const response = await conversationsApi.list({ 
        agent_id: agentId,
        summary_mode: 'include',
        call_start_after_unix: thirtyDaysAgo,
        call_start_before_unix: now
      });
      
      if (response.data) {
        const formattedConversations: ConversationDisplay[] = response.data.map(conv => ({
          ...conv,
          date: conv.date || 'N/A',
          duration: conv.duration || '0:00',
          messages: conv.messages || 0,
          status: conv.call_successful === 'success' ? 'Successful' : 
                  conv.call_successful === 'failure' ? 'Failed' : 
                  'In Progress' as "Successful" | "Failed" | "In Progress",
          summary: conv.summary || 'No summary available',
          userId: conv.user_id || 'Unknown User',
        }));
        setConversations(formattedConversations);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      toast({
        title: 'Error loading conversations',
        description: errorMessage,
        variant: 'destructive',
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  const fetchConversationDetails = useCallback(async (conversationId: string) => {
    try {
      const response = await conversationsApi.get(conversationId);
      if (response.data) {
        setConversationDetails(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversation details';
      toast({
        title: 'Error loading conversation details',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchPhoneNumbers = useCallback(async () => {
    if (!agentId) {
      setPhoneNumbers([]);
      return;
    }

    try {
      const response = await phoneNumbersApi.list();
      if (response.data) {
        setPhoneNumbers(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch phone numbers:", err);
      setPhoneNumbers([]);
    }
  }, [agentId]);

  const checkWidgetApiKey = useCallback(async () => {
    try {
      const response = await apiKeysApi.list();
      if (response.data) {
        const widgetKey = response.data.find(
          (key: ApiKey) => key.name === 'Widget API Key'
        );
        setHasWidgetApiKey(!!widgetKey);
      } else {
        setHasWidgetApiKey(false);
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
      setHasWidgetApiKey(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchPhoneNumbers();
    checkWidgetApiKey();
  }, [fetchConversations, fetchPhoneNumbers, checkWidgetApiKey]);

  // Fetch conversation details when one is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      fetchConversationDetails(selectedConversation.id);
    }
  }, [selectedConversation?.id, fetchConversationDetails]);

  // Initialize and manage audio element
  useEffect(() => {
    if (!audioUrl) {
      // Clean up if no audio URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsPlayerReady(false);
      return;
    }

    // Create new audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    
    // Set up event listeners
    const handleTimeUpdate = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsPlayerReady(true);
    };
    
    const handleCanPlay = () => {
      setIsPlayerReady(true);
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e, audio.error);
      setIsPlaying(false);
      setIsPlayerReady(false);
      toast({
        title: 'Audio playback error',
        description: 'Could not play conversation audio. Please try again.',
        variant: 'destructive',
      });
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    // Remove old listeners and add new ones
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('pause', handlePause);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    // Set source and preload
    audio.src = audioUrl;
    audio.preload = 'auto';
    setIsPlayerReady(false);
    audio.load();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
      }
    };
  }, [audioUrl, toast]);

  // Reset audio when conversation changes
  useEffect(() => {
    // Stop any playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlayerReady(false);
  }, [selectedConversation?.id]);

  // Get audio URL and handle authentication
  useEffect(() => {
    if (!selectedConversation?.id) {
      setAudioUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const fetchAudioUrl = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.error('No auth token available');
          setAudioUrl(null);
          return;
        }
        
        const url = `${API_BASE_URL}/conversations/${selectedConversation.id}/audio`;
        
        // Fetch audio as blob to include Authorization header
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const blob = await response.blob();
          
          // Check if blob is actually audio data
          if (blob.size === 0) {
            console.error('Audio blob is empty');
            setAudioUrl(null);
            return;
          }
          
          // Check content type
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('audio/')) {
            console.error('Invalid audio content type:', contentType);
            setAudioUrl(null);
            return;
          }
          
          objectUrl = URL.createObjectURL(blob);
          setAudioUrl(objectUrl);
        } else if (response.status === 404) {
          console.error('Audio not found for conversation');
          setAudioUrl(null);
        } else {
          console.error('Error fetching audio:', response.status, response.statusText);
          setAudioUrl(null);
        }
      } catch (error) {
        console.error('Error fetching audio:', error);
        setAudioUrl(null);
      }
    };

    fetchAudioUrl();

    // Cleanup object URL when component unmounts or conversation changes
    return () => {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      // Also cleanup any existing audioUrl state
      setAudioUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [selectedConversation?.id]);

  // Seek functions
  const handleSeekBack = useCallback(() => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, currentTime - 10);
    audioRef.current.currentTime = newTime;
  }, [currentTime]);

  const handleSeekForward = useCallback(() => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(duration || 0, currentTime + 10);
    audioRef.current.currentTime = newTime;
  }, [currentTime, duration]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if agent has a phone number assigned
  const hasPhoneNumber = agentId 
    ? phoneNumbers.some((pn) => pn.agent_id?.toString() === agentId)
    : false;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Date & Time</th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading conversations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12">
                    {searchQuery ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No conversations found matching your search.</p>
                      </div>
                    ) : !agentId ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">Please select an agent to view conversations.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-6 py-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">No conversations yet</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Start receiving conversations by setting up a phone number for voice calls or configuring the widget for web chat.
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {onNavigateToPhoneNumber && !hasPhoneNumber && (
                            <Button
                              onClick={onNavigateToPhoneNumber}
                              className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                              <Phone className="h-4 w-4" />
                              Buy Phone Number
                            </Button>
                          )}
                          {onNavigateToWidget && !hasWidgetApiKey && (
                            <Button
                              onClick={onNavigateToWidget}
                              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Layout className="h-4 w-4" />
                              Configure Widget
                            </Button>
                          )}
                          {onMakeFirstCall && hasWidgetApiKey && (
                            <Button
                              onClick={onMakeFirstCall}
                              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Phone className="h-4 w-4" />
                              Talk to the Agent
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => {
                  // Use cost from backend if available, otherwise show N/A
                  const costDisplay = conv.cost?.formatted 
                    || (conv.cost?.amount_dollars !== undefined ? `$${conv.cost.amount_dollars.toFixed(2)}` : 'N/A');
                  
                  return (
                    <tr
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "border-b border-border cursor-pointer transition-colors",
                        selectedConversation?.id === conv.id
                          ? "bg-sidebar-accent"
                          : "hover:bg-secondary/30"
                      )}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div>{conv.date || 'N/A'}</div>
                        {conv.userId && conv.userId !== 'Unknown User' && (
                          <div className="text-xs text-muted-foreground mt-1">Caller: {conv.userId}</div>
                        )}
                        {conv.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{conv.summary}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{conv.duration || '0:00'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">💰</span>
                          <span>{costDisplay}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedConversation && (
        <div className="w-[400px] border-l border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">
                Conversation with {assistantName}
              </h2>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {selectedConversation.id}
            </p>
          </div>

          {/* Audio Player */}
          <div className="p-4 border-b border-border">
            <div className="bg-secondary/30 rounded-lg p-3">
              {/* Waveform */}
              <div className="h-10 flex items-center gap-0.5 mb-3">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-muted-foreground/30 rounded-full"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!audioUrl || !audioRef.current) {
                      toast({
                        title: audioUrl === null ? 'Audio not available' : 'Loading audio',
                        description: audioUrl === null 
                          ? 'Audio is not available for this conversation. It may still be processing or the recording failed.'
                          : 'Audio is still loading. Please wait...',
                        variant: audioUrl === null ? 'destructive' : 'default',
                      });
                      return;
                    }
                    
                    const audio = audioRef.current;
                    
                    // If already playing, pause it
                    if (isPlaying) {
                      audio.pause();
                      setIsPlaying(false);
                      return;
                    }
                    
                    // Try to play directly
                    try {
                      // Check if audio is ready
                      if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                        await audio.play();
                        setIsPlaying(true);
                      } else {
                        // Wait for audio to be ready
                        const playWhenReady = () => {
                          audio.play()
                            .then(() => {
                              setIsPlaying(true);
                              audio.removeEventListener('canplay', playWhenReady);
                            })
                            .catch((error) => {
                              console.error('Error playing audio:', error);
                              audio.removeEventListener('canplay', playWhenReady);
                              toast({
                                title: 'Playback error',
                                description: 'Could not start playback. Please try again.',
                                variant: 'destructive',
                              });
                            });
                        };
                        
                        audio.addEventListener('canplay', playWhenReady);
                        
                        // If already can play, trigger immediately
                        if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                          playWhenReady();
                        } else {
                          toast({
                            title: 'Loading audio',
                            description: 'Please wait for the audio to finish loading.',
                            variant: 'default',
                          });
                        }
                      }
                    } catch (error) {
                      console.error('Error playing audio:', error);
                      toast({
                        title: 'Playback error',
                        description: 'Could not start playback. Please try again.',
                        variant: 'destructive',
                      });
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!audioUrl}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
                <span className="text-xs">1.0x</span>
                <button 
                  onClick={handleSeekBack}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={!audioUrl}
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button 
                  onClick={handleSeekForward}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={!audioUrl}
                >
                  <RotateCw className="h-3 w-3" />
                </button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatTime(currentTime)} / {formatTime(duration) || selectedConversation.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3">
            <div className="flex gap-4 border-b border-border">
              {(["overview", "transcription"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDetailTab(tab)}
                  className={cn(
                    "pb-2 text-sm font-medium capitalize transition-colors",
                    activeDetailTab === tab
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeDetailTab === "overview" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Call status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedConversation.status === "Successful" &&
                        "bg-success/10 text-success border-success/20",
                      selectedConversation.status === "Failed" &&
                        "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {selectedConversation.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm">{selectedConversation.duration}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="text-sm">{selectedConversation.messages}</span>
                </div>
              </div>
            )}

            {activeDetailTab === "transcription" && (
              <div className="space-y-3">
                {conversationDetails?.transcript && conversationDetails.transcript.length > 0 ? (
                  conversationDetails.transcript.map((turn, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg",
                        turn.role === 'user' ? "bg-secondary/30" : "bg-primary/10"
                      )}
                    >
                      <p className={cn(
                        "text-xs mb-1",
                        turn.role === 'user' ? "text-muted-foreground" : "text-primary"
                      )}>
                        {turn.role === 'user' ? 'User' : assistantName}
                        {turn.time_in_call_secs !== undefined && (
                          <span className="ml-2 text-muted-foreground">
                            [{Math.floor(turn.time_in_call_secs)}s]
                          </span>
                        )}
                      </p>
                      <p className="text-sm">{turn.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transcript available</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}