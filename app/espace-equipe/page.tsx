"use client";
import { useState } from "react";

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

const MEMBRE = {
  nom: "Thomas Beaumont",
  prenom: "Thomas",
  role: "Responsable missions premium",
  avatar: "T",
  couleur: C.blue,
  email: "thomas@xyra.io",
  tel: "+33 6 12 34 56 78",
  soldeConges: 12,
  congesTotal: 25,
  heures: 6.5,
  perf: 94,
  salaire: 2800,
  contrat: "CDI",
  embauche: "01/03/2024",
};

const MISSIONS_JOUR = [
  { id: "M001", heure: "09:00", client: "Isabelle Moreau", service: "Nettoyage Airbnb — Montmartre", adresse: "12 rue Lepic, Paris 18e", duree: "3h", statut: "en_cours", checklist: ["Entrée principale", "Salon & cuisine", "Chambres", "Salle de bain", "Terrasse", "Vérification finale"], checkFait: [true, true, false, false, false, false] },
  { id: "M002", heure: "14:00", client: "Marc Dupont", service: "Nettoyage bureaux — La Défense", adresse: "1 Parvis La Défense", duree: "4h", statut: "a_faire", checklist: ["Open space", "Salles de réunion", "Cuisine", "Sanitaires", "Réception", "Rapport final"], checkFait: [false, false, false, false, false, false] },
];

const CONGES_DEMANDES = [
  { id: "C001", debut: "20/05/2026", fin: "22/05/2026", jours: 3, type: "Congés payés", statut: "en_attente", motif: "Vacances famille" },
  { id: "C002", debut: "01/08/2026", fin: "15/08/2026", jours: 15, type: "Congés payés", statut: "validé", motif: "Vacances été" },
];

const ABSENCES = [
  { debut: "05/02/2026", fin: "08/02/2026", jours: 3, motif: "Grippe", justif: "Arrêt médical fourni", statut: "justifié" },
];

const FICHES_PAIE = [
  { mois: "Avril 2026", net: 2800, brut: 3584, statut: "disponible" },
  { mois: "Mars 2026", net: 2800, brut: 3584, statut: "disponible" },
  { mois: "Février 2026", net: 2750, brut: 3520, statut: "disponible" },
];

const MSGS = [
  { auteur: "Curtiss", av: "C", msg: "Bonjour Thomas, mission Airbnb confirmée pour 9h ✅", h: "08:30", moi: false },
  { auteur: "Thomas", av: "T", msg: "Reçu ! Je pars dans 30 minutes 👍", h: "08:35", moi: true },
];

