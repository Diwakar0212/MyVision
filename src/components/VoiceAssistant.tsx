import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useEffect } from "react";

interface VoiceAssistantProps {
  pageDescription: string;
  autoSpeak?: boolean;
}

const VoiceAssistant = ({ pageDescription, autoSpeak = true }: VoiceAssistantProps) => {
  const { speak, toggle, isSpeaking, isEnabled } = useVoiceAssistant();

  useEffect(() => {
    if (autoSpeak && isEnabled && pageDescription) {
      // Delay to allow page to load
      const timer = setTimeout(() => {
        speak(pageDescription);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pageDescription, autoSpeak, isEnabled]);

  return (
    <Button
      onClick={toggle}
      size="icon"
      variant={isSpeaking ? "default" : "ghost"}
      className="fixed top-4 right-20 z-50 smooth-transition"
      title={isEnabled ? "Voice assistance enabled" : "Voice assistance disabled"}
    >
      {isEnabled ? (
        <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceAssistant;
