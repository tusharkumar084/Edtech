import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
// export const storage = admin.storage(); // TODO: Enable when storage is set up

// Set Firestore settings
db.settings({
  timestampsInSnapshots: true,
});

export { admin };
export default admin;
