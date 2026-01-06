'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { simulateLogin } from '@/lib/auth-server';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { USER_DIRECTORY } from "@/lib/admin-config";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!email) {
            setError("Email address is required.");
            return;
        }
        if (!password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        try {
            // 1. Authenticate with Firebase (Google)
            await signInWithEmailAndPassword(auth, email, password);

            // 2. Find the UID map for this email to set the context cookie
            const foundEntry = Object.entries(USER_DIRECTORY).find(([_, config]) => config.email === email);

            let targetUid = '';
            if (foundEntry) {
                targetUid = foundEntry[0];
            } else {
                throw new Error("Account authorized but not configured in Lab Registry.");
            }

            // 3. Create Session (Cookie)
            await simulateLogin(targetUid);

            router.push('/');
        } catch (error: any) {
            console.error("Login failed", error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError("Invalid Email or Password.");
            } else {
                setError("Authentication Failed. Please check your credentials.");
            }
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] bg-purple-900 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-blue-900 rounded-full blur-[100px]"></div>
            </div>

            <Card className="w-full max-w-md z-10 border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-32 h-32 relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl animate-pulse"></div>
                        <Image
                            src="/msd-logo.png"
                            alt="MSD Logo"
                            fill
                            className="object-contain relative z-10 drop-shadow-2xl"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">MSD LIMS</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Secure Multi-Tenant Laboratory Access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-zinc-500">Email Address</Label>
                            <Input
                                type="email"
                                placeholder="name@laboratory.com"
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-blue-500/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-zinc-500">Security Key</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-blue-500/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs text-center animate-pulse">{error}</p>}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : "Access Laboratory"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col justify-center border-t border-zinc-800/50 pt-6 space-y-4">
                    <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest leading-relaxed">
                        Authorized Personnel Only • 256-Bit SSL Encryption • Audit Logging Active<br />
                        Unauthorized access is a violation of federal compliance protocols.
                    </p>
                    <div className="flex items-center gap-2 opacity-50">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-zinc-600 font-mono">System Operational (v2.4.0-Pro)</span>
                    </div>
                </CardFooter>
            </Card>
            <div className="absolute bottom-4 text-center">
                <p className="text-xs text-zinc-700 font-medium">© 2025 MSD Enterprise Solutions. Trusted by Leading Healthcare Providers Worldwide.</p>
            </div>
        </div>
    );
}
