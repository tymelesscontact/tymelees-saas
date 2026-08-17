"use client";
import { useState, useEffect } from "react";
import { C, fmt, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp, Sel } from "../lib/ui";

const PageRevendeur = ({ plan, showToast, UpgradeWall }: any) => {
  const [donnees, setDonnees] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [onglet, setOnglet] = useState("clients");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ societe: "", email: "", pays: "", metier: "", plan: "starter" });
  const [marque, setMarque] = useState({ marque_nom: "", marque_logo_url: "", marque_couleur: "", domaine: "" });

  const charger = async () => {
    setChargement(true);
    try {
      const r = await fetch("/api/revendeur?action=dashboard");
      const d = await r.json();
      if (!r.ok) { setErreur(d.error || "acces_refuse"); setChargement(false); return; }
      setDonnees(d);
      setMarque({
        marque_nom: d.revendeur?.marque_nom || "",
        marque_logo_url: d.revendeur?.marque_logo_url || "",
        marque_couleur: d.revendeur?.marque_couleur || "",
        domaine: d.revendeur?.domaine || "",
      });
    } catch { setErreur("connexion"); }
    setChargement(false);
  };
  useEffect(() => { charger(); }, []);

  const creerClient = async () => {
    if (!form.societe.trim() || !form.email.trim()) return showToast("⚠️ Societe et email necessaires");
    try {
      const r = await fetch("/api/revendeur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creer_client", ...form }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("✅ Client cree — il recoit son invitation par email");
        setShowAdd(false);
        setForm({ societe: "", email: "", pays: "", metier: "", plan: "starter" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const enregistrerMarque = async () => {
    try {
      const r = await fetch("/api/revendeur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "maj_marque", ...marque }),
      });
      const d = await r.json();
      if (d.success) { showToast("✅ Marque enregistree"); charger(); }
      else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const changerStatut = async (client: any, statut: string) => {
    try {
      const r = await fetch("/api/revendeur", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "statut_client", client_id: client.id, statut }),
      });
      const d = await r.json();
      if (d.success) { showToast("Statut modifie"); charger(); }
      else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur"); }
  };

  if (chargement) return <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Chargement...</div>;

  if (erreur) return <div style={{ padding: 40, textAlign: "center" }}>
    <div style={{ fontSize: 15, color: C.text, marginBottom: 8 }}>Espace revendeur</div>
    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
      Cet espace est reserve aux partenaires revendeurs Xyra.<br />
      Contactez-nous pour devenir revendeur.
    </div>
  </div>;

  const ch = donnees?.chiffres || {};
  const rev = donnees?.revendeur || {};

  return <div style={{ padding: 20 }}>
    <div style={{ background: `linear-gradient(135deg,${C.card},#0A0A1A)`, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 4 }}>PARTENAIRE REVENDEUR</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif", marginBottom: 4 }}>
        {rev.marque_nom || rev.societe}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
        {rev.marque_nom ? `${rev.marque_nom} by Xyra` : "Revendez Xyra sous votre marque"} · {rev.pays || "—"}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 10 }}><div style={{ fontSize: 9, color: C.muted }}>Clients actifs</div><div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{ch.actifs || 0}</div></div>
        <div style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 10 }}><div style={{ fontSize: 9, color: C.muted }}>En essai</div><div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{ch.essais || 0}</div></div>
        <div style={{ borderLeft: `2px solid ${C.green}`, paddingLeft: 10 }}><div style={{ fontSize: 9, color: C.muted }}>Nouveaux ce mois</div><div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{ch.nouveaux_ce_mois || 0}</div></div>
        {ch.places_restantes !== null && ch.places_restantes !== undefined && (
          <div style={{ borderLeft: `2px solid ${C.orange}`, paddingLeft: 10 }}><div style={{ fontSize: 9, color: C.muted }}>Places restantes</div><div style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>{ch.places_restantes}</div></div>
        )}
      </div>
    </div>

    <div style={{ marginBottom: 14, display: "flex", gap: 4, background: C.card2, borderRadius: 8, padding: 4, flexWrap: "wrap" }}>
      {[["clients", "👥 Mes clients"], ["marque", "🎨 Ma marque"], ["facturation", "💳 Ma facturation"]].map(([id, label]) => (
        <button key={id} onClick={() => setOnglet(id)} style={{ background: onglet === id ? C.card : "transparent", color: onglet === id ? C.gold : C.muted, border: onglet === id ? `1px solid ${C.border}` : "1px solid transparent", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>{label}</button>
      ))}
    </div>

    {onglet === "clients" && <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{ch.total || 0} client{(ch.total || 0) > 1 ? "s" : ""}</div>
        <Btn onClick={() => setShowAdd(s => !s)}>+ Nouveau client</Btn>
      </div>

      {showAdd && <Card style={{ marginBottom: 14, borderColor: `${C.gold}44` }}>
        <STitle>Nouveau client</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Societe *</label><Inp value={form.societe} onChange={(e: any) => setForm(f => ({ ...f, societe: e.target.value }))} /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Email *</label><Inp type="email" value={form.email} onChange={(e: any) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Metier</label><Inp value={form.metier} onChange={(e: any) => setForm(f => ({ ...f, metier: e.target.value }))} /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Pays</label><Inp value={form.pays} onChange={(e: any) => setForm(f => ({ ...f, pays: e.target.value }))} placeholder={rev.pays || ""} /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Forfait</label>
            <Sel value={form.plan} onChange={(e: any) => setForm(f => ({ ...f, plan: e.target.value }))}>
              <option value="starter">Starter</option>
              <option value="business">Business Pro</option>
              <option value="enterprise">Enterprise</option>
            </Sel>
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Le client recevra une invitation par email pour choisir son mot de passe.</div>
        <div style={{ display: "flex", gap: 8 }}><Btn onClick={creerClient}>✅ Creer</Btn><BtnGhost onClick={() => setShowAdd(false)}>Annuler</BtnGhost></div>
      </Card>}

      {(donnees?.clients || []).length === 0 && <Card style={{ textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 12, color: C.muted }}>Aucun client pour le moment.</div>
      </Card>}

      {(donnees?.clients || []).length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Societe</TH><TH>Forfait</TH><TH>Statut</TH><TH>Cree le</TH><TH>Actions</TH></tr></thead>
          <tbody>{(donnees?.clients || []).map((c: any) => <tr key={c.id}>
            <Td style={{ fontWeight: 600 }}>{c.societe}<div style={{ fontSize: 10, color: C.muted }}>{c.email}</div></Td>
            <Td style={{ fontSize: 11 }}>{c.plan}</Td>
            <Td><Pill color={c.statut === "actif" ? C.green : c.statut === "essai" ? C.orange : C.red}>{c.statut}</Pill></Td>
            <Td style={{ fontSize: 11, color: C.muted }}>{c.created_at ? new Date(c.created_at).toLocaleDateString("fr") : "—"}</Td>
            <Td>
              <Sel value={c.statut} onChange={(e: any) => changerStatut(c, e.target.value)} style={{ fontSize: 10, padding: "4px 8px" }}>
                <option value="essai">Essai</option>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
              </Sel>
            </Td>
          </tr>)}
          </tbody>
        </table>
      </Card>}
    </div>}

    {onglet === "marque" && <div style={{ maxWidth: 520 }}>
      <Card>
        <STitle>🎨 Votre marque</STitle>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
          Vos clients verront votre marque. La mention « by Xyra » reste affichee.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Nom de votre marque</label><Inp value={marque.marque_nom} onChange={(e: any) => setMarque(m => ({ ...m, marque_nom: e.target.value }))} placeholder="Agence Dakar" /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Adresse de votre logo</label><Inp value={marque.marque_logo_url} onChange={(e: any) => setMarque(m => ({ ...m, marque_logo_url: e.target.value }))} placeholder="https://..." /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Couleur principale</label><Inp value={marque.marque_couleur} onChange={(e: any) => setMarque(m => ({ ...m, marque_couleur: e.target.value }))} placeholder="#C9A84C" /></div>
          <div><label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Votre domaine</label><Inp value={marque.domaine} onChange={(e: any) => setMarque(m => ({ ...m, domaine: e.target.value }))} placeholder="gestion.mon-agence.sn" /></div>
          {marque.marque_nom && <div style={{ background: C.card2, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: marque.marque_couleur || C.gold }}>{marque.marque_nom}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>by Xyra</div>
          </div>}
          <Btn onClick={enregistrerMarque}>✅ Enregistrer</Btn>
        </div>
      </Card>
    </div>}

    {onglet === "facturation" && <div style={{ maxWidth: 520 }}>
      <Card>
        <STitle>💳 Ce que vous payez a Xyra</STitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}33`, fontSize: 12 }}>
            <span style={{ color: C.muted }}>Forfait {rev.plan}</span>
            <span style={{ fontWeight: 700 }}>{fmt(ch.forfait || 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}33`, fontSize: 12 }}>
            <span style={{ color: C.muted }}>{ch.actifs || 0} client{(ch.actifs || 0) > 1 ? "s" : ""} actif{(ch.actifs || 0) > 1 ? "s" : ""} × {fmt(ch.par_client || 10)}</span>
            <span style={{ fontWeight: 700 }}>{fmt((ch.actifs || 0) * (ch.par_client || 10))}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 15 }}>
            <span style={{ fontWeight: 700 }}>Total mensuel</span>
            <span style={{ fontWeight: 700, color: C.gold }}>{fmt(ch.a_facturer || 0)}</span>
          </div>
        </div>
        {ch.plafond && <div style={{ background: `${C.blue}11`, border: `1px solid ${C.blue}33`, borderRadius: 8, padding: 12, fontSize: 11, color: C.text, lineHeight: 1.7, marginTop: 12 }}>
          Votre forfait couvre {ch.plafond} clients actifs. Au-dela, passez au forfait superieur.
        </div>}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 14, lineHeight: 1.7 }}>
          Vous fixez librement vos prix a vos clients. Ce que vous leur facturez ne regarde que vous.
        </div>
      </Card>
    </div>}
  </div>;
};

export default PageRevendeur;
