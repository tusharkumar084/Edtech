// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAod0vj_GsXVVgKeScuPJBPwB3T4RjE0E0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "timeout-backend-340e2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "timeout-backend-340e2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "timeout-backend-340e2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "176409782600",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:176409782600:web:fd0068f3745ee0da302b7d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B033H3NW2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
if (import.meta.env.DEV) {
  try {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log('🔧 Connected to Functions emulator');
  } catch (error) {
    console.warn('⚠️ Could not connect to Functions emulator:', error);
  }
}


// Callable functions (enabled)
export const createRoom = httpsCallable(functions, 'createRoom');
export const joinRoom = httpsCallable(functions, 'joinRoom');
export const leaveRoom = httpsCallable(functions, 'leaveRoom');
export const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
export const getRoomDetails = httpsCallable(functions, 'getRoomDetails');
export const updateParticipantStatus = httpsCallable(functions, 'updateParticipantStatus');
export const updateUserRole = httpsCallable(functions, 'updateUserRole');
export const getUserProfile = httpsCallable(functions, 'getUserProfile');
export const updateUserPreferences = httpsCallable(functions, 'updateUserPreferences');
export const updateStudyStats = httpsCallable(functions, 'updateStudyStats');

export { functions, app };
