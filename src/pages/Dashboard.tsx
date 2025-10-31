import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, User, Mic, MessageSquare, Send } from 'lucide-react';
import { useAdvancedVoice } from '@/hooks/useAdvancedVoice';
import { GlassCard } from '@/components/GlassCard';
import { NavigationBar } from '@/components/NavigationBar';
import { QuickNav } from '@/components/QuickNav';
import { EnhancedListeningIndicator } from '@/components/EnhancedListeningIndicator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DashboardProps {
  username: string;
  onLogout: () => void;
  isVoiceModeActive: boolean;
}

export const Dashboard = ({ username, onLogout, isVoiceModeActive }: DashboardProps) => {
  const navigate = useNavigate();
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  
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
  } = useAdvancedVoice({ continuous: true, contextualHelp: true });

  const handleVoiceCommand = (command: { intent: string; confidence: number; entities?: Record<string, string> }) => {
    console.log('Voice command received:', command);

    switch (command.intent) {
      case 'navigate_liveCamera':
        speak('Starting live camera mode.');
        setTimeout(() => navigate('/live-detection'), 1000);
        break;

      case 'navigate_videoUpload':
        speak('Opening upload files.');
        setTimeout(() => navigate('/video-playback'), 1000);
        break;

      case 'navigate_dashboard':
        speak('You are already on the dashboard.');
        break;

      case 'navigate_logout':
        speak('Logging you out. Goodbye!');
        setTimeout(() => {
          stopListening();
          onLogout();
          navigate('/');
        }, 1500);
        break;

      case 'navigate_back':
        speak('You are on the main dashboard.');
        break;

      case 'action_help':
        // Handled by useAdvancedVoice
        break;

      default:
        if (command.confidence < 0.5) {
          speak('I didn\'t understand that. Try saying "help" for available commands.');
        }
    }
  };

  // Separate useEffect for one-time voice interface activation
  useEffect(() => {
    if (isVoiceModeActive && !showVoiceInterface) {
      console.log('🎤 Dashboard - Activating voice interface (one-time)');
      setShowVoiceInterface(true);
      activateVoiceMode('dashboard');
    }
  }, [isVoiceModeActive]);

  // Welcome message - runs when voice mode becomes active
  useEffect(() => {
    console.log('🏠 Dashboard - Voice mode check:', {
      isVoiceModeActive,
      hasPlayedWelcome,
      isSpeaking,
      username
    });
    
    if (isVoiceModeActive && !hasPlayedWelcome && !isSpeaking) {
      console.log('🏠 Dashboard - Voice mode is active, starting welcome sequence');
      setHasPlayedWelcome(true); // Mark as played to prevent repeats
      
      // Small delay to ensure component is fully rendered and previous TTS finished
      setTimeout(() => {
        console.log('👋 Dashboard - Speaking welcome message');
        speak(`Welcome, ${username}. You can say 'Start Camera' for live detection, 'Upload File' to analyze a video, or 'Log Out'.`);
        
        // Start listening after welcome message completes
        setTimeout(() => {
          console.log('🎧 Dashboard - Starting listener');
          startListening(handleVoiceCommand, 'dashboard');
        }, 4000); // Wait for welcome message to finish (increased from 3000)
      }, 1000); // Increased delay to ensure previous page's TTS is done
    } else {
      if (!isVoiceModeActive) console.log('⚠️  Dashboard - Voice mode not active');
      if (hasPlayedWelcome) console.log('⚠️  Dashboard - Welcome already played');
      if (isSpeaking) console.log('⚠️  Dashboard - App is currently speaking, waiting...');
    }
  }, [isVoiceModeActive, hasPlayedWelcome, isSpeaking, username]);

  // Cleanup: stop listening when component unmounts
  useEffect(() => {
    return () => {
      console.log('🏠 Dashboard - Component unmounting, stopping listener');
      stopListening();
    };
  }, []);

  const deactivateVoiceControl = () => {
    setShowVoiceInterface(false);
    stopListening();
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      setFeedbackSubmitted(true);
      speak('Thank you for your feedback!');
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedback('');
        setIsFeedbackExpanded(false);
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-background via-background to-muted/20 relative"
    >
      {/* Gemini-style glow effect when voice is active */}
      {showVoiceInterface && (
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
        className="mb-12 relative z-10"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-background" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <p className="text-lg font-semibold text-foreground">{username}</p>
            </div>
          </div>
          <NavigationBar currentPage="dashboard" onLogout={onLogout} />
        </div>
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">
            MyVision
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Navigate the world with AI-powered assistance
          </p>
        </div>
      </motion.div>

      {/* Voice feedback above cards when active */}
      {showVoiceInterface && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6 text-center relative z-10"
        >
          <p className="text-sm text-primary font-medium">
            🎤 Listening... {interimTranscript && `"${interimTranscript}"`}
          </p>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative"
        >
          {showVoiceInterface && (
            <motion.div
              className="absolute -inset-1 rounded-2xl pointer-events-none"
              animate={{ 
                boxShadow: [
                  '0 0 15px 3px rgba(59, 130, 246, 0.3)',
                  '0 0 30px 6px rgba(59, 130, 246, 0.5)',
                  '0 0 15px 3px rgba(59, 130, 246, 0.3)',
                ]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
          <GlassCard
            icon={Camera}
            title="Live Detection"
            description="Real-time camera AI analysis"
            onClick={() => navigate('/live-detection')}
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative"
        >
          {showVoiceInterface && (
            <motion.div
              className="absolute -inset-1 rounded-2xl pointer-events-none"
              animate={{ 
                boxShadow: [
                  '0 0 15px 3px rgba(59, 130, 246, 0.3)',
                  '0 0 30px 6px rgba(59, 130, 246, 0.5)',
                  '0 0 15px 3px rgba(59, 130, 246, 0.3)',
                ]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
          <GlassCard
            icon={Upload}
            title="Upload Files"
            description="Upload and analyze images or videos"
            onClick={() => navigate('/video-playback')}
          />
        </motion.div>
      </div>

      {/* Feedback Button/Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          width: isFeedbackExpanded ? '320px' : 'auto'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 glass-card rounded-xl shadow-lg z-40 overflow-hidden"
      >
        {!isFeedbackExpanded ? (
          <Button
            onClick={() => setIsFeedbackExpanded(true)}
            className="gap-2 px-4 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            size="lg"
          >
            <MessageSquare className="w-5 h-5" />
            Feedback
          </Button>
        ) : (
          <div className="p-4 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFeedbackExpanded(false)}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            
            {feedbackSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <p className="text-sm font-medium text-primary">Thanks!</p>
                <p className="text-xs text-muted-foreground mt-1">Your feedback was submitted.</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 text-sm"
                  autoFocus
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  className="w-full gap-2"
                  size="sm"
                >
                  <Send className="w-3 h-3" />
                  Send
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <QuickNav currentPage="dashboard" onLogout={onLogout} />
    </motion.div>
  );
};
