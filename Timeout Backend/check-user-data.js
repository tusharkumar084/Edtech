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

async function checkUserData() {
  try {
    console.log('🔍 Checking user data in Firestore...\n');
    
    // Get all users from the users collection
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore');
      console.log('📝 This means the webhook hasn\'t been triggered yet or there\'s a configuration issue');
      return;
    }
    
    console.log(`✅ Found ${usersSnapshot.size} user(s) in Firestore:\n`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 User ID: ${doc.id}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👨‍💼 Name: ${userData.displayName || 'Not set'}`);
      console.log(`🎯 Role: ${userData.role || 'Not selected yet'}`);
      console.log(`📅 Created: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
      console.log(`✅ Active: ${userData.isActive}`);
      console.log('-------------------\n');
    });
    
  } catch (error) {
    console.error('❌ Error checking user data:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('💡 This might be a permissions issue. Make sure your Firebase service account has the right permissions.');
    }
    
    if (error.message.includes('not found')) {
      console.log('💡 The users collection might not exist yet. Try signing up first to trigger the webhook.');
    }
  }
}

// Load environment variables first
require('dotenv').config();

// Run the check
checkUserData().then(() => {
  console.log('🏁 Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
