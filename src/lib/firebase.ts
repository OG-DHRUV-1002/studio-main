import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Fallback configuration if environment variables are missing
// using the values provided by the user.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAMop5GVHOhOnDGKHrSKq_lnP14TUL-oH8",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "labwise-h90op.firebaseapp.com",
    // Updated with the correct URL from the screenshot
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "labwise-h90op",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "labwise-h90op.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1059099747420",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1059099747420:web:3efea269e87a95dc0db299",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
