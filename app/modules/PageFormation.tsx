"use client";
import { useState, useEffect } from "react";
import { C, Card, Btn, BtnGhost, TH, Td, KPI, STitle, St, Inp, Sel } from "../lib/ui";
import { hasAccess } from "../lib/plans";

const PageFormation = ({ plan, modulesActifs, showToast, UpgradeWall }: any) => {
  const [membres, setMembres] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [titre, setTitre] = useState("");
  const [employeId, setEmployeId] = useState("");
  const [assignerModele, setAssignerModele] = useState<any>(null);
  const [assignerEmploye, setAssignerEmploye] = useState("");
  const [showAjoutModele, setShowAjoutModele] = useState(false);
  const [modeleTitre, setModeleTitre] = useState("");
  const [modeleDesc, setModeleDesc] = useState("");
  const [modeleFichier, setModeleFichier] = useState<File | null>(null);
  const [envoiModele, setEnvoiModele] = useState(false);
  const [videoOuverte, setVideoOuverte] = useState<any>(null);

  const charger = async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/equipe");
      const d = await res.json();
      const m = d.membres || [];
      setMembres(m);
      setCatalogue(d.catalogue || []);
      const toutes = m.flatMap((e: any) =>
        (e.formations || []).map((f: any) => ({ ...f, employe_nom: `${e.prenom || ""} ${e.nom}`.trim() }))
      );
      setFormations(toutes);
    } catch { showToast("❌ Erreur de chargement"); }
    setChargement(false);
  };
  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    if (!titre.trim()) return showToast("⚠️ Le titre est necessaire");
    if (!employeId) return showToast("⚠️ Choisis un employé");
    try {
      const res = await fetch("/api/equipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ajouter_formation", employe_id: employeId, titre, statut: "à faire" }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("✅ Formation ajoutée");
        setShowAdd(false); setTitre(""); setEmployeId("");
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const assigner = async () => {
    if (!assignerEmploye) return showToast("⚠️ Choisis un employé");
    try {
      const res = await fetch("/api/equipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ajouter_formation", employe_id: assignerEmploye, catalogue_id: assignerModele.id, statut: "à faire" }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`✅ "${assignerModele.titre}" assignée`);
        setAssignerModele(null); setAssignerEmploye("");
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  const ajouterModele = async () => {
    if (!modeleTitre.trim()) return showToast("⚠️ Le titre est necessaire");
    if (!modeleFichier) return showToast("⚠️ Choisis un fichier vidéo");
    setEnvoiModele(true);
    try {
      const fd = new FormData();
      fd.append("titre", modeleTitre);
      fd.append("description", modeleDesc);
      fd.append("video", modeleFichier);
      const res = await fetch("/api/equipe", { method: "POST", body: fd });
      const d = await res.json();
      if (d.success) {
        showToast("✅ Vidéo ajoutée à la bibliothèque");
        setShowAjoutModele(false); setModeleTitre(""); setModeleDesc(""); setModeleFichier(null);
        charger();
      } else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
    setEnvoiModele(false);
  };

  const majStatut = async (f: any, nouveauStatut: string) => {
    let score: any = f.score;
    if (nouveauStatut === "complété") {
      const saisie = window.prompt(`Score obtenu pour "${f.titre}" (0-100) :`, "90");
      if (saisie === null) return;
      score = Number(saisie);
      if (Number.isNaN(score) || score < 0 || score > 100) return showToast("⚠️ Score invalide (0-100)");
    }
    try {
      const res = await fetch("/api/equipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "maj_formation", id: f.id, statut: nouveauStatut, score }),
      });
      const d = await res.json();
      if (d.success) { showToast("✅ Formation mise à jour"); charger(); }
      else showToast("❌ " + (d.error || "Erreur"));
    } catch { showToast("❌ Erreur de connexion"); }
  };

  if (!hasAccess(plan, "formation", modulesActifs)) return <div style={{ padding: 20 }}><UpgradeWall page="formation" plan={plan} /></div>;

  const completees = formations.filter(f => f.statut === "complété").length;
  const avecScore = formations.filter(f => f.score !== null && f.score !== undefined);
  const scoreMoyen = avecScore.length ? Math.round(avecScore.reduce((a, f) => a + (f.score || 0), 0) / avecScore.length) : 0;

  return <div style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif" }}>⊿ Formation équipe</div>
      <Btn onClick={() => setShowAdd(s => !s)}>+ Nouvelle formation</Btn>
    </div>
    <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Normes sectorielles · Certifications · Protocoles · Vente modules</div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
      <KPI label="Formations" val={formations.length} color={C.blue} />
      <KPI label="Complétées" val={completees} color={C.green} />
      <KPI label="Score moyen" val={avecScore.length ? `${scoreMoyen}%` : "—"} color={C.gold} />
    </div>

    {showAdd && <Card style={{ marginBottom: 14, borderColor: `${C.gold}44` }}>
      <STitle>Nouvelle formation</STitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Titre *</label>
          <Inp value={titre} onChange={(e: any) => setTitre(e.target.value)} placeholder="Ex. Accueil client VIP" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Employé *</label>
          <Sel value={employeId} onChange={(e: any) => setEmployeId(e.target.value)} style={{ width: "100%" }}>
            <option value="">— Choisir —</option>
            {membres.map((m: any) => <option key={m.id} value={m.id}>{`${m.prenom || ""} ${m.nom}`.trim()}</option>)}
          </Sel>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={ajouter}>✅ Ajouter</Btn>
        <BtnGhost onClick={() => setShowAdd(false)}>Annuler</BtnGhost>
      </div>
    </Card>}

    {/* ─── Bibliothèque de formations vidéo ─── */}
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <STitle>🎬 Bibliothèque de formations</STitle>
        <BtnGhost onClick={() => setShowAjoutModele(s => !s)} style={{ fontSize: 10, padding: "4px 10px" }}>+ Ajouter une vidéo</BtnGhost>
      </div>

      {showAjoutModele && <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Titre *</label>
            <Inp value={modeleTitre} onChange={(e: any) => setModeleTitre(e.target.value)} placeholder="Ex. Nettoyage jet privé" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Fichier vidéo *</label>
            <input type="file" accept="video/*" onChange={(e: any) => setModeleFichier(e.target.files?.[0] || null)} style={{ fontSize: 11, color: C.text }} />
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Description</label>
          <Inp value={modeleDesc} onChange={(e: any) => setModeleDesc(e.target.value)} placeholder="Résumé du protocole" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={ajouterModele}>{envoiModele ? "Envoi..." : "✅ Ajouter à la bibliothèque"}</Btn>
          <BtnGhost onClick={() => setShowAjoutModele(false)}>Annuler</BtnGhost>
        </div>
      </div>}

      {catalogue.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: "10px 0" }}>Aucune vidéo pour l'instant.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {catalogue.map((v: any) => <div key={v.id} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          {v.video_url && <video src={v.video_url} style={{ width: "100%", height: 120, objectFit: "cover", background: "#000", cursor: "pointer" }} onClick={() => setVideoOuverte(v)} />}
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{v.titre}</div>
            {v.description && <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{v.description}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              <BtnGhost onClick={() => setVideoOuverte(v)} style={{ fontSize: 10, padding: "4px 8px" }}>▶ Regarder</BtnGhost>
              <Btn onClick={() => setAssignerModele(v)} style={{ fontSize: 10, padding: "4px 8px" }}>+ Assigner</Btn>
            </div>
          </div>
        </div>)}
      </div>
    </Card>

    {videoOuverte && <div onClick={() => setVideoOuverte(null)} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ maxWidth: 800, width: "100%" }}>
        <div style={{ color: "#fff", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>{videoOuverte.titre}</div>
        <video src={videoOuverte.video_url} controls autoPlay style={{ width: "100%", borderRadius: 10, maxHeight: "75vh" }} />
        <div style={{ textAlign: "right", marginTop: 8 }}><BtnGhost onClick={() => setVideoOuverte(null)} style={{ fontSize: 11 }}>Fermer</BtnGhost></div>
      </div>
    </div>}

    {assignerModele && <div onClick={() => setAssignerModele(null)} style={{ position: "fixed", inset: 0, background: "#000000aa", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, width: 320 }}>
        <STitle>Assigner "{assignerModele.titre}"</STitle>
        <Sel value={assignerEmploye} onChange={(e: any) => setAssignerEmploye(e.target.value)} style={{ width: "100%", marginBottom: 12 }}>
          <option value="">— Choisir un employé —</option>
          {membres.map((m: any) => <option key={m.id} value={m.id}>{`${m.prenom || ""} ${m.nom}`.trim()}</option>)}
        </Sel>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={assigner}>✅ Assigner</Btn>
          <BtnGhost onClick={() => setAssignerModele(null)}>Annuler</BtnGhost>
        </div>
      </div>
    </div>}

    {chargement && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 12, color: C.muted }}>Chargement...</div></Card>}

    {!chargement && formations.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}>
      <div style={{ fontSize: 12, color: C.muted }}>Aucune formation enregistrée. Ajoute la première formation d'un employé.</div>
    </Card>}

    {!chargement && formations.length > 0 && <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 0" }}><STitle>📋 Suivi individuel</STitle></div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Formation</TH><TH>Employé</TH><TH>Statut</TH><TH>Score</TH><TH>Actions</TH></tr></thead>
        <tbody>{formations.map((f) => {
          const modele = f.catalogue_id ? catalogue.find((c: any) => c.id === f.catalogue_id) : null;
          return <tr key={f.id}>
            <Td style={{ fontWeight: 600 }}>{f.titre}</Td>
            <Td style={{ color: C.muted }}>{f.employe_nom}</Td>
            <Td><St s={f.statut} /></Td>
            <Td style={{ color: f.score >= 90 ? C.green : f.score >= 70 ? C.gold : C.muted, fontWeight: 700 }}>{f.score != null ? `${f.score}%` : "—"}</Td>
            <Td>
              <div style={{ display: "flex", gap: 6 }}>
                {modele && <BtnGhost onClick={() => setVideoOuverte(modele)} style={{ padding: "4px 8px", fontSize: 10 }}>▶ Vidéo</BtnGhost>}
                {f.statut === "à faire" && <Btn onClick={() => majStatut(f, "en cours")} style={{ padding: "4px 8px", fontSize: 10 }}>▶ Démarrer</Btn>}
                {f.statut === "en cours" && <Btn onClick={() => majStatut(f, "complété")} style={{ padding: "4px 8px", fontSize: 10, background: C.green }}>✅ Terminer</Btn>}
                {f.statut === "complété" && <BtnGhost onClick={() => majStatut(f, "en cours")} style={{ padding: "4px 8px", fontSize: 10 }}>↺ Refaire</BtnGhost>}
              </div>
            </Td>
          </tr>;
        })}</tbody>
      </table>
    </Card>}
  </div>;
};

export default PageFormation;
