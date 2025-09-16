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

// Connect to EMULATOR
const db = admin.firestore();
db.settings({
  host: 'localhost:8090',
  ssl: false
});

async function viewAllData() {
  console.log('🔍 COMPLETE FIRESTORE EMULATOR DATA VIEW\n');
  console.log('=' * 60);
  
  try {
    // Get all collections
    const collections = await db.listCollections();
    
    for (const collection of collections) {
      console.log(`\n📚 COLLECTION: "${collection.id}"`);
      console.log('─'.repeat(40));
      
      const snapshot = await collection.get();
      
      if (snapshot.empty) {
        console.log('   (Empty collection)');
      } else {
        console.log(`   Found ${snapshot.size} document(s):\n`);
        
        let docCount = 1;
        snapshot.forEach((doc) => {
          console.log(`   📄 Document ${docCount}: "${doc.id}"`);
          const data = doc.data();
          
          // Pretty print the data
          Object.entries(data).forEach(([key, value]) => {
            if (value instanceof admin.firestore.Timestamp) {
              console.log(`      ${key}: ${value.toDate()}`);
            } else if (typeof value === 'object' && value !== null) {
              console.log(`      ${key}: ${JSON.stringify(value, null, 6)}`);
            } else {
              console.log(`      ${key}: ${value}`);
            }
          });
          
          console.log('   ' + '─'.repeat(35));
          docCount++;
        });
      }
    }
    
    console.log('\n🎯 DATA SUMMARY:');
    console.log('─'.repeat(40));
    for (const collection of collections) {
      const snapshot = await collection.get();
      console.log(`   ${collection.id}: ${snapshot.size} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error viewing data:', error);
  }
  
  process.exit(0);
}

viewAllData();