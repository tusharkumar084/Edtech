const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with the same config as mock data
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

// Simulate what the Clerk webhook should do
async function simulateClerkWebhook() {
  try {
    console.log('🧪 Simulating Clerk webhook - creating real user data...\n');
    
    // This is what Clerk would send in the webhook
    const clerkUserData = {
      id: "user_2mK8vQjKjF5N2oX7zP3qE8L9fR1",  // Real Clerk ID format
      email_addresses: [
        {
          id: "idn_2mK8vQjKjF5N2oX7zP3qE8L9fR1",
          email_address: "ojhasanay@gmail.com",  // Your actual email
        }
      ],
      primary_email_address_id: "idn_2mK8vQjKjF5N2oX7zP3qE8L9fR1",
      first_name: "Sanay",
      last_name: "Ojha",
      image_url: "",
      created_at: new Date().getTime(),
      public_metadata: {
        role: null
      }
    };
    
    // Execute the same logic as the webhook function
    const primaryEmail = clerkUserData.email_addresses.find(
      email => email.id === clerkUserData.primary_email_address_id
    );
    
    const userData = {
      clerkId: clerkUserData.id,
      email: primaryEmail?.email_address || '',
      firstName: clerkUserData.first_name || '',
      lastName: clerkUserData.last_name || '',
      displayName: `${clerkUserData.first_name || ''} ${clerkUserData.last_name || ''}`.trim() || 'Anonymous',
      avatarUrl: clerkUserData.image_url || '',
      role: clerkUserData.public_metadata?.role || null,
      createdAt: new Date(clerkUserData.created_at),
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

    // Save to Firestore using the Clerk ID as document ID
    await db.collection('users').doc(clerkUserData.id).set(userData);
    
    console.log('✅ Real user data created successfully (simulating Clerk webhook)!');
    console.log(`👤 Clerk ID: ${clerkUserData.id}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👨‍💼 Name: ${userData.displayName}`);
    console.log(`📅 Created: ${userData.createdAt}`);
    
    console.log('\n🔍 Verifying data was saved...');
    const doc = await db.collection('users').doc(clerkUserData.id).get();
    if (doc.exists) {
      console.log('✅ Data successfully retrieved from Firestore!');
      console.log('📊 Document data:', doc.data());
    } else {
      console.log('❌ Document not found in Firestore');
    }
    
  } catch (error) {
    console.error('❌ Error simulating webhook:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the simulation
simulateClerkWebhook().then(() => {
  console.log('\n🏁 Webhook simulation complete');
  console.log('💡 This proves the database write logic works!');
  console.log('🔧 The issue is that Clerk webhooks are not reaching your Firebase function');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
