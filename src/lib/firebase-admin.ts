import "server-only";
import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

interface MockDB {
    ref: (path?: string) => any;
}

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
    try {
        let credential;

        // 1. Try loading from Environment Variable (Best for Vercel/Production)
        const envVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (envVar) {
            console.log("DEBUG: Found FIREBASE_SERVICE_ACCOUNT_KEY. Length:", envVar.length);
            try {
                const serviceAccount = JSON.parse(envVar);
                console.log("DEBUG: Successfully parsed service account JSON.");
                credential = admin.credential.cert(serviceAccount);
            } catch (e) {
                console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var", e);
            }
        } else {
            console.log("DEBUG: FIREBASE_SERVICE_ACCOUNT_KEY env var is NOT present.");
        }

        // 2. Try loading from local file system (Fallback for Localhost)
        if (!credential) {
            try {
                const localKeyPath = path.join(process.cwd(), 'service-account.json');
                if (fs.existsSync(localKeyPath)) {
                    console.log("DEBUG: Loading from local file:", localKeyPath);
                    const fileContent = fs.readFileSync(localKeyPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);
                    credential = admin.credential.cert(serviceAccount);
                } else {
                    console.log("DEBUG: Local service-account.json not found.");
                }
            } catch (fileError) {
                console.warn("DEBUG: Failed to read local service-account.json", fileError);
            }
        }

        if (credential) {
            admin.initializeApp({
                credential: credential,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com"
            });
            console.log("Firebase Admin Initialized Successfully");
        } else {
            console.error("FIREBASE WARNING: Admin SDK could not initialize. Mocking DB.");
        }

    } catch (error) {
        console.error("Firebase Admin Initialization Critical Error:", error);
    }
}

// Export safe instances (mocked if initialization failed to prevent build crashes)
let dbInstance: admin.database.Database;
let authInstance: admin.auth.Auth;

if (admin.apps.length) {
    dbInstance = admin.database();
    authInstance = admin.auth();
} else {
    // Create a mock that satisfies the basic interfaces to prevent "default app does not exist" crash on import
    console.warn("Using MOCK Firebase Admin instances (Build Safety Mode)");

    const mockRef = {
        once: async () => ({ exists: () => false, val: () => null }),
        set: async () => { },
        update: async () => { },
        remove: async () => { },
        push: () => ({ key: 'mock-id' })
    };

    dbInstance = {
        ref: () => mockRef,
    } as unknown as admin.database.Database;

    authInstance = {
        getUser: async () => null,
        verifyIdToken: async () => ({ uid: 'mock' })
    } as unknown as admin.auth.Auth;
}

export const db = dbInstance;
export const auth = authInstance;
