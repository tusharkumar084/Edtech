# Firebase Web SDK Configuration

This configuration is for frontend applications to connect to the TimeOut Firebase backend.

## Web SDK Config

```javascript
// Firebase configuration for frontend applications
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "timeout-backend.firebaseapp.com", 
  projectId: "timeout-backend",
  storageBucket: "timeout-backend.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);

// Export Firebase services for use in the app
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

## Environment Variables for Frontend

Create a `.env.local` file in your frontend project:

```env
# Firebase Web SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=timeout-backend.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=timeout-backend
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=timeout-backend.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Frontend Integration with Clerk

Since we're using Clerk for authentication, the frontend setup will be:

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // ... your config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// lib/clerk-firebase.ts
import { useAuth } from '@clerk/nextjs';
import { db } from './firebase';

export const useFirebaseUser = () => {
  const { getToken, userId } = useAuth();
  
  const getAuthenticatedFirestore = async () => {
    const token = await getToken({ template: 'integration_firebase' });
    // Use token for authenticated Firestore requests
    return { db, token, userId };
  };
  
  return { getAuthenticatedFirestore };
};
```

## Security Note

⚠️ **Important**: The Web SDK config is safe to expose publicly. The `apiKey` is not a secret - it's used for identification, not authentication. Authentication is handled by Clerk and Firebase security rules.

## Installation Commands for Frontend

```bash
# Firebase SDK
npm install firebase

# If using React/Next.js with Clerk
npm install @clerk/nextjs
npm install @clerk/clerk-sdk-node
```

---

**Replace the placeholder values above with your actual Firebase configuration from the console.**
