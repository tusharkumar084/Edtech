# TimeOut Backend - Firebase Implementation

## Project Overview

TimeOut's backend is built on Firebase to provide real-time study room functionality with shared timers, participant management, and session analytics. The backend handles authentication, data storage, security rules, and server-side automation through Cloud Functions.

## Architecture Overview

### Firebase Services Used
- **Authentication**: Clerk (replaces Firebase Auth)
- **Firestore**: Real-time database for rooms, users, sessions
- **Cloud Functions**: Server-side logic and automation
- **Storage**: File uploads (optional for MVP)
- **Analytics**: Usage tracking and performance monitoring

### Clerk Integration
- **Frontend Auth**: Clerk handles all authentication UI and flows
- **Backend Validation**: Clerk JWTs validated in Cloud Functions
- **User Management**: Clerk webhooks sync user data to Firestore

## Folder Structure

```
timeout-backend/
├── firebase.json                 # Firebase configuration
├── .firebaserc                   # Firebase project aliases
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── package.json                  # Root dependencies (Firebase CLI tools)
├── .env.example                  # Environment variables template
├── .github/
│   └── workflows/
│       ├── deploy.yml            # CI/CD pipeline
│       └── test.yml              # Automated testing
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Database indexes
├── storage.rules                 # Firebase Storage rules
├── functions/                    # Cloud Functions directory
│   ├── package.json              # Functions dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .eslintrc.js              # Linting rules
│   ├── src/                      # Source code
│   │   ├── index.ts              # Main functions export
│   │   ├── config/               # Configuration files
│   │   │   ├── firebase.ts       # Firebase admin setup
│   │   │   ├── clerk.ts          # Clerk configuration & JWT validation
│   │   │   └── constants.ts      # App constants
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── index.ts          # Main types export
│   │   │   ├── user.ts           # User-related types
│   │   │   ├── room.ts           # Room-related types
│   │   │   ├── session.ts        # Session-related types
│   │   │   └── clerk.ts          # Clerk-related types
│   │   ├── utils/                # Utility functions
│   │   │   ├── validation.ts     # Input validation
│   │   │   ├── auth.ts           # Clerk auth helpers
│   │   │   └── time.ts           # Time/date utilities
│   │   ├── triggers/             # Firestore triggers
│   │   │   ├── user-triggers.ts  # User document triggers
│   │   │   ├── room-triggers.ts  # Room document triggers
│   │   │   └── session-triggers.ts # Session triggers
│   │   ├── webhooks/             # Clerk webhooks
│   │   │   ├── user-webhooks.ts  # User sync webhooks
│   │   │   └── auth-webhooks.ts  # Auth event webhooks
│   │   ├── scheduled/            # Scheduled functions
│   │   │   └── cleanup.ts        # Room cleanup jobs
│   │   └── callable/             # Callable functions
│   │       ├── room-management.ts # Room CRUD operations
│   │       ├── timer-control.ts   # Timer operations
│   │       └── user-management.ts # User operations
│   ├── lib/                      # Compiled JavaScript (auto-generated)
│   └── tests/                    # Test files
│       ├── setup.ts              # Test setup
│       ├── unit/                 # Unit tests
│       │   ├── utils.test.ts
│       │   └── validation.test.ts
│       └── integration/          # Integration tests
│           ├── room.test.ts
│           └── timer.test.ts
├── emulator/                     # Firebase emulator data
│   ├── firebase-export-metadata.json
│   └── firestore_export/
└── docs/                         # Documentation
    ├── api.md                    # API documentation
    ├── security-rules.md         # Security rules explanation
    └── deployment.md             # Deployment guide
```

## Clerk Authentication Integration

### Overview
Clerk handles all frontend authentication while Firebase backend validates Clerk JWTs and syncs user data via webhooks.

### Clerk Setup Requirements

#### 1. Clerk Dashboard Configuration
- Create Clerk application
- Configure OAuth providers (Google, GitHub, etc.)
- Set up webhook endpoints
- Generate API keys and secrets

