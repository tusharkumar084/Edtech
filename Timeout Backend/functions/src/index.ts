/**
 * TimeOut Backend - Firebase Cloud Functions
 * Main entry point for all Cloud Functions
 */

// Import Firebase Functions
import * as functions from "firebase-functions";

// Import configuration
import "./config/firebase"; // Initialize Firebase Admin

// Import function modules
import * as clerkWebhooks from "./webhooks/clerk";
import * as userCallables from "./callable/user";
import * as roomCallables from "./callable/room";

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API endpoint placeholder
export const api = functions.https.onRequest((req, res) => {
  res.status(200).json({
    message: "TimeOut Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      webhooks: "/webhooks/*",
      callable: [
        "updateUserRole",
        "getUserProfile", 
        "updateUserPreferences",
        "updateStudyStats",
        "createRoom",
        "joinRoom", 
        "leaveRoom",
        "getPublicRooms",
        "getRoomDetails"
      ],
    },
  });
});

// Export Clerk webhook functions
export const clerkWebhook = clerkWebhooks.clerkWebhook;

// Export user callable functions
export const updateUserRole = userCallables.updateUserRole;
export const getUserProfile = userCallables.getUserProfile;
export const updateUserPreferences = userCallables.updateUserPreferences;
export const updateStudyStats = userCallables.updateStudyStats;

// Export room callable functions
export const createRoom = roomCallables.createRoom;
export const joinRoom = roomCallables.joinRoom;
export const leaveRoom = roomCallables.leaveRoom;
export const getPublicRooms = roomCallables.getPublicRooms;
export const getRoomDetails = roomCallables.getRoomDetails;
