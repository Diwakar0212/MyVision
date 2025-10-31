import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/button';
import { NavigationBar } from '@/components/NavigationBar';
import { QuickNav } from '@/components/QuickNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Detection {
  bbox: number[];
  confidence: number;
  class_id: number;
  label: string;
  color?: string;
}

interface DetectionResults {
  success: boolean;
  type?: string; // "image" or "video"
  filename?: string;
  detections: {
    objects: Detection[];
    traffic_lights: Detection[];
    zebra_crossings: Detection[];
  };
  counts: {
    total_objects: number;
    traffic_lights: number;
    zebra_crossings: number;
  };
  voice_description: string;
  annotated_image?: string; // For images
  annotated_video?: string; // For videos (base64)
  video_info?: {
    total_frames: number;
    processed_frames: number;
    fps: number;
    duration: number;
  };
}

interface VideoPlaybackProps {
  isVoiceModeActive?: boolean;
}

export const VideoPlayback = ({ isVoiceModeActive }: VideoPlaybackProps) => {
  const navigate = useNavigate();
  const { speak, startListening } = useVoice();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEvents, setAudioEvents] = useState<Array<{ time: number; text: string }>>([]);
  const [detectionResults, setDetectionResults] = useState<DetectionResults | null>(null);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEventRef = useRef<number>(-1);

  useEffect(() => {
    // Smart initial announcement based on state
    if (!file) {
      speak('Welcome to Upload Files. You can upload images or videos for AI analysis. Say upload, or click the upload button.');
    }
    
    const listenForCommand = () => {
      startListening((text) => {
        const command = text.toLowerCase();
        
        if (command.includes('back') || command.includes('return') || command.includes('dashboard')) {
          speak('Going back to dashboard.');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else if (command.includes('play') && file && !isPlaying) {
          handlePlay();
        } else if (command.includes('upload') && !file) {
          // Silently open file selector without announcement to avoid repetition
          fileInputRef.current?.click();
        } else if (command.includes('new') || command.includes('another')) {
          speak('Select a new file.');
          setFile(null);
          setVideoUrl('');
          setDetectionResults(null);
          setError('');
          setTimeout(() => fileInputRef.current?.click(), 500);
        } else {
          setTimeout(listenForCommand, 1000);
        }
      });
    };

    setTimeout(listenForCommand, 2000);
  }, [file, isPlaying]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setDetectionResults(null);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    
    // Smart announcement based on file type
    const fileType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
    const fileName = selectedFile.name.substring(0, 20); // Limit name length
    speak(`${fileType === 'video' ? 'Video' : 'Image'} selected: ${fileName}. Processing with AI models, please wait.`);
    setIsProcessing(true);

    try {
      // Send to backend API (unified endpoint auto-detects image/video)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence', '0.4');
      formData.append('sample_rate', '5'); // For videos

      const response = await fetch('http://localhost:8000/api/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const results: DetectionResults = await response.json();
      setDetectionResults(results);
      setIsProcessing(false);
      
      // Smart announcement based on what was found
      const fileType = results.type === 'video' ? 'video' : 'image';
      const hasObjects = results.counts.total_objects > 0;
      const hasTraffic = results.counts.traffic_lights > 0;
      const hasCrossings = results.counts.zebra_crossings > 0;
      
      if (!hasObjects && !hasTraffic && !hasCrossings) {
        speak(`Analysis complete. No objects detected in this ${fileType}. You can upload another file or go back.`);
      } else {
        // Speak the AI-generated natural description first
        if (results.voice_description && results.voice_description.trim()) {
          speak(`Analysis complete. ${results.voice_description}`);
        }
        
        // Then provide detailed counts
        setTimeout(() => {
          const parts = [];
          if (hasObjects) parts.push(`${results.counts.total_objects} object${results.counts.total_objects !== 1 ? 's' : ''}`);
          if (hasTraffic) parts.push(`${results.counts.traffic_lights} traffic light${results.counts.traffic_lights !== 1 ? 's' : ''}`);
          if (hasCrossings) parts.push(`${results.counts.zebra_crossings} zebra crossing${results.counts.zebra_crossings !== 1 ? 's' : ''}`);
          
          const summary = `In total, I found ${parts.join(', ')}.`;
          speak(summary);
          
          // Additional help
          setTimeout(() => {
            if (results.type === 'video') {
              speak('Say play to watch the annotated video, or upload another file.');
            } else {
              speak('You can view the annotated image on screen, or upload another file.');
            }
          }, 3000);
        }, 4000);
      }

    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process file. Please try again.');
      setIsProcessing(false);
      speak('Sorry, I encountered an error processing this file. It may be corrupted or in an unsupported format. Please try uploading a different file.');
    }
  };

  const handlePlay = () => {
    if (!videoRef.current) return;
    
    setIsPlaying(true);
    videoRef.current.play();
    
    // Smart playback announcement
    if (detectionResults?.video_info) {
      const duration = Math.round(detectionResults.video_info.duration);
      speak(`Playing annotated video. Duration: ${duration} seconds. Watch the screen for detected objects highlighted.`);
    } else {
      speak('Playing video with AI detections highlighted.');
    }
    
    // Monitor video time and speak alerts
    const checkEvents = setInterval(() => {
      if (!videoRef.current) return;
      
      const currentTime = videoRef.current.currentTime;
      const nextEvent = audioEvents.find((event, index) => 
        event.time <= currentTime && index > lastEventRef.current
      );
      
      if (nextEvent) {
        const eventIndex = audioEvents.indexOf(nextEvent);
        lastEventRef.current = eventIndex;
        speak(nextEvent.text);
      }
      
      if (videoRef.current.ended) {
        clearInterval(checkEvents);
        setIsPlaying(false);
        speak('Playback finished. You can replay the video, upload another file, or return to dashboard.');
      }
    }, 500);
  };

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
          <div className="flex items-center justify-between mb-6">
            <NavigationBar currentPage="video-playback" showBack />
            {file && (
              <Button
                onClick={() => {
                  setFile(null);
                  setVideoUrl('');
                  setIsProcessing(false);
                  setIsPlaying(false);
                  setAudioEvents([]);
                  setDetectionResults(null);
                  setError('');
                  lastEventRef.current = -1;
                  speak('Ready for a new upload.');
                }}
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
                New Upload
              </Button>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
              Upload Files
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Upload and analyze images or videos • Click buttons to navigate
            </p>
          </div>
        </motion.div>

        {!file ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Upload className="w-12 h-12 text-background" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3 gradient-text">
              Upload Media for Analysis
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              Click or say "Upload" to select an image or video
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 border-destructive"
              >
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Image/Video Display */}
            <div className="relative rounded-2xl overflow-hidden glass-card">
              {detectionResults ? (
                // Display annotated results (image or video)
                detectionResults.type === 'video' && detectionResults.annotated_video ? (
                  <video
                    controls
                    className="w-full h-auto object-contain bg-black"
                    style={{ maxHeight: '70vh' }}
                  >
                    <source src={detectionResults.annotated_video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={detectionResults.annotated_image}
                    alt="Detection Results"
                    className="w-full h-auto object-contain bg-black"
                    style={{ maxHeight: '70vh', imageRendering: 'auto' }}
                  />
                )
              ) : (
                // Display original file while processing
                file?.type.startsWith('video/') ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-auto object-contain bg-black"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <img
                    src={videoUrl}
                    alt="Uploaded image"
                    className="w-full h-auto object-contain bg-black"
                    style={{ maxHeight: '70vh', imageRendering: 'auto' }}
                  />
                )
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="listening-orb mb-6 mx-auto" />
                    <p className="text-xl font-medium text-foreground">Analyzing with AI...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {file?.type.startsWith('video/') 
                        ? 'Processing video frame by frame...' 
                        : 'Running 3 detection models...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Detection Results */}
            {detectionResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Video Info (if video) */}
                {detectionResults.type === 'video' && detectionResults.video_info && (
                  <Card className="glass-card p-6 rounded-2xl md:col-span-2">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎬</span>
                      Video Processing Info
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Frames</p>
                        <p className="text-2xl font-bold">{detectionResults.video_info.total_frames}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Processed</p>
                        <p className="text-2xl font-bold">{detectionResults.video_info.processed_frames}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">FPS</p>
                        <p className="text-2xl font-bold">{detectionResults.video_info.fps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-2xl font-bold">{detectionResults.video_info.duration.toFixed(1)}s</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Voice Description */}
                <Card className="glass-card p-6 rounded-2xl md:col-span-2">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎤</span>
                    AI Description
                  </h3>
                  <p className="text-lg text-foreground">{detectionResults.voice_description}</p>
                </Card>

                {/* Objects Detected */}
                <Card className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-3">
                    Objects ({detectionResults.counts.total_objects})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detectionResults.detections.objects.length > 0 ? (
                      detectionResults.detections.objects.map((obj, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="font-medium">{obj.label}</span>
                          <Badge variant="secondary">{(obj.confidence * 100).toFixed(0)}%</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No objects detected</p>
                    )}
                  </div>
                </Card>

                {/* Traffic Lights */}
                <Card className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-3">
                    Traffic Lights ({detectionResults.counts.traffic_lights})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detectionResults.detections.traffic_lights.length > 0 ? (
                      detectionResults.detections.traffic_lights.map((light, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="font-medium capitalize">{light.label}</span>
                          <Badge 
                            variant="secondary"
                            className={
                              light.label === 'red' ? 'bg-red-500/20 text-red-500' :
                              light.label === 'green' ? 'bg-green-500/20 text-green-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {(light.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No traffic lights detected</p>
                    )}
                  </div>
                </Card>

                {/* Zebra Crossings */}
                <Card className="glass-card p-6 rounded-2xl md:col-span-2">
                  <h3 className="text-lg font-bold mb-3">
                    Zebra Crossings ({detectionResults.counts.zebra_crossings})
                  </h3>
                  <div className="space-y-2">
                    {detectionResults.detections.zebra_crossings.length > 0 ? (
                      detectionResults.detections.zebra_crossings.map((crossing, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <span className="font-medium">Zebra Crossing {idx + 1}</span>
                          <Badge variant="secondary">{(crossing.confidence * 100).toFixed(0)}%</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No zebra crossings detected</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  speak('Returning to dashboard.');
                  setTimeout(() => navigate('/dashboard'), 1000);
                }}
                size="lg"
                variant="outline"
                className="gap-2 px-8 py-6 text-lg rounded-xl"
              >
                <ArrowLeft className="w-6 h-6" />
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <QuickNav currentPage="video-playback" />
    </motion.div>
  );
};
