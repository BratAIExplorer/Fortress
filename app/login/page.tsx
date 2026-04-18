
"use client";

import { useState } from "react";
// We'll use a direct form submission for now as NextAuth v5 handles it well via server actions or redirects
// But for simplicity in a "Gemini" context, I'll use the browser's native redirect or a sign-in function if available.
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!username || !password) {
            setError("Please enter both email and password");
            return;
        }

        if (!username.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: true,
                callbackUrl: "/admin",
            }) as { error?: string } | undefined;

            if (result?.error) {
                setError("Email or password is incorrect. Please try again or reset your password.");
            }
        } catch {
            setError("Something went wrong. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-serif font-bold">Sign In to Fortress</CardTitle>
                    <CardDescription>Access your investment command center</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? "Authenticating..." : "Login to Fortress"}
                        </Button>
                    </form>

                    <div className="mt-6 space-y-3 text-sm text-center text-muted-foreground">
                        <div>
                            <Link href="/forgot-password" className="text-primary hover:underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <div>
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline">
                                Create one
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
