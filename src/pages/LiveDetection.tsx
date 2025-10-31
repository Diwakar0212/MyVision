import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, StopCircle, ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LiveDetectionProps {
  isVoiceModeActive?: boolean;
}

export const LiveDetection = ({ isVoiceModeActive }: LiveDetectionProps) => {
  const navigate = useNavigate();
  const { speak, startListening } = useVoice();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastAlert, setLastAlert] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        
        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:8000/api/detect/live');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          speak('Live detection started');
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          speak('Connection error. Please try again.');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Update voice description (only if not empty)
            if (data.voice_description && data.voice_description.trim() && data.voice_description !== lastAlert) {
              setLastAlert(data.voice_description);
              speak(data.voice_description);
            }
            
            console.log('Detections:', data.detections);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        // Create canvas for frame capture
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        // Send frames every 2 seconds
        intervalRef.current = setInterval(() => {
          if (videoRef.current && canvasRef.current && ws.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to base64 and send
              const frameData = canvas.toDataURL('image/jpeg', 0.8);
              ws.send(frameData);
            }
          }
        }, 2000); // Send frame every 2 seconds
      }
    } catch (error) {
      console.error('Camera error:', error);
      speak('Camera access denied. Please enable camera permissions in settings.');
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  };

  const stopCamera = () => {
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    // Close WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log('🔌 WebSocket closed');
    }
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsActive(false);
    speak('Camera stopped. Returning to dashboard.');
    setTimeout(() => navigate('/dashboard'), 1500);
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

  useEffect(() => {
    speak('Starting your live camera. Say "Stop Camera" anytime to exit.');
    
    setTimeout(() => {
      startCamera();
      
      const listenForStop = () => {
        startListening((text) => {
          if (text.toLowerCase().includes('stop')) {
            stopCamera();
          } else {
            setTimeout(listenForStop, 1000);
          }
        });
      };
      
      setTimeout(listenForStop, 2000);
    }, 2000);

    return () => {
      // Cleanup on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
              Live Detection
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              AI Eyes Mode Active • Share your experience below
            </p>
          </div>
        </motion.div>

        <div className="relative rounded-2xl overflow-hidden glass-card">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video bg-muted"
          />
          
          {isActive && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">LIVE</span>
            </div>
          )}
        </div>

        {lastAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-2xl glass-card text-center"
          >
            <p className="text-xl md:text-2xl font-medium text-foreground">
              {lastAlert}
            </p>
          </motion.div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={stopCamera}
            size="lg"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2 px-8 py-6 text-lg rounded-xl"
          >
            <StopCircle className="w-6 h-6" />
            Stop Camera
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="gap-2 px-8 py-6 text-lg rounded-xl"
          >
            <ArrowLeft className="w-6 h-6" />
            Back to Dashboard
          </Button>
        </div>

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
    </motion.div>
  );
};
