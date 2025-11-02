import { ArrowLeft, User, Bell, Lock, Globe, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import VoiceAssistant from "@/components/VoiceAssistant";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <VoiceAssistant pageDescription="Settings page. Customize your MyVision experience including account settings, appearance theme, notifications, privacy and security options." />
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Settings</h1>
            <p className="text-xl text-muted-foreground">Customize your experience</p>
          </div>

          {/* Account Settings */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Account</h2>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Username</Label>
                  <p className="text-sm text-muted-foreground">{localStorage.getItem("username") || "user"}</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">user@myvision.ai</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">Audio notifications for detections</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Voice Feedback</Label>
                  <p className="text-sm text-muted-foreground">Spoken descriptions of analysis</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Privacy & Security</h2>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Save History</Label>
                  <p className="text-sm text-muted-foreground">Store analysis history locally</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Change PIN</Label>
                  <p className="text-sm text-muted-foreground">Update your 4-digit PIN</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Language & Region</h2>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">English (US)</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-destructive/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
            <Separator />
            <div className="space-y-3">
              <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">
                Clear All History
              </Button>
              <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
