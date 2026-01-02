import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '@elevenlabs/client';
import {
  EmbeddableWidgetConfig,
  DEFAULT_WIDGET_CONFIG,
  WIDGET_SIZES,
  WIDGET_POSITIONS,
  WidgetMessage,
  WidgetStatus,
} from './types';

// Icons as inline SVGs for standalone bundle
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const PhoneOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
    <line x1="22" y1="2" x2="2" y2="22"/>
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const HeadphonesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const MicOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const AudioWaveformIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

interface EmbeddableWidgetProps {
  config: Partial<EmbeddableWidgetConfig> & { agentId: string; apiKey: string };
  apiBaseUrl?: string;
}

export function EmbeddableWidget({ config, apiBaseUrl = '' }: EmbeddableWidgetProps) {
  // Merge with defaults
  const fullConfig: EmbeddableWidgetConfig = {
    ...DEFAULT_WIDGET_CONFIG,
    ...config,
    colors: {
      ...DEFAULT_WIDGET_CONFIG.colors,
      ...config.colors,
    },
  };

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<WidgetStatus>('idle');
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  const conversationRef = useRef<Conversation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const size = WIDGET_SIZES[fullConfig.widgetSize];
  const position = WIDGET_POSITIONS[fullConfig.position];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Auto-open feature
  useEffect(() => {
    if (fullConfig.autoOpen && fullConfig.openDelay) {
      const timeout = setTimeout(() => setIsOpen(true), fullConfig.openDelay);
      return () => clearTimeout(timeout);
    }
  }, [fullConfig.autoOpen, fullConfig.openDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/widget/${fullConfig.apiKey}/${fullConfig.agentId}/signed_url`
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to get signed URL');
    }
    const data = await response.json();
    return data.data?.signed_url;
  }, [apiBaseUrl, fullConfig.apiKey, fullConfig.agentId]);

  const startConversation = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our backend
      const signedUrl = await getSignedUrl();
      if (!signedUrl) {
        throw new Error('Failed to get signed URL');
      }

      // Add welcome message if configured
      if (fullConfig.welcomeMessage && messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'agent',
          text: fullConfig.welcomeMessage,
          timestamp: new Date(),
        }]);
      }

      // Start the conversation
      const conversation = await Conversation.startSession({
        signedUrl,
        onConnect: () => {
          setStatus('connected');
        },
        onDisconnect: () => {
          setStatus('idle');
          conversationRef.current = null;
        },
        onMessage: (message) => {
          if (message.message) {
            setMessages(prev => [...prev, {
              id: `${Date.now()}-${Math.random()}`,
              role: message.source === 'user' ? 'user' : 'agent',
              text: message.message,
              timestamp: new Date(),
            }]);
          }
        },
        onError: (err) => {
          console.error('Conversation error:', err);
          setError(typeof err === 'string' ? err : 'Connection error');
          setStatus('idle');
        },
        onModeChange: (mode) => {
          if (mode.mode === 'speaking') {
            setStatus('speaking');
          } else if (mode.mode === 'listening') {
            setStatus('listening');
          }
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      setStatus('idle');
    }
  }, [fullConfig, messages.length, getSignedUrl]);

  const endConversation = useCallback(async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
      } catch (err) {
        console.error('Error ending conversation:', err);
      }
      conversationRef.current = null;
    }
    setStatus('idle');
  }, []);

  const toggleMute = useCallback(async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.setVolume({ volume: isMuted ? 1 : 0 });
        setIsMuted(!isMuted);
      } catch (err) {
        console.error('Error toggling mute:', err);
      }
    }
  }, [isMuted]);

  const sendTextMessage = useCallback(async () => {
    const trimmedText = textInput.trim();
    const active = status !== 'idle';
    if (!trimmedText || !conversationRef.current || !active) {
      return;
    }

    // Ensure conversation is connected before sending
    if (status === 'connecting') {
      setError('Please wait for the connection to be established');
      return;
    }

    // Add user message to chat immediately for instant feedback
    const userMessage: WidgetMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      text: trimmedText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setTextInput('');

    try {
      const conversation = conversationRef.current;
      
      // ElevenLabs Conversation API: Use sendText method with the text string
      // The sendText method sends text that the agent will process and respond to
      if (typeof (conversation as any).sendText === 'function') {
        await (conversation as any).sendText(trimmedText);
      } 
      // Fallback: Try interrupt method (sends text that interrupts current speech)
      else if (typeof (conversation as any).interrupt === 'function') {
        await (conversation as any).interrupt({ text: trimmedText });
      }
      // Fallback: Try send method with text property
      else if (typeof (conversation as any).send === 'function') {
        await (conversation as any).send({ text: trimmedText });
      }
      // Fallback: Try direct WebSocket send (if conversation has ws property)
      else if ((conversation as any).ws && typeof (conversation as any).ws.send === 'function') {
        // Send as JSON message to WebSocket
        (conversation as any).ws.send(JSON.stringify({ 
          type: 'text', 
          text: trimmedText 
        }));
      }
      else {
        // Log available methods for debugging
        const conversationKeys = Object.keys(conversation);
        const availableMethods = conversationKeys.filter(key => 
          typeof (conversation as any)[key] === 'function'
        );
        console.error('No text sending method found. Conversation object keys:', conversationKeys);
        console.error('Available methods:', availableMethods);
        throw new Error('Unable to send text message. Please check the console for available methods.');
      }
    } catch (err) {
      console.error('Error sending text message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  }, [textInput, status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = () => {
    if (fullConfig.iconType === 'custom' && fullConfig.customIconUrl) {
      return <img src={fullConfig.customIconUrl} alt="" style={{ width: 24, height: 24 }} />;
    }
    switch (fullConfig.iconType) {
      case 'chat': return <ChatIcon />;
      case 'headphones': return <HeadphonesIcon />;
      default: return <PhoneIcon />;
    }
  };

  const isActive = status !== 'idle';
  const isConnecting = status === 'connecting';

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'listening': return 'Listening...';
      case 'speaking': return 'Speaking...';
      default: return fullConfig.buttonText;
    }
  };

  // Styles object for the widget
  const styles = {
    container: {
      position: 'fixed' as const,
      zIndex: 99999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      ...position,
    },
    iconButton: {
      width: size.icon,
      height: size.icon,
      borderRadius: '50%',
      backgroundColor: fullConfig.colors.primary,
      color: fullConfig.colors.primaryText,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    panel: {
      width: size.panelWidth,
      height: size.panelHeight,
      backgroundColor: fullConfig.colors.background,
      borderRadius: fullConfig.borderRadius,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      border: `1px solid ${fullConfig.colors.border}`,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    header: {
      padding: '16px',
      borderBottom: `1px solid ${fullConfig.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      margin: 0,
      fontSize: '16px',
      fontWeight: 600,
      color: fullConfig.colors.text,
    },
    headerSubtitle: {
      margin: '4px 0 0 0',
      fontSize: '12px',
      color: fullConfig.colors.text,
      opacity: 0.6,
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: fullConfig.colors.text,
      opacity: 0.6,
      borderRadius: '4px',
    },
    controlBar: {
      padding: '12px 16px',
      borderBottom: `1px solid ${fullConfig.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: fullConfig.colors.background,
    },
    callButton: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isActive ? '#ef4444' : fullConfig.colors.primary,
      color: fullConfig.colors.primaryText,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: status === 'idle' ? '#9ca3af' :
                       status === 'connecting' ? '#f59e0b' :
                       status === 'listening' ? '#22c55e' : fullConfig.colors.primary,
    },
    statusText: {
      fontSize: '13px',
      color: fullConfig.colors.text,
      flex: 1,
    },
    duration: {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: fullConfig.colors.text,
      opacity: 0.6,
    },
    muteButton: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: `1px solid ${fullConfig.colors.border}`,
      backgroundColor: isMuted ? '#ef4444' : 'transparent',
      color: isMuted ? '#fff' : fullConfig.colors.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messages: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '16px',
    },
    emptyState: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      color: fullConfig.colors.text,
      opacity: 0.5,
    },
    message: (role: 'user' | 'agent') => {
      const flexDir = role === 'user' ? 'row-reverse' : 'row';
      return {
        display: 'flex',
        flexDirection: flexDir as 'row' | 'row-reverse',
        gap: '8px',
        marginBottom: '12px',
      };
    },
    messageAvatar: (role: 'user' | 'agent') => ({
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: role === 'agent' ? fullConfig.colors.primary : fullConfig.colors.userBubble,
      color: role === 'agent' ? fullConfig.colors.primaryText : fullConfig.colors.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    messageBubble: (role: 'user' | 'agent') => ({
      maxWidth: '80%',
      padding: '10px 14px',
      borderRadius: '12px',
      backgroundColor: role === 'agent' ? fullConfig.colors.agentBubble : fullConfig.colors.userBubble,
      color: fullConfig.colors.text,
    }),
    messageText: {
      margin: 0,
      fontSize: '14px',
      lineHeight: 1.4,
    },
    messageTime: {
      margin: '4px 0 0 0',
      fontSize: '10px',
      opacity: 0.5,
    },
    error: {
      padding: '8px 16px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      fontSize: '12px',
      borderBottom: `1px solid ${fullConfig.colors.border}`,
    },
    textInputContainer: {
      padding: '12px 16px',
      borderTop: `1px solid ${fullConfig.colors.border}`,
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      backgroundColor: fullConfig.colors.background,
    },
    textInput: {
      flex: 1,
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${fullConfig.colors.border}`,
      backgroundColor: fullConfig.colors.background,
      color: fullConfig.colors.text,
      fontSize: '14px',
      fontFamily: 'inherit',
      outline: 'none',
      resize: 'none' as const,
    },
    textInputDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: fullConfig.colors.primary,
      color: fullConfig.colors.primaryText,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'opacity 0.2s, transform 0.2s',
    },
    sendButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={styles.iconButton}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
          >
            {getIcon()}
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={styles.panel}
          >
            {/* Header */}
            <div style={styles.header}>
              <div>
                <h3 style={styles.headerTitle}>{fullConfig.title}</h3>
                {fullConfig.subtitle && (
                  <p style={styles.headerSubtitle}>{fullConfig.subtitle}</p>
                )}
              </div>
              <button
                style={styles.closeButton}
                onClick={() => {
                  if (isActive) endConversation();
                  setIsOpen(false);
                }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div style={styles.error}>{error}</div>
            )}

            {/* Voice Control Bar */}
            <div style={styles.controlBar}>
              <button
                style={styles.callButton}
                onClick={isActive ? endConversation : startConversation}
                disabled={isConnecting}
                aria-label={isActive ? 'End call' : 'Start call'}
              >
                {isConnecting ? (
                  <LoaderIcon className="animate-spin" />
                ) : isActive ? (
                  <PhoneOffIcon />
                ) : (
                  <PhoneIcon />
                )}
              </button>

              <div style={styles.statusDot} />
              
              {isActive && <AudioWaveformIcon />}
              
              <span style={styles.statusText}>{getStatusText()}</span>

              {isActive && (
                <>
                  <span style={styles.duration}>{formatDuration(callDuration)}</span>
                  <button
                    style={styles.muteButton}
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={styles.messages}>
              {messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <ChatIcon />
                  <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
                    {isActive 
                      ? 'Speak or type to start the conversation'
                      : 'Click the phone button to start'
                    }
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={styles.message(msg.role)}>
                    <div style={styles.messageAvatar(msg.role)}>
                      {msg.role === 'agent' ? <AudioWaveformIcon /> : <UserIcon />}
                    </div>
                    <div style={styles.messageBubble(msg.role)}>
                      <p style={styles.messageText}>{msg.text}</p>
                      <p style={styles.messageTime}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Text Input */}
            <div style={styles.textInputContainer}>
              <input
                ref={textInputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && isActive) {
                    e.preventDefault();
                    sendTextMessage();
                  }
                }}
                placeholder={
                  !isActive 
                    ? "Start a call to type or speak..." 
                    : isMuted 
                    ? "Microphone is muted. Type your message..." 
                    : "Type your message..."
                }
                disabled={!isActive}
                style={{
                  ...styles.textInput,
                  ...(!isActive ? styles.textInputDisabled : {}),
                }}
              />
              <button
                onClick={sendTextMessage}
                disabled={!isActive || !textInput.trim()}
                style={{
                  ...styles.sendButton,
                  ...(!isActive || !textInput.trim() ? styles.sendButtonDisabled : {}),
                }}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default EmbeddableWidget;

