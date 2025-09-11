import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { db } from '../config/firebase';
import { CLERK_WEBHOOK_SECRET } from '../config/constants';
import { UserData, UserRole } from '../types/user';

/**
 * Clerk Webhook Handler
 * Processes user events from Clerk and syncs data with Firestore
 */
export const clerkWebhook = onRequest(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
    maxInstances: 10,
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Verify webhook signature
      const webhook = new Webhook(CLERK_WEBHOOK_SECRET);
      
      const headers = req.headers;
      const payload = JSON.stringify(req.body);
      
      const headerPayload = {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      };

      let event: WebhookEvent;
      
      try {
        event = webhook.verify(payload, headerPayload) as WebhookEvent;
      } catch (err) {
        console.error('Error verifying webhook:', err);
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      // Process the event
      switch (event.type) {
        case 'user.created':
          await handleUserCreated(event);
          break;
        case 'user.updated':
          await handleUserUpdated(event);
          break;
        case 'user.deleted':
          await handleUserDeleted(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Handle user creation from Clerk
 */
async function handleUserCreated(event: WebhookEvent) {
  if (event.type !== 'user.created') return;
  
  const { id, email_addresses, first_name, last_name, image_url, created_at, public_metadata } = event.data;
  
  const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id);
  
  const userData: UserData = {
    clerkId: id,
    email: primaryEmail?.email_address || '',
    firstName: first_name || '',
    lastName: last_name || '',
    displayName: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous',
    avatarUrl: image_url || '',
    role: (public_metadata?.role as UserRole) || null,
    createdAt: new Date(created_at),
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

  try {
    await db.collection('users').doc(id).set(userData);
    console.log(`User created in Firestore: ${id}`);
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw error;
  }
}

/**
 * Handle user updates from Clerk
 */
async function handleUserUpdated(event: WebhookEvent) {
  if (event.type !== 'user.updated') return;
  
  const { id, email_addresses, first_name, last_name, image_url, public_metadata } = event.data;
  
  const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id);
  
  const updateData = {
    email: primaryEmail?.email_address || '',
    firstName: first_name || '',
    lastName: last_name || '',
    displayName: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous',
    avatarUrl: image_url || '',
    role: (public_metadata?.role as UserRole) || null,
    updatedAt: new Date(),
  };

  try {
    await db.collection('users').doc(id).update(updateData);
    console.log(`User updated in Firestore: ${id}`);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
}

/**
 * Handle user deletion from Clerk
 */
async function handleUserDeleted(event: WebhookEvent) {
  if (event.type !== 'user.deleted') return;
  
  const { id } = event.data;

  if (!id) {
    console.error('No user ID found in deletion event');
    return;
  }

  try {
    // Soft delete - mark as inactive instead of hard delete
    await db.collection('users').doc(id).update({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`User soft deleted in Firestore: ${id}`);
  } catch (error) {
    console.error('Error deleting user in Firestore:', error);
    throw error;
  }
}
