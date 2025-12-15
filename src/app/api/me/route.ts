import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserContext } from '@/lib/admin-config';
import { getLabConfig } from '@/lib/db';

// Force dynamic to ensure we don't cache this too aggressively during dev
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uidParam = searchParams.get('uid');

    const cookieStore = await cookies();
    const cookieUid = cookieStore.get('simulated_user_uid')?.value;

    // Priority: Query Param > Cookie > Default
    const currentUid = uidParam || cookieUid || 'uid_bhonsle_main';

    const userContext = getUserContext(currentUid);

    if (!userContext) {
        return NextResponse.json({ error: 'User not found in registry' }, { status: 404 });
    }

    // Fetch dynamic config from Firebase
    try {
        const dbConfig = await getLabConfig(userContext.lab_context.id);
        if (dbConfig) {
            if (dbConfig.displayName) userContext.lab_context.display_name = dbConfig.displayName;
            if (dbConfig.theme) userContext.lab_context.theme = dbConfig.theme;
        }
    } catch (e) {
        console.error("Failed to fetch dynamic config", e);
    }

    return NextResponse.json(userContext);
}
