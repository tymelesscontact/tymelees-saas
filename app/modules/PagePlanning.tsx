"use client";
import { useState, useEffect, useRef } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const TYPE_LABELS: Record<string, string> = {
  conge_paye: "Congé payé", conge_sans_solde: "Congé sans solde",
  arret_maladie: "Arrêt maladie", accident_travail: "Accident du travail",
  evenement_familial: "Événement familial", enfant_malade: "Enfant malade",
  absence_injustifiee: "Absence injustifiée", retard: "Retard",
};

const PagePlanning = ({ plan, showToast, profil, UpgradeWall, activeCompany }: any) => {
  const [onglet, setOnglet] = useState("dispatch");
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showNouvelleMission, setShowNouvelleMission] = useState(false);
  const [missionForm, setMissionForm] = useState({
    client_nom: "", client_email: "", client_tel: "", date_mission: "",
    heure_debut: "", heure_fin: "", adresse: "", notes: "", collaborateur_ids: [] as string[],
  });
  const [showDeclarerAbsence, setShowDeclarerAbsence] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({ employe_id: "", type: "conge_paye", debut: "", fin: "", motif: "" });
  const [positions, setPositions] = useState<any[]>([]);
  const carteDiv = useRef<HTMLDivElement>(null);
  const carteObjet = useRef<any>(null);
  const marqueurs = useRef<any[]>([]);

  const charger = async () => {
    setChargement(true);
    try {
      const [rEquipe, rMissions, rAbsences, rPositions] = await Promise.all([
        fetch("/api/equipe").then((r) => r.json()).catch(() => ({})),
        fetch("/api/planning-missions").then((r) => r.json()).catch(() => ({})),
        fetch("/api/absences").then((r) => r.json()).catch(() => ({})),
        fetch("/api/position").then((r) => r.json()).catch(() => ({})),
      ]);
      setCollaborateurs(rEquipe.membres || []);
      setMissions(rMissions.missions || []);
      setAbsences(rAbsences.absences || []);
      setPositions(rPositions.positions || []);
    } catch (e) { console.error("Planning:", e); }
    setChargement(false);
  };
  useEffect(() => { charger(); }, [activeCompany?.id]);

  useEffect(() => {
    const i = setInterval(() => {
      fetch("/api/position").then((r) => r.json()).then((d) => { if (d.positions) setPositions(d.positions); }).catch(() => {});
    }, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (onglet !== "carte" || !carteDiv.current) return;

    const initCarte = () => {
      const L = (window as any).L;
      if (!L) return;
      if (!carteObjet.current) {
        carteObjet.current = L.map(carteDiv.current).setView([48.8566, 2.3522], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(carteObjet.current);
      }
      marqueurs.current.forEach((m) => carteObjet.current.removeLayer(m));
      marqueurs.current = [];

      const icone = L.divIcon({
        className: "", html: `<div style="background:${C.gold};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>`,
        iconSize: [14, 14],
      });

      positions.forEach((p: any) => {
        const nom = p.equipe ? `${p.equipe.prenom || ""} ${p.equipe.nom}`.trim() : "Collaborateur";
        const client = p.missions?.client_nom ? ` — ${p.missions.client_nom}` : "";
        const marker = L.marker([p.latitude, p.longitude], { icon: icone }).addTo(carteObjet.current);
        marker.bindPopup(`<b>${nom}</b>${client}`);
        marqueurs.current.push(marker);
      });

      if (positions.length > 0) {
        const groupe = L.featureGroup(marqueurs.current);
        carteObjet.current.fitBounds(groupe.getBounds().pad(0.3));
      }
    };

    if ((window as any).L) { initCarte(); return; }

    const lienCss = document.createElement("link");
    lienCss.rel = "stylesheet";
    lienCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(lienCss);

    const scriptJs = document.createElement("script");
    scriptJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    scriptJs.onload = initCarte;
    document.body.appendChild(scriptJs);
  }, [onglet, positions]);

  const creerMission = async () => {
    if (!missionForm.date_mission || !missionForm.heure_debut) return showToast("⚠️ Date et heure necessaires");
    if (missionForm.collaborateur_ids.length === 0) return showToast("⚠️ Choisissez au moins un collaborateur");
    try {
      const r = await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creer", ...missionForm, company_id: activeCompany?.id || null, cree_par: "equipe" }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("✅ Mission créée");
        setShowNouvelleMission(false);
        setMissionForm({ client_nom: "", client_email: "", client_tel: "", date_mission: "", heure_debut: "", heure_fin: "", adresse: "", notes: "", collaborateur_ids: [] });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const changerStatutMission = async (id: string, statut: string) => {
    try {
      await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "modifier_statut", id, statut }),
      });
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  const declarerAbsence = async () => {
    if (!absenceForm.employe_id || !absenceForm.debut) return showToast("⚠️ Collaborateur et date necessaires");
    try {
      const r = await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "declarer", ...absenceForm, declaree_par: "rh" }),
      });
      const d = await r.json();
      if (d.success) {
        showToast("✅ Absence déclarée");
        setShowDeclarerAbsence(false);
        setAbsenceForm({ employe_id: "", type: "conge_paye", debut: "", fin: "", motif: "" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const validerAbsence = async (id: string, statut: string) => {
    try {
      await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "valider", id, statut }),
      });
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  const confirmerDeclarationEmployeur = async (id: string) => {
    try {
      await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirmer_declaration_employeur", id }),
      });
      showToast("✅ Déclaration confirmée");
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  if (!hasAccess(plan, "planning")) return <div style={{ padding: 20 }}><UpgradeWall page="Planning & Agenda" plan={plan} /></div>;

  const tabs = [
    ["dispatch", "📊 Dispatch"],
    ["missions", "📋 Missions"],
    ["absences", "🏥 Absences"],
    ["carte", "📍 Carte"],
  ];

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const missionsAujourdhui = missions.filter((m) => m.date_mission === aujourdhui && m.statut !== "annule");
  const absencesEnAttente = absences.filter((a) => a.statut === "en_attente");
  const accidentsSansDeclaration = absences.filter((a) => a.type === "accident_travail" && a.employeur_alerte_le && !a.employeur_declare_le);

  return <div style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif" }}>⊡ Planning & {profil?.termes?.rdv || "Missions"}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{collaborateurs.length} collaborateur{collaborateurs.length > 1 ? "s" : ""} · {missionsAujourdhui.length} mission{missionsAujourdhui.length > 1 ? "s" : ""} aujourd'hui</div>
      </div>
    </div>

    {accidentsSansDeclaration.length > 0 && <Card style={{ marginBottom: 16, borderColor: `${C.red}55`, background: `${C.red}11` }}>
      <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 8 }}>⚠️ Déclaration accident du travail en attente</div>
      {accidentsSansDeclaration.map((a) => <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 11 }}>
        <span>{a.nom_employe} — signalé le {a.employeur_alerte_le ? new Date(a.employeur_alerte_le).toLocaleDateString("fr") : ""}</span>
        <Btn onClick={() => confirmerDeclarationEmployeur(a.id)} style={{ fontSize: 10, padding: "4px 10px", background: C.red }}>J'ai déclaré à l'organisme</Btn>
      </div>)}
    </Card>}

    <div style={{ marginBottom: 16, display: "flex", gap: 4, background: C.card2, borderRadius: 8, padding: 4, flexWrap: "wrap" }}>
      {tabs.map(([id, label]) => <button key={id} onClick={() => setOnglet(id)} style={{ background: onglet === id ? C.card : "transparent", color: onglet === id ? C.gold : C.muted, border: onglet === id ? `1px solid ${C.border}` : "1px solid transparent", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: onglet === id ? 700 : 400 }}>{label}</button>)}
    </div>

    {chargement && <div style={{ padding: 30, textAlign: "center", color: C.muted, fontSize: 12 }}>Chargement...</div>}

    {!chargement && onglet === "dispatch" && <div>
      {missionsAujourdhui.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Aucune mission aujourd'hui.</div></Card>}
      {missionsAujourdhui.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Heure</TH><TH>Client</TH><TH>Collaborateurs</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{missionsAujourdhui.map((m) => <tr key={m.id}>
            <Td style={{ color: C.gold, fontWeight: 700 }}>{m.heure_debut}</Td>
            <Td style={{ fontWeight: 600 }}>{m.client_nom || "—"}</Td>
            <Td style={{ fontSize: 11 }}>{(m.missions_collaborateurs || []).map((mc: any) => collaborateurs.find((c) => c.id === mc.collaborateur_id)?.nom).filter(Boolean).join(", ") || "—"}</Td>
            <Td><Pill color={m.statut === "termine" ? C.green : m.statut === "annule" ? C.red : C.blue}>{m.statut}</Pill></Td>
            <Td>
              {m.statut !== "termine" && m.statut !== "annule" && <div style={{ display: "flex", gap: 4 }}>
                <BtnGhost onClick={() => changerStatutMission(m.id, "confirme")} style={{ fontSize: 9, padding: "3px 8px" }}>Confirmer</BtnGhost>
                <BtnGhost onClick={() => changerStatutMission(m.id, "termine")} style={{ fontSize: 9, padding: "3px 8px" }}>Terminer</BtnGhost>
                <BtnGhost onClick={() => changerStatutMission(m.id, "annule")} style={{ fontSize: 9, padding: "3px 8px", color: C.red }}>Annuler</BtnGhost>
              </div>}
            </Td>
          </tr>)}</tbody>
        </table>
      </Card>}

      {absencesEnAttente.length > 0 && <Card style={{ marginTop: 16 }}>
        <STitle>Absences en attente de validation</STitle>
        {absencesEnAttente.map((a) => <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
          <div>{a.nom_employe} — {TYPE_LABELS[a.type] || a.type} du {a.debut} au {a.fin}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn onClick={() => validerAbsence(a.id, "validee")} style={{ fontSize: 10, padding: "4px 10px", background: C.green }}>Valider</Btn>
            <BtnGhost onClick={() => validerAbsence(a.id, "refusee")} style={{ fontSize: 10, padding: "4px 10px", color: C.red }}>Refuser</BtnGhost>
          </div>
        </div>)}
      </Card>}
    </div>}

    {!chargement && onglet === "missions" && <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn onClick={() => setShowNouvelleMission((v) => !v)}>+ Nouvelle mission</Btn>
      </div>
      {showNouvelleMission && <Card style={{ marginBottom: 16 }}>
        <STitle>Nouvelle mission</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <Inp value={missionForm.client_nom} onChange={(e: any) => setMissionForm((f) => ({ ...f, client_nom: e.target.value }))} placeholder="Nom du client" />
          <Inp value={missionForm.client_tel} onChange={(e: any) => setMissionForm((f) => ({ ...f, client_tel: e.target.value }))} placeholder="Téléphone" />
          <Inp type="date" value={missionForm.date_mission} onChange={(e: any) => setMissionForm((f) => ({ ...f, date_mission: e.target.value }))} />
          <Inp type="time" value={missionForm.heure_debut} onChange={(e: any) => setMissionForm((f) => ({ ...f, heure_debut: e.target.value }))} />
          <Inp value={missionForm.adresse} onChange={(e: any) => setMissionForm((f) => ({ ...f, adresse: e.target.value }))} placeholder="Adresse" style={{ gridColumn: "1 / -1" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Collaborateurs</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {collaborateurs.map((c) => <button key={c.id} onClick={() => setMissionForm((f) => ({ ...f, collaborateur_ids: f.collaborateur_ids.includes(c.id) ? f.collaborateur_ids.filter((id) => id !== c.id) : [...f.collaborateur_ids, c.id] }))} style={{ background: missionForm.collaborateur_ids.includes(c.id) ? C.gold : "transparent", color: missionForm.collaborateur_ids.includes(c.id) ? "#000" : C.text, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>{c.nom}</button>)}
            {collaborateurs.length === 0 && <div style={{ fontSize: 11, color: C.muted }}>Aucun collaborateur — ajoutez-en depuis le module Équipe.</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={creerMission}>✅ Créer</Btn>
          <BtnGhost onClick={() => setShowNouvelleMission(false)}>Annuler</BtnGhost>
        </div>
      </Card>}
      {missions.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Aucune mission.</div></Card>}
      {missions.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Date</TH><TH>Heure</TH><TH>Client</TH><TH>Statut</TH></tr></thead>
          <tbody>{missions.map((m) => <tr key={m.id}>
            <Td style={{ color: C.gold }}>{m.date_mission}</Td>
            <Td>{m.heure_debut}</Td>
            <Td style={{ fontWeight: 600 }}>{m.client_nom || "—"}</Td>
            <Td><Pill color={m.statut === "termine" ? C.green : m.statut === "annule" ? C.red : C.blue}>{m.statut}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {!chargement && onglet === "carte" && <div>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.muted }}>{positions.length} collaborateur{positions.length > 1 ? "s" : ""} en mission actuellement — position mise à jour toutes les 2 minutes</div>
      </Card>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div ref={carteDiv} style={{ width: "100%", height: 480 }} />
        {positions.length === 0 && <div style={{ padding: 30, textAlign: "center", color: C.muted, fontSize: 12 }}>Aucun collaborateur en mission pour le moment.</div>}
      </Card>
    </div>}

    {!chargement && onglet === "absences" && <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn onClick={() => setShowDeclarerAbsence((v) => !v)}>+ Déclarer une absence</Btn>
      </div>
      {showDeclarerAbsence && <Card style={{ marginBottom: 16 }}>
        <STitle>Déclarer une absence</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <select value={absenceForm.employe_id} onChange={(e) => setAbsenceForm((f) => ({ ...f, employe_id: e.target.value }))} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: 8, color: C.text, fontSize: 12 }}>
            <option value="">Choisir un collaborateur…</option>
            {collaborateurs.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={absenceForm.type} onChange={(e) => setAbsenceForm((f) => ({ ...f, type: e.target.value }))} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: 8, color: C.text, fontSize: 12 }}>
            {Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <Inp type="date" value={absenceForm.debut} onChange={(e: any) => setAbsenceForm((f) => ({ ...f, debut: e.target.value }))} />
          <Inp type="date" value={absenceForm.fin} onChange={(e: any) => setAbsenceForm((f) => ({ ...f, fin: e.target.value }))} />
          <Inp value={absenceForm.motif} onChange={(e: any) => setAbsenceForm((f) => ({ ...f, motif: e.target.value }))} placeholder="Motif (facultatif)" style={{ gridColumn: "1 / -1" }} />
        </div>
        {absenceForm.type === "accident_travail" && <div style={{ background: `${C.red}11`, border: `1px solid ${C.red}33`, borderRadius: 6, padding: 10, fontSize: 11, color: C.text, marginBottom: 10 }}>
          ⚠️ Un accident du travail déclenche une alerte : vous devrez confirmer votre propre déclaration à l'organisme dans le délai légal de votre pays.
        </div>}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={declarerAbsence}>✅ Déclarer</Btn>
          <BtnGhost onClick={() => setShowDeclarerAbsence(false)}>Annuler</BtnGhost>
        </div>
      </Card>}
      {absences.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Aucune absence.</div></Card>}
      {absences.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Collaborateur</TH><TH>Type</TH><TH>Du</TH><TH>Au</TH><TH>Statut</TH></tr></thead>
          <tbody>{absences.map((a) => <tr key={a.id}>
            <Td style={{ fontWeight: 600 }}>{a.nom_employe}</Td>
            <Td style={{ fontSize: 11 }}>{TYPE_LABELS[a.type] || a.type || a.motif || "—"}</Td>
            <Td style={{ fontSize: 11, color: C.muted }}>{a.debut}</Td>
            <Td style={{ fontSize: 11, color: C.muted }}>{a.fin}</Td>
            <Td><Pill color={a.statut === "validee" ? C.green : a.statut === "refusee" ? C.red : C.orange}>{a.statut}</Pill></Td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

  </div>;
};


export default PagePlanning;
