import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase';
import { APP_CONFIG } from '../config/constants';
import { 
  StudyRoom, 
  RoomVisibility, 
  RoomParticipant 
} from '../types/room';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Get authenticated user ID from Firebase Auth
 * In emulator mode, allows bypassing auth for testing
 */
function getAuthenticatedUserId(request: CallableRequest): string {
  // In emulator mode, allow manual user ID for testing
  if (process.env.FUNCTIONS_EMULATOR === 'true' && request.data?.userId) {
    return request.data.userId;
  }
  
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return request.auth.uid;
}

/**
 * Create a new study room
 */
export const createRoom = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { 
        name, 
        description = '', 
        visibility = 'public', 
        maxParticipants = 8,
        subject = '',
        focusTime = 25,
        shortBreakTime = 5,
        longBreakTime = 15
      } = request.data;

      if (!name || name.trim().length === 0) {
        throw new HttpsError('invalid-argument', 'Room name is required');
      }

      if (maxParticipants < 2 || maxParticipants > 20) {
        throw new HttpsError('invalid-argument', 'Max participants must be between 2 and 20');
      }

      // Get user data to include host info
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      
      const userData = userDoc.data();
      
      // Create room document
      const roomRef = db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS).doc();
      const roomId = roomRef.id;
      
      const now = Timestamp.now();
      
      const roomData: StudyRoom = {
        name: name.trim(),
        description: description.trim(),
        subject: subject.trim(),
        hostId: userId,
        hostName: userData?.displayName || 'Anonymous',
        hostAvatar: userData?.avatarUrl || '',
        createdAt: now,
        updatedAt: now,
        status: 'waiting',
        visibility: visibility as RoomVisibility,
        maxParticipants,
        currentParticipants: 1,
        participants: {
          [userId]: {
            userId,
            displayName: userData?.displayName || 'Anonymous',
            avatarUrl: userData?.avatarUrl || '',
            role: 'host',
            joinedAt: now,
            isActive: true,
            studyTime: 0
          }
        },
        timer: {
          focusTime: focusTime * 60, // Convert minutes to seconds
          shortBreakTime: shortBreakTime * 60,
          longBreakTime: longBreakTime * 60,
          currentSession: 1,
          totalSessions: 4,
          currentPhase: 'focus',
          timeRemaining: focusTime * 60,
          isRunning: false,
          startedAt: null,
          pausedAt: null
        },
        settings: {
          autoStartBreaks: true,
          allowLateJoin: true,
          showParticipantProgress: true,
          muteChat: false
        },
        stats: {
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          participantCount: 1
        }
      };

      await roomRef.set(roomData);

      return { 
        success: true, 
        roomId,
        room: roomData
      };
    } catch (error) {
      console.error('Error creating room:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to create room');
    }
  }
);

/**
 * Join an existing study room
 */
export const joinRoom = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { roomId } = request.data;

      if (!roomId) {
        throw new HttpsError('invalid-argument', 'Room ID is required');
      }

      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      const userData = userDoc.data();

      // Use transaction to ensure consistency
      const result = await db.runTransaction(async (transaction) => {
        const roomRef = db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS).doc(roomId);
        const roomDoc = await transaction.get(roomRef);
        
        if (!roomDoc.exists) {
          throw new HttpsError('not-found', 'Room not found');
        }

        const roomData = roomDoc.data() as StudyRoom;

        // Check if room is joinable
        if (roomData.status === 'ended') {
          throw new HttpsError('failed-precondition', 'Room has ended');
        }

        if (roomData.currentParticipants >= roomData.maxParticipants) {
          throw new HttpsError('resource-exhausted', 'Room is full');
        }

        if (roomData.participants[userId]) {
          throw new HttpsError('already-exists', 'Already in this room');
        }

        if (!roomData.settings.allowLateJoin && roomData.status === 'active') {
          throw new HttpsError('failed-precondition', 'Late joining is not allowed');
        }

        // Add participant
        const participant: RoomParticipant = {
          userId,
          displayName: userData?.displayName || 'Anonymous',
          avatarUrl: userData?.avatarUrl || '',
          role: 'participant',
          joinedAt: Timestamp.now(),
          isActive: true,
          studyTime: 0
        };

        transaction.update(roomRef, {
          [`participants.${userId}`]: participant,
          currentParticipants: FieldValue.increment(1),
          updatedAt: Timestamp.now()
        });

        return { ...roomData, participants: { ...roomData.participants, [userId]: participant } };
      });

      return { 
        success: true,
        room: result
      };
    } catch (error) {
      console.error('Error joining room:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to join room');
    }
  }
);

/**
 * Leave a study room
 */
