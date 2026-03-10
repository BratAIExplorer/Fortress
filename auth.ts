
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
                // For MVP, we use the ADMIN_SECRET as the password for account 'admin'
                const validUser = "admin";
                const validPassword = process.env.ADMIN_SECRET || "fortress2024";

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
