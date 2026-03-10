
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Fortress Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const validUser = "admin";
                const validPassword = process.env.ADMIN_SECRET;

                if (!validPassword) {
                    console.error("CRITICAL: ADMIN_SECRET environment variable is not set. Login is disabled.");
                    return null;
                }

                if (
                    credentials.username === validUser &&
                    credentials.password === validPassword
                ) {
                    return { id: "1", name: "Admin User", email: "admin@fortress.ai" };
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
})
