import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface ListeningIndicatorProps {
  isListening: boolean;
  transcript?: string;
}

export const ListeningIndicator = ({ isListening, transcript }: ListeningIndicatorProps) => {
  if (!isListening && !transcript) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-6"
    >
      {isListening && (
        <div className="listening-orb flex items-center justify-center">
          <Mic className="w-12 h-12 text-background" />
        </div>
      )}
      
      {transcript && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl text-foreground/90 text-center max-w-2xl px-6"
        >
          {transcript}
        </motion.p>
      )}
    </motion.div>
  );
};
