import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Mail, Clock, Users, Target, BookOpen } from "lucide-react";
import timeoutLogo from "@/assets/time-out-1935482448.png";

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Demo authentication handlers
  const handleGoogleAuth = () => {
    console.log("Google auth clicked - demo mode");
    onAuthSuccess?.();
  };

  const handleEmailAuth = () => {
    console.log("Email auth clicked - demo mode");
    onAuthSuccess?.();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 hero-gradient opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={timeoutLogo} 
                alt="TimeOut Logo" 
                className="w-20 h-20 glow rounded-2xl"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              TimeOut
            </h1>
            <p className="text-xl text-muted-foreground">
              Reclaim Your Focus. Study Together.
            </p>
          </div>

          {/* Auth Card */}
          <Card className="glass p-8 space-y-6">
            {/* Demo Authentication UI */}
            <div className="space-y-4">
                <Button
                  variant="google"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleAuth}
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass"
                    />
                  </div>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleEmailAuth}
                  >
                    <Mail className="w-5 h-5" />
                    {isSignUp ? "Sign up with Email" : "Sign in with Email"}
                  </Button>
                </div>
              </div>

            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:text-primary-glow transition-smooth"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </Card>

          {/* Features Preview */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-foreground">
              What you'll get:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-lg text-center space-y-2">
                <Clock className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Focus Timer</p>
                <p className="text-xs text-muted-foreground">Block distractions</p>
              </div>
              <div className="glass p-4 rounded-lg text-center space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Study Groups</p>
                <p className="text-xs text-muted-foreground">Learn together</p>
              </div>
              <div className="glass p-4 rounded-lg text-center space-y-2">
                <Target className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Track Progress</p>
                <p className="text-xs text-muted-foreground">Monitor growth</p>
              </div>
              <div className="glass p-4 rounded-lg text-center space-y-2">
                <BookOpen className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Join Classes</p>
                <p className="text-xs text-muted-foreground">Live learning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};