"use client";
// Page ouverte en scannant le QR code colle dans un bien (logement).
// 1er scan = arrivee, 2e scan = depart ; affiche l'agent, la date, l'heure,
// les codes d'acces et toutes les infos du bien (seulement si une mission est prevue ici aujourd'hui).
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const C = {
  dark: "#06060E", card: "#0C0C1A", card2: "#121222", border: "#1E1E36", gold: "#C9A84C",
  text: "#EAE6DE", muted: "#7A7A9A", green: "#2EC9B0", red: "#FF5252", orange: "#FF8C3A",
};

const LIBELLES: Record<string, string> = {
  arrivee: "Arrivée pointée",
  depart: "Départ pointé — mission terminée",
  deja_arrive: "Arrivée déjà pointée",
  deja_termine: "Mission déjà terminée",
  consultation: "Fiche du bien (consultation)",
};

function Ligne({ label, valeur, gros }: { label: string; valeur?: string | null; gros?: boolean }) {
  if (!valeur) return null;
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: gros ? 24 : 14, fontWeight: gros ? 800 : 500, color: gros ? C.gold : C.text, letterSpacing: gros ? 2 : 0, whiteSpace: "pre-wrap" }}>{valeur}</div>
    </div>
  );
}

// Confettis maison (aucune librairie) : 160 morceaux colores qui tombent ~4 s
function lancerConfettis() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const couleurs = ["#C9A84C", "#2EC9B0", "#FF5F9E", "#4B7BFF", "#FF8C3A", "#9B5FFF", "#FFFFFF"];
  const morceaux = Array.from({ length: 160 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 120, y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
    t: Math.random() * 8 + 5, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    c: couleurs[Math.floor(Math.random() * couleurs.length)],
  }));
  const debut = performance.now();
  const image = (now: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of morceaux) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.t / 2, -p.t / 4, p.t, p.t / 2); ctx.restore();
    }
    if (now - debut < 4200) requestAnimationFrame(image); else canvas.remove();
  };
  requestAnimationFrame(image);
}

