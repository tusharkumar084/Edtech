// Firebase user handler for frontend
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAod0vj_GsXVVgKeScuPJBPwB3T4RjE0E0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "timeout-backend-340e2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "timeout-backend-340e2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "timeout-backend-340e2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "176409782600",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:176409782600:web:fd0068f3745ee0da302b7d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B033H3NW2W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8090);
    console.log('🔥 Connected to Firestore emulator on port 8090');
  } catch (error) {
    // This is expected if already connected
    if (error.code === 'failed-precondition') {
      console.log('🔥 Already connected to Firestore emulator');
    } else {
      console.warn('⚠️ Could not connect to Firestore emulator:', error);
    }
  }
}

// Function to ensure user exists and create if not
export const ensureUserExists = async (clerkUser: any) => {
  try {
    console.log('🔍 Checking if user exists in database...', clerkUser.id);
    
    const userDocRef = doc(db, 'users', clerkUser.id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('👤 Creating new user in database...');
      
      // Create user data matching the backend structure we verified works
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous',
        avatarUrl: clerkUser.imageUrl || '',
        role: null, // Will be set during role selection
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        studyStats: {
          totalStudyTime: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyGoal: 0,
          weeklyProgress: 0,
        },
        preferences: {
          defaultFocusTime: 25,
          shortBreakTime: 5,
          longBreakTime: 15,
          sessionsBeforeLongBreak: 4,
          soundEnabled: true,
          notificationsEnabled: true,
          theme: 'system',
        },
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User created successfully in database');
      return userData;
    } else {
      console.log('✅ User already exists in database');
      return userDoc.data();
    }
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
};

// Function to get user data
export const getUserData = async (clerkUserId: string) => {
  try {
    const userDocRef = doc(db, 'users', clerkUserId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    throw error;
  }
};

// Main auth success handler
export const handleAuthSuccess = async (clerkUser: any) => {
  try {
    const userData = await ensureUserExists(clerkUser);
    console.log('✅ Authentication success, user data:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Auth handling failed:', error);
    throw error;
  }
};