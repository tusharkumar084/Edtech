/**
 * Test script for TimeOut room functions
 * This script tests the room management functionality locally
 */

const { httpsCallable, connectFunctionsEmulator } = require('firebase/functions');
const { initializeApp } = require('firebase/app');
const { getFunctions } = require('firebase/functions');

// Firebase config for local testing
const firebaseConfig = {
  projectId: "timeout-backend",
  // Local emulator endpoints will be used
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to local functions emulator
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

// Test data
const testUser = {
  userId: "test-user-123",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.jpg"
};

const testRoomData = {
  name: "Test Study Room",
  description: "A room for testing our functions",
  subject: "Computer Science",
  isPublic: true,
  maxParticipants: 10,
  timerDurationMinutes: 25
};

async function testRoomFunctions() {
  try {
    console.log("🧪 Starting room function tests...\n");

    // Test 1: Create a room
    console.log("1️⃣ Testing createRoom...");
    const createRoom = httpsCallable(functions, 'createRoom');
    const createResult = await createRoom({
      ...testRoomData,
      userId: testUser.userId,
      displayName: testUser.displayName,
      avatarUrl: testUser.avatarUrl
    });
    
    const roomId = createResult.data.roomId;
    console.log("✅ Room created successfully:", roomId);
    console.log("   Room data:", JSON.stringify(createResult.data, null, 2));

    // Test 2: Get public rooms
    console.log("\n2️⃣ Testing getPublicRooms...");
    const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
    const publicRoomsResult = await getPublicRooms();
    console.log("✅ Public rooms retrieved:");
    console.log("   Found", publicRoomsResult.data.rooms.length, "public rooms");

    // Test 3: Get room details
    console.log("\n3️⃣ Testing getRoomDetails...");
    const getRoomDetails = httpsCallable(functions, 'getRoomDetails');
    const roomDetailsResult = await getRoomDetails({ roomId });
    console.log("✅ Room details retrieved:");
    console.log("   Room:", roomDetailsResult.data.room.name);
    console.log("   Participants:", Object.keys(roomDetailsResult.data.room.participants).length);

    // Test 4: Join room with second user
    console.log("\n4️⃣ Testing joinRoom...");
    const joinRoom = httpsCallable(functions, 'joinRoom');
    const joinResult = await joinRoom({
      roomId,
      userId: "test-user-456",
      displayName: "Second User",
      avatarUrl: "https://example.com/avatar2.jpg"
    });
    console.log("✅ User joined room successfully");
    console.log("   Updated participant count:", joinResult.data.currentParticipants);

    // Test 5: Leave room
    console.log("\n5️⃣ Testing leaveRoom...");
    const leaveRoom = httpsCallable(functions, 'leaveRoom');
    const leaveResult = await leaveRoom({
      roomId,
      userId: "test-user-456"
    });
    console.log("✅ User left room successfully");
    console.log("   Updated participant count:", leaveResult.data.currentParticipants);

    console.log("\n🎉 All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.details || error.message);
  }
}

// Run the tests
testRoomFunctions().then(() => {
  console.log("\n✨ Test suite finished");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});
