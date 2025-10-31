import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { PinEntry } from "./pages/PinEntry";
import { Dashboard } from "./pages/Dashboard";
import { LiveDetection } from "./pages/LiveDetection";
import { VideoPlayback } from "./pages/VideoPlayback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [username, setUsername] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  const handleLogin = (name: string) => {
    setUsername(name);
  };

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUsername('');
    setIsAuthenticated(false);
    setIsVoiceModeActive(false);
  };

  const handleActivateVoice = () => {
    setIsVoiceModeActive(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} onActivateVoice={handleActivateVoice} isVoiceModeActive={isVoiceModeActive} />} />
            <Route 
              path="/pin" 
              element={username ? <PinEntry username={username} isVoiceModeActive={isVoiceModeActive} onPinSuccess={handlePinSuccess} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard username={username} onLogout={handleLogout} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/live-detection" 
              element={isAuthenticated ? <LiveDetection /> : <Navigate to="/" />} 
            />
            <Route 
              path="/video-playback" 
              element={isAuthenticated ? <VideoPlayback /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
