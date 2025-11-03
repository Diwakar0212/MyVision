import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
}

export const useVoice = () => {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: ''
  });
  
  const recognitionRef = useRef<any>(null);
  const speechQueueRef = useRef<string[]>([]);
  const welcomedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      console.log('Speech recognition initialized');
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }, []);

  const speak = useCallback((text: string) => {
    speechQueueRef.current.push(text);
    if (!isSpeakingRef.current) {
      processQueue();
    }
  }, []);

  const processQueue = () => {
    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false }));
      return;
    }

    const text = speechQueueRef.current.shift()!;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    isSpeakingRef.current = true;
    setState(prev => ({ ...prev, isSpeaking: true }));

    utterance.onend = () => {
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not available');
      speak('Speech recognition is not available in your browser. Please use Chrome or Edge.');
      return;
    }

    console.log('Starting speech recognition...');
    shouldKeepListeningRef.current = true;
    onResultCallbackRef.current = onResult;
    retryCountRef.current = 0;
    setState(prev => ({ ...prev, isListening: true, transcript: '' }));

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      console.log('Transcript received:', transcript);
      setState(prev => ({ ...prev, transcript }));

      if (event.results[event.results.length - 1].isFinal) {
        console.log('Final transcript:', transcript);
        if (onResultCallbackRef.current && transcript.trim()) {
          shouldKeepListeningRef.current = false;
          onResultCallbackRef.current(transcript);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        speak('Microphone access denied. Please enable microphone permissions.');
        shouldKeepListeningRef.current = false;
      } else if (event.error === 'no-speech') {
        console.log('No speech detected, will retry...');
        // Don't stop, let onend handle the restart
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted, will retry if needed...');
      } else {
        shouldKeepListeningRef.current = false;
      }
      
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      setState(prev => ({ ...prev, isListening: false }));
      
      // Auto-restart if we're still supposed to be listening
      if (shouldKeepListeningRef.current && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Auto-restarting recognition (attempt ${retryCountRef.current}/${maxRetries})...`);
        
        setTimeout(() => {
          if (shouldKeepListeningRef.current && recognitionRef.current) {
            try {
              setState(prev => ({ ...prev, isListening: true }));
              recognitionRef.current.start();
              console.log('Recognition restarted successfully');
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          }
        }, 300);
      } else if (retryCountRef.current >= maxRetries) {
        console.log('Max retries reached');
        speak('I had trouble hearing you. Please try again.');
        shouldKeepListeningRef.current = false;
      }
    };

    try {
      recognitionRef.current.start();
      console.log('Speech recognition started successfully');
      // Speak a welcome message the first time web audio / recognition starts
      if (!welcomedRef.current) {
        try {
          speak('Welcome to MyVision');
          welcomedRef.current = true;
        } catch (e) {
          console.warn('Failed to play welcome message', e);
        }
      }
    } catch (error) {
      console.error('Failed to start recognition:', error);
      speak('Could not start listening. Please try again.');
      setState(prev => ({ ...prev, isListening: false }));
      shouldKeepListeningRef.current = false;
    }
  }, [speak]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    shouldKeepListeningRef.current = false;
    onResultCallbackRef.current = null;
    retryCountRef.current = 0;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  return {
    ...state,
    speak,
    stopSpeaking,
    startListening,
    stopListening
  };
};
