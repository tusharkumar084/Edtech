// Test setup file for Jest
// This file runs before all tests

// Mock Firebase Admin SDK for testing
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    settings: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
  })),
  storage: jest.fn(),
  apps: [],
  credential: {
    applicationDefault: jest.fn(),
  },
}));

// Mock Clerk SDK for testing
jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: jest.fn(() => ({
    verifyToken: jest.fn(),
    users: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    },
  })),
}));

// Mock Firebase Functions for testing
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn(),
    onCall: jest.fn(),
  },
  firestore: {
    document: jest.fn(() => ({
      onCreate: jest.fn(),
      onUpdate: jest.fn(),
      onDelete: jest.fn(),
    })),
  },
  pubsub: {
    schedule: jest.fn(() => ({
      onRun: jest.fn(),
    })),
  },
  config: jest.fn(() => ({
    clerk: {
      secret_key: 'test-secret-key',
      webhook_secret: 'test-webhook-secret',
    },
  })),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CLERK_SECRET_KEY = 'test-clerk-secret';
process.env.CLERK_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.FIREBASE_PROJECT_ID = 'test-project';
