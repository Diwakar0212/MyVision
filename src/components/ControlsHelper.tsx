import { Keyboard, Mouse, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export const ControlsHelper = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-6 glass-card rounded-xl p-4 max-w-xs z-50"
    >
      <h3 className="text-sm font-semibold mb-3 gradient-text">Navigation Options</h3>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mouse className="w-4 h-4 text-primary" />
          <span>Click buttons & cards to navigate</span>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          <span>Use voice commands</span>
        </div>
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          <span>Tab to focus, Enter to activate</span>
        </div>
      </div>
    </motion.div>
  );
};
