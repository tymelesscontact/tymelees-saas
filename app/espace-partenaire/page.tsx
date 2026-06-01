"use client";
import { useState } from "react";

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

const PARTENAIRE = {
  nom: "Thomas Beaumont",
  prenom: "Thomas",
  role: "Apporteur d'affaires",
  avatar: "T",
  couleur: C.blue,
  email: "thomas@xyra.io",
  tel: "+33 6 12 34 56 78",
  commission: 20,
  ca: 12400,
  commissionsDues: 2480,
  commissionsPaye: 4800,
  lienParrainage: "https://tymelees-saas-yzel.vercel.app/inscription?ref=THOMAS-AA",
  lienClub: "https://tymelees-saas-yzel.vercel.app/inscription?ref=THOMAS-CLUB&type=club",
};

const LEADS = [
  { id: "L001", nom: "Hôtel Prestige Paris", contact: "Claire Bernard", ca: 8000, statut: "gagné", date: "10/04", commission: 1600 },
  { id: "L002", nom: "AirParis Management", contact: "Kevin Mour", ca: 3600, statut: "en_cours", date: "08/04", commission: 720 },
  { id: "L003", nom: "Cabinet Lebrun", contact: "Me Lebrun", ca: 960, statut: "perdu", date: "05/04", commission: 0 },
  { id: "L004", nom: "SCI Châtillon", contact: "M. Dupont", ca: 2400, statut: "nouveau", date: "14/04", commission: 480 },
];

const INVITATIONS = [
  { id: "INV001", nom: "Marie Leclerc", email: "marie@restaurant.fr", type: "client", date: "12/04", statut: "inscrit" },
  { id: "INV002", nom: "Groupe Atlas", email: "contact@atlas.ma", type: "club", date: "10/04", statut: "en_attente" },
  { id: "INV003", nom: "Jean-Paul Roux", email: "jp.roux@gmail.com", type: "partenaire", date: "08/04", statut: "inscrit" },
];

const PAIEMENTS = [
  { date: "01/04", montant: 2480, methode: "Virement SEPA", statut: "payé", ref: "COM-001" },
  { date: "01/03", montant: 1200, methode: "Virement SEPA", statut: "payé", ref: "COM-002" },
];

