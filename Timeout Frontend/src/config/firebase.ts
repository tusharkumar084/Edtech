// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase config - using the working project from .env
const firebaseConfig = {
  apiKey: "AIzaSyAod0vj_GsXVVgKeScuPJBPwB3T4RjE0E0",
  authDomain: "timeout-backend-340e2.firebaseapp.com",
  projectId: "timeout-backend-340e2",
  storageBucket: "timeout-backend-340e2.firebasestorage.app",
  messagingSenderId: "176409782600",
  appId: "1:176409782600:web:fd0068f3745ee0da302b7d",
  measurementId: "G-B033H3NW2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// TODO: Callable functions (when deployed)
// Currently these functions don't exist, so commenting out to prevent errors
// export const createRoom = httpsCallable(functions, 'createRoom');
// export const joinRoom = httpsCallable(functions, 'joinRoom');
// export const leaveRoom = httpsCallable(functions, 'leaveRoom');
// export const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
// export const getRoomDetails = httpsCallable(functions, 'getRoomDetails');
// export const updateUserRole = httpsCallable(functions, 'updateUserRole');
// export const getUserProfile = httpsCallable(functions, 'getUserProfile');
// export const updateUserPreferences = httpsCallable(functions, 'updateUserPreferences');
// export const updateStudyStats = httpsCallable(functions, 'updateStudyStats');

export { functions, app };
