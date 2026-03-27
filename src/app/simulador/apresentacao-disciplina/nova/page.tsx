import { redirect } from "next/navigation";

// Este fluxo foi unificado no wizard de apresentação de trabalhos
export default function Page() {
  redirect("/hub/apresentacao");
}
