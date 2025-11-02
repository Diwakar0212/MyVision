import { ArrowLeft, Users, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoiceAssistant from "@/components/VoiceAssistant";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="About MyVision. Learn about our mission to empower accessibility through AI innovation. Discover our technology and values." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">About MyVision</h1>
            <p className="text-xl text-muted-foreground">Empowering accessibility through AI innovation</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyVision is dedicated to breaking down barriers and creating a more accessible world for everyone. 
              We leverage advanced artificial intelligence and computer vision technology to provide real-time 
              assistance that empowers users to navigate their environment with confidence and independence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-icon flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where technology seamlessly bridges accessibility gaps
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-icon flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Our Team</h3>
              <p className="text-muted-foreground">
                Experts in AI, accessibility, and user experience design
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-icon flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Our Values</h3>
              <p className="text-muted-foreground">
                Innovation, inclusivity, and user-centered design
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-bold">Technology</h2>
            <p className="text-muted-foreground leading-relaxed">
              MyVision uses state-of-the-art machine learning models trained on diverse datasets to provide 
              accurate object detection, text recognition, and scene understanding. Our system continuously 
              learns and improves to deliver better assistance over time.
            </p>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li className="list-disc">Real-time object and obstacle detection</li>
              <li className="list-disc">Optical character recognition (OCR)</li>
              <li className="list-disc">Scene understanding and context analysis</li>
              <li className="list-disc">Natural language descriptions</li>
              <li className="list-disc">Voice command integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
