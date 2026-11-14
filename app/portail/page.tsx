import { redirect } from "next/navigation";

// L'ancienne demo (comptes fictifs, donnees inventees) est conservee dans PortailDemo.tsx
// mais n'est plus accessible : /portail renvoie vers le vrai espace client.
export default function Portail() {
  redirect("/espace-client");
}
