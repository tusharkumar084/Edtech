import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chrome, Clock, Users, Target, BookOpen } from "lucide-react";
import timeoutLogo from "@/assets/time-out-1935482448.png";

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);

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
            {/* Clerk Authentication */}
            <div className="flex justify-center">
              {isSignUp ? (
                <SignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      card: "bg-transparent shadow-none",
                      headerTitle: "text-foreground",
                      headerSubtitle: "text-muted-foreground",
                      formFieldLabel: "text-foreground",
                      formFieldInput: "bg-background/50 border-border text-foreground",
                      footerActionLink: "text-primary hover:text-primary/90",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                      socialButtonsBlockButton: "bg-background/50 border-border text-foreground hover:bg-background/70",
                      socialButtonsBlockButtonText: "text-foreground"
                    }
                  }}
                />
              ) : (
                <SignIn 
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      card: "bg-transparent shadow-none",
                      headerTitle: "text-foreground",
                      headerSubtitle: "text-muted-foreground",
                      formFieldLabel: "text-foreground",
                      formFieldInput: "bg-background/50 border-border text-foreground",
                      footerActionLink: "text-primary hover:text-primary/90",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                      socialButtonsBlockButton: "bg-background/50 border-border text-foreground hover:bg-background/70",
                      socialButtonsBlockButtonText: "text-foreground"
                    }
                  }}
                />
              )}
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