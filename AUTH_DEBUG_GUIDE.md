# Authentication & Database Issues - Troubleshooting Guide

## Problem: User data not being stored in database during authentication

## Root Causes Identified:

### 1. **Firebase Functions Not Deployed**
Your webhook handler exists but may not be deployed to Firebase.

### 2. **Clerk Webhook Not Configured**
The webhook endpoint URL needs to be set up in Clerk dashboard.

### 3. **Environment Configuration Issues**
Frontend and backend environment variables may not be properly synchronized.

## **STEP-BY-STEP FIX:**

### **Step 1: Deploy Firebase Functions**

```bash
# Navigate to backend directory
cd "Timeout Backend"

# Install dependencies
cd functions
npm install
cd ..

# Build and deploy functions
npm run build
firebase deploy --only functions
```

### **Step 2: Configure Clerk Webhooks**

1. **Go to Clerk Dashboard:**
   - Visit https://dashboard.clerk.com
   - Select your application

2. **Add Webhook Endpoint:**
   - Go to "Webhooks" in the sidebar
   - Click "Add Endpoint"
   - URL: `https://YOUR-PROJECT-ID.cloudfunctions.net/clerkWebhook`
   - Events to listen for:
     - `user.created`
     - `user.updated` 
     - `user.deleted`
   - Copy the webhook secret to your `.env` file

### **Step 3: Test Firebase Connection**

```bash
# Test if Firebase is working
cd "Timeout Backend"
node test-firestore-direct.js
```

### **Step 4: Check Clerk Configuration**

1. **Verify Clerk Keys:**
   - Backend: `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET`
   - Frontend: `VITE_CLERK_PUBLISHABLE_KEY`

2. **Check Clerk Dashboard:**
   - Ensure the publishable key matches your environment
   - Verify webhook is active and receiving events

### **Step 5: Test Authentication Flow**

1. **Enable Firebase Emulators (for testing):**
```bash
cd "Timeout Backend"
firebase emulators:start
```

2. **Test Sign Up:**
   - Go to your frontend
   - Create a new account
   - Check Firebase console for user data

### **Step 6: Debug Issues**

## **Common Issues & Solutions:**

### **Issue 1: "Webhook signature verification failed"**
**Solution:** 
- Check `CLERK_WEBHOOK_SECRET` in `.env`
- Ensure webhook secret matches Clerk dashboard

### **Issue 2: "Firebase permission denied"**
**Solution:**
- Check Firestore rules
- Ensure service account has proper permissions

### **Issue 3: "User data not appearing in Firestore"**
**Solution:**
- Check Firebase function logs: `firebase functions:log`
- Verify webhook endpoint is receiving events

### **Issue 4: "Clerk authentication not working"**
**Solution:**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` in frontend `.env`
- Check browser network tab for errors

## **Verification Commands:**

### **Check Firebase Functions Deployment:**
```bash
firebase functions:list
```

### **Check Function Logs:**
```bash
firebase functions:log --only clerkWebhook
```

### **Test Webhook Locally:**
```bash
# Start emulators
firebase emulators:start

# Test webhook endpoint
curl -X POST http://localhost:5001/YOUR-PROJECT/us-central1/clerkWebhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## **Expected Results:**

### **When Working Correctly:**
1. User signs up via Clerk
2. Clerk sends webhook to your Firebase function
3. Function creates user document in Firestore
4. User data appears in Firebase console
5. Frontend can access user data

### **Firestore Document Structure:**
```json
{
  "clerkId": "user_xxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "role": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "studyStats": {
    "totalStudyTime": 0,
    "sessionsCompleted": 0
  }
}
```

## **Debugging Checklist:**

- [ ] Environment variables set correctly
- [ ] Firebase functions deployed
- [ ] Clerk webhook configured and active
- [ ] Firestore rules allow writes
- [ ] Service account has permissions
- [ ] Frontend can connect to Clerk
- [ ] Network requests succeed (check browser dev tools)
- [ ] Function logs show webhook events

## **Next Steps if Still Not Working:**

1. **Check Firebase Console:**
   - Go to Firebase console
   - Check Authentication > Users
   - Check Firestore > Data

2. **Check Browser Developer Tools:**
   - Network tab for failed requests
   - Console for JavaScript errors

3. **Check Firebase Function Logs:**
   - Look for webhook processing errors
   - Verify user creation attempts

4. **Verify Clerk Integration:**
   - Test basic Clerk auth without custom webhook
   - Check if users appear in Clerk dashboard
