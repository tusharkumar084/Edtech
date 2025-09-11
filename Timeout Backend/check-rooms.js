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

async function checkRooms() {
  try {
    console.log('🔍 Checking study rooms in Firestore...\n');
    
    // Get all rooms from the rooms collection
    const roomsSnapshot = await db.collection('rooms').get();
    
    if (roomsSnapshot.empty) {
      console.log('❌ No rooms found in Firestore');
      return;
    }
    
    console.log(`✅ Found ${roomsSnapshot.size} room(s) in Firestore:\n`);
    
    roomsSnapshot.forEach((doc) => {
      const roomData = doc.data();
      console.log(`🏠 Room ID: ${doc.id}`);
      console.log(`📚 Name: ${roomData.name}`);
      console.log(`📝 Description: ${roomData.description}`);
      console.log(`📖 Subject: ${roomData.subject}`);
      console.log(`👥 Members: ${roomData.currentMembers}/${roomData.maxMembers}`);
      console.log(`🌐 Public: ${roomData.isPublic ? 'Yes' : 'No'}`);
      console.log(`👤 Created by: ${roomData.createdBy}`);
      console.log(`📅 Created: ${roomData.createdAt?.toDate?.() || roomData.createdAt}`);
      console.log('-------------------\n');
    });
    
  } catch (error) {
    console.error('❌ Error checking rooms:', error.message);
  }
}

// Run the check
checkRooms().then(() => {
  console.log('🏁 Room check complete');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