export default function EspacePartenaire() {
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState(LEADS);
  const [invitations, setInvitations] = useState(INVITATIONS);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ nom: "", contact: "", email: "", tel: "", ca: "", notes: "" });
  const [inviteForm, setInviteForm] = useState({ nom: "", email: "", type: "client", message: "" });
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const copyLink = (type: string) => {
    const link = type === "client" ? PARTENAIRE.lienParrainage : PARTENAIRE.lienClub;
    navigator.clipboard?.writeText(link);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    showToast("🔗 Lien copié !");
  };

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Tableau de bord" },
    { id: "leads", icon: "🎯", label: "Mes leads" },
    { id: "commissions", icon: "💰", label: "Mes commissions" },
    { id: "invitations", icon: "✉️", label: "Invitations" },
    { id: "documents", icon: "📋", label: "Documents" },
    { id: "outils", icon: "🛠", label: "Outils de vente" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  const Card = ({ children, style = {} }: any) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
  );

  const Pill = ({ children, color = C.gold }: any) => (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
  );

  const Btn = ({ children, onClick, color = C.gold, style = {} }: any) => (
    <button onClick={onClick} style={{ background: color, color: color === C.gold ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", ...style }}>{children}</button>
  );

  const statutColor: Record<string, string> = { gagné: C.green, en_cours: C.gold, perdu: C.muted, nouveau: C.blue, inscrit: C.green, en_attente: C.orange };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}>XYRA</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${PARTENAIRE.couleur}22`, border: `2px solid ${PARTENAIRE.couleur}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: PARTENAIRE.couleur }}>{PARTENAIRE.avatar}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{PARTENAIRE.prenom}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{PARTENAIRE.commission}% commission</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {/* DASHBOARD */}
        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A0A1A)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE PARTENAIRE</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>Bonjour {PARTENAIRE.prenom} 👋</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Partenaire Xyra · {PARTENAIRE.commission}% de commission</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ borderLeft: `2px solid ${C.green}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>CA total apporté</div><div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{PARTENAIRE.ca.toLocaleString("fr")} €</div></div>
              <div style={{ borderLeft: `2px solid ${C.orange}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Commissions dues</div><div style={{ fontSize: 20, fontWeight: 700, color: C.orange }}>{PARTENAIRE.commissionsDues.toLocaleString("fr")} €</div></div>
              <div style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Leads actifs</div><div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>{leads.filter(l => l.statut !== "perdu").length}</div></div>
              <div style={{ borderLeft: `2px solid ${C.purple}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Invitations</div><div style={{ fontSize: 20, fontWeight: 700, color: C.purple }}>{invitations.length}</div></div>
            </div>
          </div>

          {/* Alerte commission */}
          {PARTENAIRE.commissionsDues > 0 && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>💰 Commission en attente</div>
                <div style={{ fontSize: 11, color: C.muted }}>{PARTENAIRE.commissionsDues.toLocaleString("fr")}€ seront virés prochainement</div>
              </div>
              <Btn onClick={() => setPage("commissions")} color={C.orange} style={{ color: "#000", fontSize: 11 }}>Voir détails</Btn>
            </div>
          )}

          {/* KPIs rapides */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[["Taux conversion", Math.round(leads.filter(l => l.statut === "gagné").length / leads.length * 100) + "%", C.green], ["Leads gagnés", leads.filter(l => l.statut === "gagné").length + "/" + leads.length, C.gold], ["Commission totale", (PARTENAIRE.commissionsDues + PARTENAIRE.commissionsPaye).toLocaleString("fr") + " €", C.blue]].map(([l, v, c], i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Derniers leads */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎯 Derniers leads</div>
            {leads.slice(0, 3).map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>{l.nom}</div><div style={{ fontSize: 10, color: C.muted }}>{l.contact} · {l.date}</div></div>
                <div style={{ textAlign: "right" }}>
                  <Pill color={statutColor[l.statut] || C.muted}>{l.statut}</Pill>
                  <div style={{ fontSize: 11, color: C.gold, marginTop: 2 }}>{l.ca > 0 ? l.ca.toLocaleString("fr") + " €" : "—"}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setPage("leads")} style={{ marginTop: 10, background: "transparent", color: C.gold, border: "none", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Voir tous les leads →</button>
          </Card>
        </div>}

        {/* LEADS */}
        {page === "leads" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>🎯 Mes leads</div>
            <Btn onClick={() => setShowLeadForm(s => !s)}>+ Soumettre un lead</Btn>
          </div>

          {showLeadForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouveau lead</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[["Nom de l'entreprise *", "nom"], ["Contact principal *", "contact"], ["Email", "email"], ["Téléphone", "tel"], ["CA estimé (€)", "ca"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                    <input value={(leadForm as any)[key]} onChange={e => setLeadForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder={label} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                  </div>
                ))}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Notes</label>
                  <input value={leadForm.notes} onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contexte, besoins du prospect..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => {
                  if (!leadForm.nom) return showToast("⚠️ Remplissez le nom");
                  const ca = Number(leadForm.ca) || 0;
                  setLeads(ls => [...ls, { id: "L00" + (ls.length + 1), nom: leadForm.nom, contact: leadForm.contact, email: leadForm.email, tel: leadForm.tel, ca, statut: "nouveau", date: new Date().toLocaleDateString("fr"), commission: Math.round(ca * PARTENAIRE.commission / 100) }] as any);
                  setShowLeadForm(false);
                  setLeadForm({ nom: "", contact: "", email: "", tel: "", ca: "", notes: "" });
                  showToast("✅ Lead soumis ! Curtiss va le traiter rapidement.");
                }}>✅ Soumettre le lead</Btn>
                <button onClick={() => setShowLeadForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </Card>
          )}

          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Entreprise", "Contact", "CA estimé", "Commission", "Date", "Statut"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={i}>
                    <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, fontWeight: 700 }}>{l.nom}</td>
                    <td style={{ padding: "9px 10px", fontSize: 11, borderBottom: `1px solid ${C.border}22`, color: C.muted }}>{l.contact}</td>
                    <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, color: C.green, fontWeight: 600 }}>{l.ca > 0 ? l.ca.toLocaleString("fr") + " €" : "À définir"}</td>
                    <td style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, color: C.gold, fontWeight: 700 }}>{l.commission > 0 ? l.commission.toLocaleString("fr") + " €" : "—"}</td>
                    <td style={{ padding: "9px 10px", fontSize: 10, borderBottom: `1px solid ${C.border}22`, color: C.muted }}>{l.date}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${C.border}22` }}><Pill color={statutColor[l.statut] || C.muted}>{l.statut}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>}

        {/* COMMISSIONS */}
        {page === "commissions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💰 Mes commissions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[["Dues", PARTENAIRE.commissionsDues.toLocaleString("fr") + " €", C.orange], ["Payées", PARTENAIRE.commissionsPaye.toLocaleString("fr") + " €", C.green], ["Taux", PARTENAIRE.commission + "%", C.gold]].map(([l, v, c], i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>

          {PARTENAIRE.commissionsDues > 0 && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 4 }}>💰 {PARTENAIRE.commissionsDues.toLocaleString("fr")}€ en attente de paiement</div>
              <div style={{ fontSize: 11, color: C.muted }}>Virement sous 30 jours après encaissement client · Xyra vous notifie par WhatsApp</div>
            </div>
          )}

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Historique des paiements</div>
            {PAIEMENTS.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.date} · {p.methode}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{p.ref}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{p.montant.toLocaleString("fr")} €</div>
                  <Pill color={C.green}>✓ {p.statut}</Pill>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {/* INVITATIONS */}
        {page === "invitations" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>✉️ Mes invitations</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>Invitez des personnes à rejoindre Xyra ou le Club d'affaires</div>

          {/* Liens de parrainage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { type: "client", titre: "🏢 Inviter un client Xyra", desc: "Ils s'inscrivent avec 14 jours gratuits", couleur: C.blue, lien: PARTENAIRE.lienParrainage },
              { type: "club", titre: "⬡ Inviter au Club d'affaires", desc: "Rejoindre le réseau privé Xyra", couleur: C.gold, lien: PARTENAIRE.lienClub },
              { type: "partenaire", titre: "🤝 Inviter un partenaire AA", desc: "Devenir apporteur d'affaires Xyra", couleur: C.green, lien: PARTENAIRE.lienParrainage + "&type=partenaire" },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `2px solid ${item.couleur}33`, borderRadius: 14, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.couleur, marginBottom: 6 }}>{item.titre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{item.desc}</div>
                <div style={{ background: C.card2, borderRadius: 8, padding: "8px 10px", fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 12, wordBreak: "break-all" }}>
                  {item.lien.slice(0, 45)}...
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copyLink(item.type)} style={{ flex: 1, background: item.couleur, color: "#000", border: "none", borderRadius: 6, padding: "8px 0", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                    {copied === item.type ? "✓ Copié !" : "📋 Copier le lien"}
                  </button>
                  <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent("Rejoins Xyra avec mon lien : " + item.lien)}`); }} style={{ background: `${C.green}22`, color: C.green, border: `1px solid ${C.green}44`, borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>
                    💬 WA
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire invitation directe */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>📧 Envoyer une invitation directe</div>
              <Btn onClick={() => setShowInviteForm(s => !s)} style={{ fontSize: 11, padding: "6px 12px" }}>+ Inviter</Btn>
            </div>
            {showInviteForm && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[["Nom *", "nom"], ["Email *", "email"]].map(([label, key]) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                      <input value={(inviteForm as any)[key]} onChange={e => setInviteForm((f: any) => ({ ...f, [key]: e.target.value }))} placeholder={label} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Type d'invitation</label>
                    <select value={inviteForm.type} onChange={e => setInviteForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }}>
                      <option value="client">Client Xyra</option>
                      <option value="club">Club d'affaires</option>
                      <option value="partenaire">Partenaire AA</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Message personnalisé</label>
                    <input value={inviteForm.message} onChange={e => setInviteForm(f => ({ ...f, message: e.target.value }))} placeholder="Message optionnel..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => {
                    if (!inviteForm.nom || !inviteForm.email) return showToast("⚠️ Remplissez nom et email");
                    setInvitations(inv => [...inv, { id: "INV00" + (inv.length + 1), nom: inviteForm.nom, email: inviteForm.email, type: inviteForm.type, date: new Date().toLocaleDateString("fr"), statut: "en_attente" }]);
                    setShowInviteForm(false);
                    setInviteForm({ nom: "", email: "", type: "client", message: "" });
                    showToast(`✅ Invitation envoyée à ${inviteForm.nom} !`);
                  }}>📧 Envoyer l'invitation</Btn>
                  <button onClick={() => setShowInviteForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                </div>
              </div>
            )}
          </Card>

          {/* Liste invitations */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Historique des invitations ({invitations.length})</div>
            {invitations.map((inv, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{inv.nom}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{inv.email} · {inv.date}</div>
                  <Pill color={inv.type === "client" ? C.blue : inv.type === "club" ? C.gold : C.green}>{inv.type}</Pill>
                </div>
                <Pill color={statutColor[inv.statut] || C.muted}>{inv.statut === "inscrit" ? "✓ Inscrit" : "⏳ En attente"}</Pill>
              </div>
            ))}
          </Card>
        </div>}

        {/* DOCUMENTS */}
        {page === "documents" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>📋 Mes documents</div>
          {[{ nom: "Contrat AA signé", type: "Contrat", date: "01/03/2024", statut: "signé" }, { nom: "RIB bancaire", type: "RIB", date: "01/03/2024", statut: "valide" }, { nom: "Relevé commissions Avril 2026", type: "Relevé", date: "30/04/2026", statut: "disponible" }, { nom: "Relevé commissions Mars 2026", type: "Relevé", date: "31/03/2026", statut: "disponible" }].map((d, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{d.nom}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{d.type} · {d.date}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill color={d.statut === "signé" || d.statut === "valide" || d.statut === "disponible" ? C.green : C.muted}>✓ {d.statut}</Pill>
                <Btn onClick={() => showToast(`📥 ${d.nom} téléchargé`)} style={{ fontSize: 11, padding: "6px 12px" }}>📥 Télécharger</Btn>
              </div>
            </div>
          ))}
        </div>}

        {/* OUTILS */}
        {page === "outils" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>🛠 Outils de vente</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { icon: "📊", titre: "Présentation Xyra", desc: "Deck complet à envoyer à vos prospects", action: "Télécharger PDF" },
              { icon: "📱", titre: "Script WhatsApp", desc: "Message type pour aborder un prospect", action: "Copier le script" },
              { icon: "📧", titre: "Template email prospection", desc: "Email accrocheur testé et optimisé", action: "Copier le template" },
              { icon: "🎯", titre: "Argumentaire de vente", desc: "Les 5 arguments qui convertissent", action: "Voir l'argumentaire" },
              { icon: "💰", titre: "Calculateur de commission", desc: "Estimez votre gain selon le CA apporté", action: "Calculer" },
              { icon: "🏆", titre: "Témoignages clients", desc: "Avis et cas clients à partager", action: "Voir les témoignages" },
            ].map((o, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{o.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{o.titre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{o.desc}</div>
                <Btn onClick={() => showToast(`✅ ${o.action}`)} style={{ fontSize: 11, padding: "6px 12px" }}>{o.action}</Btn>
              </div>
            ))}
          </div>
          {/* Script WhatsApp exemple */}
          <Card style={{ background: `${C.green}08`, borderColor: `${C.green}33` }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 8 }}>💬 Script WhatsApp — À copier/coller</div>
            <div style={{ background: C.card, borderRadius: 8, padding: 14, fontSize: 12, color: C.text, lineHeight: 1.8, fontStyle: "italic" }}>
              "Bonjour [Prénom], je vous contacte car je travaille avec Xyra, un outil de gestion tout-en-un utilisé par des entrepreneurs comme vous. Il permet de gérer vos devis, factures, équipe, paiements et bien plus — depuis un seul endroit. 14 jours gratuits sans CB. Je vous envoie le lien si ça vous intéresse ?"
            </div>
            <Btn onClick={() => { navigator.clipboard?.writeText("Bonjour [Prénom], je vous contacte car je travaille avec Xyra..."); showToast("✅ Script copié !"); }} style={{ marginTop: 10, fontSize: 11 }}>📋 Copier ce script</Btn>
          </Card>
        </div>}

        {/* PROFIL */}
        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${PARTENAIRE.couleur}22`, border: `3px solid ${PARTENAIRE.couleur}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: PARTENAIRE.couleur, margin: "0 auto 12px" }}>{PARTENAIRE.avatar}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{PARTENAIRE.nom}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{PARTENAIRE.role}</div>
              </div>
              {[["📧 Email", PARTENAIRE.email], ["📱 Téléphone", PARTENAIRE.tel], ["💰 Taux commission", PARTENAIRE.commission + "%"], ["🤝 Partenaire depuis", "01/03/2024"]].map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 Mes performances</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["CA total", PARTENAIRE.ca.toLocaleString("fr") + " €", C.gold], ["Leads soumis", leads.length.toString(), C.blue], ["Taux conversion", Math.round(leads.filter(l => l.statut === "gagné").length / leads.length * 100) + "%", C.green], ["Invitations", invitations.length.toString(), C.purple]].map(([l, v, c], i) => (
                  <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c as string }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, zIndex: 9999, display: "flex", gap: 8, alignItems: "center" }}>
          🔔 {toast}
        </div>
      )}
    </div>
  );
}