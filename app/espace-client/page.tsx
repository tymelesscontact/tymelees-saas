"use client";
import { useState, useEffect, useCallback } from "react";

// Espace client : toutes les donnees viennent de /api/espace-client (lues cote serveur et
// filtrees sur l'email verifie du compte connecte). Les signatures passent par les vraies
// pages publiques de signature (/devis/[reference], /signature/[token]).

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
);
const Pill = ({ children, color = C.gold }: any) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
);
const Btn = ({ children, onClick, color = C.gold, style = {}, disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled} style={{ background: color, color: color === C.gold || color === C.green ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: disabled ? "default" : "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>
);
const BtnGhost = ({ children, onClick, style = {}, disabled = false, title }: any) => (
  <button onClick={onClick} disabled={disabled} title={title} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", cursor: disabled ? "default" : "pointer", fontSize: 12, fontFamily: "inherit", opacity: disabled ? 0.55 : 1, ...style }}>{children}</button>
);
const Bientot = () => <span style={{ fontSize: 9, fontWeight: 700, color: C.purple, border: `1px solid ${C.purple}55`, borderRadius: 10, padding: "1px 6px", marginLeft: 6 }}>BIENTÔT</span>;
const champ: any = { background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

const STATUT_LIBELLE: Record<string, string> = {
  envoyé: "À signer", vu: "À signer", en_attente: "À signer", signé: "Signé", payé: "Payé", refusé: "Refusé",
  émise: "À régler", payée: "Payée", en_retard: "En retard", annulée: "Annulée",
  envoye: "À signer", signe: "Signé", annule: "Annulé",
  propose: "Proposée", confirme: "Confirmée", confirmé: "Confirmée", en_cours: "En cours", terminé: "Terminée", termine: "Terminée", annulé: "Annulée",
};
const statutColor: Record<string, string> = {
  envoyé: C.orange, vu: C.orange, en_attente: C.orange, signé: C.green, payé: C.green, refusé: C.red,
  émise: C.orange, payée: C.green, en_retard: C.red, annulée: C.muted,
  envoye: C.orange, signe: C.green, annule: C.muted,
  propose: C.blue, confirme: C.green, confirmé: C.green, en_cours: C.gold, terminé: C.green, termine: C.green, annulé: C.muted,
};
const dateFr = (d: any) => { if (!d) return "—"; const x = new Date(d); return isNaN(x.getTime()) ? String(d) : x.toLocaleDateString("fr-FR"); };
const euros = (n: any) => (Number(n) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
const chiffresTel = (t: string | null | undefined) => (t || "").replace(/[^0-9]/g, "").replace(/^00/, "");

export default function EspaceClient() {
  const [page, setPage] = useState("dashboard");
  const [donnees, setDonnees] = useState<any>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devisForm, setDevisForm] = useState({ tenant_id: "", service: "", description: "", budget: "", date: "" });
  const [envoiDemande, setEnvoiDemande] = useState(false);
  const [contactTenant, setContactTenant] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [mdp, setMdp] = useState({ actuel: "", nouveau: "", confirmation: "" });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/espace-client?action=donnees");
      if (res.status === 401) { window.location.assign("/login"); return; }
      const d = await res.json();
      if (!res.ok) { setErreur(d.error || "Erreur de chargement"); setLoading(false); return; }
      setDonnees(d);
      const demandables = (d.entreprises || []).filter((e: any) => e.peut_demander);
      if (demandables.length === 1) setDevisForm(f => ({ ...f, tenant_id: demandables[0].id }));
      if ((d.entreprises || []).length >= 1) setContactTenant(d.entreprises[0].id);
    } catch {
      setErreur("Connexion impossible");
    }
    setLoading(false);
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const entreprises: any[] = donnees?.entreprises || [];
  const devis: any[] = donnees?.devis || [];
  const factures: any[] = donnees?.factures || [];
  const missions: any[] = donnees?.missions || [];
  const contrats: any[] = donnees?.contrats || [];
  const nomEntreprise = (id: string) => entreprises.find(e => e.id === id)?.societe || "";
  const plusieurs = entreprises.length > 1;
  const demandables = entreprises.filter(e => e.peut_demander);

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Mon espace" },
    { id: "devis", icon: "◧", label: "Devis" },
    { id: "factures", icon: "🧾", label: "Factures" },
    { id: "missions", icon: "✅", label: "Mes missions" },
    { id: "contrats", icon: "✦", label: "Contrats" },
    { id: "chat", icon: "💬", label: "Contact" },
    { id: "fidelite", icon: "⭐", label: "Fidélité" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  const totalCA = factures.filter(f => f.statut === "payée" && f.type_document !== "avoir").reduce((a, f) => a + (Number(f.montant_ttc) || 0), 0);
  const devisEnAttente = devis.filter(d => d.signable);
  const contratsASigner = contrats.filter(c => c.lien_signature);

  const ouvrir = (url: string) => window.open(url, "_blank", "noopener");
  const mailEntreprise = (tenantId: string, sujet: string, corps = "") => {
    const e = entreprises.find(x => x.id === tenantId);
    if (!e?.email) return showToast("⚠️ Cette entreprise n'a pas renseigné d'email");
    window.location.assign(`mailto:${e.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`);
  };

  const envoyerDemande = async () => {
    if (!devisForm.tenant_id) return showToast("⚠️ Choisissez l'entreprise");
    if (!devisForm.service.trim()) return showToast("⚠️ Remplissez le service");
    setEnvoiDemande(true);
    try {
      const res = await fetch("/api/espace-client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "demande_devis", ...devisForm }) });
      const d = await res.json();
      if (!res.ok || !d.success) { showToast("❌ " + (d.error || "Envoi impossible")); setEnvoiDemande(false); return; }
      setShowDevisForm(false);
      setDevisForm(f => ({ ...f, service: "", description: "", budget: "", date: "" }));
      showToast(`✅ Demande transmise à ${nomEntreprise(devisForm.tenant_id)}`);
    } catch { showToast("❌ Connexion impossible"); }
    setEnvoiDemande(false);
  };

  const changerMotDePasse = async () => {
    if (!mdp.actuel || !mdp.nouveau) return showToast("⚠️ Remplissez les champs");
    if (mdp.nouveau !== mdp.confirmation) return showToast("⚠️ Les deux mots de passe ne correspondent pas");
    try {
      const res = await fetch("/api/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: mdp.actuel, newPassword: mdp.nouveau }) });
      const d = await res.json();
      if (!res.ok || !d.success) return showToast("❌ " + (d.error || "Modification impossible"));
      setMdp({ actuel: "", nouveau: "", confirmation: "" });
      showToast("✅ Mot de passe modifié");
    } catch { showToast("❌ Connexion impossible"); }
  };

  const deconnexion = async () => {
    try { await fetch("/api/session", { method: "DELETE" }); } catch { /* on redirige quand meme */ }
    window.location.assign("/login");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 12, color: C.muted }}>Chargement de votre espace...</div>
    </div>
  );

  if (erreur) return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 13, color: C.muted }}>{erreur}</div>
      <Btn onClick={() => { setErreur(null); setLoading(true); charger(); }}>Réessayer</Btn>
    </div>
  );

  const ligneEntreprise = (tenantId: string) => plusieurs ? <span style={{ color: C.gold }}>{nomEntreprise(tenantId)} · </span> : null;
  const choixEntreprise = (valeur: string, onChange: (v: string) => void, liste: any[]) => (
    <select value={valeur} onChange={e => onChange(e.target.value)} style={champ}>
      <option value="">— Choisir —</option>
      {liste.map(e => <option key={e.id} value={e.id}>{e.societe}</option>)}
    </select>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif" }}>XYRA</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginTop: 2 }}>ESPACE CLIENT</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer", color: page === item.id ? C.gold : C.muted, background: page === item.id ? `${C.gold}0E` : "transparent", border: "none", borderLeft: `2px solid ${page === item.id ? C.gold : "transparent"}`, width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: 12, fontWeight: page === item.id ? 600 : 400 }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>{donnees?.nom || donnees?.email}</div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>{entreprises.map(e => e.societe).join(" · ") || "Client"}</div>
          <BtnGhost onClick={deconnexion} style={{ fontSize: 10, padding: "4px 10px", width: "100%" }}>Se déconnecter</BtnGhost>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {/* DASHBOARD */}
        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE CLIENT</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>
              Bonjour {donnees?.nom || "👋"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                ["Devis à signer", devisEnAttente.length, C.orange],
                ["Missions", missions.length, C.blue],
                ["Total réglé", euros(totalCA), C.gold],
                ["Contrats", contrats.length, C.green],
              ].map(([l, v, c]: any, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {(devisEnAttente.length > 0 || contratsASigner.length > 0) && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 10 }}>
                ⏳ {devisEnAttente.length + contratsASigner.length} document(s) en attente de votre signature
              </div>
              {devisEnAttente.map((d: any) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.orange}22` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{d.service || "Devis"}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{ligneEntreprise(d.tenant_id)}{d.reference} · {euros(d.montant)}</div>
                  </div>
                  <Btn onClick={() => d.lien && ouvrir(d.lien)} style={{ fontSize: 11 }}>✒ Consulter et signer</Btn>
                </div>
              ))}
              {contratsASigner.map((c: any) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.orange}22` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.titre || "Contrat"}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{ligneEntreprise(c.tenant_id)}{c.reference}</div>
                  </div>
                  <Btn onClick={() => ouvrir(c.lien_signature)} style={{ fontSize: 11 }}>✒ Signer</Btn>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { icon: "◧", label: "Demander un devis", action: () => { setPage("devis"); setShowDevisForm(true); }, color: C.gold },
              { icon: "💬", label: "Contacter l'entreprise", action: () => setPage("chat"), color: C.green },
              { icon: "🧾", label: "Mes factures", action: () => setPage("factures"), color: C.blue },
              { icon: "✅", label: "Mes missions", action: () => setPage("missions"), color: C.purple },
            ].map((a, i) => (
              <Card key={i} style={{ cursor: "pointer", textAlign: "center", borderColor: `${a.color}33` }} onClick={a.action}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</div>
              </Card>
            ))}
          </div>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✅ Dernières missions</div>
            {missions.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: C.muted }}>Aucune mission pour le moment</div>
            ) : missions.slice(0, 3).map((m: any) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.service}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{ligneEntreprise(m.tenant_id)}{dateFr(m.date_mission)}{m.adresse ? " · " + m.adresse : ""}</div>
                </div>
                <Pill color={statutColor[m.statut] || C.muted}>{STATUT_LIBELLE[m.statut] || m.statut}</Pill>
              </div>
            ))}
          </Card>
        </div>}

        {/* DEVIS */}
        {page === "devis" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>◧ Mes devis</div>
            {demandables.length > 0 && <Btn onClick={() => setShowDevisForm(s => !s)}>+ Demander un devis</Btn>}
          </div>

          {showDevisForm && demandables.length > 0 && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouvelle demande de devis</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {demandables.length > 1 && <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Entreprise *</label>
                  {choixEntreprise(devisForm.tenant_id, v => setDevisForm(f => ({ ...f, tenant_id: v })), demandables)}
                </div>}
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Service souhaité *</label>
                  <input value={devisForm.service} onChange={e => setDevisForm(f => ({ ...f, service: e.target.value }))} placeholder="Ex : ménage, entretien..." style={champ} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Budget estimé (€)</label>
                  <input value={devisForm.budget} onChange={e => setDevisForm(f => ({ ...f, budget: e.target.value }))} placeholder="Ex : 500" style={champ} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date souhaitée</label>
                  <input type="date" value={devisForm.date} onChange={e => setDevisForm(f => ({ ...f, date: e.target.value }))} style={champ} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Description</label>
                  <input value={devisForm.description} onChange={e => setDevisForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails supplémentaires..." style={champ} />
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Votre demande est transmise à l’entreprise, qui vous enverra son devis.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={envoyerDemande} disabled={envoiDemande}>{envoiDemande ? "Envoi..." : "✅ Envoyer la demande"}</Btn>
                <BtnGhost onClick={() => setShowDevisForm(false)}>Annuler</BtnGhost>
              </div>
            </Card>
          )}

          <Card>
            {devis.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>◧</div>
                <div>Aucun devis pour le moment</div>
                {demandables.length > 0 && <Btn onClick={() => setShowDevisForm(true)} style={{ marginTop: 12, fontSize: 11 }}>+ Demander un devis</Btn>}
              </div>
            ) : devis.map((d: any) => (
              <div key={d.id} style={{ background: C.card2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${d.signable ? C.gold + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.service || "Devis"}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{ligneEntreprise(d.tenant_id)}{d.reference} · {dateFr(d.created_at)}{d.expire ? " · expiré" : ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{euros(d.montant)}</div>
                    <Pill color={d.expire && d.statut !== "signé" && d.statut !== "payé" ? C.muted : (statutColor[d.statut] || C.muted)}>{d.expire && d.statut !== "signé" && d.statut !== "payé" ? "Expiré" : (STATUT_LIBELLE[d.statut] || d.statut)}</Pill>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {d.lien && <BtnGhost onClick={() => ouvrir(d.lien)} style={{ fontSize: 11 }}>📄 Voir le devis</BtnGhost>}
                  {d.signable && d.lien && (
                    <Btn onClick={() => ouvrir(d.lien)} style={{ fontSize: 11, background: C.green }}>✒ Consulter et signer</Btn>
                  )}
                  <BtnGhost onClick={() => mailEntreprise(d.tenant_id, `Question sur le devis ${d.reference}`)} style={{ fontSize: 11 }}>💬 Question</BtnGhost>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {/* FACTURES */}
        {page === "factures" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>🧾 Mes factures</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              ["Total réglé", euros(totalCA), C.gold],
              ["Factures", factures.length, C.blue],
              ["Dernière", factures[0] ? dateFr(factures[0].date_emission || factures[0].created_at) : "—", C.green],
            ].map(([l, v, c]: any, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <Card>
            {factures.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune facture pour le moment</div>
            ) : factures.map((f: any) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}22`, gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{f.type_document === "avoir" ? "Avoir" : "Facture"} {f.numero}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{ligneEntreprise(f.tenant_id)}{dateFr(f.date_emission || f.created_at)}{f.description ? " · " + f.description : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{euros(f.montant_ttc)}</div>
                  <Pill color={statutColor[f.statut] || C.muted}>{STATUT_LIBELLE[f.statut] || f.statut}</Pill>
                  <BtnGhost onClick={() => ouvrir(`/api/espace-client?action=facture_pdf&id=${f.id}`)} style={{ fontSize: 11 }}>📥 PDF</BtnGhost>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {/* MISSIONS */}
        {page === "missions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✅ Mes missions</div>
          {missions.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune mission pour le moment</div></Card>
          ) : missions.map((m: any) => (
            <Card key={m.id} style={{ marginBottom: 12, borderColor: m.statut === "en_cours" ? `${C.gold}44` : C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{m.service}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{ligneEntreprise(m.tenant_id)}📅 {dateFr(m.date_mission)}{m.heure ? " · ⏱ " + String(m.heure).slice(0, 5) : ""}</div>
                  {m.adresse && <div style={{ fontSize: 11, color: C.muted }}>📍 {m.adresse}</div>}
                </div>
                <Pill color={statutColor[m.statut] || C.muted}>{STATUT_LIBELLE[m.statut] || m.statut}</Pill>
              </div>
              {(m.statut === "terminé" || m.statut === "termine") && (
                <div style={{ display: "flex", gap: 6 }}>
                  <BtnGhost disabled title="Bientôt disponible" style={{ fontSize: 11 }}>⭐ Laisser un avis<Bientot /></BtnGhost>
                  <BtnGhost disabled title="Bientôt disponible" style={{ fontSize: 11 }}>🔄 Réserver à nouveau<Bientot /></BtnGhost>
                </div>
              )}
            </Card>
          ))}
        </div>}

        {/* CONTRATS */}
        {page === "contrats" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✦ Mes contrats</div>
          {contrats.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucun contrat pour le moment</div></Card>
          ) : contrats.map((c: any) => (
            <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.titre || "Contrat"}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{ligneEntreprise(c.tenant_id)}{c.reference} · {dateFr(c.created_at)}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill color={statutColor[c.statut] || C.muted}>{STATUT_LIBELLE[c.statut] || c.statut}</Pill>
                {c.lien_signature && <Btn onClick={() => ouvrir(c.lien_signature)} style={{ fontSize: 11 }}>✒ Signer</Btn>}
                {c.pdf_disponible && <BtnGhost onClick={() => ouvrir(`/api/espace-client?action=contrat_pdf&id=${c.id}`)} style={{ fontSize: 11 }}>📥 PDF</BtnGhost>}
              </div>
            </div>
          ))}
        </div>}

        {/* CONTACT */}
        {page === "chat" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💬 Contacter l’entreprise</div>
          {entreprises.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune entreprise liée à votre compte</div></Card>
          ) : <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginBottom: 16 }}>
              {entreprises.map(e => (
                <Card key={e.id}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{e.societe}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{e.email || "Email non renseigné"}{e.telephone ? " · " + e.telephone : ""}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {e.email && <BtnGhost onClick={() => mailEntreprise(e.id, "Message depuis mon espace client")} style={{ fontSize: 12 }}>📧 Email</BtnGhost>}
                    {chiffresTel(e.telephone) && <Btn onClick={() => ouvrir(`https://wa.me/${chiffresTel(e.telephone)}`)} style={{ background: C.green, fontSize: 12 }}>💬 WhatsApp</Btn>}
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Écrire un message</div>
              {plusieurs && <div style={{ marginBottom: 8 }}>{choixEntreprise(contactTenant, setContactTenant, entreprises)}</div>}
              <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} rows={4} placeholder="Votre message..." style={{ ...champ, resize: "vertical", marginBottom: 8 }} />
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>Le message s’ouvre dans votre messagerie email, adressé à l’entreprise.</div>
              <Btn onClick={() => { if (!contactTenant) return showToast("⚠️ Choisissez l'entreprise"); if (!newMsg.trim()) return showToast("⚠️ Écrivez votre message"); mailEntreprise(contactTenant, "Message depuis mon espace client", newMsg); }}>↗ Envoyer</Btn>
            </Card>
          </>}
        </div>}

        {/* FIDÉLITÉ */}
        {page === "fidelite" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>⭐ Fidélité & Avantages <Bientot /></div>
          <div style={{ background: `${C.purple}11`, border: `1px solid ${C.purple}33`, borderRadius: 10, padding: "10px 14px", fontSize: 11, color: C.text, marginBottom: 16 }}>
            Programme de fidélité en préparation : les niveaux et avantages ci-dessous sont un aperçu et ne s’appliquent pas encore à vos commandes.
          </div>
          <Card style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, borderColor: `${C.gold}44`, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 8 }}>VOTRE STATUT (APERÇU)</div>
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {totalCA >= 10000 ? "💎 VIP" : totalCA >= 5000 ? "🥇 Gold" : totalCA >= 1000 ? "🥈 Silver" : "🥉 Bronze"}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{euros(totalCA)} de factures réglées</div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎁 Avantages prévus</div>
              {["-5% dès 1 000 € réglés", "Accès prioritaire dès 5 000 € réglés", "Tarif personnalisé dès 10 000 € réglés"].map((a, i) => (
                <div key={i} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}22`, color: C.muted }}>🔒 {a}</div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🤝 Parrainage <Bientot /></div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7 }}>Le parrainage sera proposé ici dès qu’il sera mis en place par votre prestataire.</div>
            </Card>
          </div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 Mon historique</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                ["Total réglé", euros(totalCA), C.gold],
                ["Missions", missions.length, C.blue],
                ["Devis signés", devis.filter((d: any) => d.statut === "signé" || d.statut === "payé").length, C.green],
              ].map(([l, v, c]: any, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>}

        {/* PROFIL */}
        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.gold}22`, border: `3px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.gold, margin: "0 auto 12px" }}>
                  {(donnees?.nom || donnees?.email || "?")[0]?.toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{donnees?.nom || "—"}</div>
              </div>
              {[
                ["📧", donnees?.email],
                ["🏢", entreprises.length ? "Client de " + entreprises.map(e => e.societe).join(", ") : "—"],
              ].map(([k, v]: any, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                  <span>{k}</span><span style={{ color: C.muted }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🔑 Sécurité</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Mot de passe actuel</label>
                  <input type="password" value={mdp.actuel} onChange={e => setMdp(m => ({ ...m, actuel: e.target.value }))} placeholder="••••••••" style={champ} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Nouveau mot de passe (8 caractères minimum)</label>
                  <input type="password" value={mdp.nouveau} onChange={e => setMdp(m => ({ ...m, nouveau: e.target.value }))} placeholder="••••••••" style={champ} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Confirmer le mot de passe</label>
                  <input type="password" value={mdp.confirmation} onChange={e => setMdp(m => ({ ...m, confirmation: e.target.value }))} placeholder="••••••••" style={champ} />
                </div>
                <Btn onClick={changerMotDePasse}>Modifier le mot de passe</Btn>
              </div>
            </Card>
          </div>
        </div>}

      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, zIndex: 9999 }}>
          🔔 {toast}
        </div>
      )}
    </div>
  );
}
