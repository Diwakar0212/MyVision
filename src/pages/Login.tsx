import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username);
      navigate("/pin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <VoiceAssistant pageDescription="Welcome to MyVision, an AI-powered accessibility assistant. Please enter your username to continue." />
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">
            MyVision
          </h1>
          <p className="text-lg text-muted-foreground">AI-Powered Accessibility</p>
        </div>

        <form onSubmit={handleContinue} className="mt-12 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="username" className="text-base">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-background border-border"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={!username.trim()}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">
              Say <span className="text-cyan-400 font-semibold">"Hey Vision"</span> to activate voice mode
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