export const leaveRoom = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { roomId } = request.data;

      if (!roomId) {
        throw new HttpsError('invalid-argument', 'Room ID is required');
      }

      // Use transaction to ensure consistency
      await db.runTransaction(async (transaction) => {
        const roomRef = db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS).doc(roomId);
        const roomDoc = await transaction.get(roomRef);
        
        if (!roomDoc.exists) {
          throw new HttpsError('not-found', 'Room not found');
        }

        const roomData = roomDoc.data() as StudyRoom;

        if (!roomData.participants[userId]) {
          throw new HttpsError('not-found', 'Not in this room');
        }

        // If host is leaving, transfer ownership or end room
        if (roomData.hostId === userId) {
          const otherParticipants = Object.entries(roomData.participants)
            .filter(([id, _]) => id !== userId);

          if (otherParticipants.length > 0) {
            // Transfer host to first participant
            const [newHostId, newHostData] = otherParticipants[0];
            transaction.update(roomRef, {
              hostId: newHostId,
              hostName: (newHostData as RoomParticipant).displayName,
              hostAvatar: (newHostData as RoomParticipant).avatarUrl,
              [`participants.${newHostId}.role`]: 'host',
              [`participants.${userId}`]: FieldValue.delete(),
              currentParticipants: FieldValue.increment(-1),
              updatedAt: Timestamp.now()
            });
          } else {
            // End room if host is last participant
            transaction.update(roomRef, {
              status: 'ended',
              endedAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            });
          }
        } else {
          // Regular participant leaving
          transaction.update(roomRef, {
            [`participants.${userId}`]: FieldValue.delete(),
            currentParticipants: FieldValue.increment(-1),
            updatedAt: Timestamp.now()
          });
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error leaving room:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to leave room');
    }
  }
);

/**
 * Get list of public rooms for discovery
 */
export const getPublicRooms = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      getAuthenticatedUserId(request); // Ensure user is authenticated
      
      const { limit = 20, subject = null } = request.data;

      let query = db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS)
        .where('visibility', '==', 'public')
        .where('status', 'in', ['waiting', 'active'])
        .orderBy('createdAt', 'desc')
        .limit(Math.min(limit, 50));

      if (subject) {
        query = query.where('subject', '==', subject);
      }

      const snapshot = await query.get();
      
      const rooms = snapshot.docs.map(doc => {
        const data = doc.data() as StudyRoom;
        // Remove sensitive participant data for public listing
        return {
          ...data,
          participants: Object.keys(data.participants).length // Just count
        };
      });

      return { 
        success: true,
        rooms
      };
    } catch (error) {
      console.error('Error getting public rooms:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get public rooms');
    }
  }
);

/**
 * Get room details (for participants only)
 */
export const getRoomDetails = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { roomId } = request.data;

      if (!roomId) {
        throw new HttpsError('invalid-argument', 'Room ID is required');
      }

      const roomDoc = await db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS).doc(roomId).get();
      
      if (!roomDoc.exists) {
        throw new HttpsError('not-found', 'Room not found');
      }

      const roomData = roomDoc.data() as StudyRoom;

      // Check if user is participant or if room is public
      if (!roomData.participants[userId] && roomData.visibility === 'private') {
        throw new HttpsError('permission-denied', 'Access denied to private room');
      }

      return { 
        success: true,
        room: roomData
      };
    } catch (error) {
      console.error('Error getting room details:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get room details');
    }
  }
);

/**
 * Update participant status in a room (studying/away)
 */
export const updateParticipantStatus = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { roomId, isActive } = request.data;

      if (!roomId) {
        throw new HttpsError('invalid-argument', 'Room ID is required');
      }

      if (typeof isActive !== 'boolean') {
        throw new HttpsError('invalid-argument', 'isActive must be a boolean');
      }

      // Use transaction to ensure consistency
      const result = await db.runTransaction(async (transaction) => {
        const roomRef = db.collection(APP_CONFIG.COLLECTIONS.STUDY_ROOMS).doc(roomId);
        const roomDoc = await transaction.get(roomRef);
        
        if (!roomDoc.exists) {
          throw new HttpsError('not-found', 'Room not found');
        }

        const roomData = roomDoc.data() as StudyRoom;

        if (!roomData.participants[userId]) {
          throw new HttpsError('failed-precondition', 'User is not a participant in this room');
        }

        // Update participant status
        transaction.update(roomRef, {
          [`participants.${userId}.isActive`]: isActive,
          updatedAt: Timestamp.now()
        });

        return { 
          success: true, 
          status: isActive ? 'studying' : 'away'
        };
      });

      return result;
    } catch (error) {
      console.error('Error updating participant status:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update participant status');
    }
  }
);
