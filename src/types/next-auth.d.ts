import { Plan } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: Plan;
      trialEndsAt: Date | null;
    } & DefaultSession["user"];
  }
}
