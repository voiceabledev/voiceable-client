"use client"

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
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationsApi, Conversation, normalizeApiBaseUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  currentTime,
  duration,
  audioUrl,
  toast,
  isPlayerReady,
  onSeekBack,
  onSeekForward,
  audioRef,
}: {
  selectedConversation: ConversationDisplay;
  conversationDetails: Conversation | null;
  onClose: () => void;
  activeDetailTab: "overview" | "transcription";
  setActiveDetailTab: (tab: "overview" | "transcription") => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  toast: ReturnType<typeof useToast>['toast'];
  isPlayerReady: boolean;
  onSeekBack: () => void;
  onSeekForward: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) => {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            onClick={onSeekBack}
            className="text-muted-foreground hover:text-foreground"
            disabled={!audioUrl}
          >
            <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button 
            onClick={onSeekForward}
            className="text-muted-foreground hover:text-foreground"
            disabled={!audioUrl}
          >
            <RotateCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <span className="text-xs md:text-sm text-muted-foreground ml-auto">
            {formatTime(currentTime)} / {formatTime(duration) || selectedConversation.duration}
          </span>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="px-3 md:px-4 mt-3 md:mt-4 flex-shrink-0">
      <div className="flex gap-2 md:gap-4 border-b border-border overflow-x-auto scrollbar-hide">
        {(["overview", "transcription"] as const).map((tab) => (
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
            {tab}
          </button>
        ))}
      </div>
    </div>

    {/* Tab Content */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 min-h-0">
      {activeDetailTab === "overview" && (
        <div className="space-y-4 md:space-y-5 pb-4">
          <div>
            <h3 className="text-xs md:text-sm font-semibold mb-2">Summary</h3>
            <p className="text-xs md:text-sm text-muted-foreground whitespace-normal">
              {selectedConversation.summary}
            </p>
          </div>

          {/* Call Information */}
          <div className="space-y-2 md:space-y-2.5">
            <h3 className="text-xs md:text-sm font-semibold">Call Information</h3>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    selectedConversation.status === "Successful" &&
                      "bg-success/10 text-success border-success/20",
                    selectedConversation.status === "Failed" &&
                      "bg-destructive/10 text-destructive border-destructive/20",
                    selectedConversation.status === "In Progress" &&
                      "bg-warning/10 text-warning border-warning/20"
                  )}
                >
                  {selectedConversation.status}
                </Badge>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Date</span>
                <span className="truncate ml-2">{selectedConversation.date}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Duration</span>
                <span>{selectedConversation.duration}</span>
              </div>
            </div>
          </div>

          {/* Usage & Costs */}
          {(selectedConversation.credits || selectedConversation.llmCost) && (
            <div className="space-y-2 md:space-y-2.5">
              <h3 className="text-xs md:text-sm font-semibold">Usage & Costs</h3>
              <div className="space-y-2 text-xs md:text-sm">
                {selectedConversation.credits && (
                  <>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Call credits</span>
                      <span>{selectedConversation.credits.call}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">LLM credits</span>
                      <span>{selectedConversation.credits.llm}</span>
                    </div>
                  </>
                )}
                {selectedConversation.llmCost && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">LLM cost</span>
                    <span>{selectedConversation.llmCost}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeDetailTab === "transcription" && (
        <div className="space-y-3 md:space-y-4 pb-4">
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
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "transcription">("overview");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Show detail panel when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setShowDetailPanel(true);
    }
  }, [selectedConversation]);

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
    
    // Set up event listeners (only once)
    const handleTimeUpdate = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded');
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsPlayerReady(true);
    };
    
    const handleCanPlay = () => {
      console.log('Audio can play');
      setIsPlayerReady(true);
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      console.log('Audio playback ended');
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
      console.log('Audio started playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Audio paused');
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
  
  // Control playback based on isPlaying state (backup mechanism)
  // Note: Primary control is now in the button handler, this is for state sync
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Sync playback state with audio element
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

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
        const API_BASE_URL = normalizeApiBaseUrl(
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/voiceable-api'
        );
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
        <div className="flex-1 overflow-auto min-h-0">
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

        {/* Modal with Overlay */}
        {selectedConversation && showDetailPanel && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => {
                setShowDetailPanel(false);
                setSelectedConversation(null);
                setConversationDetails(null);
              }}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div 
                className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
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
                  currentTime={currentTime}
                  duration={duration}
                  audioUrl={audioUrl}
                  toast={toast}
                  isPlayerReady={isPlayerReady}
                  onSeekBack={handleSeekBack}
                  onSeekForward={handleSeekForward}
                  audioRef={audioRef}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
