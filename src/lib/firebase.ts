import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Fallback configuration if environment variables are missing
// using the values provided by the user.
const firebaseConfig = {
    apiKey: "AIzaSyAMop5GVHOhOnDGKHrSKq_lnP14TUL-oH8",
    authDomain: "labwise-h90op.firebaseapp.com",
    databaseURL: "https://labwise-h90op-default-rtdb.firebaseio.com",
    projectId: "labwise-h90op",
    storageBucket: "labwise-h90op.firebasestorage.app",
    messagingSenderId: "1059099747420",
    appId: "1:1059099747420:web:3efea269e87a95dc0db299",
};

console.log("DEBUG: Firebase Config Values:", {
    hasKey: !!firebaseConfig.apiKey,
    hasDbUrl: !!firebaseConfig.databaseURL,
    dbUrl: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
