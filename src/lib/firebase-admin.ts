import "server-only";
import * as admin from 'firebase-admin';

// Check if we are checking the credentials
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require('../../service-account.json')),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com"
        });
        console.log("Firebase Admin Initialized");
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
    }
}

export const db = admin.database();
export const auth = admin.auth();
