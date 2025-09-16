import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";

export const DashboardHeader = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  // Fallback to demo user if Clerk user is not available
  const currentUser = user || {
    firstName: "Demo",
    lastName: "User",
    primaryEmailAddress: { emailAddress: "demo@timeout.app" },
    imageUrl: null
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

  const displayName = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser?.primaryEmailAddress?.emailAddress || "User";

  return (
    <div className="glass border-b border-glass-border/30 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {currentUser?.imageUrl ? (
              <img 
                src={currentUser.imageUrl} 
                alt={displayName}
                className="w-8 h-8 rounded-full border border-border/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Welcome back, {currentUser?.firstName || "Demo"}!
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentUser?.primaryEmailAddress?.emailAddress || "demo@timeout.app"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="glass text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="glass text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
