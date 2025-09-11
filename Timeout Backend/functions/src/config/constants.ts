// Application constants and configuration

// Clerk configuration
export const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "";
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "";

export const APP_CONFIG = {
  // Room settings
  ROOM_EXPIRY_HOURS: parseInt(process.env.ROOM_EXPIRY_HOURS || "24", 10),
  MAX_ROOM_MEMBERS: parseInt(process.env.MAX_ROOM_MEMBERS || "50", 10),
  SESSION_TIMEOUT_MINUTES: parseInt(process.env.SESSION_TIMEOUT_MINUTES || "30", 10),
  
  // Timer settings
  MIN_TIMER_DURATION: 5, // 5 minutes
  MAX_TIMER_DURATION: 480, // 8 hours
  TIMER_UPDATE_INTERVAL: 1000, // 1 second
  
  // User roles
  USER_ROLES: {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
  } as const,
  
  // Room visibility
  ROOM_VISIBILITY: {
    PUBLIC: "public",
    PRIVATE: "private",
  } as const,
  
  // Room status
  ROOM_STATUS: {
    WAITING: "waiting",
    ACTIVE: "active", 
    PAUSED: "paused",
    COMPLETED: "completed",
  } as const,
  
  // Collection names
  COLLECTIONS: {
    USERS: "users",
    STUDY_ROOMS: "studyRooms",
    SESSIONS: "sessions",
    MESSAGES: "messages",
  } as const,
  
  // Error messages
  ERRORS: {
    UNAUTHORIZED: "Unauthorized access",
    ROOM_NOT_FOUND: "Study room not found",
    ROOM_FULL: "Study room is at capacity",
    INVALID_TIMER: "Invalid timer operation",
    PERMISSION_DENIED: "Permission denied",
  } as const,
} as const;

// Export type for APP_CONFIG
export type AppConfig = typeof APP_CONFIG;
