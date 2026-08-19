"use client";
import { useState, useEffect } from "react";

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

const TYPE_ABSENCE_LABELS: Record<string, string> = {
  conge_paye: "Congé payé", conge_sans_solde: "Congé sans solde",
  arret_maladie: "Arrêt maladie", accident_travail: "Accident du travail",
  evenement_familial: "Événement familial", enfant_malade: "Enfant malade",
  absence_injustifiee: "Absence injustifiée", retard: "Retard",
};

const TYPE_SIGNALEMENT_LABELS: Record<string, string> = {
  degat: "Dégât constaté", acces_impossible: "Accès impossible",
  client_absent: "Client absent", materiel_manquant: "Matériel manquant",
  probleme_client: "Problème client", autre: "Autre",
};

export default function EspaceEquipe() {
  const [page, setPage] = useState("dashboard");
  const [membre, setMembre] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({ type: "conge_paye", debut: "", fin: "", motif: "" });

  const [showSignalementForm, setShowSignalementForm] = useState(false);
  const [signalementMissionId, setSignalementMissionId] = useState<string | null>(null);
  const [signalementForm, setSignalementForm] = useState({ type: "autre", gravite: "moyen", contenu: "" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const charger = async () => {
    setLoading(true);
    try {
      const who = await fetch("/api/whoami").then(r => r.json());
      if (!who.email || !who.isCollaborateur) { window.location.href = "/login"; return; }

      const [mis, abs, sig] = await Promise.all([
        fetch("/api/planning-missions").then(r => r.json()).catch(() => ({})),
        fetch("/api/absences").then(r => r.json()).catch(() => ({})),
        fetch("/api/signalements?vue=equipe").then(r => r.json()).catch(() => ({})),
      ]);
      if (mis.missions) setMissions(mis.missions);
      if (abs.absences) setAbsences(abs.absences);
      if (sig.signalements) setSignalements(sig.signalements);
      setMembre({ email: who.email, employe_id: who.employeId });
    } catch (e: any) {
      setErreur("connexion");
    }
    setLoading(false);
  };
  useEffect(() => { charger(); }, []);

  const updateMissionStatut = async (id: string, statut: string) => {
    try {
      await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "modifier_statut", id, statut }),
      });
      setMissions(ms => ms.map(m => m.id === id ? { ...m, statut } : m));
      showToast(statut === "en_cours" ? "🚀 Mission démarrée" : "✅ Mission terminée");
    } catch { showToast("❌ Erreur"); }
  };

  const demanderAbsence = async () => {
    if (!absenceForm.debut) return showToast("⚠️ Date de début nécessaire");
    try {
      const r = await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "declarer", employe_id: membre?.employe_id, ...absenceForm, declaree_par: "collaborateur" }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("✅ Demande envoyée — en attente de validation");
        setShowAbsenceForm(false);
        setAbsenceForm({ type: "conge_paye", debut: "", fin: "", motif: "" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const envoyerSignalement = async () => {
    if (!signalementForm.contenu.trim()) return showToast("⚠️ Décrivez le problème");
    try {
      const r = await fetch("/api/signalements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creer", mission_id: signalementMissionId, employe_id: membre?.employe_id, ...signalementForm }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("✅ Signalement envoyé — vous protégez la mission");
        setShowSignalementForm(false);
        setSignalementForm({ type: "autre", gravite: "moyen", contenu: "" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const ouvrirGPS = (adresse: string, mode: "walking" | "driving" | "transit") => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse)}&travelmode=${mode}`, "_blank");
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
    { id: "missions", icon: "✅", label: "Mes missions" },
    { id: "absences", icon: "🏖", label: "Congés & Absences" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 12, color: C.muted }}>Chargement...</div>
    </div>
  );

  if (erreur) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
      Une erreur est survenue. <a href="/login" style={{ color: C.gold, marginLeft: 6 }}>Se reconnecter</a>
    </div>
  );

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const missionsDuJour = missions.filter(m => m.date_mission === aujourdhui);

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif" }}>XYRA</div>
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
          <div style={{ fontSize: 11, fontWeight: 600 }}>{membre?.email}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE ÉQUIPE</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>Bonjour 👋</div>
            <div style={{ fontSize: 11, color: C.muted }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✅ Missions du jour</div>
            {missionsDuJour.length === 0 ? (
              <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune mission aujourd'hui</div>
            ) : missionsDuJour.map((m, i) => (
              <div key={i} style={{ background: C.card2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${m.statut === "en_cours" ? C.gold + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.heure_debut} — {m.client_nom}</div>
                  <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut}</Pill>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>📍 {m.adresse}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {m.adresse && <>
                    <Btn onClick={() => ouvrirGPS(m.adresse, "driving")} style={{ fontSize: 11, padding: "5px 10px", background: C.blue }}>🚗 Voiture</Btn>
                    <Btn onClick={() => ouvrirGPS(m.adresse, "walking")} style={{ fontSize: 11, padding: "5px 10px", background: C.blue }}>🚶 À pied</Btn>
                    <Btn onClick={() => ouvrirGPS(m.adresse, "transit")} style={{ fontSize: 11, padding: "5px 10px", background: C.blue }}>🚌 Transport</Btn>
                  </>}
                  {m.statut !== "termine" && <Btn onClick={() => updateMissionStatut(m.id, m.statut === "confirme" ? "en_cours" : "termine")} style={{ fontSize: 11, padding: "5px 10px", background: m.statut === "confirme" ? C.blue : C.green }}>{m.statut === "confirme" ? "▶ Démarrer" : "✅ Terminer"}</Btn>}
                  <Btn onClick={() => { setSignalementMissionId(m.id); setShowSignalementForm(true); }} style={{ fontSize: 11, padding: "5px 10px", background: C.red }}>⚠️ Signaler un problème</Btn>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {page === "missions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✅ Toutes mes missions</div>
          {missions.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune mission assignée</div></Card>
          ) : missions.map((m, i) => (
            <Card key={i} style={{ marginBottom: 12, borderColor: m.statut === "en_cours" ? `${C.gold}44` : C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{m.client_nom}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{m.date_mission} · {m.heure_debut}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>📍 {m.adresse}</div>
                </div>
                <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut}</Pill>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {m.statut !== "termine" && <Btn onClick={() => updateMissionStatut(m.id, m.statut === "confirme" ? "en_cours" : "termine")} style={{ fontSize: 11, padding: "6px 12px", background: m.statut === "confirme" ? C.blue : C.green }}>{m.statut === "confirme" ? "▶ Démarrer" : "✅ Terminer"}</Btn>}
                {m.adresse && <Btn onClick={() => ouvrirGPS(m.adresse, "driving")} style={{ fontSize: 11, padding: "6px 12px", background: C.blue }}>🗺 GPS</Btn>}
                <Btn onClick={() => { setSignalementMissionId(m.id); setShowSignalementForm(true); }} style={{ fontSize: 11, padding: "6px 12px", background: C.red }}>⚠️ Problème</Btn>
              </div>
            </Card>
          ))}

          {signalements.length > 0 && <Card style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚠️ Signalements sur les chantiers</div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Visible par toute l'équipe, pour que chacun fasse attention.</div>
            {signalements.map((s, i) => (
              <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${s.gravite === "urgent" ? C.red + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Pill color={TYPE_SIGNALEMENT_LABELS[s.type] ? C.orange : C.muted}>{TYPE_SIGNALEMENT_LABELS[s.type] || s.type}</Pill>
                  <Pill color={s.gravite === "urgent" ? C.red : s.gravite === "grave" ? C.orange : C.muted}>{s.gravite}</Pill>
                </div>
                <div style={{ fontSize: 12, color: C.text }}>{s.contenu}</div>
              </div>
            ))}
          </Card>}
        </div>}

        {page === "absences" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>🏖 Congés & Absences</div>
            <Btn onClick={() => setShowAbsenceForm(s => !s)}>+ Déclarer une absence</Btn>
          </div>

          {showAbsenceForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouvelle déclaration</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Type</label>
                  <select value={absenceForm.type} onChange={e => setAbsenceForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }}>
                    {Object.entries(TYPE_ABSENCE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date début</label>
                  <input type="date" value={absenceForm.debut} onChange={e => setAbsenceForm(f => ({ ...f, debut: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date fin</label>
                  <input type="date" value={absenceForm.fin} onChange={e => setAbsenceForm(f => ({ ...f, fin: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Motif (facultatif)</label>
                  <input value={absenceForm.motif} onChange={e => setAbsenceForm(f => ({ ...f, motif: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              {absenceForm.type === "accident_travail" && (
                <div style={{ background: `${C.red}11`, border: `1px solid ${C.red}33`, borderRadius: 6, padding: 10, fontSize: 11, marginBottom: 10 }}>
                  ⚠️ Prévenez aussi directement Xyra par téléphone dans les 24h — c'est une obligation légale.
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={demanderAbsence}>✅ Envoyer</Btn>
                <button onClick={() => setShowAbsenceForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Mes demandes</div>
            {absences.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune demande</div> :
              absences.map((a, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${a.statut === "validee" ? C.green + "33" : a.statut === "refusee" ? C.red + "33" : C.orange + "33"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{a.debut} → {a.fin}</div>
                    <Pill color={a.statut === "validee" ? C.green : a.statut === "refusee" ? C.red : C.orange}>{a.statut}</Pill>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{TYPE_ABSENCE_LABELS[a.type] || a.type}</div>
                </div>
              ))
            }
          </Card>
        </div>}

        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <Card>
            <div style={{ fontSize: 12, color: C.muted }}>{membre?.email}</div>
          </Card>
        </div>}
      </div>

      {showSignalementForm && (
        <div onClick={() => setShowSignalementForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>⚠️ Signaler un problème</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={signalementForm.type} onChange={e => setSignalementForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, color: C.text, fontSize: 12 }}>
                {Object.entries(TYPE_SIGNALEMENT_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <select value={signalementForm.gravite} onChange={e => setSignalementForm(f => ({ ...f, gravite: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, color: C.text, fontSize: 12 }}>
                <option value="mineur">Mineur</option>
                <option value="moyen">Moyen</option>
                <option value="grave">Grave</option>
                <option value="urgent">Urgent — prévenir immédiatement</option>
              </select>
              <textarea value={signalementForm.contenu} onChange={e => setSignalementForm(f => ({ ...f, contenu: e.target.value }))} placeholder="Décrivez ce qui se passe..." rows={4} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical" as any }} />
              <div style={{ fontSize: 10, color: C.muted }}>Ce signalement reste dans le dossier de la mission et vous protège.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={envoyerSignalement} color={C.red}>✅ Envoyer</Btn>
                <button onClick={() => setShowSignalementForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, zIndex: 9999 }}>
          🔔 {toast}
        </div>
      )}
    </div>
  );
}
