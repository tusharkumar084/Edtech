import { Timestamp } from "firebase-admin/firestore";

// Re-export all types for easy importing
export * from "./user";
export * from "./room";
export * from "./session";
export * from "./clerk";

// Common types
export interface BaseDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimestampedDocument {
  createdAt: Timestamp;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Firebase Function context
export interface FunctionContext {
  auth?: {
    uid: string;
    token: {
      clerk_user_id: string;
      role: string;
      email?: string;
    };
  };
}
