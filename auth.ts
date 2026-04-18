import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as any).isAdmin;
                token.hasSeenOnboarding = (user as any).hasSeenOnboarding;
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
                (session.user as any).isAdmin = token.isAdmin;
                (session.user as any).hasSeenOnboarding = token.hasSeenOnboarding;
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
