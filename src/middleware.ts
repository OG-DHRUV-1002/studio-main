import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('simulated_user_uid')?.value;

    // Define protected routes (everything inside (app) which is the root layout in this structure basically)
    // Actually, standard Next.js app router structure often puts (app) as the protected group.
    // We want to protect everything EXCEPT /login and /api (unless specific api needs protection, which it does, but middleware is primarily for page redirects).

    if (request.nextUrl.pathname.startsWith('/login')) {
        // If already logged in, redirect to dashboard
        if (currentUser) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }



    // Allow API routes to handle their own auth or pass through (we check cookies in actions/routes anyway)
    if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    if (!currentUser) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
