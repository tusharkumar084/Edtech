/**
 * Direct Firestore test - bypasses Cloud Functions to test database directly
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8090';

// Initialize admin SDK
admin.initializeApp({
  projectId: 'timeout-backend'
});

const db = admin.firestore();

async function testFirestoreDirectly() {
  try {
    console.log("🧪 Testing direct Firestore connection...\n");

    // Test 1: Add a test document
    console.log("📝 Adding test room document to Firestore...");
    
    const testRoomData = {
      name: "Direct Firestore Test Room",
      description: "Testing direct database connection",
      subject: "Database Testing",
      isPublic: true,
      maxParticipants: 10,
      currentParticipants: 1,
      hostId: "test-host-123",
      hostName: "Test Host",
      hostAvatar: "https://example.com/avatar.jpg",
      status: "active",
      visibility: "public",
      settings: {
        allowMessages: true,
        requireApproval: false
      },
      participants: {
        "test-host-123": {
          displayName: "Test Host",
          avatarUrl: "https://example.com/avatar.jpg",
          role: "host",
          joinedAt: admin.firestore.Timestamp.now()
        }
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    // Add the document
    const docRef = await db.collection('rooms').add(testRoomData);
    console.log("✅ Document added with ID:", docRef.id);

    // Test 2: Read the document back
    console.log("\n📖 Reading document back from Firestore...");
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log("✅ Document found!");
      const data = doc.data();
      console.log("   Room name:", data.name);
      console.log("   Room subject:", data.subject);
      console.log("   Participants:", data.currentParticipants);
      console.log("   Created at:", data.createdAt.toDate());
    } else {
      console.log("❌ Document not found");
    }

    // Test 3: Query for all rooms
    console.log("\n📋 Querying all rooms...");
    const snapshot = await db.collection('rooms').get();
    console.log(`✅ Found ${snapshot.size} rooms in database`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.name} (${doc.id})`);
    });

    console.log("\n🎉 Direct Firestore test completed successfully!");
    console.log("🌐 View the data in Firestore UI: http://127.0.0.1:4000/firestore");

  } catch (error) {
    console.error("❌ Direct Firestore test failed:", error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Run the test
testFirestoreDirectly();
