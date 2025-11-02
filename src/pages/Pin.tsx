import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Pin = () => {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "user";

  const handleContinue = () => {
    if (pin.length === 4) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold gradient-text">Enter PIN</h1>
          <p className="text-lg text-muted-foreground">Welcome, {username}</p>
        </div>

        <div className="mt-12 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter your 4-digit PIN</p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={(value) => setPin(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-14 w-14 text-xl border-primary" />
                    <InputOTPSlot index={1} className="h-14 w-14 text-xl border-primary" />
                    <InputOTPSlot index={2} className="h-14 w-14 text-xl border-primary" />
                    <InputOTPSlot index={3} className="h-14 w-14 text-xl border-primary" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={pin.length !== 4}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">OR</p>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">
              Say <span className="text-cyan-400 font-semibold">"Hey"</span> to activate voice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pin;
