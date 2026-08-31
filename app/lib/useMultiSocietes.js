import { useState, useEffect } from "react";

export function useMultiSocietes() {
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompanyState] = useState(null);
  const [vueGlobale, setVueGlobaleState] = useState(true);

  const setActiveCompany = (c) => {
    setActiveCompanyState(c);
    if (typeof window !== "undefined") {
      if (c?.id) window.localStorage.setItem("ty_active_company_id", c.id);
      else window.localStorage.removeItem("ty_active_company_id");
    }
  };

  const setVueGlobale = (v) => {
    setVueGlobaleState(v);
    if (typeof window !== "undefined") window.localStorage.setItem("ty_vue_globale", v ? "1" : "0");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedVue = window.localStorage.getItem("ty_vue_globale");
    if (savedVue !== null) setVueGlobaleState(savedVue === "1");
  }, []);

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
        if (companiesData?.length) {
          setCompanies(companiesData);
          const savedId = typeof window !== "undefined" ? window.localStorage.getItem("ty_active_company_id") : null;
          if (savedId) {
            const trouvee = companiesData.find(c => c.id === savedId);
            if (trouvee) setActiveCompanyState(trouvee);
          }
        }
      } catch (e) {
        console.error("useMultiSocietes:", e);
      }
    };
    loadCompanies();
  }, []);

  return { companies, setCompanies, activeCompany, setActiveCompany, vueGlobale, setVueGlobale };
}
