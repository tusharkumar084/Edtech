import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AuthPage } from "./auth/AuthPage";
import { RoleSelection } from "./auth/RoleSelection";
import { StudentDashboard } from "./dashboard/StudentDashboard";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

export const TimeOutApp = () => {
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [isClerkAvailable, setIsClerkAvailable] = useState(true);
  const [mockUser, setMockUser] = useState<User | null>(null);

  // Try to use Clerk hooks with fallback
  let isLoaded = false;
  let isSignedIn = false;
  let user = null;

  try {
    const auth = useAuth();
    const userData = useUser();
    
    isLoaded = auth.isLoaded && userData.isLoaded;
    isSignedIn = auth.isSignedIn;
    user = userData.user;
  } catch (error) {
    console.warn("Clerk not available, using mock authentication:", error);
    setIsClerkAvailable(false);
  }

  // Mock authentication handlers for fallback
  const handleMockAuthSuccess = () => {
    const mockUserData: User = {
      id: "demo-user-123",
      email: "demo@timeout.app",
      firstName: "Demo",
      lastName: "User",
      imageUrl: undefined
    };
    setMockUser(mockUserData);
  };

  const handleRoleSelection = (role: "student" | "teacher") => {
    setUserRole(role);
  };

  // Loading state
  if (isClerkAvailable && !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine current user (Clerk or mock)
  const currentUser = isClerkAvailable && user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    imageUrl: user.imageUrl
  } : mockUser;

  const isAuthenticated = isClerkAvailable ? isSignedIn : mockUser !== null;

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleMockAuthSuccess} />;
  }

  // Show role selection if user hasn't selected a role
  if (!userRole && currentUser) {
    return (
      <RoleSelection
        userName={`${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email}
        onRoleSelect={handleRoleSelection}
      />
    );
  }

  // Show appropriate dashboard based on role
  if (userRole === "student" && currentUser) {
    return <StudentDashboard />;
  }

  if (userRole === "teacher") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};