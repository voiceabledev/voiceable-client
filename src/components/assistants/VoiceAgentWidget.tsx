import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff,
  Volume2,
  Loader2,
  AudioWaveform,
} from 'lucide-react';
import { conversationsApi } from '@/lib/api';

interface VoiceAgentWidgetProps {
  agentId: string;
  onMessage?: (message: { role: 'user' | 'agent'; text: string }) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening') => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VoiceAgentWidget({
  agentId,
  onMessage,
  onStatusChange,
  onError,
  className,
}: VoiceAgentWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversationRef = useRef<Conversation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

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
            setIsSpeaking(true);
            updateStatus('speaking');
          } else if (mode.mode === 'listening') {
            setIsSpeaking(false);
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

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 p-6', className)}>
      {/* Voice Visualization */}
      <div className="relative">
        {/* Outer rings for speaking animation */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-300',
            isSpeaking && isActive && 'animate-ping bg-primary/20'
          )}
          style={{ 
            width: '160px', 
            height: '160px', 
            left: '-20px', 
            top: '-20px' 
          }}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            isSpeaking && isActive && 'animate-pulse bg-primary/10'
          )}
          style={{ 
            width: '140px', 
            height: '140px', 
            left: '-10px', 
            top: '-10px' 
          }}
        />
        
        {/* Main orb */}
        <div
          className={cn(
            'relative w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-300',
            status === 'idle' && 'bg-muted',
            status === 'connecting' && 'bg-warning/20',
            (status === 'connected' || status === 'listening') && 'bg-primary/20',
            status === 'speaking' && 'bg-primary/30'
          )}
        >
          {status === 'connecting' ? (
            <Loader2 className="w-12 h-12 text-warning animate-spin" />
          ) : isActive ? (
            <div className="relative">
              <AudioWaveform 
                className={cn(
                  'w-12 h-12 text-primary transition-transform duration-200',
                  isSpeaking && 'scale-110'
                )} 
              />
              {status === 'listening' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
              )}
            </div>
          ) : (
            <Phone className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {status === 'idle' && (
          <p className="text-sm text-muted-foreground">Click to start a conversation</p>
        )}
        {status === 'connecting' && (
          <p className="text-sm text-warning">Connecting...</p>
        )}
        {status === 'connected' && (
          <p className="text-sm text-primary">Connected</p>
        )}
        {status === 'listening' && (
          <p className="text-sm text-success">Listening...</p>
        )}
        {status === 'speaking' && (
          <p className="text-sm text-primary">Agent is speaking...</p>
        )}
      </div>

      {/* Call Duration */}
      {isActive && (
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>{formatDuration(callDuration)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isActive ? (
          <>
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="w-16 h-16 rounded-full"
              onClick={endConversation}
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full opacity-50"
              disabled
              title="Volume"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
            onClick={startConversation}
            disabled={isConnecting}
            title="Start Call"
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Phone className="w-6 h-6" />
            )}
          </Button>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center max-w-[240px]">
        {isActive 
          ? "Speak naturally - the agent will respond to your voice"
          : "Start a voice conversation with your AI assistant"
        }
      </p>
    </div>
  );
}
