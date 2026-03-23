import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: "Dicto <no-reply@dicto.app>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.plan = (user as unknown as { plan: Plan }).plan;
      session.user.trialEndsAt = (user as unknown as { trialEndsAt: Date | null }).trialEndsAt;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Primeiro login → TRIAL de 14 dias
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.TRIAL,
          trialEndsAt,
        },
      });
    },
  },
});
