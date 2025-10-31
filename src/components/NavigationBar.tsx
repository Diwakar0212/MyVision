import { useNavigate } from 'react-router-dom';
import { Home, Camera, Upload, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/hooks/useVoice';

interface NavigationBarProps {
  currentPage?: 'dashboard' | 'live-detection' | 'video-playback';
  onLogout?: () => void;
  showBack?: boolean;
}

export const NavigationBar = ({ currentPage, onLogout, showBack = false }: NavigationBarProps) => {
  const navigate = useNavigate();
  const { speak } = useVoice();

  const handleNavigation = (path: string, message: string) => {
    speak(message);
    setTimeout(() => navigate(path), 500);
  };

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            onClick={() => handleNavigation('/dashboard', 'Returning to dashboard.')}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        
        {currentPage !== 'dashboard' && (
          <Button
            onClick={() => handleNavigation('/dashboard', 'Going to dashboard.')}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {currentPage !== 'live-detection' && (
          <Button
            onClick={() => handleNavigation('/live-detection', 'Opening live detection.')}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl"
          >
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">Live Camera</span>
          </Button>
        )}

        {currentPage !== 'video-playback' && (
          <Button
            onClick={() => handleNavigation('/video-playback', 'Opening upload files.')}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload Files</span>
          </Button>
        )}

        {onLogout && (
          <Button
            onClick={() => {
              speak('Logging you out. Goodbye!');
              setTimeout(() => {
                onLogout();
                navigate('/');
              }, 1500);
            }}
            variant="destructive"
            size="lg"
            className="gap-2 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        )}
      </div>
    </div>
  );
};
