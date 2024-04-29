

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/index"


export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        token.user = user;        
      }
      return token;
    },
    async session({ session, token }) {

      let feededSession = session as any;

      feededSession.user = token.user as any;
      feededSession.accessToken = token.accessToken
      
      return feededSession;
    }
  }
});

import {
  signIn as nextSignIn,
  signOut as nextSignOut
} from 'next-auth/react'

export const signIn = nextSignIn
export const signOut = nextSignOut