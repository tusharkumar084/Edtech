const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with environment variables  
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "timeout-backend-340e2",
  private_key: process.env.FIREBASE_PRIVATE_KEY || "",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'timeout-backend-340e2'
  });
}

const db = admin.firestore();

async function createMockUserData() {
  try {
    console.log('📝 Creating mock user data for Sanay Ojha...\n');
    
    // Mock user data based on what Clerk would send
    const userData = {
      clerkId: "user_mock_sanay_ojha", // Mock Clerk ID
      email: "sanay.ojha@example.com", // Replace with your actual email
      firstName: "Sanay",
      lastName: "Ojha", 
      displayName: "Sanay Ojha",
      avatarUrl: "",
      role: null, // Will be set when you choose student/teacher
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

    // Add user to Firestore
    await db.collection('users').doc('user_mock_sanay_ojha').set(userData);
    
    console.log('✅ Mock user data created successfully!');
    console.log(`👤 User ID: user_mock_sanay_ojha`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👨‍💼 Name: ${userData.displayName}`);
    console.log(`📅 Created: ${userData.createdAt}`);
    
    // Also create a sample room to test the functionality
    const roomData = {
      name: "Study Group - Math",
      description: "Collaborative math study session",
      subject: "Mathematics",
      isPublic: true,
      maxMembers: 10,
      currentMembers: 1,
      createdBy: "user_mock_sanay_ojha",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      members: ["user_mock_sanay_ojha"],
      settings: {
        allowChat: true,
        allowScreenShare: true,
        requireApproval: false,
      }
    };
    
    await db.collection('rooms').doc('room_sample_math').set(roomData);
    console.log('✅ Sample study room created: Study Group - Math');
    
  } catch (error) {
    console.error('❌ Error creating mock data:', error.message);
  }
}

// Run the script
createMockUserData().then(() => {
  console.log('\n🏁 Mock data creation complete');
  console.log('💡 Now you can test the app with data in Firestore!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
