import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Allow account linking
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user role and id to session
      session.user.role = user.role || "user";
      session.user.id = user.id;
      return session;
    },
    async signIn({ user, account, profile, email }) {
      try {
        if (account?.provider === "google") {
          // Check if user already exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (existingUser) {
            // Check if this Google account is already linked
            const existingAccount = existingUser.accounts.find(
              (acc) =>
                acc.provider === "google" &&
                acc.providerAccountId === account.providerAccountId
            );

            if (!existingAccount) {
              // Link the Google account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });

              console.log(
                `✅ Linked Google account to existing user: ${user.email}`
              );
            }
          }
        }

        return true;
      } catch (error) {
        console.error("❌ Error during sign in:", error);
        return false;
      }
    },
  },
  events: {
    async createUser({ user }) {
      // This runs when a new user is created
      console.log("New user created:", user.email);

      // The role field will be automatically set to "user" via Prisma default
      // You can add additional logic here if needed
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        console.log(
          `🎉 New user registered: ${user.email} with role: ${user.role}`
        );
      }

      // Update last sign in time if you want to track it
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { GET, POST } = handlers;
