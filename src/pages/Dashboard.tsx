import { Camera, Upload, Home, Info, FileOutput, History, HelpCircle, Settings, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import VoiceAssistant from "@/components/VoiceAssistant";

const Dashboard = () => {
  const username = localStorage.getItem("username") || "user";

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Info, label: "About", path: "/about" },
    { icon: FileOutput, label: "Output", path: "/output" },
    { icon: History, label: "History", path: "/history" },
    { icon: HelpCircle, label: "Help", path: "/help" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Dashboard. Welcome back! You can access Live Detection to analyze your surroundings in real-time, or Upload Files to analyze images and videos. Navigate using the menu or quick action cards." />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  {menuItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <Button variant="ghost" className="w-full justify-start">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 gradient-icon">
                <AvatarFallback className="bg-transparent text-white font-semibold">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <p className="text-sm font-medium">{username}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">MyVision</h1>
          <p className="text-lg text-muted-foreground">Navigate the world with AI-powered assistance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Link to="/live-camera" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary smooth-transition h-full">
              <div className="w-16 h-16 rounded-2xl gradient-icon flex items-center justify-center mb-6">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 gradient-text group-hover:opacity-80">Live Detection</h3>
              <p className="text-muted-foreground">Real-time camera AI analysis</p>
            </div>
          </Link>

          <Link to="/upload" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary smooth-transition h-full">
              <div className="w-16 h-16 rounded-2xl gradient-icon flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 gradient-text group-hover:opacity-80">Upload Files</h3>
              <p className="text-muted-foreground">Upload and analyze images or videos</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Navigation</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary smooth-transition"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Feedback Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-12 px-6 gradient-icon border-0 text-white shadow-lg hover:shadow-xl smooth-transition"
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        Feedback
      </Button>
    </div>
  );
};

export default Dashboard;
