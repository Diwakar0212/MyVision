import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useVoiceAssistant = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => {
      setIsSpeaking(false);
      // Play next in queue if available
      if (queueRef.current.length > 0) {
        const nextText = queueRef.current.shift();
        if (nextText) {
          speak(nextText, true);
        }
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = useCallback(async (text: string, skipQueue = false) => {
    if (!isEnabled || !text) return;

    // If currently speaking and not skipping queue, add to queue
    if (isSpeaking && !skipQueue) {
      queueRef.current.push(text);
      return;
    }

    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'Aria' }
      });

      if (error) throw error;

      if (data?.audioContent && audioRef.current) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Voice assistant error:', error);
      setIsSpeaking(false);
      toast({
        title: "Voice Error",
        description: "Failed to generate speech",
        variant: "destructive",
      });
    }
  }, [isEnabled, isSpeaking, toast]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    queueRef.current = [];
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (isSpeaking) {
      stop();
    }
  }, [isSpeaking, stop]);

  return {
    speak,
    stop,
    toggle,
    isSpeaking,
    isEnabled,
  };
};
