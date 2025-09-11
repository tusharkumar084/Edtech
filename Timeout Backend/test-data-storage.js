/**
 * Test script to verify data is being stored in Firestore
 * This script will create a room and check if it appears in the database
 */

const { httpsCallable, connectFunctionsEmulator } = require('firebase/functions');
const { initializeApp } = require('firebase/app');
const { getFunctions } = require('firebase/functions');

// Firebase config for local testing
const firebaseConfig = {
  projectId: "timeout-backend",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to local functions emulator
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

// Test data
const testRoomData = {
  name: "Data Storage Test Room",
  description: "Testing if data goes to Firestore",
  subject: "Testing",
  isPublic: true,
  maxParticipants: 5,
  timerDurationMinutes: 15,
  userId: "test-user-123",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.jpg"
};

async function testDataStorage() {
  try {
    console.log("🧪 Testing Firestore data storage...\n");

    console.log("📝 Creating a test room...");
    console.log("Room data:", JSON.stringify(testRoomData, null, 2));

    // Test: Create a room
    const createRoom = httpsCallable(functions, 'createRoom');
    const result = await createRoom(testRoomData);
    
    console.log("\n✅ Room creation result:");
    console.log("Room ID:", result.data.roomId);
    console.log("Host ID:", result.data.hostId);
    console.log("Participants:", result.data.currentParticipants);

    console.log("\n🔍 Now check the Firestore UI at: http://127.0.0.1:4000/firestore");
    console.log("📂 Look for collection: 'rooms'");
    console.log("📄 Look for document:", result.data.roomId);

    // Test: Get public rooms to verify it's listed
    console.log("\n📋 Fetching public rooms to verify storage...");
    const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
    const publicRoomsResult = await getPublicRooms();
    
    console.log("✅ Public rooms found:", publicRoomsResult.data.rooms.length);
    
    const ourRoom = publicRoomsResult.data.rooms.find(room => room.id === result.data.roomId);
    if (ourRoom) {
      console.log("✅ Our test room is in the database!");
      console.log("Room name:", ourRoom.name);
      console.log("Room subject:", ourRoom.subject);
      console.log("Participants:", ourRoom.currentParticipants);
    } else {
      console.log("❌ Our test room was not found in public rooms");
    }

    console.log("\n🎉 Test completed!");
    console.log("🖥️  Check the Firestore UI to see the actual data structure");

  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.details) {
      console.error("Error details:", error.details);
    }
  }
}

// Run the test
testDataStorage().then(() => {
  console.log("\n✨ Data storage test finished");
  console.log("📊 Visit http://127.0.0.1:4000/firestore to see the data");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});
