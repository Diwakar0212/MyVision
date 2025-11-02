import { useEffect, useRef, useState } from "react";
import { Camera, Circle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LiveCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Function to start camera
  const startCamera = async () => {
    setError(null);
    try {
      console.log("Requesting camera...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        // Using 'true' requests the default resolution; we can also specify width/height
        video: true,
        audio: false,
      });
      console.log("Camera stream acquired:", mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Crucial: Play video after setting source
        await videoRef.current.play().catch((err) => {
          console.warn("Autoplay prevented:", err);
        });
      }

      setStream(mediaStream);
      setIsActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err.message || "Unable to access camera. Please check permissions.");
    }
  };

  // ✅ Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    // Optionally remove srcObject when stopping
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  // ✅ Cleanup when unmounting
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link to="/dashboard">
          <Button variant="ghost" className="text-white border border-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center">
        Live Camera Feed
      </h1>

      {error && (
        <div className="text-red-400 mb-4 text-center">
          ⚠️ **{error}**
          <br />
          <span className="text-sm text-gray-400">
            Ensure you are serving the page over **HTTPS** or **localhost** and have allowed camera permissions.
          </span>
        </div>
      )}

      {/* Camera View */}
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        {isActive && (
          <Badge className="absolute top-4 right-4 z-10 bg-red-500/90 text-white border-0 animate-pulse">
            <Circle className="h-2 w-2 mr-2 fill-white" /> LIVE
          </Badge>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // These classes are critical for full screen video display within its container:
          className="w-full h-full object-contain bg-black"
        />
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        {!isActive ? (
          <Button
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="mr-2 h-4 w-4" /> **Start Camera**
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            **Stop Camera**
          </Button>
        )}
      </div>

      {/* Debug info */}
      <div className="mt-6 text-gray-400 text-sm text-center">
        <p>
          {isActive
            ? "Camera is active. If no video appears, check browser console for video errors."
            : "Click Start Camera to begin."}
        </p>
      </div>
    </div>
  );
};

export default LiveCamera;