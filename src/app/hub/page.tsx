import { auth } from "@/lib/auth";
import { HubClient } from "./HubClient";

export const metadata = {
  title: "Começar — Dicto",
};

export default async function HubPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return <HubClient isLoggedIn={isLoggedIn} />;
}
