import { redirect } from "next/navigation";

// Fluxo removido — usuário redirecionado para o hub
export default function Page() {
  redirect("/hub");
}
