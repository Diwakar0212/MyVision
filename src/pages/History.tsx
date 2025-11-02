import { ArrowLeft, Clock, Trash2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VoiceAssistant from "@/components/VoiceAssistant";

const History = () => {
  const historyItems = [
    { id: 1, action: "Live Camera Session", duration: "12 min", date: "Today, 2:30 PM", type: "camera" },
    { id: 2, action: "Image Upload - kitchen.jpg", duration: "Analysis", date: "Today, 11:15 AM", type: "upload" },
    { id: 3, action: "Text Recognition", duration: "3 min", date: "Yesterday, 5:45 PM", type: "text" },
    { id: 4, action: "Live Camera Session", duration: "8 min", date: "Yesterday, 3:20 PM", type: "camera" },
    { id: 5, action: "Video Upload - outdoor.mp4", duration: "Analysis", date: "2 days ago", type: "upload" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="History page. Review your activity and analysis records. Search through past camera sessions and file uploads." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">History</h1>
            <p className="text-xl text-muted-foreground">Your activity and analysis records</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search history..." 
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-card border border-border rounded-xl p-5 hover:border-primary smooth-transition group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg gradient-icon flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{item.action}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 smooth-transition text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline">Load More</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
