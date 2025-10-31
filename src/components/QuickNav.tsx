import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Camera, Upload, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/hooks/useVoice';

interface QuickNavProps {
  currentPage?: string;
  onLogout?: () => void;
}

export const QuickNav = ({ currentPage, onLogout }: QuickNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { speak } = useVoice();

  const handleNavigation = (path: string, message: string) => {
    speak(message);
    setIsOpen(false);
    setTimeout(() => navigate(path), 500);
  };

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      message: 'Going to dashboard.',
      show: currentPage !== 'dashboard'
    },
    {
      icon: Camera,
      label: 'Live Camera',
      path: '/live-detection',
      message: 'Starting live camera.',
      show: currentPage !== 'live-detection'
    },
    {
      icon: Upload,
      label: 'Upload Files',
      path: '/video-playback',
      message: 'Opening upload files.',
      show: currentPage !== 'video-playback'
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 left-0 glass-card rounded-2xl p-4 mb-2 min-w-[200px]"
          >
            <div className="space-y-2">
              {navItems.filter(item => item.show).map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path, item.message)}
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start gap-3 hover:bg-primary/10"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
              {onLogout && (
                <>
                  <div className="border-t border-border my-2" />
                  <Button
                    onClick={() => {
                      speak('Logging you out. Goodbye!');
                      setIsOpen(false);
                      setTimeout(() => {
                        onLogout();
                        navigate('/');
                      }, 1500);
                    }}
                    variant="ghost"
                    size="lg"
                    className="w-full justify-start gap-3 hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-primary to-secondary hover:opacity-90"
        aria-label="Quick navigation menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
    </div>
  );
};
