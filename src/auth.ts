import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db"
import { CustomSession } from '@/lib/definitions'


export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile https://www.googleapis.com/auth/contacts",
          prompt: "select_account",
          access_type: "offline"
        }
      }
    }),
  ],
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {

      let feededSession = session as any;

      feededSession.user = token.user as any;
      feededSession.accessToken = token.accessToken
      feededSession.refreshToken = token.refreshToken
      feededSession.expiresAt = token.exp

      return feededSession;
    }
  }
});