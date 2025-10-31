import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdvancedVoice } from '@/hooks/useAdvancedVoice';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PinEntryProps {
  username: string;
  onPinSuccess: () => void;
  isVoiceModeActive: boolean;
}

export const PinEntry = ({ username, onPinSuccess, isVoiceModeActive }: PinEntryProps) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>([]);
  const [pinValue, setPinValue] = useState('');

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

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pinValue.length === 4) {
      const digits = pinValue.split('');
      setPin(digits);
      speak('PIN accepted. Logging you in.');
      stopListening();
      onPinSuccess(); // Set authentication
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleVoiceCommand = (command: { intent: string; confidence: number; entities?: Record<string, string> }) => {
    console.log('PIN - Voice command received:', command);
    console.log('PIN - Current isSpeaking:', isSpeaking);
    
    // Don't process commands while app is speaking
    if (isSpeaking) {
      console.log('PIN - Ignoring command while app is speaking');
      return;
    }

    // Handle PIN input
    if (command.intent === 'number_input' && command.entities?.numbers) {
      const digits = command.entities.numbers.slice(0, 4);
      console.log('PIN - Numbers detected:', digits);
      
      if (digits.length === 4) {
        // Display PIN in both the boxes and OTP input
        setPinValue(digits);
        setPin(digits.split(''));
        
        speak('PIN accepted. Logging you in.');
        stopListening();
        onPinSuccess();
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (digits.length > 0) {
        speak(`I heard ${digits.length} digit${digits.length !== 1 ? 's' : ''}. Please say exactly 4 digits for your PIN.`);
      }
    } else if (command.intent === 'navigate_back') {
      speak('Going back to login.');
      stopListening();
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  // Watch transcript and update PIN field in real-time
  useEffect(() => {
    console.log('📝 PIN - Transcript watcher:', {
      transcript,
      isSpeaking,
      isVoiceModeActive,
      pinValue
    });

    // Don't capture while app is speaking
    if (isSpeaking) {
      console.log('🔇 PIN - Skipping transcript while app is speaking');
      return;
    }

    if (isVoiceModeActive && transcript && transcript.trim()) {
      const numbers = transcript.match(/\d+/g);
      console.log('🔢 PIN - Numbers found in transcript:', numbers);
      
      if (numbers) {
        const allDigits = numbers.join('');
        if (allDigits.length >= 4) {
          const pin4digits = allDigits.slice(0, 4);
          console.log('✅ PIN - Valid 4 digits found:', pin4digits);
          setPinValue(pin4digits);
          setPin(pin4digits.split(''));
          
          // Auto-proceed after getting 4 digits
          setTimeout(() => {
            speak('PIN accepted. Logging you in.');
            stopListening();
            onPinSuccess();
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }, 500);
        } else {
          console.log('⚠️  PIN - Not enough digits:', allDigits.length);
        }
      }
    }
  }, [transcript, isVoiceModeActive, isSpeaking]);

  useEffect(() => {
    // Auto-submit when 4 digits are entered
    if (pinValue.length === 4 && !isVoiceModeActive) {
      handleManualSubmit();
    }
  }, [pinValue, isVoiceModeActive]);

  useEffect(() => {
    if (isVoiceModeActive) {
      console.log('🔐 PIN Page - Voice mode active, initializing...');
      
      // Give a brief welcome and start listening
      const timer = setTimeout(() => {
        speak('Please say your 4-digit PIN.');
        
        // Start listening after the message
        setTimeout(() => {
          activateVoiceMode('pin');
          startListening(handleVoiceCommand, 'pin');
          console.log('🎤 PIN Page - Listening for PIN');
        }, 2000); // Wait for welcome message to finish
      }, 500);

      return () => {
        console.log('🛑 PIN Page - Cleaning up');
        clearTimeout(timer);
        stopListening();
      };
    }
  }, [isVoiceModeActive]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
          Enter PIN
        </h2>
        <p className="text-lg text-muted-foreground">Welcome, {username}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
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
                    '0 0 20px 5px rgba(59, 130, 246, 0.3)',
                    '0 0 40px 10px rgba(59, 130, 246, 0.5)',
                    '0 0 20px 5px rgba(59, 130, 246, 0.3)',
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
              <div className="space-y-4">
                <label htmlFor="pin" className="text-lg font-medium text-foreground text-center block">
                  Enter your 4-digit PIN
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pinValue}
                    onChange={(value) => setPinValue(value)}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                      <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 text-lg py-6"
                  disabled={pinValue.length !== 4}
                >
                  <ArrowRight className="w-5 h-5" />
                  Continue
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full gap-2 text-lg py-6"
                  onClick={() => navigate('/login')}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Login
                </Button>
              </div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                {!isVoiceModeActive && "Say "}
                {!isVoiceModeActive && <span className="font-bold text-primary">"Hey"</span>}
                {!isVoiceModeActive && " to activate voice"}
              </p>
            </motion.div>
      </motion.div>
    </motion.div>
  );
};
