"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function PageSignature() {
  const params = useParams();
  const token = params?.token as string;
  const [code, setCode] = useState("");
  const [etape, setEtape] = useState("code");
  const [contrat, setContrat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [nomTape, setNomTape] = useState("");
  const [accepte, setAccepte] = useState(false);

  const verifierCode = async () => {
    if (!code) return setErreur("Entrez le code reçu par email");
    setLoading(true);
    setErreur("");
    try {
      const res = await fetch('/api/contrats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifier_code', lien_token: token, code }),
      });
      const data = await res.json();
      if (data.success) {
        setContrat(data.contrat);
        if (data.contrat.statut === 'signe') setEtape('deja_signe');
        else setEtape('document');
      } else {
        setErreur(data.error || 'Code incorrect');
      }
    } catch (e) {
      setErreur('Erreur de connexion');
    }
    setLoading(false);
  };

  const signer = async () => {
    if (!nomTape) return setErreur("Tapez votre nom complet pour signer");
    if (!accepte) return setErreur("Vous devez cocher la case de consentement");
    setLoading(true);
    setErreur("");
    try {
      const res = await fetch('/api/contrats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signer', lien_token: token, nom_tape: nomTape }),
      });
      const data = await res.json();
      if (data.success) setEtape('signe');
      else setErreur(data.error || 'Erreur lors de la signature');
    } catch (e) {
      setErreur('Erreur de connexion');
    }
    setLoading(false);
  };

  const S = { bg: "#0A0A16", card: "#12121E", border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE", muted: "#5A5A7A", green: "#2EC9B0", red: "#E5484D" };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 560, width: "100%", background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 32 }}>
        <div style={{ fontSize: 12, color: S.gold, letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>Xyra · Signature électronique</div>

        {etape === "code" && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 10 }}>Vérification d'identité</div>
            <div style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>Entrez le code de vérification reçu par email pour accéder au document.</div>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code à 6 chiffres" maxLength={6}
              style={{ width: "100%", padding: 14, background: "#0C0C1A", border: `1px solid ${S.border}`, borderRadius: 8, color: S.text, fontSize: 20, textAlign: "center", letterSpacing: "0.3em", marginBottom: 14 }} />
            {erreur && <div style={{ color: S.red, fontSize: 12, marginBottom: 14 }}>{erreur}</div>}
            <button onClick={verifierCode} disabled={loading}
              style={{ width: "100%", padding: 14, background: S.gold, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {loading ? "Vérification..." : "Vérifier le code"}
            </button>
          </>
        )}

        {etape === "document" && contrat && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 4 }}>{contrat.titre}</div>
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 16 }}>Pour : {contrat.signataire_nom}</div>
            <div style={{ background: "#0C0C1A", border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, maxHeight: 320, overflowY: "auto", fontSize: 12, color: S.text, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 18 }}>
              {contrat.contenu_final}
            </div>
            <input value={nomTape} onChange={e => setNomTape(e.target.value)} placeholder="Tapez votre nom complet pour signer"
              style={{ width: "100%", padding: 12, background: "#0C0C1A", border: `1px solid ${S.border}`, borderRadius: 8, color: S.text, fontSize: 14, marginBottom: 12 }} />
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: S.muted, marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={accepte} onChange={e => setAccepte(e.target.checked)} style={{ marginTop: 2 }} />
              Je reconnais avoir lu et compris ce document, et je consens à le signer électroniquement. Cette signature a la même valeur juridique qu'une signature manuscrite.
            </label>
            {erreur && <div style={{ color: S.red, fontSize: 12, marginBottom: 14 }}>{erreur}</div>}
            <button onClick={signer} disabled={loading}
              style={{ width: "100%", padding: 14, background: S.green, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {loading ? "Signature..." : "✓ Signer le document"}
            </button>
          </>
        )}

        {etape === "signe" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 8 }}>Document signé avec succès</div>
            <div style={{ fontSize: 13, color: S.muted }}>Une confirmation a été enregistrée. Vous pouvez fermer cette page.</div>
          </div>
        )}

        {etape === "deja_signe" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📄</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 8 }}>Ce document a déjà été signé</div>
            <div style={{ fontSize: 13, color: S.muted }}>Aucune action supplémentaire n'est nécessaire.</div>
          </div>
        )}
      </div>
    </div>
  );
}
