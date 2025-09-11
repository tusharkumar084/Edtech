import { Timestamp } from "firebase-admin/firestore";
import { BaseDocument } from "./index";

export interface User extends BaseDocument {
  clerkId: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  lastActive: Timestamp;
  clerkMetadata?: ClerkUserMetadata;
}

export interface UserData {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deletedAt?: Date;
  studyStats: UserStudyStats;
  preferences: UserPreferences;
}

export interface UserStudyStats {
  totalStudyTime: number; // in minutes
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number; // in minutes
  weeklyProgress: number; // in minutes
}

export interface UserPreferences {
  defaultFocusTime: number; // in minutes
  shortBreakTime: number; // in minutes
  longBreakTime: number; // in minutes
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type UserRole = "student" | "teacher" | "admin";

export interface ClerkUserMetadata {
  lastSignInAt?: number;
  emailVerified: boolean;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserData {
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  role?: UserRole;
  lastActive?: Timestamp;
}
