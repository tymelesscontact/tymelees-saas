"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, Btn, BtnGhost, TH, Td, KPI, STitle, Pill, Inp, Sel } from "../lib/ui";
import { ouvrirChat } from "../lib/ouvrirChat";

const PageFournisseurs = ({ plan, showToast, UpgradeWall, activeCompany, setPage }: any) => {
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [sel, setSel] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nom: "", categorie: "", contact: "", email: "", tel: "", iban: "", delai_livraison: "" });
  const [edition, setEdition] = useState(false);

  const charger = async () => {
    setChargement(true);
    try {
      const p = activeCompany?.id ? `?company_id=${activeCompany.id}` : "";
      const res = await fetch(`/api/fournisseurs${p}`);
      const d = await res.json();
      setFournisseurs(d.fournisseurs || []);
    } catch { showToast("❌ Erreur de chargement"); }
    setChargement(false);
  };
  useEffect(() => { charger(); }, [activeCompany?.id]);

  const enregistrer = async () => {
    if (!form.nom.trim()) return showToast("⚠️ Le nom est necessaire");
    try {
      const res = await fetch("/api/fournisseurs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: edition ? "modifier" : "creer",
          id: edition ? sel?.id : undefined,
          ...form,
          company_id: activeCompany?.id || null,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(edition ? "✅ Fournisseur modifie" : "✅ Fournisseur ajoute");
        setShowAdd(false); setEdition(false); setSel(null);
        setForm({ nom: "", categorie: "", contact: "", email: "", tel: "", iban: "", delai_livraison: "" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const supprimer = async (f: any) => {
    if (!window.confirm(`Supprimer ${f.nom} ?`)) return;
    try {
      const res = await fetch("/api/fournisseurs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "supprimer", id: f.id }),
      });
      const d = await res.json();
      if (d.success) { showToast("Fournisseur supprime"); setSel(null); charger(); }
      else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const modifier = (f: any) => {
    setForm({
      nom: f.nom || "", categorie: f.categorie || "", contact: f.contact || "",
      email: f.email || "", tel: f.tel || "", iban: f.iban || "",
      delai_livraison: f.delai_livraison || "",
    });
    setEdition(true); setSel(f); setShowAdd(true);
  };

  const champ = (cle: string, libelle: string) => (
    <div>
      <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{libelle}</label>
      <Inp value={(form as any)[cle]} onChange={(e: any) => setForm({ ...form, [cle]: e.target.value })} />
    </div>
  );

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif" }}>⊞ Fournisseurs</div>
        <div style={{ fontSize: 11, color: C.muted }}>{fournisseurs.length} fournisseur{fournisseurs.length > 1 ? "s" : ""}</div>
      </div>
      <Btn onClick={() => { setShowAdd(s => !s); setEdition(false); setSel(null); setForm({ nom: "", categorie: "", contact: "", email: "", tel: "", iban: "", delai_livraison: "" }); }}>
        + Nouveau fournisseur
      </Btn>
    </div>

    {showAdd && <Card style={{ marginBottom: 14, borderColor: `${C.gold}44` }}>
      <STitle>{edition ? "Modifier le fournisseur" : "Nouveau fournisseur"}</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {champ("nom", "Nom *")}
        {champ("categorie", "Categorie")}
        {champ("email", "Email")}
        {champ("tel", "Telephone")}
        {champ("contact", "Personne a contacter")}
        {champ("delai_livraison", "Delai de livraison")}
        {champ("iban", "IBAN")}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={enregistrer}>✅ {edition ? "Enregistrer" : "Ajouter"}</Btn>
        <BtnGhost onClick={() => { setShowAdd(false); setEdition(false); }}>Annuler</BtnGhost>
      </div>
    </Card>}

    {chargement && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Chargement...</div></Card>}

    {!chargement && fournisseurs.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}>
      <div style={{ fontSize: 12, color: C.muted }}>Aucun fournisseur enregistre.</div>
    </Card>}

    {!chargement && fournisseurs.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Fournisseur</TH><TH>Categorie</TH><TH>Contact</TH><TH>Delai</TH><TH>Actions</TH></tr></thead>
        <tbody>{fournisseurs.map((f) => <tr key={f.id}>
          <Td style={{ fontWeight: 600 }}>{f.nom}</Td>
          <Td style={{ color: C.muted, fontSize: 11 }}>{f.categorie || "—"}</Td>
          <Td style={{ fontSize: 11 }}>
            {f.email && <div style={{ color: C.text }}>{f.email}</div>}
            {f.tel && <div style={{ color: C.muted }}>{f.tel}</div>}
            {!f.email && !f.tel && <span style={{ color: C.muted }}>{f.contact || "—"}</span>}
          </Td>
          <Td style={{ color: C.muted, fontSize: 11 }}>{f.delai_livraison || "—"}</Td>
          <Td>
            <div style={{ display: "flex", gap: 6 }}>
              {(f.email || f.tel) && <Btn onClick={() => ouvrirChat({ nom: f.nom, email: f.email, tel: f.tel, type: "fournisseur" }, setPage, showToast)} style={{ fontSize: 10, padding: "4px 10px", background: C.green }}>💬 Discuter</Btn>}
              <BtnGhost onClick={() => modifier(f)} style={{ fontSize: 10, padding: "4px 10px" }}>Modifier</BtnGhost>
              <BtnGhost onClick={() => supprimer(f)} style={{ fontSize: 10, padding: "4px 10px", color: C.red, borderColor: `${C.red}44` }}>Supprimer</BtnGhost>
            </div>
          </Td>
        </tr>)}
        </tbody>
      </table>
    </Card>}
  </div>;
};

export default PageFournisseurs;
