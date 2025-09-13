import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AuthPage } from "./auth/AuthPage";
import { RoleSelection } from "./auth/RoleSelection";
import { StudentDashboard } from "./dashboard/StudentDashboard";
import { handleAuthSuccess, updateUserRole, getUserData } from "@/utils/firebaseUserHandler";

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false); // Track if user is already initialized

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

  // Handle Clerk user authentication
  useEffect(() => {
    const initializeUser = async () => {
      // Only initialize if: 
      // 1. Clerk is available and user is signed in
      // 2. User exists and has an ID
      // 3. Not already initializing
      // 4. User hasn't been initialized yet
      if (isClerkAvailable && isSignedIn && user?.id && !isInitializing && !userInitialized) {
        setIsInitializing(true);
        try {
          console.log('🔄 Initializing user in database...', user.id);
          await handleAuthSuccess(user);
          
          // Check if user has a role set
          const userData = await getUserData(user.id);
          if (userData?.role) {
            setUserRole(userData.role);
          }
          
          setUserInitialized(true); // Mark as initialized
        } catch (error) {
          console.error('Failed to initialize user:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    // Reset states when user signs out
    if (!isSignedIn) {
      setUserInitialized(false);
      setUserRole(null);
      setIsInitializing(false);
    }

    initializeUser();
  }, [isClerkAvailable, isSignedIn, user?.id, userInitialized]); // FIXED: Only depend on user ID, not the whole user object

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

  const handleRoleSelection = async (role: "student" | "teacher") => {
    try {
      if (isClerkAvailable && user) {
        await updateUserRole(user.id, role);
      }
      setUserRole(role);
    } catch (error) {
      console.error('Failed to update role:', error);
      // Still set role locally for demo
      setUserRole(role);
    }
  };

  // Loading state
  if (isClerkAvailable && (!isLoaded || isInitializing)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {isInitializing ? "Setting up your account..." : "Loading..."}
          </p>
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