import "server-only";
import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
    try {
        let credential;

        // 1. Try loading from Environment Variable (Best for Vercel/Production)
        // You must add FIREBASE_SERVICE_ACCOUNT_KEY to your Vercel Environment Variables
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log("Loading Admin SDK from Environment Variable");
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                credential = admin.credential.cert(serviceAccount);
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var", e);
            }
        }

        // 2. Try loading from local file system (Fallback for Localhost)
        // We use fs.readFileSync instead of require() to prevent Webpack/Turbopack 
        // from crashing during build if the file is missing (which it is in Vercel).
        if (!credential) {
            try {
                const localKeyPath = path.join(process.cwd(), 'service-account.json');
                if (fs.existsSync(localKeyPath)) {
                    console.log("Loading Admin SDK from local file:", localKeyPath);
                    const fileContent = fs.readFileSync(localKeyPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);
                    credential = admin.credential.cert(serviceAccount);
                } else {
                    console.warn("Local service-account.json not found at:", localKeyPath);
                }
            } catch (fileError) {
                console.warn("Failed to load local service-account.json", fileError);
            }
        }

        if (credential) {
            admin.initializeApp({
                credential: credential,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://labwise-h90op-default-rtdb.firebaseio.com"
            });
            console.log("Firebase Admin Initialized Successfully");
        } else {
            // In build time or if misconfigured, this might happen. 
            // We don't throw here to avoid breaking static generation of pages that might validly redirect.
            console.error("Firebase Admin Config Error: No credentials found (Env Var 'FIREBASE_SERVICE_ACCOUNT_KEY' or file 'service-account.json').");
        }

    } catch (error) {
        console.error("Firebase Admin Initialization Critical Error:", error);
    }
}

export const db = admin.database();
export const auth = admin.auth();
