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
            // 1. Authenticate with Firebase (Email/Password)
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

    async function handleGoogleLogin() {
        setError('');
        setLoading(true);
        try {
            const { signInWithPopup } = await import("firebase/auth");
            const { googleProvider } = await import("@/lib/firebase");

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (!user.email) throw new Error("No email provided by Google.");

            // Verify against USER_DIRECTORY
            const foundEntry = Object.entries(USER_DIRECTORY).find(([_, config]) => config.email === user.email);

            if (foundEntry) {
                const targetUid = foundEntry[0];
                await simulateLogin(targetUid);
                router.push('/');
            } else {
                // Critical: Sign out immediately if not allowed
                await auth.signOut();
                throw new Error("Access Denied: Your Google account is not authorized for this laboratory system.");
            }
        } catch (error: any) {
            console.error("Google Login failed", error);
            setError(error.message || "Google Authentication Failed");
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
                    <div className="space-y-6">
                        {/* Google Sign In Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200 h-11 font-medium relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.341,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.341,43.611,20.083z" />
                            </svg>
                            Sign in with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with email</span>
                            </div>
                        </div>

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
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all duration-300"
                                    disabled={loading}
                                >
                                    {loading ? "Authenticating..." : "Login with Password"}
                                </Button>
                            </div>
                        </form>
                    </div>
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
