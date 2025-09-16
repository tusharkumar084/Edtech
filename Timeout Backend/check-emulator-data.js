const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin for emulator
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

// Connect to EMULATOR (not production)
const db = admin.firestore();
db.settings({
  host: 'localhost:8090',
  ssl: false
});

async function checkEmulatorData() {
  try {
    console.log('🔍 Checking data in EMULATOR database...\n');
    
    // Check users collection in EMULATOR
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in EMULATOR');
      console.log('💡 This means your frontend is either:');
      console.log('   1. Not connecting to emulator properly');
      console.log('   2. Not triggering user creation yet');
      console.log('   3. Still writing to production');
    } else {
      console.log(`✅ Found ${usersSnapshot.size} user(s) in EMULATOR:\n`);
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`👤 User ID: ${doc.id}`);
        console.log(`📧 Email: ${userData.email}`);
        console.log(`👨‍💼 Name: ${userData.displayName || 'Not set'}`);
        console.log(`🎯 Role: ${userData.role || 'Not selected yet'}`);
        console.log(`📅 Created: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
        console.log('-------------------\n');
      });
    }
    
    // Check other collections
    const collections = ['test', 'rooms', 'studyRooms', 'sessions'];
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      if (!snapshot.empty) {
        console.log(`📚 Found ${snapshot.size} documents in '${collectionName}' collection`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking emulator data:', error.message);
  }
  
  process.exit(0);
}

checkEmulatorData();