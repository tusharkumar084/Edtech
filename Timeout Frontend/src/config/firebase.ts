// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase config
const firebaseConfig = {
  projectId: "timeout-backend",
  // Add other config as needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// Callable functions
export const createRoom = httpsCallable(functions, 'createRoom');
export const joinRoom = httpsCallable(functions, 'joinRoom');
export const leaveRoom = httpsCallable(functions, 'leaveRoom');
export const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
export const getRoomDetails = httpsCallable(functions, 'getRoomDetails');
export const updateUserRole = httpsCallable(functions, 'updateUserRole');
export const getUserProfile = httpsCallable(functions, 'getUserProfile');
export const updateUserPreferences = httpsCallable(functions, 'updateUserPreferences');
export const updateStudyStats = httpsCallable(functions, 'updateStudyStats');

export { functions };
