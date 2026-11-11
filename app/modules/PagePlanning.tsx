"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { C, Card, CT, Btn, BtnGhost, TH, Td, STitle, Pill, Inp } from "../lib/ui";
import { hasAccess } from "../lib/plans";
import { QRCodeSVG } from "qrcode.react";

const TYPE_LABELS: Record<string, string> = {
  conge_paye: "Congé payé", conge_sans_solde: "Congé sans solde",
  arret_maladie: "Arrêt maladie", accident_travail: "Accident du travail",
  evenement_familial: "Événement familial", enfant_malade: "Enfant malade",
  absence_injustifiee: "Absence injustifiée", retard: "Retard",
};

const PagePlanning = ({ plan, modulesActifs, showToast, profil, UpgradeWall, activeCompany }: any) => {
  const [onglet, setOnglet] = useState("dispatch");
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showNouvelleMission, setShowNouvelleMission] = useState(false);
  const [missionForm, setMissionForm] = useState({
    client_nom: "", client_email: "", client_tel: "", date_mission: "",
    heure_debut: "", duree: "", adresse: "", notes: "", collaborateur_ids: [] as string[], bien_id: "",
  });
  // Biens (logements) avec QR code de pointage
  const BIEN_VIDE = { id: "", nom: "", client_nom: "", type_bien: "", adresse: "", etage_porte: "", code_acces: "", code_boite_cles: "", emplacement_boite_cles: "", wifi: "", consignes: "", infos: "" };
  const [biens, setBiens] = useState<any[]>([]);
  const [bienForm, setBienForm] = useState<any>(null);
  const [qrOuvert, setQrOuvert] = useState<string | null>(null);
  const [detailMission, setDetailMission] = useState<string | null>(null);
  // Feuilles d'heures du mois (vue RH) + email de l'expert-comptable
  const [moisFH, setMoisFH] = useState(() => new Date().toISOString().slice(0, 7));
  const [feuillesFH, setFeuillesFH] = useState<any[] | null>(null);
  const [emailCompta, setEmailCompta] = useState("");
  const [envoiCabinet, setEnvoiCabinet] = useState(false);
  const [detailFH, setDetailFH] = useState<string | null>(null);
  const [showDeclarerAbsence, setShowDeclarerAbsence] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({ employe_id: "", type: "conge_paye", debut: "", fin: "", motif: "" });
  const [positions, setPositions] = useState<any[]>([]);
  const [signalements, setSignalements] = useState<any[]>([]);
  // Remplacement en un clic : mission ouverte, suggestions de remplacants, prevenir le client
  const [remplacement, setRemplacement] = useState<any>(null);
  const [suggestionsRempl, setSuggestionsRempl] = useState<any[] | null>(null);
  const [prevenirClient, setPrevenirClient] = useState(true);
  const [remplEnCours, setRemplEnCours] = useState(false);
  const carteDiv = useRef<HTMLDivElement>(null);
  const carteObjet = useRef<any>(null);
  const marqueurs = useRef<any[]>([]);

  const chargerJson = async (url: string) => {
    const controleur = new AbortController();
    const delai = window.setTimeout(() => controleur.abort(), 8000);
    try {
      const reponse = await fetch(url, { signal: controleur.signal });
      return await reponse.json().catch(() => ({}));
    } catch { return {}; }
    finally { window.clearTimeout(delai); }
  };

  const charger = async () => {
    setChargement(true);
    try {
      const [rEquipe, rMissions, rAbsences, rPositions, rSignalements] = await Promise.all([
        chargerJson("/api/equipe"),
        chargerJson("/api/planning-missions"),
        chargerJson("/api/absences"),
        chargerJson("/api/position"),
        chargerJson("/api/signalements"),
      ]);
      setCollaborateurs(rEquipe.membres || []);
      setMissions(rMissions.missions || []);
      setAbsences(rAbsences.absences || []);
      setPositions(rPositions.positions || []);
      setSignalements((rSignalements.signalements || []).filter((s: any) => s.statut !== "resolu"));
      chargerJson("/api/biens").then((d) => setBiens(d.biens || []));
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

  const confirmerAlertes = (alertes: { message: string }[]) => window.confirm(`⚠️ Alerte légale de planning\n\n${alertes.map((a) => `• ${a.message}`).join("\n")}\n\nCes contrôles sont préventifs. Confirmer quand même ?`);

  const creerMission = async (confirmer = false) => {
    if (!missionForm.date_mission || !missionForm.heure_debut) return showToast("⚠️ Date et heure necessaires");
    if (missionForm.collaborateur_ids.length === 0) return showToast("⚠️ Choisissez au moins un collaborateur");
    try {
      const r = await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creer", ...missionForm, confirmer_alertes: confirmer, company_id: activeCompany?.id || null, cree_par: "equipe" }),
      });
      const d = await r.json().catch(() => ({ error: `Réponse serveur invalide (${r.status})` }));
      if (d.confirmation_requise) { if (confirmerAlertes(d.alertes_legales || [])) await creerMission(true); return; }
      if (d.success) {
        showToast("✅ Mission créée");
        setShowNouvelleMission(false);
        setMissionForm({ client_nom: "", client_email: "", client_tel: "", date_mission: "", heure_debut: "", duree: "", adresse: "", notes: "", collaborateur_ids: [], bien_id: "" });
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Connexion impossible — réessayez"); }
  };

  const LIBELLE_STATUT: Record<string, string> = { propose: "Proposée", confirme: "Confirmée", en_route: "En route", en_cours: "En cours", termine: "Terminée", annule: "Annulée", reporte: "Reportée" };
  const changerStatutMission = async (id: string, statut: string) => {
    if (statut === "annule" && !window.confirm("Annuler cette mission ?")) return;
    try {
      const r = await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "modifier_statut", id, statut }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "non_autorise" ? "Action non autorisée" : (d.error || "Erreur"))); return; }
      showToast("✅ Mission " + (LIBELLE_STATUT[statut] || statut).toLowerCase());
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  const affecterMission = async (m: any, collaborateurId: string, confirmer = false) => {
    if (!collaborateurId) return;
    try {
      const r = await fetch("/api/planning-missions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "affecter", mission_id: m.id, collaborateur_id: collaborateurId, confirmer_alertes: confirmer }) });
      const d = await r.json().catch(() => ({}));
      if (d.confirmation_requise) { if (confirmerAlertes(d.alertes_legales || [])) await affecterMission(m, collaborateurId, true); return; }
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Erreur"))); return; }
      const c = d.canal === "whatsapp" ? "WhatsApp" : d.canal === "email" ? "email" : d.canal === "sms" ? "SMS" : null;
      showToast(`✅ Mission confiée à ${d.collaborateur}${c ? ` — prévenu par ${c}` : " — non prévenu (ni téléphone ni email)"}`);
      charger();
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const retirerCollaborateur = async (m: any, collaborateurId: string, nom: string) => {
    if (!window.confirm(`Retirer ${nom} de cette mission ?`)) return;
    try {
      const r = await fetch("/api/planning-missions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "retirer_collaborateur", mission_id: m.id, collaborateur_id: collaborateurId }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error || "Erreur")); return; }
      showToast(`${nom} retiré de la mission`);
      charger();
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const supprimerMission = async (m: any) => {
    if (!window.confirm(`Supprimer définitivement la mission du ${m.date_mission}${m.client_nom ? " chez " + m.client_nom : ""} ? Cette action est irréversible.`)) return;
    try {
      const r = await fetch("/api/planning-missions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "supprimer", id: m.id }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Suppression impossible"))); return; }
      showToast("🗑 Mission supprimée");
      setDetailMission(null);
      charger();
    } catch { showToast("❌ Erreur de connexion"); }
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
      const r = await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "valider", id, statut }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) showToast("❌ " + (d.error || "Action refusée"));
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  const confirmerDeclarationEmployeur = async (id: string) => {
    try {
      const r = await fetch("/api/absences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirmer_declaration_employeur", id }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Action refusée"))); return; }
      showToast("✅ Déclaration confirmée");
      charger();
    } catch { showToast("❌ Erreur"); }
  };

  if (!hasAccess(plan,"planning",modulesActifs)) return <div style={{ padding: 20 }}><UpgradeWall page="planning" plan={plan} /></div>;

  const ouvrirRemplacement = async (m: any, absence: any) => {
    setRemplacement({ mission: m, absence });
    setSuggestionsRempl(null);
    try {
      const r = await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggerer_collaborateurs", date_mission: m.date_mission, heure_debut: String(m.heure || "09:00").slice(0, 5), exclure_id: absence.employe_id }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error || "Suggestions indisponibles")); setSuggestionsRempl([]); return; }
      setSuggestionsRempl(d.suggestions || []);
    } catch { showToast("❌ Erreur de connexion"); setSuggestionsRempl([]); }
  };

  const confirmerRemplacement = async (nouveau: any, confirmer = false) => {
    if (!remplacement) return;
    setRemplEnCours(true);
    try {
      const r = await fetch("/api/planning-missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remplacer", mission_id: remplacement.mission.id, ancien_id: remplacement.absence.employe_id, nouveau_id: nouveau.id, prevenir_client: prevenirClient, confirmer_alertes: confirmer }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.confirmation_requise) { if (confirmerAlertes(d.alertes_legales || [])) await confirmerRemplacement(nouveau, true); return; }
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Remplacement impossible"))); setRemplEnCours(false); return; }
      const canal = (c: string | null) => c === "whatsapp" ? "WhatsApp" : c === "email" ? "email" : c === "sms" ? "SMS" : null;
      const info = [canal(d.canal_remplacant) ? `${d.remplacant} prévenu par ${canal(d.canal_remplacant)}` : `${d.remplacant} non prévenu (ni téléphone ni email joignable)`,
        prevenirClient ? (canal(d.canal_client) ? `client prévenu par ${canal(d.canal_client)}` : "client non prévenu (pas de coordonnées)") : null].filter(Boolean).join(" · ");
      showToast((canal(d.canal_remplacant) ? "✅ " : "⚠️ ") + "Mission confiée à " + d.remplacant + " — " + info);
      setRemplacement(null);
      charger();
    } catch { showToast("❌ Erreur de connexion"); }
    setRemplEnCours(false);
  };

  const enregistrerBien = async () => {
    if (!bienForm?.nom?.trim()) return showToast("⚠️ Donnez un nom au bien");
    try {
      const r = await fetch("/api/biens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: bienForm.id ? "modifier" : "creer", ...bienForm }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Erreur"))); return; }
      showToast(bienForm.id ? "✅ Bien mis à jour" : "✅ Bien créé — son QR code est prêt");
      setBienForm(null);
      if (!bienForm.id && d.bien?.id) setQrOuvert(d.bien.id);
      const l = await fetch("/api/biens").then((x) => x.json()).catch(() => ({}));
      setBiens(l.biens || []);
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const actionBien = async (b: any, action: "desactiver" | "nouveau_qr") => {
    const question = action === "desactiver" ? `Désactiver « ${b.nom} » ? Son QR code ne fonctionnera plus (l'historique est conservé).` : `Créer un nouveau QR code pour « ${b.nom} » ? L'ancien autocollant ne fonctionnera plus.`;
    if (!window.confirm(question)) return;
    try {
      const r = await fetch("/api/biens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id: b.id }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error || "Erreur")); return; }
      showToast(action === "desactiver" ? "Bien désactivé" : "✅ Nouveau QR code — pensez à réimprimer l'autocollant");
      const l = await fetch("/api/biens").then((x) => x.json()).catch(() => ({}));
      setBiens(l.biens || []);
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const lienQR = (b: any) => `${typeof window !== "undefined" ? window.location.origin : "https://xyraio.fr"}/b/${b.qr_token}`;
  const imprimerQR = (b: any) => {
    const el = document.getElementById("qr-" + b.id);
    if (!el) return;
    const esc = (t: string) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
    const w = window.open("", "_blank");
    if (!w) return showToast("⚠️ Autorisez l'ouverture de fenêtre pour imprimer");
    w.document.write(`<html><head><title>QR ${esc(b.nom)}</title></head><body style="font-family:sans-serif;text-align:center;padding:30px"><h2 style="margin:0 0 6px">${esc(b.nom)}</h2><div style="color:#555;margin-bottom:16px">${esc(b.adresse || "")}</div>${el.innerHTML}<p style="font-size:18px;margin-top:16px"><strong>Intervenant : scannez à votre arrivée et à votre départ</strong></p></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const chargerFH = async (mois: string) => {
    setFeuillesFH(null);
    try {
      const r = await fetch(`/api/feuilles-heures?mois=${mois}`);
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) { showToast("❌ " + (d.error === "reserve_au_proprietaire_ou_admin" ? "Réservé au propriétaire ou à un Admin" : (d.error || "Erreur"))); setFeuillesFH([]); return; }
      setFeuillesFH(d.feuilles || []); setEmailCompta(d.email_comptable || "");
    } catch { showToast("❌ Erreur de connexion"); setFeuillesFH([]); }
  };

  const postFH = async (payload: any) => {
    const r = await fetch("/api/feuilles-heures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) { showToast("❌ " + (d.error || "Erreur")); return null; }
    return d;
  };

  const envoyerAuCabinet = async () => {
    if (!emailCompta) return showToast("⚠️ Renseignez l'email de votre expert-comptable");
    if (!window.confirm(`Envoyer les variables de paie de ${moisFH} à ${emailCompta} ?`)) return;
    setEnvoiCabinet(true);
    const d = await postFH({ action: "envoyer_cabinet", mois: moisFH });
    if (d) { showToast(`✅ Envoyé à ${d.envoye_a}${d.non_signees?.length ? ` — non signées : ${d.non_signees.join(", ")}` : ""}`); chargerFH(moisFH); }
    setEnvoiCabinet(false);
  };

  const h = (min: number) => `${Math.floor((min || 0) / 60)}h${String((min || 0) % 60).padStart(2, "0")}`;

  const tabs = [
    ["dispatch", "📊 Dispatch"],
    ["missions", "📋 Missions"],
    ["absences", "🏥 Absences"],
    ["carte", "📍 Carte"],
    ["biens", "🏠 Biens & QR"],
    ["heures", "🕒 Feuilles d'heures"],
  ];

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const missionsAujourdhui = missions.filter((m) => m.date_mission === aujourdhui && m.statut !== "annule");
  const absencesEnAttente = absences.filter((a) => a.statut === "en_attente");
  const accidentsSansDeclaration = absences.filter((a) => a.type === "accident_travail" && a.employeur_alerte_le && !a.employeur_declare_le);
  // Missions a venir dont un collaborateur assigne est absent (absence validee ou en attente)
  const missionsACouvrir: { mission: any; absence: any }[] = [];
  for (const a of absences) {
    if (!["validee", "en_attente"].includes(a.statut) || a.type === "retard" || !a.employe_id) continue;
    const fin = a.fin || a.debut;
    for (const m of missions) {
      if (!m.date_mission || m.date_mission < aujourdhui || m.date_mission < a.debut || m.date_mission > fin) continue;
      if (["annule", "termine"].includes(m.statut)) continue;
      if ((m.missions_collaborateurs || []).some((c: any) => c.collaborateur_id === a.employe_id)) missionsACouvrir.push({ mission: m, absence: a });
    }
  }
  missionsACouvrir.sort((x, y) => (x.mission.date_mission + (x.mission.heure || "")).localeCompare(y.mission.date_mission + (y.mission.heure || "")));

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

    {missionsACouvrir.length > 0 && <Card style={{ marginBottom: 16, borderColor: `${C.gold}55`, background: `${C.gold}0D` }}>
      <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 8 }}>🔁 {missionsACouvrir.length} mission{missionsACouvrir.length > 1 ? "s" : ""} à couvrir — collaborateur absent</div>
      {missionsACouvrir.map(({ mission: m, absence: a }) => {
        const ouvert = remplacement?.mission?.id === m.id && remplacement?.absence?.employe_id === a.employe_id;
        return <div key={m.id + a.id} style={{ padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11 }}>
            <span><strong>{new Date(m.date_mission + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}{m.heure ? " · " + String(m.heure).slice(0, 5) : ""}</strong> — {m.client_nom || "Client"}{m.adresse ? ` (${m.adresse})` : ""} · <span style={{ color: C.red }}>{a.nom_employe} absent{a.statut === "en_attente" ? " (demande en attente)" : ""}</span></span>
            {!ouvert && <Btn onClick={() => ouvrirRemplacement(m, a)} style={{ fontSize: 10, padding: "4px 10px" }}>Remplacer</Btn>}
            {ouvert && <BtnGhost onClick={() => setRemplacement(null)} style={{ fontSize: 10, padding: "4px 10px" }}>Fermer</BtnGhost>}
          </div>
          {ouvert && <div style={{ marginTop: 8, padding: 10, background: C.card2, borderRadius: 8 }}>
            <label style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <input type="checkbox" checked={prevenirClient} onChange={(e) => setPrevenirClient(e.target.checked)} /> Prévenir le client du changement d'intervenant
            </label>
            {suggestionsRempl === null && <div style={{ fontSize: 11, color: C.muted }}>Recherche des collaborateurs disponibles…</div>}
            {suggestionsRempl !== null && suggestionsRempl.length === 0 && <div style={{ fontSize: 11, color: C.muted }}>Aucun collaborateur disponible sur ce créneau (tous absents ou déjà en mission).</div>}
            {(suggestionsRempl || []).slice(0, 5).map((sug: any, i: number) => <div key={sug.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 11 }}>
              <span>{i === 0 ? "⭐ " : ""}<strong>{sug.nom}</strong> <span style={{ color: C.muted }}>· {sug.missions_ce_jour} mission{sug.missions_ce_jour > 1 ? "s" : ""} ce jour{sug.zone_compatible ? "" : " · hors zone"}{sug.competence_compatible ? "" : " · compétence à vérifier"}</span></span>
              <Btn onClick={() => confirmerRemplacement(sug)} style={{ fontSize: 10, padding: "4px 10px", opacity: remplEnCours ? 0.5 : 1 }}>{remplEnCours ? "…" : "Confier la mission"}</Btn>
            </div>)}
          </div>}
        </div>;
      })}
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
            <Td style={{ color: C.gold, fontWeight: 700 }}>{m.heure}{(() => {
              // Prevu vs reel : heure d'arrivee pointee par le collaborateur, retard en couleur
              if (!m.heure_arrivee_reelle) return null;
              const hm = (t: string) => { const [h, mi] = String(t).slice(0, 5).split(":").map(Number); return h * 60 + (mi || 0); };
              const ecart = m.heure ? hm(m.heure_arrivee_reelle) - hm(m.heure) : 0;
              return <div style={{ fontSize: 9, fontWeight: 600, color: ecart > 10 ? C.red : C.green }}>arrivé {String(m.heure_arrivee_reelle).slice(0, 5)}{ecart > 10 ? ` (+${ecart} min)` : ""}{m.heure_fin_reelle ? ` · fini ${String(m.heure_fin_reelle).slice(0, 5)}` : ""}</div>;
            })()}</Td>
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

      {signalements.length > 0 && <Card style={{ marginTop: 16, borderColor: C.red + "44" }}>
        <STitle>🚨 Signalements en attente ({signalements.length})</STitle>
        {signalements.map((s: any) => {
          const auteur = collaborateurs.find((c) => c.id === s.collaborateur_id);
          const mission = missions.find((m) => m.id === s.mission_id);
          const couleurGravite = s.gravite === "haute" ? C.red : s.gravite === "moyen" ? C.orange : C.muted;
          return (
            <div key={s.id} style={{ padding: 12, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <Pill color={couleurGravite}>{s.gravite}</Pill>
                  <span style={{ fontSize: 11, color: C.muted }}>{s.type}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>— {auteur ? `${auteur.prenom || ""} ${auteur.nom}`.trim() : "Collaborateur"}{mission?.client_nom ? ` chez ${mission.client_nom}` : ""}</span>
                </div>
                <div style={{ fontSize: 13 }}>{s.contenu}</div>
              </div>
              <BtnGhost onClick={async () => {
                // La resolution (texte) est obligatoire cote serveur : on la demande, et on ne retire
                // le signalement de la liste que si le serveur a bien accepte.
                const resolution = window.prompt("Comment ce signalement a-t-il été résolu ?");
                if (!resolution?.trim()) return;
                const r = await fetch("/api/signalements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resoudre", id: s.id, resolution }) });
                const d = await r.json().catch(() => ({}));
                if (!r.ok || d.error) { showToast("❌ " + (d.error || "Action refusée")); return; }
                setSignalements((sig) => sig.filter((x) => x.id !== s.id));
              }} style={{ fontSize: 10, padding: "4px 10px", whiteSpace: "nowrap" as any }}>✓ Résolu</BtnGhost>
            </div>
          );
        })}
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
          {biens.length > 0 && <select value={missionForm.bien_id} onChange={(e: any) => { const b = biens.find((x) => x.id === e.target.value); setMissionForm((f) => ({ ...f, bien_id: e.target.value, ...(b ? { adresse: b.adresse || f.adresse, client_nom: b.client_nom || f.client_nom } : {}) })); }}
            style={{ gridColumn: "1 / -1", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 12, fontFamily: "inherit" }}>
            <option value="">🏠 Bien (logement) — facultatif, permet le pointage par QR code</option>
            {biens.map((b) => <option key={b.id} value={b.id}>{b.nom}{b.client_nom ? ` — ${b.client_nom}` : ""}</option>)}
          </select>}
          <Inp value={missionForm.client_nom} onChange={(e: any) => setMissionForm((f) => ({ ...f, client_nom: e.target.value }))} placeholder="Nom du client" />
          <Inp value={missionForm.client_tel} onChange={(e: any) => setMissionForm((f) => ({ ...f, client_tel: e.target.value }))} placeholder="Téléphone" />
          <Inp type="date" value={missionForm.date_mission} onChange={(e: any) => setMissionForm((f) => ({ ...f, date_mission: e.target.value }))} />
          <Inp type="time" value={missionForm.heure_debut} onChange={(e: any) => setMissionForm((f) => ({ ...f, heure_debut: e.target.value }))} />
          <Inp value={missionForm.duree} onChange={(e: any) => setMissionForm((f) => ({ ...f, duree: e.target.value }))} placeholder="Durée prévue (ex. 2h30)" />
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
          <thead><tr><TH>Date</TH><TH>Heure</TH><TH>Client / bien</TH><TH>Collaborateurs</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{missions.map((m) => {
            const bien = biens.find((b) => b.id === m.bien_id);
            const noms = (m.missions_collaborateurs || []).map((mc: any) => mc.equipe ? `${mc.equipe.prenom || ""} ${mc.equipe.nom || ""}`.trim() : collaborateurs.find((c) => c.id === mc.collaborateur_id)?.nom).filter(Boolean).join(", ");
            const ouverte = detailMission === m.id;
            return <Fragment key={m.id}>
              <tr onClick={() => setDetailMission(ouverte ? null : m.id)} style={{ cursor: "pointer" }}>
                <Td style={{ color: C.gold }}>{new Date(m.date_mission + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</Td>
                <Td>{String(m.heure || "").slice(0, 5)}{m.heure_arrivee_reelle && <div style={{ fontSize: 9, color: C.green }}>arrivé {String(m.heure_arrivee_reelle).slice(0, 5)}{m.heure_fin_reelle ? ` · fini ${String(m.heure_fin_reelle).slice(0, 5)}` : ""}</div>}</Td>
                <Td style={{ fontWeight: 600 }}>{m.client_nom || "—"}{bien && <div style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>🏠 {bien.nom}</div>}</Td>
                <Td style={{ fontSize: 11 }}>
                  <div>{noms || <span style={{ color: C.red }}>personne</span>}</div>
                  {!["termine", "annule"].includes(m.statut) && <select value="" onClick={(e) => e.stopPropagation()} onChange={(e) => affecterMission(m, e.target.value)}
                    style={{ marginTop: 4, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 6px", color: C.gold, fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>
                    <option value="">👤 Confier à…</option>
                    {collaborateurs.filter((c) => !(m.missions_collaborateurs || []).some((mc: any) => mc.collaborateur_id === c.id)).map((c) => <option key={c.id} value={c.id}>{`${c.prenom || ""} ${c.nom || ""}`.trim()}</option>)}
                  </select>}
                </Td>
                <Td><Pill color={m.statut === "termine" ? C.green : m.statut === "annule" ? C.red : m.statut === "en_cours" ? C.gold : C.blue}>{LIBELLE_STATUT[m.statut] || m.statut}</Pill></Td>
                <Td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                  {m.statut === "propose" && <BtnGhost onClick={() => changerStatutMission(m.id, "confirme")} style={{ fontSize: 9, padding: "3px 8px" }}>Confirmer</BtnGhost>}
                  {!["termine", "annule"].includes(m.statut) && <BtnGhost onClick={() => changerStatutMission(m.id, "termine")} style={{ fontSize: 9, padding: "3px 8px" }}>Terminer</BtnGhost>}
                  {!["termine", "annule"].includes(m.statut) && <BtnGhost onClick={() => changerStatutMission(m.id, "annule")} style={{ fontSize: 9, padding: "3px 8px", color: C.red }}>Annuler</BtnGhost>}
                  {m.statut !== "termine" && <BtnGhost onClick={() => supprimerMission(m)} style={{ fontSize: 9, padding: "3px 8px", color: C.red }}>🗑 Supprimer</BtnGhost>}
                </div></Td>
              </tr>
              {ouverte && <tr><td colSpan={6} style={{ padding: "10px 14px", background: C.card2, fontSize: 11, lineHeight: 1.7 }}>
                {m.service && <div><strong>Prestation :</strong> {m.service}</div>}
                <div><strong>Adresse :</strong> {m.adresse || bien?.adresse || "—"}</div>
                {bien && <div><strong>Bien :</strong> {bien.nom} — QR code dans l'onglet « Biens & QR »</div>}
                {(m.client_tel || m.client_email) && <div><strong>Client :</strong> {[m.client_tel, m.client_email].filter(Boolean).join(" · ")}</div>}
                <div><strong>Collaborateurs :</strong> {(m.missions_collaborateurs || []).length === 0 ? "aucun" : (m.missions_collaborateurs || []).map((mc: any) => {
                  const nom = mc.equipe ? `${mc.equipe.prenom || ""} ${mc.equipe.nom || ""}`.trim() : (collaborateurs.find((c) => c.id === mc.collaborateur_id)?.nom || "?");
                  return <span key={mc.collaborateur_id} style={{ marginRight: 10 }}>{nom}{!["termine", "annule"].includes(m.statut) && <button onClick={() => retirerCollaborateur(m, mc.collaborateur_id, nom)} style={{ marginLeft: 4, background: "transparent", border: "none", color: C.red, cursor: "pointer", fontSize: 11 }}>✕</button>}</span>;
                })}</div>
                <div><strong>Pointage :</strong> {m.heure_arrivee_reelle ? `arrivée ${String(m.heure_arrivee_reelle).slice(0, 5)}` : "pas encore arrivé"}{m.heure_fin_reelle ? ` · fin ${String(m.heure_fin_reelle).slice(0, 5)}` : ""}</div>
                {m.notes && <div><strong>Notes :</strong> {m.notes}</div>}
              </td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
      </Card>}
    </div>}

    {!chargement && onglet === "heures" && <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input type="month" value={moisFH} max={new Date().toISOString().slice(0, 7)} onChange={(e) => { if (e.target.value) { setMoisFH(e.target.value); chargerFH(e.target.value); } }}
          style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontFamily: "inherit", fontSize: 12 }} />
        <BtnGhost onClick={() => chargerFH(moisFH)} style={{ fontSize: 11 }}>{feuillesFH === null ? "Afficher" : "Actualiser"}</BtnGhost>
        <a href={`/api/feuilles-heures?mois=${moisFH}&format=csv`} style={{ fontSize: 11, color: C.gold, textDecoration: "none", border: `1px solid ${C.gold}55`, borderRadius: 6, padding: "6px 10px" }}>📥 Export CSV (variables de paie)</a>
      </div>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Email de votre expert-comptable (reçoit les variables de paie du mois)</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Inp value={emailCompta} onChange={(e: any) => setEmailCompta(e.target.value)} placeholder="cabinet@exemple.fr" style={{ flex: 1, minWidth: 200 }} />
          <BtnGhost onClick={async () => { if (await postFH({ action: "email_comptable", email: emailCompta })) showToast("✅ Email du cabinet enregistré"); }} style={{ fontSize: 11 }}>Enregistrer</BtnGhost>
          <Btn onClick={envoyerAuCabinet} style={{ fontSize: 11 }}>{envoiCabinet ? "Envoi…" : "📧 Envoyer au cabinet"}</Btn>
        </div>
      </Card>
      {feuillesFH === null && <Card style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 12, color: C.muted }}>Choisissez un mois puis cliquez sur « Afficher ».</div></Card>}
      {feuillesFH && feuillesFH.length === 0 && <Card style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 12, color: C.muted }}>Aucun collaborateur.</div></Card>}
      {feuillesFH && feuillesFH.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Collaborateur</TH><TH>Heures</TH><TH>Au-delà contrat</TH><TH>Absences</TH><TH>Acomptes</TH><TH>Frais</TH><TH>Feuille</TH><TH></TH></tr></thead>
          <tbody>{feuillesFH.map((f) => <Fragment key={f.employe.id}>
            <tr>
              <Td style={{ fontWeight: 600 }}>{f.employe.nom}<div style={{ fontSize: 9, color: C.muted }}>{f.employe.contrat || ""} · {f.employe.heures_semaine} h/sem.</div></Td>
              <Td style={{ color: C.gold, fontWeight: 700 }}>{h(f.total_minutes)}</Td>
              <Td style={{ color: f.minutes_au_dela > 0 ? C.orange : C.muted }}>{h(f.minutes_au_dela)}</Td>
              <Td style={{ fontSize: 11 }}>{f.absences.reduce((s: number, a: any) => s + a.jours, 0)} j</Td>
              <Td style={{ fontSize: 11 }}>{f.acomptes_total} €</Td>
              <Td style={{ fontSize: 11 }}>{f.frais_total} €</Td>
              <Td style={{ fontSize: 10 }}>{f.signee_le ? <span style={{ color: C.green }}>✔ signée{f.validee_le ? " · validée" : ""}</span> : <span style={{ color: C.muted }}>non signée</span>}{f.envoyee_cabinet_le ? <div style={{ color: C.muted }}>envoyée {new Date(f.envoyee_cabinet_le).toLocaleDateString("fr-FR")}</div> : null}</Td>
              <Td><div style={{ display: "flex", gap: 4 }}>
                <BtnGhost onClick={() => setDetailFH(detailFH === f.employe.id ? null : f.employe.id)} style={{ fontSize: 9, padding: "3px 8px" }}>Détail</BtnGhost>
                {f.signee_le && !f.validee_le && <Btn onClick={async () => { if (await postFH({ action: "valider", mois: moisFH, employe_id: f.employe.id })) { showToast("✅ Feuille validée"); chargerFH(moisFH); } }} style={{ fontSize: 9, padding: "3px 8px" }}>Valider</Btn>}
              </div></Td>
            </tr>
            {detailFH === f.employe.id && <tr><td colSpan={8} style={{ padding: "8px 14px", background: C.card2, fontSize: 11 }}>
              {f.jours.length === 0 && <span style={{ color: C.muted }}>Aucune heure pointée ce mois-ci.</span>}
              {f.jours.map((j: any) => <div key={j.date} style={{ padding: "3px 0" }}><strong>{new Date(j.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</strong> — {h(j.minutes)} · <span style={{ color: C.muted }}>{j.lignes.map((l: any) => `${l.libelle}${l.arrivee ? ` (${l.arrivee}→${l.fin || "…"})` : ""}`).join(" ; ")}</span></div>)}
            </td></tr>}
          </Fragment>)}</tbody>
        </table>
      </Card>}
      <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>Heures calculées à partir des pointages réels (QR code, boutons d'arrivée/fin, pointage du jour). Les majorations et la paie sont établies par le cabinet à partir de ces variables.</div>
    </div>}

    {!chargement && onglet === "biens" && <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
        <div style={{ fontSize: 11, color: C.muted }}>Un QR code par logement : l'intervenant le scanne en arrivant et en partant. Il voit les codes d'accès et toutes les infos du bien, et vous êtes prévenu.</div>
        <Btn onClick={() => setBienForm(bienForm ? null : { ...BIEN_VIDE })}>{bienForm && !bienForm.id ? "Fermer" : "+ Nouveau bien"}</Btn>
      </div>
      {bienForm && <Card style={{ marginBottom: 16 }}>
        <STitle>{bienForm.id ? "Modifier le bien" : "Nouveau bien"}</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <Inp value={bienForm.nom || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, nom: e.target.value }))} placeholder="Nom du bien * (ex. Studio Marais)" />
          <Inp value={bienForm.client_nom || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, client_nom: e.target.value }))} placeholder="Propriétaire / client" />
          <Inp value={bienForm.type_bien || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, type_bien: e.target.value }))} placeholder="Type (appartement, maison…)" />
          <Inp value={bienForm.etage_porte || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, etage_porte: e.target.value }))} placeholder="Étage, porte, bâtiment" />
          <Inp value={bienForm.adresse || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, adresse: e.target.value }))} placeholder="Adresse complète" style={{ gridColumn: "1 / -1" }} />
          <Inp value={bienForm.code_acces || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, code_acces: e.target.value }))} placeholder="Code d'entrée (porte, digicode)" />
          <Inp value={bienForm.code_boite_cles || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, code_boite_cles: e.target.value }))} placeholder="Code de la boîte à clés" />
          <Inp value={bienForm.emplacement_boite_cles || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, emplacement_boite_cles: e.target.value }))} placeholder="Où se trouve la boîte à clés" style={{ gridColumn: "1 / -1" }} />
          <Inp value={bienForm.wifi || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, wifi: e.target.value }))} placeholder="Wi-Fi (réseau / mot de passe)" style={{ gridColumn: "1 / -1" }} />
          <textarea value={bienForm.consignes || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, consignes: e.target.value }))} placeholder="Consignes : check-list ménage, linge, poubelles, alarme…" rows={3} style={{ gridColumn: "1 / -1", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
          <textarea value={bienForm.infos || ""} onChange={(e: any) => setBienForm((f: any) => ({ ...f, infos: e.target.value }))} placeholder="Autres infos utiles : parking, animaux, points d'attention…" rows={3} style={{ gridColumn: "1 / -1", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>🔒 Les codes ne sont montrés qu'à l'intervenant qui a une mission dans ce bien le jour même (et à vous).</div>
        <div style={{ display: "flex", gap: 8 }}><Btn onClick={enregistrerBien}>Enregistrer</Btn><BtnGhost onClick={() => setBienForm(null)}>Annuler</BtnGhost></div>
      </Card>}
      {biens.length === 0 && !bienForm && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Aucun bien pour le moment. Créez-en un pour obtenir son QR code.</div></Card>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {biens.map((b) => <Card key={b.id}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🏠 {b.nom}</div>
          {b.client_nom && <div style={{ fontSize: 11, color: C.muted }}>{b.client_nom}</div>}
          {b.adresse && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.adresse}</div>}
          {b.qr_token && qrOuvert === b.id && <div style={{ textAlign: "center", margin: "12px 0" }}>
            <div id={"qr-" + b.id} style={{ background: "#fff", padding: 10, display: "inline-block", borderRadius: 8 }}><QRCodeSVG value={lienQR(b)} size={180} level="M" /></div>
          </div>}
          {b.qr_token && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <BtnGhost onClick={() => setQrOuvert(qrOuvert === b.id ? null : b.id)} style={{ fontSize: 10, padding: "4px 10px" }}>{qrOuvert === b.id ? "Masquer le QR" : "📱 QR code"}</BtnGhost>
            {qrOuvert === b.id && <Btn onClick={() => imprimerQR(b)} style={{ fontSize: 10, padding: "4px 10px" }}>🖨 Imprimer</Btn>}
            <BtnGhost onClick={() => setBienForm({ ...BIEN_VIDE, ...b })} style={{ fontSize: 10, padding: "4px 10px" }}>Modifier</BtnGhost>
            <BtnGhost onClick={() => actionBien(b, "nouveau_qr")} style={{ fontSize: 10, padding: "4px 10px" }}>Nouveau QR</BtnGhost>
            <BtnGhost onClick={() => actionBien(b, "desactiver")} style={{ fontSize: 10, padding: "4px 10px", color: C.red }}>Désactiver</BtnGhost>
          </div>}
        </Card>)}
      </div>
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
