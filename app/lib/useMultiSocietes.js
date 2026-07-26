import { useState, useEffect } from "react";

export function useMultiSocietes() {
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [vueGlobale, setVueGlobale] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sbc = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        // Securite: on ne fait JAMAIS confiance a un identifiant transmis de l'exterieur.
        // On verifie ici la vraie session directement aupres de Supabase.
        const { data: { user } } = await sbc.auth.getUser();
        if (!user?.id) return;
        const { data: companiesData } = await sbc
          .from("companies")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at");
        if (companiesData?.length) setCompanies(companiesData);
      } catch (e) {
        console.error("useMultiSocietes:", e);
      }
    };
    loadCompanies();
  }, []);

  return { companies, setCompanies, activeCompany, setActiveCompany, vueGlobale, setVueGlobale };
}