#### 2. Webhook Endpoints
```typescript
// User created webhook
POST /api/webhooks/clerk/user-created
// User updated webhook  
POST /api/webhooks/clerk/user-updated
// User deleted webhook
POST /api/webhooks/clerk/user-deleted
```

#### 3. JWT Validation in Cloud Functions
```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';

export const validateClerkToken = async (token: string) => {
  try {
    const decoded = await clerkClient.verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid Clerk token');
  }
};
```

#### 4. Environment Variables
```env
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

### User Data Sync Flow

#### Frontend → Clerk → Backend
1. User signs up/in via Clerk on frontend
2. Clerk sends webhook to Firebase Functions
3. Function creates/updates user document in Firestore
4. Real-time listeners update frontend state

#### Webhook Handler Example
```typescript
export const clerkUserWebhook = functions.https.onRequest(async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'user.created':
      await createUserDocument(data);
      break;
    case 'user.updated':
      await updateUserDocument(data);
      break;
    case 'user.deleted':
      await deleteUserDocument(data);
      break;
  }
  
  res.status(200).send('OK');
});
```

### Security Rules with Clerk

#### Custom Claims Setup
```typescript
// Add Clerk user ID to Firebase custom claims
const customClaims = {
  clerk_user_id: clerkUser.id,
  role: clerkUser.publicMetadata.role || 'student'
};

await admin.auth().setCustomUserClaims(firebaseUid, customClaims);
```

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null && 
             request.auth.token.clerk_user_id != null;
    }
    
    function getClerkUserId() {
      return request.auth.token.clerk_user_id;
    }
    
    function getUserRole() {
      return request.auth.token.role;
    }
    
    // Users collection
    match /users/{clerkUserId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                      getClerkUserId() == clerkUserId;
    }
    
    // Study rooms collection
    match /studyRooms/{roomId} {
      allow read: if isAuthenticated() && (
        resource.data.visibility == 'public' || 
        getClerkUserId() in resource.data.members
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        getClerkUserId() == resource.data.hostId ||
        getClerkUserId() in resource.data.members
      );
      allow delete: if isAuthenticated() && 
                       getClerkUserId() == resource.data.hostId;
    }
  }
}
```

### Implementation Changes Required

#### 1. Dependencies
```json
{
  "@clerk/clerk-sdk-node": "^4.0.0",
  "@clerk/nextjs": "^4.0.0"
}
```

#### 2. Firebase Functions Structure
```
functions/src/
├── webhooks/
│   ├── clerk-user.ts      # User sync webhooks
│   └── clerk-auth.ts      # Auth event webhooks
├── middleware/
│   └── clerk-auth.ts      # JWT validation middleware
└── utils/
    └── clerk.ts           # Clerk helper functions
```

#### 3. User Data Mapping
```typescript
// Map Clerk user to Firestore document
const mapClerkUserToFirestore = (clerkUser: any) => ({
  clerkId: clerkUser.id,
  email: clerkUser.email_addresses[0]?.email_address,
  name: `${clerkUser.first_name} ${clerkUser.last_name}`.trim(),
  avatar: clerkUser.profile_image_url,
  role: clerkUser.public_metadata?.role || 'student',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  lastActive: admin.firestore.FieldValue.serverTimestamp(),
  clerkMetadata: {
    lastSignInAt: clerkUser.last_sign_in_at,
    emailVerified: clerkUser.email_addresses[0]?.verification?.status === 'verified'
  }
});
```

## Firestore Database Schema

### Users Collection: `/users/{clerkUserId}`
```typescript
{
  clerkId: string,                // Clerk user ID (primary key)
  email: string,                  // User email address
  name: string,                   // User display name
  avatar: string,                 // Profile picture URL
  role: "student" | "teacher",    // User role
  createdAt: Timestamp,           // Account creation time
  lastActive: Timestamp,          // Last activity timestamp
  clerkMetadata?: any            // Additional Clerk user data
}
```

