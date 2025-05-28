import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Define admin emails - you can move this to environment variables
const ADMIN_EMAILS = [
  "r.tarunnayaka25042005@gmail.com", // Your email
  // Add other admin emails here
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Check if user is admin
        token.isAdmin = ADMIN_EMAILS.includes(user.email);
        token.role = ADMIN_EMAILS.includes(user.email) ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