export default function EspaceEquipe() {
  const [page, setPage] = useState("dashboard");
  const [missions, setMissions] = useState(MISSIONS_JOUR);
  const [conges, setConges] = useState(CONGES_DEMANDES);
  const [msgs, setMsgs] = useState(MSGS);
  const [newMsg, setNewMsg] = useState("");
  const [pointed, setPointed] = useState(false);
  const [showCongeForm, setShowCongeForm] = useState(false);
  const [congeForm, setCongeForm] = useState({ debut: "", fin: "", type: "Congés payés", motif: "" });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Tableau de bord" },
    { id: "missions", icon: "✅", label: "Mes missions" },
    { id: "planning", icon: "📅", label: "Mon planning" },
    { id: "conges", icon: "🏖", label: "Congés & Absences" },
    { id: "paie", icon: "💸", label: "Mes fiches de paie" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  const Card = ({ children, style = {} }: any) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>
      {children}
    </div>
  );

  const Pill = ({ children, color = C.gold }: any) => (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
      {children}
    </span>
  );

  const Btn = ({ children, onClick, color = C.gold, style = {} }: any) => (
    <button onClick={onClick} style={{ background: color, color: color === C.gold ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", ...style }}>
      {children}
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}>XYRA</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginTop: 2 }}>ESPACE ÉQUIPE</div>
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
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${MEMBRE.couleur}22`, border: `2px solid ${MEMBRE.couleur}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: MEMBRE.couleur }}>{MEMBRE.avatar}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{MEMBRE.prenom}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{MEMBRE.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {/* DASHBOARD */}
        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE ÉQUIPE</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>Bonjour {MEMBRE.prenom} 👋</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Missions aujourd'hui</div><div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{missions.length}</div></div>
              <div style={{ borderLeft: `2px solid ${C.green}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Performance</div><div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{MEMBRE.perf}%</div></div>
              <div style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 12 }}><div style={{ fontSize: 9, color: C.muted }}>Congés restants</div><div style={{ fontSize: 18, fontWeight: 700, color: C.blue }}>{MEMBRE.soldeConges}j</div></div>
              <div style={{ borderLeft: `2px solid ${pointed ? C.green : C.orange}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 9, color: C.muted }}>Pointage</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: pointed ? C.green : C.orange }}>{pointed ? "✅ Pointé" : "⏳ À faire"}</div>
              </div>
            </div>
          </div>

          {/* Pointage */}
          {!pointed && <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>📍 Pointage du matin</div>
              <div style={{ fontSize: 11, color: C.muted }}>N'oubliez pas de pointer votre arrivée</div>
            </div>
            <Btn onClick={() => { setPointed(true); showToast("✅ Pointage enregistré — " + new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })); }} color={C.orange} style={{ color: "#000" }}>📍 Pointer maintenant</Btn>
          </div>}

          {/* Missions du jour */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✅ Missions du jour</div>
            {missions.map((m, i) => (
              <div key={i} style={{ background: C.card2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${m.statut === "en_cours" ? C.gold + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.heure} — {m.service}</div>
                  <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut === "en_cours" ? "En cours" : m.statut === "termine" ? "✓ Terminé" : "À faire"}</Pill>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>👤 {m.client} · 📍 {m.adresse}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>⏱ {m.duree}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={() => { window.open(`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`); }} style={{ fontSize: 11, padding: "5px 10px", background: C.blue }}>🗺 Navigation</Btn>
                  <Btn onClick={() => setPage("missions")} style={{ fontSize: 11, padding: "5px 10px" }}>📋 Checklist</Btn>
                </div>
              </div>
            ))}
          </Card>

          {/* Congés en attente */}
          {conges.filter(c => c.statut === "en_attente").length > 0 && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 4 }}>⏳ Demande de congés en attente de validation</div>
              {conges.filter(c => c.statut === "en_attente").map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: C.muted }}>{c.debut} → {c.fin} ({c.jours}j) — {c.motif}</div>
              ))}
            </div>
          )}
        </div>}

        {/* MISSIONS */}
        {page === "missions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✅ Mes missions</div>
          {missions.map((m, i) => (
            <Card key={i} style={{ marginBottom: 14, borderColor: m.statut === "en_cours" ? `${C.gold}44` : C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{m.service}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{m.heure} · {m.duree} · {m.client}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>📍 {m.adresse}</div>
                </div>
                <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut === "en_cours" ? "En cours" : m.statut === "termine" ? "✓ Terminé" : "À faire"}</Pill>
              </div>
              {/* Checklist */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>CHECKLIST</div>
                {m.checklist.map((item, j) => (
                  <div key={j} onClick={() => {
                    const updated = [...missions];
                    updated[i].checkFait[j] = !updated[i].checkFait[j];
                    setMissions(updated);
                  }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}22`, cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${m.checkFait[j] ? C.green : C.border}`, background: m.checkFait[j] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                      {m.checkFait[j] ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 12, color: m.checkFait[j] ? C.muted : C.text, textDecoration: m.checkFait[j] ? "line-through" : "none" }}>{item}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>
                  {m.checkFait.filter(Boolean).length}/{m.checklist.length} étapes complétées
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.statut !== "termine" && <Btn onClick={() => { const updated = [...missions]; updated[i].statut = updated[i].statut === "a_faire" ? "en_cours" : "termine"; setMissions(updated); showToast(updated[i].statut === "en_cours" ? "🚀 Mission démarrée !" : "✅ Mission terminée !"); }} color={m.statut === "a_faire" ? C.blue : C.green}>{m.statut === "a_faire" ? "▶ Démarrer" : "✅ Terminer"}</Btn>}
                <Btn onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`)} style={{ fontSize: 11, padding: "7px 12px", background: C.blue }}>🗺 Navigation GPS</Btn>
                <Btn onClick={() => showToast("📸 Photo envoyée au patron")} style={{ fontSize: 11, padding: "7px 12px", background: C.purple }}>📸 Envoyer photo</Btn>
                <Btn onClick={() => showToast("⚠️ Problème signalé au patron")} style={{ fontSize: 11, padding: "7px 12px", background: C.red }}>⚠️ Signaler problème</Btn>
              </div>
            </Card>
          ))}
        </div>}

        {/* CONGÉS & ABSENCES */}
        {page === "conges" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>🏖 Congés & Absences</div>
            <Btn onClick={() => setShowCongeForm(s => !s)}>+ Demander des congés</Btn>
          </div>

          {/* Solde */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[["Congés acquis", MEMBRE.congesTotal + "j", C.blue], ["Congés pris", (MEMBRE.congesTotal - MEMBRE.soldeConges) + "j", C.orange], ["Solde restant", MEMBRE.soldeConges + "j", C.green]].map(([l, v, c], i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Formulaire demande */}
          {showCongeForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouvelle demande de congés</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date de début</label>
                  <input type="date" value={congeForm.debut} onChange={e => setCongeForm(f => ({ ...f, debut: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date de fin</label>
                  <input type="date" value={congeForm.fin} onChange={e => setCongeForm(f => ({ ...f, fin: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Type</label>
                  <select value={congeForm.type} onChange={e => setCongeForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }}>
                    <option>Congés payés</option>
                    <option>RTT</option>
                    <option>Congé sans solde</option>
                    <option>Congé exceptionnel</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Motif</label>
                  <input value={congeForm.motif} onChange={e => setCongeForm(f => ({ ...f, motif: e.target.value }))} placeholder="Motif de la demande" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => {
                  if (!congeForm.debut || !congeForm.fin) return showToast("⚠️ Remplissez les dates");
                  const jours = Math.ceil((new Date(congeForm.fin).getTime() - new Date(congeForm.debut).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  setConges(cs => [...cs, { id: "C00" + (cs.length + 1), debut: congeForm.debut, fin: congeForm.fin, jours, type: congeForm.type, statut: "en_attente", motif: congeForm.motif }]);
                  setShowCongeForm(false);
                  setCongeForm({ debut: "", fin: "", type: "Congés payés", motif: "" });
                  showToast("✅ Demande envoyée — en attente de validation par Curtiss");
                }}>✅ Envoyer la demande</Btn>
                <button onClick={() => setShowCongeForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </Card>
          )}

          {/* Liste congés */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Mes demandes de congés</div>
            {conges.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune demande de congés</div> :
              conges.map((c, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${c.statut === "validé" ? C.green + "33" : c.statut === "refusé" ? C.red + "33" : C.orange + "33"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.debut} → {c.fin} ({c.jours}j)</div>
                    <span style={{ fontSize: 10, background: c.statut === "validé" ? `${C.green}22` : c.statut === "refusé" ? `${C.red}22` : `${C.orange}22`, color: c.statut === "validé" ? C.green : c.statut === "refusé" ? C.red : C.orange, borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>
                      {c.statut === "validé" ? "✓ Validé" : c.statut === "refusé" ? "✗ Refusé" : "⏳ En attente"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{c.type} · {c.motif}</div>
                </div>
              ))
            }
          </Card>

          {/* Absences */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🏥 Mes absences</div>
            {ABSENCES.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune absence enregistrée</div> :
              ABSENCES.map((a, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{a.debut} → {a.fin} ({a.jours}j)</div>
                    <span style={{ fontSize: 10, background: `${C.green}22`, color: C.green, borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>✓ {a.statut}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{a.motif} · {a.justif}</div>
                </div>
              ))
            }
          </Card>
        </div>}

        {/* FICHES DE PAIE */}
        {page === "paie" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💸 Mes fiches de paie</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[["Salaire net", "2 800 €", C.gold], ["Salaire brut", "3 584 €", C.blue], ["Contrat", MEMBRE.contrat, C.green]].map(([l, v, c], i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>
          {FICHES_PAIE.map((f, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{f.mois}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Net : {f.net.toLocaleString("fr")} € · Brut : {f.brut.toLocaleString("fr")} €</div>
              </div>
              <Btn onClick={() => showToast(`📄 Fiche ${f.mois} téléchargée`)} style={{ fontSize: 11, padding: "6px 14px" }}>📥 Télécharger</Btn>
            </div>
          ))}
        </div>}

        {/* MESSAGES */}
        {page === "messages" && <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💬 Messages avec Curtiss</div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.moi ? "row-reverse" : "row" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.moi ? `${C.gold}22` : `${C.blue}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: m.moi ? C.gold : C.blue, flexShrink: 0 }}>{m.av}</div>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ background: m.moi ? `${C.gold}18` : C.card2, border: `1px solid ${m.moi ? C.gold + "33" : C.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 2 }}>
                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.msg}</div>
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, textAlign: m.moi ? "right" : "left" }}>{m.h}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newMsg.trim()) { setMsgs(ms => [...ms, { auteur: "Thomas", av: "T", msg: newMsg, h: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }), moi: true }]); setNewMsg(""); } }} placeholder="Écrire un message..." style={{ flex: 1, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <Btn onClick={() => { if (newMsg.trim()) { setMsgs(ms => [...ms, { auteur: "Thomas", av: "T", msg: newMsg, h: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }), moi: true }]); setNewMsg(""); } }}>↗</Btn>
          </div>
        </div>}

        {/* PROFIL */}
        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${MEMBRE.couleur}22`, border: `3px solid ${MEMBRE.couleur}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: MEMBRE.couleur, margin: "0 auto 12px" }}>{MEMBRE.avatar}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{MEMBRE.nom}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{MEMBRE.role}</div>
              </div>
              {[["📧 Email", MEMBRE.email], ["📱 Téléphone", MEMBRE.tel], ["📋 Contrat", MEMBRE.contrat], ["📅 Depuis", MEMBRE.embauche]].map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 Mes statistiques</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Performance", MEMBRE.perf + "%", C.green], ["Missions mois", "14", C.blue], ["Note clients", "★ 4.9", C.gold], ["Ponctualité", "98%", C.teal]].map(([l, v, c], i) => (
                  <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c as string }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>}

        {/* PLANNING */}
        {page === "planning" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>📅 Mon planning</div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Cette semaine</div>
            {[["Lun 13/04", "09:00", "Nettoyage Airbnb — Montmartre", "Isabelle Moreau", "✅"], ["Lun 13/04", "14:00", "Nettoyage bureaux — La Défense", "Marc Dupont", "✅"], ["Mar 14/04", "10:00", "Entretien yacht — Port de Cannes", "Jet Services", "📅"], ["Mer 15/04", "09:00", "Nettoyage résidentiel — Neuilly", "Client VIP", "📅"], ["Ven 17/04", "14:00", "RDV équipe", "Curtiss", "📅"]].map(([date, h, service, client, statut], i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}22`, alignItems: "center" }}>
                <div style={{ width: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{date}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{h}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{service}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{client}</div>
                </div>
                <div style={{ fontSize: 16 }}>{statut}</div>
              </div>
            ))}
          </Card>
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