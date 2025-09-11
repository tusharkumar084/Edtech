import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase';
import { UserRole, UserData } from '../types/user';

/**
 * Get authenticated user ID from Firebase Auth
 */
function getAuthenticatedUserId(request: CallableRequest): string {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return request.auth.uid;
}

/**
 * Update user role (called after role selection in frontend)
 */
export const updateUserRole = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { role } = request.data as { role: UserRole };

      if (!role || !['student', 'teacher'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Invalid role provided');
      }

      // Update user role in Firestore
      await db.collection('users').doc(userId).update({
        role,
        updatedAt: new Date(),
      });

      return { success: true, role };
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update user role');
    }
  }
);

/**
 * Get user profile data
 */
export const getUserProfile = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }

      const userData = userDoc.data() as UserData;
      
      // Remove sensitive data before returning
      const { ...publicUserData } = userData;
      
      return publicUserData;
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get user profile');
    }
  }
);

/**
 * Update user preferences
 */
export const updateUserPreferences = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { preferences } = request.data;

      if (!preferences) {
        throw new HttpsError('invalid-argument', 'Preferences data required');
      }

      // Validate preferences structure
      const validPreferences = {
        defaultFocusTime: preferences.defaultFocusTime || 25,
        shortBreakTime: preferences.shortBreakTime || 5,
        longBreakTime: preferences.longBreakTime || 15,
        sessionsBeforeLongBreak: preferences.sessionsBeforeLongBreak || 4,
        soundEnabled: Boolean(preferences.soundEnabled),
        notificationsEnabled: Boolean(preferences.notificationsEnabled),
        theme: preferences.theme || 'system',
      };

      // Update user preferences in Firestore
      await db.collection('users').doc(userId).update({
        preferences: validPreferences,
        updatedAt: new Date(),
      });

      return { success: true, preferences: validPreferences };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update user preferences');
    }
  }
);

/**
 * Update user study stats
 */
export const updateStudyStats = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { studyTime, sessionCompleted } = request.data;

      if (typeof studyTime !== 'number' || studyTime < 0) {
        throw new HttpsError('invalid-argument', 'Valid study time required');
      }

      // Get current user data
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data() as UserData;
      const currentStats = userData.studyStats;

      // Calculate new stats
      const newStats = {
        totalStudyTime: currentStats.totalStudyTime + studyTime,
        sessionsCompleted: sessionCompleted ? currentStats.sessionsCompleted + 1 : currentStats.sessionsCompleted,
        currentStreak: sessionCompleted ? currentStats.currentStreak + 1 : currentStats.currentStreak,
        longestStreak: Math.max(currentStats.longestStreak, currentStats.currentStreak + (sessionCompleted ? 1 : 0)),
        weeklyGoal: currentStats.weeklyGoal,
        weeklyProgress: currentStats.weeklyProgress + studyTime,
      };

      // Update study stats in Firestore
      await db.collection('users').doc(userId).update({
        studyStats: newStats,
        updatedAt: new Date(),
      });

      return { success: true, studyStats: newStats };
    } catch (error) {
      console.error('Error updating study stats:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update study stats');
    }
  }
);