### Study Rooms Collection: `/studyRooms/{roomId}`
```typescript
{
  hostId: string,                 // Room creator's Clerk ID
  topic: string,                  // Study session topic
  description?: string,           // Optional room description
  visibility: "public" | "private", // Room visibility
  members: string[],              // Array of member Clerk IDs
  maxMembers?: number,            // Maximum room capacity
  timer: {
    running: boolean,             // Timer active status
    duration: number,             // Total duration in minutes
    startedAt: Timestamp | null,  // Timer start time
    endsAt: Timestamp | null,     // Timer end time
    pausedAt: Timestamp | null    // Timer pause time
  },
  status: "waiting" | "active" | "paused" | "completed", // Room status
  resources?: {
    links: string[],              // Shared links
    files: string[]               // Storage file references
  },
  createdAt: Timestamp,           // Room creation time
  updatedAt: Timestamp,           // Last update time
  expiresAt: Timestamp            // Auto-expiry time
}
```

### Sessions Collection: `/sessions/{sessionId}`
```typescript
{
  roomId: string,                 // Associated room ID
  startedAt: Timestamp,           // Session start time
  endedAt?: Timestamp,            // Session end time
  duration: number,               // Session duration in minutes
  participants: string[],         // Participant Clerk IDs
  analytics: {
    joinEvents: Timestamp[],      // Join event timestamps
    leaveEvents: Timestamp[],     // Leave event timestamps
    timerEvents: Timestamp[]      // Timer event timestamps
  },
  createdAt: Timestamp            // Session creation time
}
```

## Security Rules Strategy

### Key Principles
- **Clerk Authentication**: All operations require valid Clerk JWT tokens
- **Host Control**: Only room hosts can control timers and room settings
- **Visibility Rules**: Public rooms readable by all, private rooms only by members
- **Self-Management**: Users can only modify their own profiles
- **Audit Trail**: Critical operations are logged and validated

### Example Security Rules
```javascript
// Users collection rules
match /users/{clerkUserId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && getUserId() == clerkUserId;
}

// Study rooms collection rules
match /studyRooms/{roomId} {
  allow read: if resource.data.visibility == 'public' || 
                 getUserId() in resource.data.members;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && (
    getUserId() == resource.data.hostId ||
    getUserId() in resource.data.members
  );
  allow delete: if isAuthenticated() && 
                   getUserId() == resource.data.hostId;
}

// Helper functions for Clerk integration
function isAuthenticated() {
  return request.auth != null && request.auth.token.clerk_user_id != null;
}

function getUserId() {
  return request.auth.token.clerk_user_id;
}
```

## Cloud Functions Architecture

### Core Functions

#### 1. Room Management
- **`onRoomCreate`**: Initialize room settings and set expiration
- **`onRoomUpdate`**: Validate timer changes and log events
- **`cleanupInactiveRooms`**: Scheduled function to remove expired rooms

#### 2. User Management
- **`onUserCreate`**: Initialize user profile on first sign-in
- **`updateUserActivity`**: Track last active timestamp

#### 3. Session Analytics
- **`createSession`**: Log session start and initialize analytics
- **`endSession`**: Calculate metrics and store session data

#### 4. Validation Functions
- **`validateTimerUpdate`**: Ensure only hosts can control timers
- **`validateRoomJoin`**: Check room capacity and permissions

## Implementation Plan

### Step 1: Project Foundation ✅
**Goal**: Set up basic Firebase project structure
- Initialize Firebase project
- Set up folder structure
- Configure package.json and basic configs
- Set up Git repository

### Step 2: Clerk Integration Setup
**Goal**: Implement Clerk authentication integration
- Configure Clerk webhooks for user sync
- Set up JWT validation in Cloud Functions
- Create user sync functions
- Set up Clerk user data structure in Firestore

