const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "timeout-backend-340e2",
  private_key: process.env.FIREBASE_PRIVATE_KEY || "",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'timeout-backend-340e2'
  });
}

const db = admin.firestore();

// Create user data for your actual authentication
async function createUserForRealAuth() {
  try {
    console.log('👤 Creating user data for your real authentication...\n');
    
    // Get the Clerk user ID from when you sign up
    // You'll need to replace this with your actual Clerk user ID
    const clerkUserId = process.argv[2] || "user_REPLACE_WITH_YOUR_CLERK_ID";
    
    if (clerkUserId === "user_REPLACE_WITH_YOUR_CLERK_ID") {
      console.log('❌ Please provide your Clerk user ID as argument:');
      console.log('   node create-real-user.js user_YOUR_ACTUAL_CLERK_ID');
      console.log('\n💡 To find your Clerk ID:');
      console.log('   1. Sign up/in to your app');
      console.log('   2. Check browser dev tools > Application > Local Storage');
      console.log('   3. Look for Clerk data with your user ID');
      process.exit(1);
    }
    
    const userData = {
      clerkId: clerkUserId,
      email: "ojhasanay@gmail.com", // Your actual email
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

    // Save with your actual Clerk ID
    await db.collection('users').doc(clerkUserId).set(userData);
    
    console.log('✅ Real user data created successfully!');
    console.log(`👤 Clerk ID: ${clerkUserId}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👨‍💼 Name: ${userData.displayName}`);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Sign in to your app with Clerk');
    console.log('2. Your user data should now appear in the dashboard');
    console.log('3. Set up proper webhooks later for production');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
}

createUserForRealAuth().then(() => {
  console.log('\n🏁 User creation complete');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
