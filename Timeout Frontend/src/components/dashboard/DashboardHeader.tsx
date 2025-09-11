import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, Settings } from "lucide-react";

export const DashboardHeader = () => {
  // Try to get user data with fallback
  let user = null;
  let isLoaded = false;
  let clerk = null;

  try {
    const auth = useAuth();
    const userData = useUser();
    clerk = useClerk();
    
    isLoaded = auth.isLoaded && userData.isLoaded;
    user = userData.user;
  } catch (error) {
    // Clerk not available, use fallback
    isLoaded = true;
    user = {
      firstName: "Demo",
      lastName: "User",
      primaryEmailAddress: { emailAddress: "demo@timeout.app" },
      imageUrl: null
    };
  }

  const handleSignOut = () => {
    if (clerk) {
      clerk.signOut();
    } else {
      // Fallback for demo mode - reload page
      window.location.reload();
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
          <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.primaryEmailAddress?.emailAddress || "User";

  return (
    <div className="glass border-b border-glass-border/30 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
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
                Welcome back, {user?.firstName || "Demo"}!
              </h2>
              <p className="text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress || "demo@timeout.app"}
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
