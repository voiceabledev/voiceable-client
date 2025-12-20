import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff,
  Loader2,
  AudioWaveform,
} from 'lucide-react';
import { conversationsApi } from '@/lib/api';

interface VoiceControlBarProps {
  agentId: string;
  onMessage?: (message: { role: 'user' | 'agent'; text: string }) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening') => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VoiceControlBar({
  agentId,
  onMessage,
  onStatusChange,
  onError,
  className,
}: VoiceControlBarProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const conversationRef = useRef<Conversation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Auto-hide the hint tooltip after 4 seconds
  useEffect(() => {
    if (showHint) {
      const timeout = setTimeout(() => {
        setShowHint(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [showHint]);

  // Hide hint when call starts
  useEffect(() => {
    if (status !== 'idle') {
      setShowHint(false);
    }
  }, [status]);

  // Call duration timer
  useEffect(() => {
    if (status === 'connected' || status === 'speaking' || status === 'listening') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (status === 'idle') {
        setCallDuration(0);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const startConversation = useCallback(async () => {
    if (!agentId) {
      onError?.(new Error('Agent ID is required'));
      return;
    }

    try {
      updateStatus('connecting');

      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from backend
      const response = await conversationsApi.getSignedUrl(agentId);
      if (!response.data?.signed_url) {
        throw new Error('Failed to get signed URL for conversation');
      }

      // Start the conversation with the signed URL
      const conversation = await Conversation.startSession({
        signedUrl: response.data.signed_url,
        onConnect: () => {
          console.log('Connected to agent');
          updateStatus('connected');
        },
        onDisconnect: () => {
          console.log('Disconnected from agent');
          updateStatus('idle');
          conversationRef.current = null;
        },
        onMessage: (message) => {
          console.log('Message received:', message);
          if (message.message) {
            onMessage?.({
              role: message.source === 'user' ? 'user' : 'agent',
              text: message.message,
            });
          }
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          onError?.(new Error(typeof error === 'string' ? error : 'Conversation error'));
          updateStatus('idle');
        },
        onModeChange: (mode) => {
          console.log('Mode changed:', mode);
          if (mode.mode === 'speaking') {
            updateStatus('speaking');
          } else if (mode.mode === 'listening') {
            updateStatus('listening');
          }
        },
      });

      conversationRef.current = conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      onError?.(new Error(errorMessage));
      updateStatus('idle');
    }
  }, [agentId, onMessage, onError, updateStatus]);

  const endConversation = useCallback(async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
      conversationRef.current = null;
    }
    updateStatus('idle');
  }, [updateStatus]);

  const toggleMute = useCallback(async () => {
    if (conversationRef.current) {
      try {
        if (isMuted) {
          await conversationRef.current.setVolume({ volume: 1 });
        } else {
          await conversationRef.current.setVolume({ volume: 0 });
        }
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = status !== 'idle';
  const isConnecting = status === 'connecting';

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Start conversation';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'listening':
        return 'Listening...';
      case 'speaking':
        return 'Agent speaking...';
      default:
        return '';
    }
  };

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      {/* Start/End Call Button */}
      {isActive ? (
        <Button
          variant="destructive"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={endConversation}
          title="End Call"
        >
          <PhoneOff className="w-4 h-4" />
        </Button>
      ) : (
        <Tooltip open={showHint && status === 'idle'}>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className={cn(
                "h-9 w-9 rounded-full p-0 bg-primary hover:bg-primary/90",
                showHint && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse"
              )}
              onClick={startConversation}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-primary text-primary-foreground font-medium">
            <p>Click here to start testing</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Status Indicator */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Animated Status Dot */}
        <div className={cn(
          "w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors",
          status === 'idle' && "bg-muted-foreground/30",
          status === 'connecting' && "bg-warning animate-pulse",
          status === 'connected' && "bg-primary",
          status === 'listening' && "bg-success animate-pulse",
          status === 'speaking' && "bg-primary animate-pulse"
        )} />

        {/* Voice Waveform Icon (animated when speaking/listening) */}
        {isActive && (
          <AudioWaveform className={cn(
            "w-4 h-4 flex-shrink-0 transition-opacity",
            status === 'speaking' && "text-primary animate-pulse",
            status === 'listening' && "text-success",
            status === 'connected' && "text-muted-foreground"
          )} />
        )}

        {/* Status Text */}
        <span className="text-sm text-muted-foreground truncate">
          {getStatusText()}
        </span>

        {/* Call Duration */}
        {isActive && (
          <span className="text-xs font-mono text-muted-foreground ml-auto flex-shrink-0">
            {formatDuration(callDuration)}
          </span>
        )}
      </div>

      {/* Mute Button (only when active) */}
      {isActive && (
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="sm"
          className="h-9 w-9 rounded-full p-0 flex-shrink-0"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}

