import { HubClient } from "./HubClient";

export const metadata = {
  title: "O que vai fazer no Dicto? — Dicto",
};

export default function HubPage() {
  // Redirect de usuários logados é feito pelo middleware
  return <HubClient />;
}
