import "server-only";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
    try {
        let credential;

        // 1. Try loading from Environment Variable (Best for Vercel/Production)
        // You must add FIREBASE_SERVICE_ACCOUNT_KEY to your Vercel Environment Variables
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log("Loading Admin SDK from Environment Variable");
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
        }
        // 2. Try loading from local file (Best for Localhost Development)
        // We use dynamic require or fs to avoid build-time errors if file is missing in Vercel
        else {
            console.log("Loading Admin SDK from local file system");
            // Standard require would fail build if file is missing (due to gitignore)
            // But locally we know it exists.
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const serviceAccount = require('../../service-account.json');
                credential = admin.credential.cert(serviceAccount);
            } catch (fileError) {
                console.warn("Local service-account.json not found. Admin features may fail.");
            }
        }

        if (credential) {
            admin.initializeApp({
                credential: credential,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com"
            });
            console.log("Firebase Admin Initialized Successfully");
        } else {
            console.error("Firebase Admin Initialization Failed: No credentials found (Env Var or File).");
        }

    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
    }
}

export const db = admin.database();
export const auth = admin.auth();
