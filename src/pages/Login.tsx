import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdvancedVoice } from '@/hooks/useAdvancedVoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Keyboard } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
  onActivateVoice: () => void;
  isVoiceModeActive: boolean;
}

export const Login = ({ onLogin, onActivateVoice, isVoiceModeActive }: LoginProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(true);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    lastCommand,
    isWaitingForWakeWord,
    speak,
    startListening,
    stopListening,
    activateVoiceMode,
  } = useAdvancedVoice({ continuous: true, wakeWord: 'hey vision' });

  const [hasPlayedAppWelcome, setHasPlayedAppWelcome] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
      navigate('/pin');
    }
  };

  const handleVoiceCommand = (command: { intent: string; confidence: number; entities?: Record<string, string> }) => {
    console.log('Login - Voice command received:', command);
    console.log('Login - Current isVoiceModeActive:', isVoiceModeActive);
    console.log('Login - Current isSpeaking:', isSpeaking);
    console.log('Login - Current isListening:', isListening);
    console.log('Login - Transcript:', transcript);

    // Don't process commands while the app is speaking
    if (isSpeaking) {
      console.log('Login - Ignoring command while app is speaking');
      return;
    }

    if (command.intent === 'wakeword_detected' && !isVoiceModeActive) {
      console.log('Login - Wake word detected! Activating voice mode...');
      // Activate voice mode for entire app
      onActivateVoice();
      setIsListeningForWakeWord(false);
      
      // Speak welcome message - recognition will auto-restart after speech ends
      speak('Welcome to MyVision. To begin, please say your username.');
      console.log('🎤 Login - Welcome message will play, recognition will restart automatically after 1100ms');
      return;
    }

    if (!isVoiceModeActive) {
      console.log('Login - Voice mode not active, waiting for wake word');
      return; // Wait for wake word first
    }

    // Ignore wake word and navigation commands when voice mode is active
    if (command.intent === 'wakeword_detected' || command.intent.startsWith('navigate_') || command.intent.startsWith('action_')) {
      console.log('Login - Ignoring command:', command.intent);
      return;
    }

    // Handle username input - accept any text as username
    if (command.intent === 'text_input' && command.entities?.text) {
      const voiceUsername = command.entities.text.toLowerCase();
      
      // Ignore if it contains wake words
      if (voiceUsername.includes('hey') || voiceUsername.includes('hello') || voiceUsername.includes('hi')) {
        console.log('Login - Ignoring wake word in text:', voiceUsername);
        return;
      }
      
      console.log('Login - Username received:', voiceUsername);
      setUsername(voiceUsername); // Write to input box
      speak(`Thank you, ${voiceUsername}.`);
      
      // Wait for thank you message, then navigate
      setTimeout(() => {
        onLogin(voiceUsername);
        navigate('/pin');
      }, 2500); // Wait for thank you message to complete
    }
  };

  // Watch transcript and update username field in real-time
  useEffect(() => {
    console.log('📝 Transcript watcher triggered:', {
      transcript,
      isSpeaking,
      isListening,
      isVoiceModeActive,
      lastProcessedTranscript
    });

    // Don't capture text while the app is speaking (to avoid capturing TTS audio)
    if (isSpeaking) {
      console.log('🔇 Login - Skipping transcript while app is speaking');
      return;
    }
    
    // IMPORTANT: Also check if recognition is actually listening
    if (!isListening) {
      console.log('🔇 Login - Skipping transcript - not listening yet (recognition still restarting)');
      return;
    }
    
    // Don't process the same transcript twice
    if (transcript === lastProcessedTranscript) {
      console.log('⏭️  Login - Skipping duplicate transcript');
      return;
    }
    
    if (isVoiceModeActive && transcript && transcript.trim()) {
      const spokenText = transcript.toLowerCase().trim();
      console.log('🔍 Login - Analyzing transcript:', spokenText);
      
      // Filter out app vocabulary and wake words
      if (!spokenText.includes('hey') && !spokenText.includes('hello') && !spokenText.includes('hi') && 
          !spokenText.includes('welcome') && !spokenText.includes('vision') && 
          !spokenText.includes('username') && !spokenText.includes('myvision') &&
          !spokenText.includes('say your') && !spokenText.includes('begin')) {
        console.log('✅ Login - Valid username detected from transcript:', transcript);
        const capturedUsername = transcript.trim();
        setUsername(capturedUsername);
        setLastProcessedTranscript(transcript); // Mark as processed
        
        // Small delay to ensure user finished speaking
        setTimeout(() => {
          console.log('💬 Login - Saying thank you to:', capturedUsername);
          speak(`Thank you, ${capturedUsername}.`);
          
          // Wait for "thank you" to finish, then navigate to PIN page
          setTimeout(() => {
            console.log('➡️  Login - Navigating to PIN page');
            onLogin(capturedUsername);
            navigate('/pin');
          }, 2500); // Wait for thank you message to complete
        }, 500); // Reduced from 1000ms to be more responsive
      } else {
        console.log('❌ Login - Transcript contains filtered words, ignoring');
      }
    } else {
      if (!isVoiceModeActive) console.log('⚠️  Login - Voice mode not active');
      if (!transcript) console.log('⚠️  Login - No transcript available');
    }
  }, [transcript, isVoiceModeActive, isSpeaking, isListening, lastProcessedTranscript]);

  // Monitor isSpeaking state - clear processed transcript when app starts speaking
  useEffect(() => {
    if (isSpeaking) {
      console.log('🔇 App started speaking - Clearing lastProcessedTranscript');
      setLastProcessedTranscript('');
    } else {
      console.log('🎤 App stopped speaking - Ready to accept input');
    }
  }, [isSpeaking]);

  // Monitor isListening state changes
  useEffect(() => {
    console.log('🎧 isListening changed:', isListening);
    if (isListening && !isSpeaking && isVoiceModeActive) {
      console.log('✅ READY TO CAPTURE - Recognition is active and app is not speaking');
    }
  }, [isListening, isSpeaking, isVoiceModeActive]);

  useEffect(() => {
    // Always start listening for wake word
    const timer = setTimeout(() => {
      activateVoiceMode('login');
      startListening(handleVoiceCommand, 'login');
    }, 500);

    // One-time welcome when the app (login page) opens
    if (!hasPlayedAppWelcome) {
      // Small delay to avoid clashing with other TTS
      setTimeout(() => {
        console.log('🎤 Login - Playing app-open welcome');
        speak('Welcome to MyVision.');
        setHasPlayedAppWelcome(true);
      }, 300);
    }

    return () => {
      clearTimeout(timer);
      stopListening();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96]
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: 'blur(10px)',
        transition: { duration: 0.4 }
      }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20 relative"
    >
      {/* Gemini-style glow effect when voice is active */}
      {isVoiceModeActive && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 border-4 border-primary/30 rounded-3xl blur-xl" />
          </motion.div>
          <motion.div
            className="absolute inset-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 border-2 border-primary/40 rounded-3xl blur-lg" />
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -30 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          y: 0,
          transition: {
            delay: 0.3,
            duration: 0.6,
            ease: "easeOut"
          }
        }}
        className="text-center mb-12 relative z-10"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-6 gradient-text"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          MyVision
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground"
        >
          AI-Powered Accessibility
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ 
          y: 0, 
          opacity: 1, 
          scale: 1,
          transition: {
            delay: 0.5,
            duration: 0.5,
            ease: "easeOut"
          }
        }}
        className="w-full max-w-md relative z-10"
      >
        <form onSubmit={handleManualSubmit} className="glass-card rounded-2xl p-8 space-y-6 relative">
          {/* Glowing effect around input when voice is active */}
          {isVoiceModeActive && (
            <>
              <motion.div
                className="absolute -inset-1 rounded-2xl pointer-events-none"
                animate={{ 
                  boxShadow: [
                    '0 0 20px 5px rgba(var(--primary-rgb, 59, 130, 246), 0.3)',
                    '0 0 40px 10px rgba(var(--primary-rgb, 59, 130, 246), 0.5)',
                    '0 0 20px 5px rgba(var(--primary-rgb, 59, 130, 246), 0.3)',
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 left-0 right-0 text-center"
              >
                <p className="text-sm text-primary font-medium">
                  🎤 Listening... {interimTranscript && `"${interimTranscript}"`}
                </p>
              </motion.div>
            </>
          )}
            <div className="space-y-2 relative">
              <label htmlFor="username" className="text-lg font-medium text-foreground">
                Username
              </label>
              <div className="relative">
                {isVoiceModeActive && (
                  <motion.div
                    className="absolute -inset-1 rounded-lg pointer-events-none"
                    animate={{ 
                      boxShadow: [
                        '0 0 10px 2px rgba(59, 130, 246, 0.4)',
                        '0 0 20px 4px rgba(59, 130, 246, 0.6)',
                        '0 0 10px 2px rgba(59, 130, 246, 0.4)',
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                )}
                <Input
                  id="username"
                  type="text"
                  placeholder={isVoiceModeActive ? (interimTranscript || "Listening...") : "Enter your username"}
                  value={username || (isVoiceModeActive && interimTranscript ? interimTranscript : '')}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`text-lg py-6 relative z-10 ${isVoiceModeActive ? 'border-primary/50' : ''}`}
                  autoFocus
                  readOnly={isVoiceModeActive}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 text-lg py-6"
                disabled={!username.trim()}
              >
                <ArrowRight className="w-5 h-5" />
                Continue
              </Button>
            </div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <div className="glass-card rounded-xl p-4 relative overflow-hidden">
              {isListening && !isVoiceModeActive && (
                <motion.div
                  className="absolute inset-0 bg-primary/5"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
              <div className="relative">
                <p className="text-sm text-muted-foreground">
                  Say <span className="font-bold text-primary">"Hey Vision"</span> to activate voice mode
                </p>
                {interimTranscript && !isVoiceModeActive && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-primary mt-2 italic"
                  >
                    "{interimTranscript}"
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
    </motion.div>
  );
};
