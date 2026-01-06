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
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                credential = admin.credential.cert(serviceAccount);
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var", e);
            }
        }

        // 2. Try loading from local file system (Fallback for Localhost)
        if (!credential) {
            try {
                const localKeyPath = path.join(process.cwd(), 'service-account.json');
                if (fs.existsSync(localKeyPath)) {
                    const fileContent = fs.readFileSync(localKeyPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);
                    credential = admin.credential.cert(serviceAccount);
                }
            } catch (fileError) {
                console.warn("Failed to load local service-account.json");
            }
        }

        if (credential) {
            admin.initializeApp({
                credential: credential,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com"
            });
            console.log("Firebase Admin Initialized Successfully");
        } else {
            console.error("FIREBASE WARNING: Admin SDK could not initialize. Missing credentials.");
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
