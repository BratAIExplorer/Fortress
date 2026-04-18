import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { privacyConsent } from "@/lib/db/schema/consent";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "Fortress Credentials",
            credentials: {
                username: { label: "Identifier", type: "text" }, // Matches existing login form
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const identifier = (credentials.username as string).toLowerCase().trim();
                const password = credentials.password as string;

                // 1. Check for legacy 'admin' username + ADMIN_SECRET
                const adminSecret = process.env.ADMIN_SECRET;
                if ((identifier === "admin" || identifier === "admin@fortress.ai") && adminSecret && password === adminSecret) {
                    return { 
                        id: "admin-id", 
                        name: "System Admin", 
                        email: "admin@fortress.ai",
                        isAdmin: true 
                    };
                }

                // 2. Check Database for user (searching both email and username if applicable, but currently prioritizing email)
                try {
                    const user = await db
                        .select()
                        .from(authUser)
                        .where(eq(authUser.email, identifier))
                        .limit(1);

                    if (!user.length || !user[0].password) {
                        return null;
                    }

                    // Compare hashed password
                    const isValid = await compare(password, user[0].password);
                    
                    if (!isValid) return null;

                    return {
                        id: user[0].id,
                        name: user[0].name,
                        email: user[0].email,
                        isAdmin: user[0].isAdmin,
                        hasSeenOnboarding: user[0].hasSeenOnboarding,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as any).isAdmin;
                token.hasSeenOnboarding = (user as any).hasSeenOnboarding;
                token.provider = account?.provider;
            }

            // Handle first-time OAuth signup: create user record if it doesn't exist
            if (account?.provider && user?.email && !token.id) {
                try {
                    // Check if user exists
                    const existingUser = await db
                        .select()
                        .from(authUser)
                        .where(eq(authUser.email, user.email))
                        .limit(1);

                    if (!existingUser.length) {
                        // Create new OAuth user (no password hash needed)
                        const newUser = await db.insert(authUser).values({
                            email: user.email,
                            name: user.name || user.email.split("@")[0],
                            password: null, // OAuth users have no password
                            isAdmin: false,
                            hasSeenOnboarding: false,
                        }).returning();

                        if (newUser.length > 0) {
                            token.id = newUser[0].id;

                            // Auto-create consent record for OAuth user
                            // OAuth users implicitly consent to privacy when signing up
                            await db.insert(privacyConsent).values({
                                userId: newUser[0].id,
                                dataCollection: true,
                                feedbackUsage: true,
                                emailNotifications: false,
                                consentVersion: "1.0-oauth",
                            }).catch(() => {
                                // Non-blocking if consent insert fails
                                console.error("Failed to create consent for OAuth user");
                            });
                        }
                    }
                } catch (error) {
                    console.error("OAuth user creation error:", error);
                }
            }

            // Allow dynamic session updates (e.g. after onboarding)
            if (trigger === "update" && session) {
                token.hasSeenOnboarding = session.hasSeenOnboarding;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).isAdmin = token.isAdmin || false;
                (session.user as any).hasSeenOnboarding = token.hasSeenOnboarding || false;
                (session.user as any).provider = token.provider;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
})
