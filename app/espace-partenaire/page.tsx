"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

export default function EspacePartenaire() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [partenaire, setPartenaire] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ nom: "", contact: "", email: "", tel: "", ca_estime: "", notes: "" });
  const [inviteForm, setInviteForm] = useState({ nom: "", email: "", type: "client", message: "" });
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      const [p, l, inv] = await Promise.all([
        sb.from("partenaires").select("*").eq("user_id", user.id).single(),
        sb.from("leads_partenaires").select("*").eq("partenaire_id", user.id).order("created_at", { ascending: false }),
        sb.from("invitations").select("*").eq("partenaire_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (p.data) setPartenaire(p.data);
      if (l.data) setLeads(l.data);
      if (inv.data) setInvitations(inv.data);
      setLoading(false);
    };
    init();
  }, []);

  const submitLead = async () => {
    if (!leadForm.nom) return showToast("⚠️ Remplissez le nom");
    const ca = Number(leadForm.ca_estime) || 0;
    const commission = Math.round(ca * (partenaire?.commission || 20) / 100);
    const { data, error } = await sb.from("leads_partenaires").insert({
      partenaire_id: user.id,
      nom_partenaire: partenaire?.nom || user.email,
      nom: leadForm.nom,
      contact: leadForm.contact,
      email: leadForm.email,
      tel: leadForm.tel,
      ca_estime: ca,
      commission,
      notes: leadForm.notes,
      statut: "nouveau",
    }).select().single();
    if (!error && data) {
      setLeads(ls => [data, ...ls]);
      setShowLeadForm(false);
      setLeadForm({ nom: "", contact: "", email: "", tel: "", ca_estime: "", notes: "" });
      showToast("✅ Lead soumis ! Curtiss va le traiter rapidement.");
    }
  };

  const sendInvitation = async () => {
    if (!inviteForm.nom || !inviteForm.email) return showToast("⚠️ Remplissez nom et email");
    const { data, error } = await sb.from("invitations").insert({
      partenaire_id: user.id,
      nom_partenaire: partenaire?.nom || user.email,
      nom: inviteForm.nom,
      email: inviteForm.email,
      type: inviteForm.type,
      message: inviteForm.message,
      statut: "en_attente",
    }).select().single();
    if (!error && data) {
      setInvitations(inv => [data, ...inv]);
      setShowInviteForm(false);
      setInviteForm({ nom: "", email: "", type: "client", message: "" });
      showToast(`✅ Invitation envoyée à ${inviteForm.nom} !`);
    }
  };

  const copyLink = (type: string) => {
    const base = `${window.location.origin}/inscription`;
    const ref = partenaire?.code_parrainage || user?.id?.slice(0, 8).toUpperCase();
    const link = type === "client" ? `${base}?ref=${ref}` : type === "club" ? `${base}?ref=${ref}&type=club` : `${base}?ref=${ref}&type=partenaire`;
    navigator.clipboard?.writeText(link);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    showToast("🔗 Lien copié !");
  };

  const Card = ({ children, style = {} }: any) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
  );

  const Pill = ({ children, color = C.gold }: any) => (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
  );

  const Btn = ({ children, onClick, color = C.gold, style = {} }: any) => (
    <button onClick={onClick} style={{ background: color, color: color === C.gold ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", ...style }}>{children}</button>
  );

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Tableau de bord" },
    { id: "leads", icon: "🎯", label: "Mes leads" },
    { id: "commissions", icon: "💰", label: "Mes commissions" },
    { id: "invitations", icon: "✉️", label: "Invitations" },
    { id: "documents", icon: "📋", label: "Documents" },
    { id: "outils", icon: "🛠", label: "Outils de vente" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  const statutColor: Record<string, string> = { gagné: C.green, en_cours: C.gold, perdu: C.muted, nouveau: C.blue, inscrit: C.green, en_attente: C.orange };

  const totalCA = leads.reduce((a, l) => a + (l.ca_estime || 0), 0);
  const totalCommission = leads.reduce((a, l) => a + (l.commission || 0), 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 12, color: C.muted }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif" }}>XYRA</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginTop: 2 }}>ESPACE PARTENAIRE</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer", color: page === item.id ? C.gold : C.muted, background: page === item.id ? `${C.gold}0E` : "transparent", border: "none", borderLeft: `2px solid ${page === item.id ? C.gold : "transparent"}`, width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: 12, fontWeight: page === item.id ? 600 : 400 }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>{partenaire?.nom || user?.email}</div>
          <div style={{ fontSize: 9, color: C.muted }}>{partenaire?.commission || 20}% commission</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A0A1A)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE PARTENAIRE</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>Bonjour {partenaire?.prenom || partenaire?.nom || "👋"}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{partenaire?.commission || 20}% de commission sur chaque deal</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["CA total apporté", totalCA.toLocaleString("fr") + " €", C.green], ["Commissions", totalCommission.toLocaleString("fr") + " €", C.orange], ["Leads actifs", leads.filter(l => l.statut !== "perdu").length, C.blue], ["Invitations", invitations.length, C.purple]].map(([l, v, c]: any, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎯 Derniers leads</div>
            {leads.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: C.muted }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                <div>Aucun lead soumis — commencez à prospecter !</div>
                <Btn onClick={() => setPage("leads")} style={{ marginTop: 12, fontSize: 11 }}>+ Soumettre un lead</Btn>
              </div>
            ) : leads.slice(0, 4).map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l.nom}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{l.contact} · {new Date(l.created_at).toLocaleDateString("fr")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Pill color={statutColor[l.statut] || C.muted}>{l.statut}</Pill>
                  {l.commission > 0 && <div style={{ fontSize: 11, color: C.gold, marginTop: 2 }}>{l.commission.toLocaleString("fr")} €</div>}
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {page === "leads" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>🎯 Mes leads</div>
            <Btn onClick={() => setShowLeadForm(s => !s)}>+ Soumettre un lead</Btn>
          </div>

          {showLeadForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouveau lead</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[["Nom de l'entreprise *", "nom"], ["Contact principal", "contact"], ["Email", "email"], ["Téléphone", "tel"], ["CA estimé (€)", "ca_estime"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                    <input value={(leadForm as any)[key]} onChange={e => setLeadForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder={label as string} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                  </div>
                ))}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Notes</label>
                  <input value={leadForm.notes} onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contexte, besoins..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              {leadForm.ca_estime && <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}33`, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11 }}>
                Votre commission estimée : <strong style={{ color: C.gold }}>{Math.round(Number(leadForm.ca_estime) * (partenaire?.commission || 20) / 100).toLocaleString("fr")} €</strong>
              </div>}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={submitLead}>✅ Soumettre</Btn>
                <button onClick={() => setShowLeadForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </Card>
          )}

          {leads.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucun lead soumis</div></Card>
          ) : <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Entreprise", "Contact", "CA estimé", "Commission", "Statut"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
              <tbody>{leads.map((l, i) => (
                <tr key={i}>
                  <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, fontWeight: 700 }}>{l.nom}</td>
                  <td style={{ padding: "9px 10px", fontSize: 11, borderBottom: `1px solid ${C.border}22`, color: C.muted }}>{l.contact || "—"}</td>
                  <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, color: C.green, fontWeight: 600 }}>{l.ca_estime > 0 ? l.ca_estime.toLocaleString("fr") + " €" : "—"}</td>
                  <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, color: C.gold, fontWeight: 700 }}>{l.commission > 0 ? l.commission.toLocaleString("fr") + " €" : "—"}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}22` }}><Pill color={statutColor[l.statut] || C.muted}>{l.statut}</Pill></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>}
        </div>}

        {page === "commissions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💰 Mes commissions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[["Total estimé", totalCommission.toLocaleString("fr") + " €", C.gold], ["Leads gagnés", leads.filter(l => l.statut === "gagné").length, C.green], ["Taux commission", (partenaire?.commission || 20) + "%", C.blue]].map(([l, v, c]: any, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Détail par lead</div>
            {leads.filter(l => l.commission > 0).length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: C.muted }}>Aucune commission générée pour l'instant</div>
            ) : leads.filter(l => l.commission > 0).map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>{l.nom}</div><div style={{ fontSize: 10, color: C.muted }}>{l.statut}</div></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{l.commission.toLocaleString("fr")} €</div>
              </div>
            ))}
          </Card>
        </div>}

        {page === "invitations" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>✉️ Mes invitations</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>Invitez des personnes à rejoindre Xyra ou le Club d'affaires</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { type: "client", titre: "🏢 Client Xyra", desc: "14 jours gratuits", couleur: C.blue },
              { type: "club", titre: "⬡ Club d'affaires", desc: "Réseau privé Xyra", couleur: C.gold },
              { type: "partenaire", titre: "🤝 Partenaire AA", desc: "Devenir apporteur", couleur: C.green },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `2px solid ${item.couleur}33`, borderRadius: 14, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.couleur, marginBottom: 6 }}>{item.titre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{item.desc}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copyLink(item.type)} style={{ flex: 1, background: item.couleur, color: "#000", border: "none", borderRadius: 6, padding: "8px 0", cursor: "pointer", fontWeight: 700, fontSize: 11, fontFamily: "inherit" }}>
                    {copied === item.type ? "✓ Copié !" : "📋 Copier lien"}
                  </button>
                  <button onClick={() => { const ref = partenaire?.code_parrainage || user?.id?.slice(0, 8).toUpperCase(); window.open(`https://wa.me/?text=${encodeURIComponent("Rejoins Xyra avec mon lien : " + window.location.origin + "/inscription?ref=" + ref)}`); }} style={{ background: `${C.green}22`, color: C.green, border: `1px solid ${C.green}44`, borderRadius: 6, padding: "8px 8px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>💬</button>
                </div>
              </div>
            ))}
          </div>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>📧 Invitation directe</div>
              <Btn onClick={() => setShowInviteForm(s => !s)} style={{ fontSize: 11, padding: "6px 12px" }}>+ Inviter</Btn>
            </div>
            {showInviteForm && <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[["Nom *", "nom"], ["Email *", "email"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                    <input value={(inviteForm as any)[key]} onChange={e => setInviteForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder={label as string} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Type</label>
                  <select value={inviteForm.type} onChange={e => setInviteForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }}>
                    <option value="client">Client Xyra</option>
                    <option value="club">Club d'affaires</option>
                    <option value="partenaire">Partenaire AA</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Message</label>
                  <input value={inviteForm.message} onChange={e => setInviteForm(f => ({ ...f, message: e.target.value }))} placeholder="Message optionnel..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={sendInvitation}>📧 Envoyer</Btn>
                <button onClick={() => setShowInviteForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </div>}
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Historique ({invitations.length})</div>
            {invitations.length === 0 ? <div style={{ textAlign: "center", padding: 24, color: C.muted }}>Aucune invitation envoyée</div> :
              invitations.map((inv, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{inv.nom}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{inv.email} · {new Date(inv.created_at).toLocaleDateString("fr")}</div>
                    <Pill color={inv.type === "client" ? C.blue : inv.type === "club" ? C.gold : C.green}>{inv.type}</Pill>
                  </div>
                  <Pill color={inv.statut === "inscrit" ? C.green : C.orange}>{inv.statut === "inscrit" ? "✓ Inscrit" : "⏳ En attente"}</Pill>
                </div>
              ))
            }
          </Card>
        </div>}

        {page === "documents" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>📋 Mes documents</div>
          <Card>
            <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div>Vos contrats et documents sont disponibles ici</div>
              <div style={{ fontSize: 11, marginTop: 8 }}>Contact : <a href="https://wa.me/33765189527" style={{ color: C.gold }}>WhatsApp Xyra</a></div>
            </div>
          </Card>
        </div>}

        {page === "outils" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>🛠 Outils de vente</div>
          <Card style={{ background: `${C.green}08`, borderColor: `${C.green}33`, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 8 }}>💬 Script WhatsApp — À copier</div>
            <div style={{ background: C.card, borderRadius: 8, padding: 14, fontSize: 12, color: C.text, lineHeight: 1.8, fontStyle: "italic" }}>
              "Bonjour [Prénom], je vous contacte car je travaille avec Xyra, un outil de gestion tout-en-un pour entrepreneurs. Il gère vos devis, factures, équipe, paiements — depuis un seul endroit. 14 jours gratuits. Je vous envoie le lien ?"
            </div>
            <Btn onClick={() => { navigator.clipboard?.writeText("Bonjour [Prénom], je vous contacte car je travaille avec Xyra..."); showToast("✅ Copié !"); }} style={{ marginTop: 10, fontSize: 11 }}>📋 Copier</Btn>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["📊", "Présentation Xyra", "Deck à envoyer à vos prospects"], ["💰", "Calculateur commission", "Estimez votre gain"], ["📧", "Template email", "Email optimisé pour prospecter"], ["🏆", "Témoignages clients", "Avis à partager"]].map(([icon, titre, desc], i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{titre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{desc}</div>
                <Btn onClick={() => showToast("✅ Disponible bientôt !")} style={{ fontSize: 10, padding: "5px 10px" }}>Accéder</Btn>
              </div>
            ))}
          </div>
        </div>}

        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.gold}22`, border: `3px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.gold, margin: "0 auto 12px" }}>
                {partenaire?.nom?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{partenaire?.nom || "Partenaire"}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{partenaire?.role || "Apporteur d'affaires"}</div>
            </div>
            {[["📧", user?.email], ["💰", (partenaire?.commission || 20) + "% de commission"], ["🤝", "Partenaire depuis " + (partenaire?.created_at ? new Date(partenaire.created_at).toLocaleDateString("fr") : "—")], ["🎯", leads.length + " leads soumis"]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                <span>{k}</span><span style={{ color: C.muted }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>}
      </div>

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, zIndex: 9999 }}>🔔 {toast}</div>}
    </div>
  );
}