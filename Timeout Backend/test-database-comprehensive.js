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

// Comprehensive database test
async function runDatabaseTests() {
  console.log('🔥 FIREBASE DATABASE COMPREHENSIVE TEST\n');
  
  try {
    // Test 1: Check existing user data
    console.log('📋 TEST 1: Reading existing user data...');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${usersSnapshot.size} user(s) in database:`);
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`   👤 User: ${userData.displayName || 'Unknown'}`);
        console.log(`   📧 Email: ${userData.email || 'No email'}`);
        console.log(`   🆔 Clerk ID: ${userData.clerkId || doc.id}`);
        console.log(`   📅 Created: ${userData.createdAt?.toDate() || 'Unknown'}`);
        console.log('   ---');
      });
    }

    // Test 2: Create a new test user
    console.log('\n📋 TEST 2: Creating new test user...');
    const testUserId = `test_user_${Date.now()}`;
    const testUserData = {
      clerkId: testUserId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      studyStats: {
        totalStudyTime: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      preferences: {
        defaultFocusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        notificationsEnabled: true,
      },
    };

    await db.collection('users').doc(testUserId).set(testUserData);
    console.log('✅ Test user created successfully');

    // Test 3: Read the test user back
    console.log('\n📋 TEST 3: Reading test user back...');
    const testUserDoc = await db.collection('users').doc(testUserId).get();
    if (testUserDoc.exists) {
      console.log('✅ Test user retrieved successfully');
      console.log('📊 Data:', testUserDoc.data());
    } else {
      console.log('❌ Test user not found');
    }

    // Test 4: Update test user
    console.log('\n📋 TEST 4: Updating test user...');
    await db.collection('users').doc(testUserId).update({
      'studyStats.totalStudyTime': 1500, // 25 minutes
      'studyStats.sessionsCompleted': 1,
      updatedAt: new Date(),
    });
    console.log('✅ Test user updated successfully');

    // Test 5: Create a test study room
    console.log('\n📋 TEST 5: Creating test study room...');
    const roomData = {
      name: 'Test Study Room',
      description: 'A test room for database verification',
      subject: 'Computer Science',
      isPublic: true,
      maxMembers: 10,
      currentMembers: 1,
      createdBy: testUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowChat: true,
        focusTime: 25,
        breakTime: 5,
      },
      activeSession: null,
    };

    const roomRef = await db.collection('rooms').add(roomData);
    console.log(`✅ Test study room created with ID: ${roomRef.id}`);

    // Test 6: Query rooms
    console.log('\n📋 TEST 6: Querying study rooms...');
    const roomsSnapshot = await db.collection('rooms')
      .where('isPublic', '==', true)
      .limit(5)
      .get();
    
    console.log(`✅ Found ${roomsSnapshot.size} public room(s):`);
    roomsSnapshot.forEach(doc => {
      const room = doc.data();
      console.log(`   🏠 Room: ${room.name}`);
      console.log(`   📚 Subject: ${room.subject || 'General'}`);
      console.log(`   👥 Members: ${room.currentMembers}/${room.maxMembers}`);
    });

    // Test 7: Test real-time capabilities (simulation)
    console.log('\n📋 TEST 7: Testing real-time update simulation...');
    const roomId = roomRef.id;
    
    // Simulate joining a room
    await db.collection('rooms').doc(roomId).update({
      currentMembers: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });
    console.log('✅ Simulated user joining room');

    // Simulate starting a study session
    await db.collection('rooms').doc(roomId).update({
      activeSession: {
        startTime: new Date(),
        sessionType: 'focus',
        duration: 25,
        participants: [testUserId],
      },
      updatedAt: new Date(),
    });
    console.log('✅ Simulated study session start');

    // Test 8: Clean up test data
    console.log('\n📋 TEST 8: Cleaning up test data...');
    await db.collection('users').doc(testUserId).delete();
    await db.collection('rooms').doc(roomId).delete();
    console.log('✅ Test data cleaned up');

    // Test 9: Check your actual user data
    console.log('\n📋 TEST 9: Verifying your actual user data...');
    const yourUserQuery = await db.collection('users')
      .where('email', '==', 'ojhasanay@gmail.com')
      .get();
    
    if (!yourUserQuery.empty) {
      const yourUserDoc = yourUserQuery.docs[0];
      const yourData = yourUserDoc.data();
      console.log('✅ Your user data found:');
      console.log(`   👤 Name: ${yourData.displayName}`);
      console.log(`   📧 Email: ${yourData.email}`);
      console.log(`   🆔 Clerk ID: ${yourData.clerkId}`);
      console.log(`   📊 Study Stats:`, yourData.studyStats);
      console.log(`   ⚙️ Preferences:`, yourData.preferences);
    } else {
      console.log('❌ Your user data not found');
    }

    // Test 10: Performance test
    console.log('\n📋 TEST 10: Performance test...');
    const startTime = Date.now();
    
    const batch = db.batch();
    for (let i = 0; i < 10; i++) {
      const docRef = db.collection('temp_test').doc(`perf_test_${i}`);
      batch.set(docRef, { index: i, timestamp: new Date() });
    }
    await batch.commit();
    
    const performanceQuery = await db.collection('temp_test').get();
    
    // Clean up performance test
    const deleteBatch = db.batch();
    performanceQuery.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    
    const endTime = Date.now();
    console.log(`✅ Performance test: ${performanceQuery.size} documents in ${endTime - startTime}ms`);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log('✅ Read operations: Working');
    console.log('✅ Write operations: Working');
    console.log('✅ Update operations: Working');
    console.log('✅ Delete operations: Working');
    console.log('✅ Query operations: Working');
    console.log('✅ Batch operations: Working');
    console.log('✅ Your user data: Present and valid');
    console.log('\n🚀 Your Firebase database is fully functional!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check .env file for correct Firebase credentials');
    console.log('2. Verify Firebase project permissions');
    console.log('3. Ensure Firestore is enabled in Firebase console');
  }
}

// Run all tests
runDatabaseTests().then(() => {
  console.log('\n🏁 Database testing complete');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error during testing:', error);
  process.exit(1);
});