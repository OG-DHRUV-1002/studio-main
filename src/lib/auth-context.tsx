'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from './admin-config';
import { simulateLogin, logoutAction } from './auth-server';

interface AuthContextType {
    user: UserContext | null;
    loading: boolean;
    loginAs: (uid: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginAs: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserContext | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Simulate initial login or fetch from API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    // If 404/401, likely not logged in or cookie missing
                    // Middleware usually handles redirect, but good to know state
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch user context", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const loginAs = async (uid: string) => {
        setLoading(true);
        try {
            await simulateLogin(uid);

            // Re-fetch to confirm context updates (API route reads cookie)
            const res = await fetch('/api/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutAction();
            setUser(null);
            router.push('/login');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
