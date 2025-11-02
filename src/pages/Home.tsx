import { ArrowLeft, Eye, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoiceAssistant from "@/components/VoiceAssistant";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Home page. Learn about MyVision's AI-powered vision assistance features including visual recognition, smart assistance, and voice control." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Home</h1>
            <p className="text-xl text-muted-foreground">Your AI-powered vision assistant</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Visual Recognition</h3>
              <p className="text-muted-foreground">Advanced AI analyzes your environment in real-time</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Smart Assistance</h3>
              <p className="text-muted-foreground">Intelligent guidance for daily activities</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl gradient-icon flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Voice Control</h3>
              <p className="text-muted-foreground">Hands-free operation with voice commands</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-bold">Welcome to MyVision</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyVision is your intelligent companion designed to enhance accessibility through cutting-edge AI technology. 
              Whether you're navigating unfamiliar spaces, reading text, or identifying objects, our system provides 
              real-time assistance to help you interact with the world more independently.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Use the Live Detection feature for real-time camera analysis, or upload images and videos for detailed 
              processing. Our AI understands context and provides meaningful descriptions to support your daily activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
