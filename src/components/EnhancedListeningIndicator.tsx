import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

interface EnhancedListeningIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript?: string;
  interimTranscript?: string;
  isWaitingForWakeWord?: boolean;
  lastCommand?: { intent: string; confidence: number } | null;
}

export const EnhancedListeningIndicator = ({
  isListening,
  isSpeaking,
  transcript,
  interimTranscript,
  isWaitingForWakeWord = false,
  lastCommand
}: EnhancedListeningIndicatorProps) => {
  
  const getStatusMessage = () => {
    if (isSpeaking) return 'Speaking...';
    if (isWaitingForWakeWord) return 'Say "Hey MyVision" to activate';
    if (isListening && interimTranscript) return 'Listening...';
    if (isListening) return 'Ready to listen';
    return 'Voice inactive';
  };

  const getStatusColor = () => {
    if (isSpeaking) return 'from-blue-500 to-cyan-500';
    if (isWaitingForWakeWord) return 'from-yellow-500 to-orange-500';
    if (isListening) return 'from-primary to-secondary';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md space-y-4"
    >
      {/* Main Orb */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: isListening || isSpeaking ? [1, 1.2, 1] : 1,
            opacity: isListening || isSpeaking ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: isListening || isSpeaking ? Infinity : 0,
            ease: "easeInOut"
          }}
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-br ${getStatusColor()} blur-2xl`}
        />
        
        <motion.div
          animate={{
            rotate: isListening || isSpeaking ? 360 : 0,
          }}
          transition={{
            duration: 3,
            repeat: isListening || isSpeaking ? Infinity : 0,
            ease: "linear"
          }}
          className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center shadow-lg`}
        >
          {isSpeaking ? (
            <Volume2 className="w-12 h-12 text-white" />
          ) : isListening ? (
            <Mic className="w-12 h-12 text-white" />
          ) : (
            <MicOff className="w-12 h-12 text-white opacity-50" />
          )}
        </motion.div>

        {/* Pulse rings */}
        {(isListening || isSpeaking) && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
                className={`absolute w-24 h-24 rounded-full border-2 border-primary`}
              />
            ))}
          </>
        )}
      </div>

      {/* Status Message */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-foreground mb-2">
          {getStatusMessage()}
        </p>
        
        {isWaitingForWakeWord && (
          <p className="text-sm text-muted-foreground">
            Or continue using keyboard/mouse
          </p>
        )}
      </motion.div>

      {/* Transcript Display */}
      <AnimatePresence mode="wait">
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="space-y-2">
              {interimTranscript && (
                <p className="text-muted-foreground italic text-sm">
                  {interimTranscript}
                </p>
              )}
              {transcript && (
                <div className="space-y-1">
                  <p className="text-foreground font-medium">
                    "{transcript}"
                  </p>
                  {lastCommand && lastCommand.confidence > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Intent:</span>
                      <span className="text-primary font-medium">
                        {lastCommand.intent.replace(/_/g, ' ')}
                      </span>
                      <span className="text-muted-foreground">
                        ({Math.round(lastCommand.confidence * 100)}% confident)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Examples */}
      {!isListening && !isSpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <p className="text-xs text-muted-foreground font-medium">Try saying:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Go to dashboard', 'Start camera', 'Help'].map((cmd) => (
              <span
                key={cmd}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                "{cmd}"
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
