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

export default function EspaceEquipe() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [membre, setMembre] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [conges, setConges] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [pointages, setPointages] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [pointed, setPointed] = useState(false);
  const [showCongeForm, setShowCongeForm] = useState(false);
  const [congeForm, setCongeForm] = useState({ debut: "", fin: "", type: "Congés payés", motif: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      // Charger données équipe
      const [m, c, a, p, msgs] = await Promise.all([
        sb.from("missions").select("*").eq("employe_id", user.id).order("date", { ascending: true }),
        sb.from("conges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        sb.from("absences").select("*").eq("user_id", user.id).order("debut", { ascending: false }),
        sb.from("pointages").select("*").eq("user_id", user.id).eq("date", new Date().toISOString().split("T")[0]),
        sb.from("equipe").select("*").eq("user_id", user.id).single(),
      ]);

      if (m.data) setMissions(m.data);
      if (c.data) setConges(c.data);
      if (a.data) setAbsences(a.data);
      if (p.data && p.data.length > 0) setPointed(true);
      if (msgs.data) setMembre(msgs.data);
      setLoading(false);
    };
    init();
  }, []);

  const handlePointage = async () => {
    if (!user) return;
    const heure = new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
    await sb.from("pointages").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      heure_arrivee: heure,
      localisation: "Paris",
    });
    setPointed(true);
    showToast("✅ Pointage enregistré — " + heure);
  };

  const handleDemandeConge = async () => {
    if (!congeForm.debut || !congeForm.fin) return showToast("⚠️ Remplissez les dates");
    const jours = Math.ceil((new Date(congeForm.fin).getTime() - new Date(congeForm.debut).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const { data, error } = await sb.from("conges").insert({
      user_id: user.id,
      nom_employe: membre?.nom || user.email,
      debut: congeForm.debut,
      fin: congeForm.fin,
      jours,
      type: congeForm.type,
      motif: congeForm.motif,
      statut: "en_attente",
    }).select().single();
    if (!error && data) {
      setConges(cs => [data, ...cs]);
      setShowCongeForm(false);
      setCongeForm({ debut: "", fin: "", type: "Congés payés", motif: "" });
      showToast("✅ Demande envoyée — en attente de validation");
    }
  };

  const updateMissionStatut = async (id: string, statut: string) => {
    await sb.from("missions").update({ statut }).eq("id", id);
    setMissions(ms => ms.map(m => m.id === id ? { ...m, statut } : m));
    showToast(statut === "en_cours" ? "🚀 Mission démarrée !" : "✅ Mission terminée !");
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
    { id: "planning", icon: "📅", label: "Mon planning" },
    { id: "conges", icon: "🏖", label: "Congés & Absences" },
    { id: "paie", icon: "💸", label: "Mes fiches de paie" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 12, color: C.muted }}>Chargement...</div>
    </div>
  );

  const missionsDuJour = missions.filter(m => m.date === new Date().toISOString().split("T")[0]);
  const soldeConges = membre?.solde_conges || 25;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
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
          <div style={{ fontSize: 11, fontWeight: 600 }}>{membre?.nom || user?.email}</div>
          <div style={{ fontSize: 9, color: C.muted }}>{membre?.role || "Équipe Xyra"}</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE ÉQUIPE</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>Bonjour {membre?.prenom || "👋"}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["Missions aujourd'hui", missionsDuJour.length, C.gold], ["Congés restants", soldeConges + "j", C.blue], ["Pointage", pointed ? "✅ Fait" : "⏳ À faire", pointed ? C.green : C.orange]].map(([l, v, c]: any, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {!pointed && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>📍 Pointage du matin</div>
                <div style={{ fontSize: 11, color: C.muted }}>N'oubliez pas de pointer votre arrivée</div>
              </div>
              <Btn onClick={handlePointage} color={C.orange} style={{ color: "#000" }}>📍 Pointer maintenant</Btn>
            </div>
          )}

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✅ Missions du jour</div>
            {missionsDuJour.length === 0 ? (
              <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune mission aujourd'hui</div>
            ) : missionsDuJour.map((m, i) => (
              <div key={i} style={{ background: C.card2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${m.statut === "en_cours" ? C.gold + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.heure} — {m.service}</div>
                  <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut}</Pill>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>👤 {m.client} · 📍 {m.adresse}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`)} style={{ fontSize: 11, padding: "5px 10px", background: C.blue }}>🗺 GPS</Btn>
                  {m.statut !== "termine" && <Btn onClick={() => updateMissionStatut(m.id, m.statut === "a_faire" ? "en_cours" : "termine")} style={{ fontSize: 11, padding: "5px 10px", background: m.statut === "a_faire" ? C.blue : C.green }}>{m.statut === "a_faire" ? "▶ Démarrer" : "✅ Terminer"}</Btn>}
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {page === "conges" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>🏖 Congés & Absences</div>
            <Btn onClick={() => setShowCongeForm(s => !s)}>+ Demander des congés</Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[["Solde restant", soldeConges + "j", C.green], ["En attente", conges.filter(c => c.statut === "en_attente").length, C.orange], ["Absences", absences.length, C.red]].map(([l, v, c]: any, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>

          {showCongeForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouvelle demande</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date début</label>
                  <input type="date" value={congeForm.debut} onChange={e => setCongeForm(f => ({ ...f, debut: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date fin</label>
                  <input type="date" value={congeForm.fin} onChange={e => setCongeForm(f => ({ ...f, fin: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Type</label>
                  <select value={congeForm.type} onChange={e => setCongeForm(f => ({ ...f, type: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }}>
                    <option>Congés payés</option><option>RTT</option><option>Congé sans solde</option><option>Congé exceptionnel</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Motif</label>
                  <input value={congeForm.motif} onChange={e => setCongeForm(f => ({ ...f, motif: e.target.value }))} placeholder="Motif..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={handleDemandeConge}>✅ Envoyer</Btn>
                <button onClick={() => setShowCongeForm(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              </div>
            </Card>
          )}

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Mes demandes de congés</div>
            {conges.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune demande</div> :
              conges.map((c, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${c.statut === "valide" ? C.green + "33" : c.statut === "refuse" ? C.red + "33" : C.orange + "33"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.debut} → {c.fin} ({c.jours}j)</div>
                    <Pill color={c.statut === "valide" ? C.green : c.statut === "refuse" ? C.red : C.orange}>{c.statut === "valide" ? "✓ Validé" : c.statut === "refuse" ? "✗ Refusé" : "⏳ En attente"}</Pill>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{c.type} · {c.motif}</div>
                </div>
              ))
            }
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🏥 Mes absences</div>
            {absences.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>Aucune absence</div> :
              absences.map((a, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{a.debut} → {a.fin} ({a.jours}j)</div>
                    <Pill color={C.green}>✓ {a.statut}</Pill>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{a.motif} · {a.justif}</div>
                </div>
              ))
            }
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
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{m.service}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{m.date} · {m.heure} · {m.duree}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>👤 {m.client} · 📍 {m.adresse}</div>
                </div>
                <Pill color={m.statut === "en_cours" ? C.gold : m.statut === "termine" ? C.green : C.muted}>{m.statut}</Pill>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {m.statut !== "termine" && <Btn onClick={() => updateMissionStatut(m.id, m.statut === "a_faire" ? "en_cours" : "termine")} style={{ fontSize: 11, padding: "6px 12px", background: m.statut === "a_faire" ? C.blue : C.green }}>{m.statut === "a_faire" ? "▶ Démarrer" : "✅ Terminer"}</Btn>}
                <Btn onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`)} style={{ fontSize: 11, padding: "6px 12px", background: C.blue }}>🗺 GPS</Btn>
                <Btn onClick={() => showToast("⚠️ Problème signalé")} style={{ fontSize: 11, padding: "6px 12px", background: C.red }}>⚠️ Problème</Btn>
              </div>
            </Card>
          ))}
        </div>}

        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.blue}22`, border: `3px solid ${C.blue}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.blue, margin: "0 auto 12px" }}>{membre?.nom?.[0] || user?.email?.[0]?.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{membre?.nom || "Membre équipe"}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{membre?.role || "Équipe Xyra"}</div>
            </div>
            {[["📧", user?.email], ["📅", "Membre depuis " + (membre?.embauche || "—")], ["📋", membre?.contrat || "CDI"]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                <span>{k}</span><span style={{ color: C.muted }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>}

        {page === "paie" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💸 Mes fiches de paie</div>
          <Card>
            <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div>Vos fiches de paie sont disponibles ici dès leur génération</div>
              <div style={{ fontSize: 11, marginTop: 8 }}>Contact : <a href="https://wa.me/33765189527" style={{ color: C.gold }}>WhatsApp Xyra</a></div>
            </div>
          </Card>
        </div>}

        {page === "planning" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>📅 Mon planning</div>
          <Card>
            {missions.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune mission planifiée</div>
            ) : missions.sort((a, b) => a.date > b.date ? 1 : -1).map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}22`, alignItems: "center" }}>
                <div style={{ width: 70, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{m.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{m.heure}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.service}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{m.client} · {m.adresse}</div>
                </div>
                <Pill color={m.statut === "termine" ? C.green : m.statut === "en_cours" ? C.gold : C.muted}>{m.statut}</Pill>
              </div>
            ))}
          </Card>
        </div>}

        {page === "messages" && <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💬 Messages</div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ textAlign: "center", color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div>Messagerie connectée au dashboard owner</div>
            </div>
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