### Step 3: Core Room Management
**Goal**: Basic study room functionality
- Room creation/deletion
- Room schema in Firestore
- Basic room security rules
- Room listing functionality

### Step 4: Member Management
**Goal**: Join/leave room functionality
- Member addition/removal
- Room capacity limits
- Member status tracking
- Real-time member list updates

### Step 5: Timer System
**Goal**: Shared timer functionality
- Timer state management in Firestore
- Host-only timer controls
- Real-time timer synchronization
- Timer validation functions

### Step 6: Session Analytics
**Goal**: Track study sessions
- Session creation/completion
- Basic analytics collection
- Session history storage

### Step 7: Cloud Functions & Automation
**Goal**: Server-side automation
- Auto-expire inactive rooms
- Scheduled cleanup jobs
- Advanced validation functions
- Error handling and logging

### Step 8: Security Hardening
**Goal**: Comprehensive security
- Advanced security rules
- Input validation
- Rate limiting
- Audit logging

### Step 9: Testing & Emulation
**Goal**: Testing infrastructure
- Firebase Emulator setup
- Unit tests for functions
- Integration tests
- Test data seeding

### Step 10: Deployment & CI/CD
**Goal**: Production deployment
- GitHub Actions setup
- Environment management
- Production deployment
- Monitoring and alerts

## Technical Decisions

### Real-time Updates
- **Firestore Listeners**: Use for live timer sync and member updates
- **Optimized Queries**: Reduce bandwidth with targeted listener queries
- **Offline Handling**: Graceful degradation when offline

### Timer Implementation
- **Server State**: Store authoritative timer state in Firestore
- **Client Calculation**: Local countdown computation for smooth UX
- **Server Validation**: All timer operations validated server-side

### Security Approach
- **Least Privilege**: Minimal permissions for each operation
- **Host-Based Model**: Room creators have elevated permissions
- **Function Validation**: Critical operations validated in Cloud Functions

### Data Consistency
- **Atomic Operations**: Use transactions for critical updates
- **Member Management**: Atomic array operations for member lists
- **Analytics**: Eventual consistency acceptable for analytics data

## Development Environment

### Required Tools
- Node.js (v18+)
- Firebase CLI
- TypeScript
- Git

### Setup Commands
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Start emulators
firebase emulators:start

# Deploy functions
firebase deploy --only functions

# Run tests
npm test
```

## Monitoring & Analytics

### Performance Tracking
- Firestore read/write operations
- Cloud Function execution times
- User engagement metrics
- Error rates and alerts

### Key Metrics
- Active users per day/week/month
- Average session duration
- Room creation/completion rates
- Function error rates
- Database performance metrics

## Security Considerations

### Authentication
- Multi-factor authentication support
- Session management
- Token validation

### Data Protection
- Input sanitization
- SQL injection prevention (NoSQL injection)
- Rate limiting on sensitive operations

### Privacy
- GDPR compliance considerations
- Data retention policies
- User data deletion capabilities

## Deployment Strategy

### Environments
- **Development**: Local emulators
- **Staging**: Firebase staging project
- **Production**: Firebase production project

### CI/CD Pipeline
- Automated testing on pull requests
- Staging deployment on merge to develop
- Production deployment on release tags
- Rollback capabilities

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Room templates and scheduling
- Integration with calendar systems
- Mobile push notifications
- Advanced resource sharing
- Breakout room functionality

### Scalability Considerations
- Database sharding strategies
- Function optimization
- CDN integration for file storage
- Global deployment options

---

## Getting Started

1. **Prerequisites**: Ensure you have Node.js and Firebase CLI installed
2. **Clone Repository**: `git clone <repository-url>`
3. **Install Dependencies**: `npm install`
4. **Setup Environment**: Copy `.env.example` to `.env` and configure
5. **Start Emulators**: `firebase emulators:start`
6. **Run Tests**: `npm test`

For detailed setup instructions, see `docs/deployment.md`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For questions or issues, please refer to the documentation in the `docs/` folder or create an issue in the project repository.
