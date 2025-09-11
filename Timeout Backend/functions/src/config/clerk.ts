import { clerkClient } from "@clerk/clerk-sdk-node";

// Initialize Clerk client
const clerk = clerkClient;

export { clerk };

// Clerk configuration constants
export const CLERK_CONFIG = {
  webhookSecret: process.env.CLERK_WEBHOOK_SECRET || "",
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
  apiVersion: "v1",
  userSyncEnabled: true,
} as const;

// JWT validation function
export const validateClerkToken = async (token: string) => {
  try {
    const decoded = await clerk.verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid Clerk token: ${error}`);
  }
};

// JWT validation function that returns user ID
export const validateClerkJWT = async (token?: string): Promise<string | null> => {
  if (!token) return null;
  
  try {
    const decoded = await clerk.verifyToken(token);
    return decoded.sub || null; // sub contains the user ID
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
};

// Extract Clerk user ID from request
export const getClerkUserIdFromRequest = (req: any): string | null => {
  try {
    // Extract from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    // This would need to be validated in actual implementation
    return token; // Placeholder - actual implementation would decode JWT
  } catch (error) {
    return null;
  }
};
