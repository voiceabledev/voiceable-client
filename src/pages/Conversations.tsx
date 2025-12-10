import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  MoreHorizontal,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationsApi, Conversation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ReactPlayer from "react-player";

interface ConversationDisplay extends Conversation {
  agent: string;
  userId: string;
  credits?: {
    call: number;
    llm: number;
  };
  llmCost?: string;
}

const filterOptions = [
  // "Date After",
  // "Date Before",
  // "Call status",
  // "Criteria",
  // "Data",
  // "Duration",
  // "Rating",
  // "Comments",
  // "Agent",
  // "Tools",
  // "User",
];

const ConversationDetailPanel = ({
  selectedConversation,
  conversationDetails,
  onClose,
  activeDetailTab,
  setActiveDetailTab,
  isPlaying,
  setIsPlaying,
  playerRef,
  currentTime,
  duration,
  audioUrl,
  toast,
  onProgress,
}: {
  selectedConversation: ConversationDisplay;
  conversationDetails: Conversation | null;
  onClose: () => void;
  activeDetailTab: "overview" | "transcription" | "client";
  setActiveDetailTab: (tab: "overview" | "transcription" | "client") => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playerRef: React.RefObject<any>;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  toast: ReturnType<typeof useToast>['toast'];
  onProgress: (state: { played: number; playedSeconds: number }) => void;
}) => {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeekBack = () => {
    if (!playerRef.current) return;
    
    const newTime = Math.max(0, currentTime - 10);
    
    // Try ReactPlayer's seekTo method
    if (typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime, 'seconds');
      } catch (e) {
        console.warn('Could not seek back:', e);
      }
    } else {
      // Fallback: try to access internal player
      try {
        const internalPlayer = playerRef.current.getInternalPlayer?.();
        if (internalPlayer && 'currentTime' in internalPlayer) {
          (internalPlayer as HTMLMediaElement).currentTime = newTime;
        }
      } catch (e) {
        console.warn('Could not seek back via internal player:', e);
      }
    }
  };

  const handleSeekForward = () => {
    if (!playerRef.current) return;
    
    const newTime = Math.min(duration || 0, currentTime + 10);
    
    // Try ReactPlayer's seekTo method
    if (typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime, 'seconds');
      } catch (e) {
        console.warn('Could not seek forward:', e);
      }
    } else {
      // Fallback: try to access internal player
      try {
        const internalPlayer = playerRef.current.getInternalPlayer?.();
        if (internalPlayer && 'currentTime' in internalPlayer) {
          (internalPlayer as HTMLMediaElement).currentTime = newTime;
        }
      } catch (e) {
        console.warn('Could not seek forward via internal player:', e);
      }
    }
  };

  return (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base md:text-lg font-semibold truncate">
          Conversation with {selectedConversation.agent}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground font-mono truncate">
        {selectedConversation.id}
      </p>
    </div>

    {/* Audio Waveform */}
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {formatTime(currentTime)}
          </span>
        </div>
        {/* Waveform placeholder */}
        <div className="h-10 md:h-12 flex items-center gap-0.5 mb-2 md:mb-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-muted-foreground/30 rounded-full min-w-[2px]"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => {
              if (!audioUrl) {
                toast({
                  title: audioUrl === null ? 'Audio not available' : 'Loading audio',
                  description: audioUrl === null 
                    ? 'Audio is not available for this conversation. It may still be processing or the recording failed.'
                    : 'Audio is still loading. Please wait...',
                  variant: audioUrl === null ? 'destructive' : 'default',
                });
                return;
              }
              console.log('Play button clicked, current isPlaying:', isPlaying, 'audioUrl:', audioUrl);
              setIsPlaying(!isPlaying);
            }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!audioUrl}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
            )}
          </button>
          <span className="text-xs md:text-sm">1.0x</span>
          <button 
            onClick={handleSeekBack}
            className="text-muted-foreground hover:text-foreground"
            disabled={!audioUrl}
          >
            <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button 
            onClick={handleSeekForward}
            className="text-muted-foreground hover:text-foreground"
            disabled={!audioUrl}
          >
            <RotateCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <span className="text-xs md:text-sm text-muted-foreground ml-auto">
            {formatTime(currentTime)} / {formatTime(duration) || selectedConversation.duration}
          </span>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>

    {/* Info Banner */}
    <div className="mx-3 md:mx-4 mt-3 md:mt-4 p-2 md:p-3 rounded-lg bg-secondary/50 border border-border flex items-start gap-2 md:gap-3 flex-shrink-0">
      <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-xs md:text-sm text-muted-foreground">
        You can now ensure your agent returns high quality responses to conversations like
        this one. Try Tests in the{" "}
        <span className="text-primary cursor-pointer">Transcription tab</span>.
      </p>
    </div>

    {/* Tabs */}
    <div className="px-3 md:px-4 mt-3 md:mt-4 flex-shrink-0">
      <div className="flex gap-2 md:gap-4 border-b border-border overflow-x-auto scrollbar-hide">
        {(["overview", "transcription", "client"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDetailTab(tab)}
            className={cn(
              "pb-2 text-xs md:text-sm font-medium capitalize transition-colors flex-shrink-0",
              activeDetailTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "client" ? "Client data" : tab}
          </button>
        ))}
      </div>
    </div>

    {/* Tab Content */}
    <div className="flex-1 overflow-auto p-3 md:p-4 min-h-0">
      {activeDetailTab === "overview" && (
        <div className="space-y-3 md:space-y-4 pb-4">
          <div>
            <h3 className="text-xs md:text-sm font-semibold mb-2">Summary</h3>
            <p className="text-xs md:text-sm text-muted-foreground whitespace-normal">
              {selectedConversation.summary}
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs md:text-sm text-muted-foreground">Call status</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                selectedConversation.status === "Successful" &&
                  "bg-success/10 text-success border-success/20"
              )}
            >
              {selectedConversation.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs md:text-sm text-muted-foreground">User ID</span>
            <span className="text-xs md:text-sm font-mono text-muted-foreground truncate ml-2">
              {selectedConversation.userId}
            </span>
          </div>

          {/* Metadata Section */}
          <div className="border-t border-border pt-3 md:pt-4 mt-3 md:mt-4">
            <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3">Metadata</h3>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="truncate ml-2">{selectedConversation.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connection duration</span>
                <span>{selectedConversation.duration}</span>
              </div>
              {selectedConversation.credits && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits (call)</span>
                    <span>{selectedConversation.credits.call}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits (LLM)</span>
                    <span>{selectedConversation.credits.llm}</span>
                  </div>
                </>
              )}
              {selectedConversation.llmCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LLM Cost</span>
                  <span>{selectedConversation.llmCost}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeDetailTab === "transcription" && (
        <div className="space-y-3 md:space-y-4">
          {conversationDetails?.transcript && conversationDetails.transcript.length > 0 ? (
            conversationDetails.transcript.map((turn, index) => (
              <div
                key={index}
                className={cn(
                  "p-2 md:p-3 rounded-lg",
                  turn.role === 'user' ? "bg-secondary/30" : "bg-primary/10"
                )}
              >
                <p className={cn(
                  "text-xs mb-1",
                  turn.role === 'user' ? "text-muted-foreground" : "text-primary"
                )}>
                  {turn.role === 'user' ? 'User' : 'Agent'}
                  {turn.time_in_call_secs !== undefined && (
                    <span className="ml-2 text-muted-foreground">
                      [{Math.floor(turn.time_in_call_secs)}s]
                    </span>
                  )}
                </p>
                <p className="text-xs md:text-sm">{turn.message}</p>
              </div>
            ))
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No transcript available</p>
          )}
        </div>
      )}

      {activeDetailTab === "client" && (
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs md:text-sm text-muted-foreground">User ID</span>
            <span className="text-xs md:text-sm font-mono truncate ml-2">{selectedConversation.userId}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-xs md:text-sm text-muted-foreground">Session ID</span>
            <span className="text-xs md:text-sm font-mono truncate ml-2">{selectedConversation.id}</span>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default function Conversations() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDisplay | null>(null);
  const [conversationDetails, setConversationDetails] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription" | "client">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await conversationsApi.list({ summary_mode: 'include' });
      if (response.data) {
        const formattedConversations: ConversationDisplay[] = response.data.map(conv => ({
          ...conv,
          agent: conv.agent_name || 'Unknown Agent',
          userId: conv.user_id || 'Unknown User',
          status: conv.call_successful === 'success' ? 'Successful' : 
                  conv.call_successful === 'failure' ? 'Failed' : 
                  'In Progress' as "Successful" | "Failed" | "In Progress",
        }));
        setConversations(formattedConversations);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      console.error('Error fetching conversations:', err);
      toast({
        title: 'Error loading conversations',
        description: errorMessage,
        variant: 'destructive',
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch conversation details when one is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      fetchConversationDetails(selectedConversation.id);
    }
  }, [selectedConversation?.id, fetchConversationDetails]);

  // Show detail panel when conversation is selected on mobile
  useEffect(() => {
    if (selectedConversation) {
      setShowDetailPanel(true);
    }
  }, [selectedConversation]);

  // Handle progress updates from ReactPlayer
  const handleProgress = useCallback((state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    // Duration is available in the progress state
    if (state.loadedSeconds > 0 && duration === 0) {
      setDuration(state.loadedSeconds);
    }
  }, [duration]) as unknown as (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;

  // Handle errors from ReactPlayer
  const handleError = useCallback((error: unknown) => {
    console.error('Audio playback error:', error);
    setIsPlaying(false);
    toast({
      title: 'Audio playback error',
      description: 'Could not play conversation audio. Please try again.',
      variant: 'destructive',
    });
  }, [toast]);

  // Handle when audio ends
  const handleEnded = useCallback(() => {
    console.log('Audio playback ended');
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Handle when audio is ready to play
  const handleReady = useCallback(() => {
    console.log('Audio player ready');
    // Try to get duration when ready - use a small delay to ensure player is fully initialized
    setTimeout(() => {
      if (playerRef.current) {
        try {
          // ReactPlayer exposes getInternalPlayer method
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const internalPlayer = (playerRef.current as any)?.getInternalPlayer?.();
          if (internalPlayer && 'duration' in internalPlayer) {
            const dur = (internalPlayer as HTMLMediaElement).duration;
            if (dur && isFinite(dur) && dur > 0) {
              setDuration(dur);
            }
          }
        } catch (e) {
          // Ignore errors getting internal player - duration will come from progress updates
        }
      }
    }, 100);
  }, []);

  // Handle when audio starts playing
  const handlePlay = useCallback(() => {
    console.log('Audio started playing');
    setIsPlaying(true);
  }, []);

  // Handle when audio is paused
  const handlePause = useCallback(() => {
    console.log('Audio paused');
    setIsPlaying(false);
  }, []);

  // Reset audio when conversation changes
  useEffect(() => {
    // Stop any playing audio first
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    // Don't clear audioUrl immediately - let it clear naturally when new one loads
    // setAudioUrl(null);
  }, [selectedConversation?.id]);

  // Get audio URL and handle authentication
  useEffect(() => {
    if (!selectedConversation?.id) {
      setAudioUrl(null);
      return;
    }

    // Try to fetch audio even if has_audio is not explicitly set
    // Some conversations might have audio but the flag might not be set correctly
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
            toast({
              title: 'Audio not available',
              description: 'The audio file appears to be empty.',
              variant: 'destructive',
            });
            return;
          }
          
          // Check content type
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('audio/')) {
            console.error('Invalid audio content type:', contentType);
            setAudioUrl(null);
            toast({
              title: 'Audio format error',
              description: 'The audio file format is not supported.',
              variant: 'destructive',
            });
            return;
          }
          
          objectUrl = URL.createObjectURL(blob);
          setAudioUrl(objectUrl);
        } else if (response.status === 404) {
          console.error('Audio not found for conversation');
          setAudioUrl(null);
          toast({
            title: 'Audio not available',
            description: 'Audio recording is not available for this conversation.',
            variant: 'destructive',
          });
        } else if (response.status === 401 || response.status === 403) {
          console.error('Unauthorized to access audio');
          setAudioUrl(null);
          toast({
            title: 'Access denied',
            description: 'You do not have permission to access this audio.',
            variant: 'destructive',
          });
        } else {
          console.error('Error fetching audio:', response.status, response.statusText);
          setAudioUrl(null);
          toast({
            title: 'Error loading audio',
            description: `Failed to load audio: ${response.statusText}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching audio:', error);
        setAudioUrl(null);
        toast({
          title: 'Error loading audio',
          description: error instanceof Error ? error.message : 'Failed to load conversation audio.',
          variant: 'destructive',
        });
      }
    };

    fetchAudioUrl();

    // Cleanup object URL when component unmounts or conversation changes
    return () => {
      // Stop any playing audio
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
  }, [selectedConversation?.id, toast]);

  const filteredConversations = conversations.filter(conv =>
    conv.agent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">Conversation history</h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3 md:mb-4">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 md:pl-10 bg-secondary/50 border-border h-10 md:h-12 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 pb-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-md bg-secondary/50 text-xs md:text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex relative min-h-0 overflow-hidden">
        {/* Table */}
        <div className={cn(
          "flex-1 overflow-auto min-h-0",
          selectedConversation && "hidden md:block"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      Date
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </button>
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Messages</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Call status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 md:px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading conversations...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredConversations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 md:px-6 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No conversations found matching your search.' : 'No conversations found.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredConversations.map((conv) => (
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
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.date || 'N/A'}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.agent || 'Unknown Agent'}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.duration || '0:00'}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">{conv.messages || 0}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            conv.status === "Successful" &&
                              "bg-success/10 text-success border-success/20",
                            conv.status === "Failed" &&
                              "bg-destructive/10 text-destructive border-destructive/20",
                            conv.status === "In Progress" &&
                              "bg-warning/10 text-warning border-warning/20"
                          )}
                        >
                          {conv.status || 'Unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedConversation && (
          <>
            {/* Mobile: Bottom Sheet */}
            {showDetailPanel && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => {
                    setShowDetailPanel(false);
                    setSelectedConversation(null);
                  }}
                />
                <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg md:hidden overflow-hidden min-h-0">
                  <ConversationDetailPanel
                    selectedConversation={selectedConversation}
                    conversationDetails={conversationDetails}
                    onClose={() => {
                      setShowDetailPanel(false);
                      setSelectedConversation(null);
                      setConversationDetails(null);
                    }}
                    activeDetailTab={activeDetailTab}
                    setActiveDetailTab={setActiveDetailTab}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    playerRef={playerRef}
                    currentTime={currentTime}
                    duration={duration}
                    audioUrl={audioUrl}
                    toast={toast}
                    onProgress={handleProgress}
                  />
                  {audioUrl && (
                <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                  {/* @ts-expect-error - ReactPlayer type definitions are incorrect */}
                  <ReactPlayer
                    ref={playerRef}
                    url={audioUrl}
                    playing={isPlaying}
                    controls={false}
                    width="1"
                    height="1"
                    onProgress={handleProgress}
                    onError={handleError}
                    onEnded={handleEnded}
                    onReady={handleReady}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                </div>
                  )}
                </div>
              </>
            )}
            
            {/* Desktop: Side Panel */}
            <div className="hidden md:flex w-[500px] border-l border-border flex-col h-full overflow-hidden">
              <ConversationDetailPanel
                selectedConversation={selectedConversation}
                conversationDetails={conversationDetails}
                onClose={() => {
                  setSelectedConversation(null);
                  setConversationDetails(null);
                }}
                activeDetailTab={activeDetailTab}
                setActiveDetailTab={setActiveDetailTab}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                playerRef={playerRef}
                currentTime={currentTime}
                duration={duration}
                audioUrl={audioUrl}
                toast={toast}
                onProgress={handleProgress}
              />
              {audioUrl && (
                <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                  {/* @ts-expect-error - ReactPlayer type definitions are incorrect */}
                  <ReactPlayer
                    ref={playerRef}
                    url={audioUrl}
                    playing={isPlaying}
                    controls={false}
                    width="1"
                    height="1"
                    onProgress={handleProgress}
                    onError={handleError}
                    onEnded={handleEnded}
                    onReady={handleReady}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
