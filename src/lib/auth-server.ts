'use server';

import { cookies } from 'next/headers';
import { getUserContext } from '@/lib/admin-config';

const AUTH_COOKIE = 'simulated_user_uid';

export async function getCurrentLabId(): Promise<string> {
    const cookieStore = await cookies();
    const uid = cookieStore.get(AUTH_COOKIE)?.value;

    if (!uid) {
        // Fallback for initial demo state if no cookie set yet,
        // or throw error depending on strictness.
        // For "God Mode" demo, default to Dr. Bhonsle if not logged in?
        // Let's default to Bhonsle to match client-side default.
        return 'lab_001_bhonsle';
    }

    const userContext = getUserContext(uid);
    if (!userContext) {
        // If invalid UID, unauthorized or default?
        throw new Error("Unauthorized: Invalid User ID");
    }

    return userContext.lab_context.id;
}

export async function simulateLogin(uid: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, uid, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
}
