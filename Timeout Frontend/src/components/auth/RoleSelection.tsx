import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, Presentation, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

interface RoleSelectionProps {
  userName: string;
  onRoleSelect: (role: "student" | "teacher") => void;
}

export const RoleSelection = ({ userName, onRoleSelect }: RoleSelectionProps) => {
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const { signOut } = useAuth();

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback to reload if signOut fails
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 hero-gradient opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="glass"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {userName}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Who are you?
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Card */}
            <Card 
              className={`glass p-8 cursor-pointer transition-bounce hover:scale-105 ${
                selectedRole === "student" 
                  ? "ring-2 ring-primary shadow-glow" 
                  : "hover:bg-glass/60"
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Student</h3>
                  <p className="text-muted-foreground">
                    Study solo or in groups, block distractions
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Focus timer & study tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Join study groups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Attend live classes</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Teacher Card */}
            <Card 
              className={`glass p-8 cursor-pointer transition-bounce hover:scale-105 ${
                selectedRole === "teacher" 
                  ? "ring-2 ring-primary shadow-glow" 
                  : "hover:bg-glass/60"
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Presentation className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Teacher</h3>
                  <p className="text-muted-foreground">
                    Create classes, track engagement
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-primary" />
                    <span>Host live classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Manage student groups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Track student progress</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handleContinue}
              disabled={!selectedRole}
              className="px-12"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};