function formatDuree(min?: number | null) {
  if (min == null) return "";
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

// Chronometre en direct depuis l'heure d'arrivee (HH:MM du jour, heure du telephone)
function Chrono({ depuis }: { depuis: string }) {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setMaintenant(Date.now()), 1000); return () => clearInterval(i); }, []);
  const [h, m] = depuis.split(":").map(Number);
  const debut = new Date(); debut.setHours(h, m || 0, 0, 0);
  let s = Math.max(0, Math.floor((maintenant - debut.getTime()) / 1000));
  if (s > 20 * 3600) s = 0;
  const p = (n: number) => String(n).padStart(2, "0");
  return <div style={{ fontSize: 44, fontWeight: 900, color: C.gold, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>{p(Math.floor(s / 3600))}:{p(Math.floor((s % 3600) / 60))}:{p(s % 60)}</div>;
}

function chronoFixe(min?: number | null) {
  if (min == null) return "";
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}:00`;
}

export default function ScanBien() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [etat, setEtat] = useState<"chargement" | "ok" | "connexion" | "erreur">("chargement");
  const [res, setRes] = useState<any>(null);
  const [erreur, setErreur] = useState("");
  const dejaEnvoye = useRef(false);

  useEffect(() => {
    if (!token || dejaEnvoye.current) return;
    dejaEnvoye.current = true; // un seul pointage par ouverture de page
    fetch("/api/biens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scan", token }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) { setEtat("connexion"); return; }
        if (!r.ok || d.error) { setErreur(d.error || "Pointage impossible"); setEtat("erreur"); return; }
        setRes(d); setEtat("ok");
        if (d.action === "depart") setTimeout(lancerConfettis, 150);
      })
      .catch(() => { setErreur("Pas de connexion internet"); setEtat("erreur"); });
  }, [token]);

  const dateFr = (iso: string) => iso ? new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";


  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif", marginBottom: 16 }}>XYRA</div>

        {etat === "chargement" && <div style={{ color: C.muted, fontSize: 14 }}>Pointage en cours…</div>}

        {etat === "connexion" && <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Connectez-vous pour pointer</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Connectez-vous à votre espace Xyra, puis scannez à nouveau le QR code.</div>
          <a href="/login" style={{ display: "inline-block", background: C.gold, color: "#000", padding: "10px 18px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>Se connecter</a>
        </div>}

        {etat === "erreur" && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}55`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 6 }}>⚠️ {erreur}</div>
        </div>}

        {etat === "ok" && res && (res.action === "depart" || res.action === "deja_termine") && <div style={{ textAlign: "center", background: `linear-gradient(160deg, ${C.green}22, ${C.gold}22)`, border: `1px solid ${C.green}66`, borderRadius: 16, padding: "26px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 46, lineHeight: 1 }}>🎉</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green, margin: "10px 0 4px" }}>{res.action === "depart" ? "Bravo !" : "Mission déjà terminée"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Fin de mission{res.agent ? `, ${res.agent.split(" ")[0]}` : ""}</div>
          {res.duree_minutes != null && <div style={{ fontSize: 13, color: C.muted }}>Temps passé sur la mission</div>}
          {res.duree_minutes != null && <div style={{ fontSize: 44, fontWeight: 900, color: C.gold, letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>⏱ {chronoFixe(res.duree_minutes)}</div>}
          {res.duree_minutes != null && <div style={{ fontSize: 13, color: C.muted }}>soit {formatDuree(res.duree_minutes)}</div>}
          <div style={{ fontSize: 14, marginTop: 10 }}>{res.heure_arrivee ? `Arrivée ${res.heure_arrivee} · ` : ""}Fin <strong>{res.heure_fin || res.heure}</strong></div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{dateFr(res.date)}</div>
          <div style={{ fontSize: 13, marginTop: 12 }}>🏠 {res.bien?.nom}</div>
        </div>}

        {etat === "ok" && res && res.action !== "depart" && res.action !== "deja_termine" && <>
          <div style={{ background: res.action === "depart" || res.action === "deja_termine" ? `${C.green}18` : `${C.gold}18`, border: `1px solid ${res.action === "depart" || res.action === "deja_termine" ? C.green : C.gold}66`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{res.action === "arrivee" ? "📍 " : res.action === "depart" ? "✅ " : "ℹ️ "}{LIBELLES[res.action] || "Pointage"}</div>
            <div style={{ fontSize: 14 }}><strong>{res.agent}</strong></div>
            <div style={{ fontSize: 13, color: C.muted }}>{dateFr(res.date)} · {res.heure}</div>
            {res.mission?.service && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Mission : {res.mission.service}{res.mission.heure ? ` (prévue à ${String(res.mission.heure).slice(0, 5)})` : ""}</div>}
            {(res.action === "arrivee" || res.action === "deja_arrive") && res.heure_arrivee && <div style={{ textAlign: "center", margin: "14px 0 4px" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>⏱ Mission en cours depuis {res.heure_arrivee}</div>
              <Chrono depuis={res.heure_arrivee} />
            </div>}
            {(res.action === "arrivee" || res.action === "deja_arrive") && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Scannez à nouveau ce QR code en partant pour pointer votre départ.</div>}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 16px 10px" }}>
            <Ligne label="Bien" valeur={`${res.bien.nom}${res.bien.type_bien ? " · " + res.bien.type_bien : ""}`} />
            <Ligne label="Client" valeur={res.bien.client_nom} />
            <Ligne label="Adresse" valeur={res.bien.adresse} />
            <Ligne label="Étage / porte" valeur={res.bien.etage_porte} />
            <Ligne label="🔑 Code de la boîte à clés" valeur={res.bien.code_boite_cles} gros />
            <Ligne label="Emplacement de la boîte à clés" valeur={res.bien.emplacement_boite_cles} />
            <Ligne label="🚪 Code d'entrée" valeur={res.bien.code_acces} gros />
            <Ligne label="📶 Wi-Fi" valeur={res.bien.wifi} />
            <Ligne label="📋 Consignes" valeur={res.bien.consignes} />
            <Ligne label="ℹ️ Infos utiles" valeur={res.bien.infos} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 12, textAlign: "center" }}>Ces codes sont confidentiels : ne les partagez pas.</div>
        </>}
      </div>
    </div>
  );
}
