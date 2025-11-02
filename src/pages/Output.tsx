import { ArrowLeft, FileText, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VoiceAssistant from "@/components/VoiceAssistant";

const Output = () => {
  const sampleOutputs = [
    {
      id: 1,
      type: "Image Analysis",
      result: "Living room scene with a blue sofa, coffee table, and window with natural light",
      confidence: "95%",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "Text Recognition",
      result: "Street sign: Main Street, Speed Limit 30 mph",
      confidence: "98%",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "Object Detection",
      result: "Detected: Person (2), Car (3), Bicycle (1), Traffic Light (2)",
      confidence: "92%",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Output page. View your AI analysis results and insights from previous sessions. Each result shows confidence level and detailed descriptions." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Output</h1>
            <p className="text-xl text-muted-foreground">AI analysis results and insights</p>
          </div>

          <div className="space-y-4">
            {sampleOutputs.map((output) => (
              <div key={output.id} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary" className="font-medium">
                        {output.type}
                      </Badge>
                      <Badge variant="outline" className="border-primary text-primary">
                        {output.confidence} confidence
                      </Badge>
                      <span className="text-sm text-muted-foreground">{output.timestamp}</span>
                    </div>
                    
                    <p className="text-lg leading-relaxed">{output.result}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-bold">No More Results</h3>
            <p className="text-muted-foreground">
              Start analyzing images or using live detection to see more results here
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link to="/live-camera">
                <Button>Live Detection</Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline">Upload Files</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
