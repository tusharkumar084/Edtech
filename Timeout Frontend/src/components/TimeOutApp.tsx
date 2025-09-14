import { useState } from "react";
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
  const [mockUser, setMockUser] = useState<User | null>(null);

  // Mock authentication handlers
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

  // Show auth page if not authenticated
  if (!mockUser) {
    return <AuthPage onAuthSuccess={handleMockAuthSuccess} />;
  }

  // Show role selection if user hasn't selected a role
  if (!userRole) {
    return (
      <RoleSelection
        userName={`${mockUser.firstName} ${mockUser.lastName}`.trim() || mockUser.email}
        onRoleSelect={handleRoleSelection}
      />
    );
  }

  // Show appropriate dashboard based on role
  if (userRole === "student") {
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};