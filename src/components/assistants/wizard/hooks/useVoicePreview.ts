import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Voice } from "@/lib/api";

export function useVoicePreview() {
  const { toast } = useToast();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = (voice: Voice) => {
    if (!voice.preview_url) {
      console.warn('No preview_url for voice:', voice.id, voice);
      toast({
        title: 'Preview unavailable',
        description: 'This voice does not have a preview available.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Playing preview for voice:', voice.id, 'URL:', voice.preview_url);

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
      console.log('Audio ended for voice:', voice.id);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', (e) => {
      console.error('Audio error for voice:', voice.id, e);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });

    audio.play().catch((err) => {
      console.error('Error playing preview:', err, 'Voice:', voice.id, 'URL:', voice.preview_url);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview. Please check your browser audio settings.',
        variant: 'destructive',
      });
    });
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  return {
    playingVoiceId,
    handlePlayPreview,
  };
}
