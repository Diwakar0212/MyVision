import { useState, useCallback } from "react";
import { ArrowLeft, Upload as UploadIcon, File, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { speak } = useVoiceAssistant();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      speak(`${droppedFiles.length} file${droppedFiles.length > 1 ? 's' : ''} added for analysis`);
    }
  }, [speak]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      speak(`${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    speak("File removed");
  };

  const analyzeFiles = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    speak(`Analyzing ${files.length} file${files.length > 1 ? 's' : ''}. Please wait.`);

    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${files.length} file${files.length > 1 ? 's' : ''}`,
      });
      speak("Analysis complete. Check the output page for detailed results.");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Upload Files page. Upload images or videos to analyze with AI assistance. You can drag and drop or click to select files." />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/live-camera">
              <Button variant="outline" size="sm">
                Live Camera
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Upload Files</h1>
            <p className="text-xl text-muted-foreground">
              Upload and analyze images or videos • Click buttons to navigate
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`bg-card border-2 border-dashed ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            } rounded-2xl p-12 smooth-transition`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl gradient-icon flex items-center justify-center mx-auto">
                <UploadIcon className="h-10 w-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold gradient-text">Upload Media for Analysis</h3>
                <p className="text-muted-foreground">
                  Click or say "Upload" to select an image or video
                </p>
              </div>

              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                />
                <label htmlFor="file-upload">
                  <Button asChild className="cursor-pointer">
                    <span>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Choose Files
                    </span>
                  </Button>
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Supports images (JPG, PNG, GIF) and videos (MP4, MOV, AVI)
              </p>
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Selected Files ({files.length})</h3>
                <Button
                  onClick={analyzeFiles}
                  disabled={isAnalyzing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Analyze Files</>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-icon flex items-center justify-center">
                        <File className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="opacity-0 group-hover:opacity-100 smooth-transition"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
