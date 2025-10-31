import { useCallback, useEffect, useState, useRef } from 'react';

interface VoiceCommand {
  intent: string;
  confidence: number;
  entities?: Record<string, string>;
}

interface AdvancedVoiceOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  wakeWord?: string;
  contextualHelp?: boolean;
}

export const useAdvancedVoice = (options: AdvancedVoiceOptions = {}) => {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    wakeWord = 'hey myvision',
    contextualHelp = true
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true);
  const [context, setContext] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const callbackRef = useRef<((command: VoiceCommand) => void) | null>(null);
  const pausedForSpeechRef = useRef<boolean>(false); // Track if paused for TTS

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;
    }
  }, [continuous, interimResults, language]);

  // Advanced Natural Language Understanding
  const parseCommand = useCallback((text: string): VoiceCommand => {
    const lowerText = text.toLowerCase().trim();
    
    // Navigation intents
    const navigationPatterns = {
      dashboard: /\b(go to |open |show |navigate to )?(dashboard|home|main menu)\b/i,
      liveCamera: /\b(start|open|launch|activate|begin)?\s*(live|camera|detection|video|stream)\b/i,
      videoUpload: /\b(upload|analyze|process|open)?\s*(video|file|recording|clip)\b/i,
      back: /\b(go back|return|previous|back)\b/i,
      logout: /\b(log out|logout|sign out|exit|quit)\b/i,
    };

    // Action intents
    const actionPatterns = {
      stop: /\b(stop|halt|pause|end|cancel)\b/i,
      play: /\b(play|start|begin|resume)\b/i,
      help: /\b(help|assist|guide|what can|how do)\b/i,
      repeat: /\b(repeat|say again|what|pardon)\b/i,
    };

    // Check for wake word - simple "hey" to avoid pronunciation errors
    const wakeWordVariants = [
      /\bhey\b/i,
      /\bhi\b/i,
      /\bhello\b/i,
    ];
    
    for (const pattern of wakeWordVariants) {
      if (pattern.test(lowerText)) {
        return { intent: 'wakeword_detected', confidence: 1.0 };
      }
    }

    // Check navigation intents
    for (const [intent, pattern] of Object.entries(navigationPatterns)) {
      if (pattern.test(lowerText)) {
        return { 
          intent: `navigate_${intent}`, 
          confidence: 0.9,
          entities: { destination: intent }
        };
      }
    }

    // Check action intents
    for (const [intent, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(lowerText)) {
        return { 
          intent: `action_${intent}`, 
          confidence: 0.85,
          entities: { action: intent }
        };
      }
    }

    // Check for numbers (PIN entry)
    const numbers = lowerText.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return {
        intent: 'number_input',
        confidence: 0.95,
        entities: { numbers: numbers.join('') }
      };
    }

    // Check for username/text input (any text that's not a command or wake word)
    if (lowerText.length > 1) {
      return {
        intent: 'text_input',
        confidence: 0.7,
        entities: { text: text.trim() }
      };
    }

    return { intent: 'unknown', confidence: 0.3 };
  }, [wakeWord]);

  // Enhanced speak with queue and interruption handling
  const speak = useCallback((text: string, options: { interrupt?: boolean; rate?: number; pitch?: number } = {}) => {
    const { interrupt = true, rate = 1.0, pitch = 1.0 } = options;

    if (interrupt) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = language;

    utterance.onstart = () => {
      console.log('🔇 TTS STARTED - Setting isSpeaking = true');
      setIsSpeaking(true);
      pausedForSpeechRef.current = true;
      
      // Clear interim transcript only
      setInterimTranscript('');
      console.log('📝 Current transcript before speaking:', transcript);
      
      // AGGRESSIVELY stop speech recognition
      if (recognitionRef.current && isListening) {
        console.log('🛑 STOPPING recognition immediately - App is speaking');
        try {
          // Try abort first (more immediate than stop)
          if (typeof recognitionRef.current.abort === 'function') {
            recognitionRef.current.abort();
          } else {
            recognitionRef.current.stop();
          }
        } catch (error) {
          console.log('Could not stop recognition during speech', error);
        }
      }
    };
    
    utterance.onend = () => {
      console.log('🔊 TTS ENDED - Waiting before resuming recognition');
      
      // Wait longer to ensure audio is completely finished
      setTimeout(() => {
        setIsSpeaking(false);
        console.log('✅ isSpeaking = false');
        
        // Resume speech recognition after speaking
        if (recognitionRef.current && pausedForSpeechRef.current) {
          pausedForSpeechRef.current = false;
          console.log('🔓 Cleared pausedForSpeechRef flag');
          
          // Extra delay before restarting
          setTimeout(() => {
            try {
              // ALWAYS restart recognition after TTS - don't check isListening closure
              console.log('🎤 RESTARTING recognition NOW - Ready to listen');
              setIsListening(true); // Ensure state is updated
              recognitionRef.current.start();
              console.log('✅ Recognition restarted successfully');
            } catch (error) {
              console.log('❌ Could not restart recognition after speech:', error);
              // If it fails because it's already running, that's okay
              if (error.message && !error.message.includes('already started')) {
                setIsListening(false);
              }
            }
          }, 300); // Additional delay after setting flags
        }
      }, 800); // Longer initial delay to ensure audio output is complete
    };
    
    utterance.onerror = () => {
      console.log('❌ TTS ERROR - Resuming recognition');
      setTimeout(() => {
        setIsSpeaking(false);
        pausedForSpeechRef.current = false;
        
        // Resume speech recognition on error
        if (recognitionRef.current) {
          setTimeout(() => {
            try {
              if (isListening) {
                recognitionRef.current.start();
              }
            } catch (error) {
              console.log('Could not restart recognition after error');
            }
          }, 300);
        }
      }, 800);
    };

    synthRef.current.speak(utterance);
  }, [language, isListening]);

  // Start listening with wake word detection
  const startListening = useCallback((callback?: (command: VoiceCommand) => void, contextInfo?: string) => {
    if (!recognitionRef.current) {
      speak('Speech recognition is not supported in your browser.');
      return;
    }

    if (contextInfo) {
      setContext(contextInfo);
    }

    callbackRef.current = callback || null;
    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      // 🚫 CRITICAL: Ignore ALL transcripts while app is speaking
      if (pausedForSpeechRef.current || isSpeaking) {
        console.log('🚫 BLOCKED: Ignoring transcript - App is speaking');
        return;
      }

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Don't update interim while speaking
      if (!isSpeaking && !pausedForSpeechRef.current) {
        setInterimTranscript(interim);
      }

      if (final) {
        console.log('📝 Final transcript received:', final);
        setTranscript(final);
        const command = parseCommand(final);
        setLastCommand(command);

        console.log('useAdvancedVoice - Parsed command:', command);
        console.log('useAdvancedVoice - isWaitingForWakeWord:', isWaitingForWakeWord);

        // Always call callback first to let parent component handle wake word
        if (callbackRef.current && command.confidence > 0) {
          callbackRef.current(command);
        }

        // Handle wake word internally (without speaking - let parent handle that)
        if (isWaitingForWakeWord) {
          if (command.intent === 'wakeword_detected') {
            setIsWaitingForWakeWord(false);
            // Don't speak here - let the parent component handle the response
          }
          return; // Don't process other commands until wake word is detected
        }

        // Handle help request
        if (command.intent === 'action_help' && contextualHelp) {
          provideContextualHelp();
          return;
        }

        // Handle repeat request
        if (command.intent === 'action_repeat') {
          // Repeat last spoken message (would need message history)
          speak('Please repeat your command.');
          return;
        }

        // Low confidence warning (callback was already called above)
        if (command.confidence <= 0.5) {
          speak('I didn\'t quite catch that. Could you please repeat?');
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        speak('I didn\'t hear anything. Please try again.');
      } else if (event.error === 'audio-capture') {
        speak('Microphone access is required. Please check your settings.');
      } else if (event.error === 'not-allowed') {
        speak('Microphone permission was denied. Please enable it in your browser settings.');
      }
      
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      // Don't auto-restart if we're paused for speech
      if (pausedForSpeechRef.current) {
        console.log('⏸️  Recognition ended (paused for speech) - Not restarting');
        return;
      }
      
      if (continuous && isListening) {
        console.log('🔄 Recognition ended - Auto-restarting (continuous mode)');
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Could not auto-restart recognition');
        }
      } else {
        console.log('🛑 Recognition ended - Stopping');
        setIsListening(false);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  }, [isWaitingForWakeWord, continuous, isListening, parseCommand, speak, contextualHelp]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const provideContextualHelp = useCallback(() => {
    const helpMessages: Record<string, string> = {
      login: 'You can say your username, or use commands like "use keyboard" to type instead.',
      pin: 'Say your four digit PIN number, or say "go back" to return to login.',
      dashboard: 'You can say: "start camera" for live detection, "upload video" for analysis, or "log out" to exit.',
      'live-detection': 'Say "stop camera" to end the session, or "go back" to return to dashboard.',
      'video-playback': 'Say "play video", "upload another", or "go back" to the dashboard.',
    };

    const message = helpMessages[context] || 'You can say commands like "go to dashboard", "start camera", "upload video", "help", or "log out".';
    speak(message);
  }, [context, speak]);

  const resetWakeWord = useCallback(() => {
    setIsWaitingForWakeWord(true);
  }, []);

  const activateVoiceMode = useCallback((contextInfo: string) => {
    setIsWaitingForWakeWord(false); // Skip wake word for immediate activation
    setContext(contextInfo);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    lastCommand,
    isWaitingForWakeWord,
    speak,
    startListening,
    stopListening,
    resetWakeWord,
    activateVoiceMode,
    provideContextualHelp,
  };
};
