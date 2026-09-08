"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

const C = {
  dark: "#06060E", card: "#0C0C1A", card2: "#121222",
  border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
  muted: "#5A5A7A", green: "#2EC9B0", red: "#FF5252",
};

function DevisPublicPageInner() {
  const params = useParams();
  const reference = params.reference as string;
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || "";
  const [devis, setDevis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [etape, setEtape] = useState(1);
  const [nomSignature, setNomSignature] = useState("");
  const [signing, setSigning] = useState(false);
  const [confirmRefus, setConfirmRefus] = useState(false);
  const [refusing, setRefusing] = useState(false);

  useEffect(() => {
    if (!token) {
      setErreur("Lien invalide");
      setLoading(false);
      return;
    }
    fetch("/api/devis?action=public&reference=" + reference + "&token=" + encodeURIComponent(token))
      .then(r => r.json())
      .then(d => {
        if (d.devis) setDevis(d.devis);
        else setErreur(d.error || "Devis introuvable");
        setLoading(false);
      })
      .catch(() => { setErreur("Erreur de connexion"); setLoading(false); });
  }, [reference, token]);

  const signer = async () => {
    if (!nomSignature.trim()) return;
    setSigning(true);
    try {
      const res = await fetch("/api/devis/signer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, token, email: devis.client_email, nom: nomSignature }),
      });
      const data = await res.json();
      if (data.success) {
        setDevis((d: any) => ({ ...d, statut: "signé" }));
        setEtape(3);
      } else {
        setErreur(data.error || "Erreur lors de la signature");
      }
    } catch (e) {
      setErreur("Erreur de connexion");
    }
    setSigning(false);
  };

  const refuser = async () => {
    setRefusing(true);
    try {
      const res = await fetch("/api/devis/refuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, token }),
      });
      const data = await res.json();
      if (data.success) {
        setDevis((d: any) => ({ ...d, statut: "refusé" }));
      } else {
        setErreur(data.error || "Erreur lors du refus");
      }
    } catch (e) {
      setErreur("Erreur de connexion");
    }
    setRefusing(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
    </div>
  );

  if (erreur || !devis) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, fontFamily: "'Segoe UI',sans-serif", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 20, color: C.red }}>Erreur : {erreur || "Devis introuvable"}</div>
    </div>
  );

  const lignesHtml = (devis.lignes || []).map((l: any, i: number) => (
    <tr key={i}>
      <td style={{ padding: "8px 0", borderBottom: "1px solid #1E1E3633" }}>{l.desc}</td>
      <td style={{ padding: "8px 0", textAlign: "center", borderBottom: "1px solid #1E1E3633" }}>{l.qte}</td>
      <td style={{ padding: "8px 0", textAlign: "right", borderBottom: "1px solid #1E1E3633" }}>{l.pu} EUR</td>
      <td style={{ padding: "8px 0", textAlign: "right", borderBottom: "1px solid #1E1E3633" }}>{(l.qte * l.pu).toFixed(2)} EUR</td>
    </tr>
  ));

  const dejaSigne = devis.statut === "signé" || devis.statut === "payé";
  const dejaRefuse = devis.statut === "refusé";

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI',sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {devis?.tenant_snapshot?.logo_url ? (
            <img src={devis.tenant_snapshot.logo_url} alt={devis.tenant_snapshot.societe || "Logo"} style={{ height: 40, marginBottom: 4 }} />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.15em", color: C.gold, fontFamily: "Georgia,serif" }}>{devis?.tenant_snapshot?.societe || "XYRA"}</div>
          )}
        </div>
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Devis {devis.reference}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Pour {devis.client_nom} - {devis.service}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: 8, color: C.muted }}>Description</th>
                <th style={{ paddingBottom: 8, color: C.muted }}>Qte</th>
                <th style={{ textAlign: "right", paddingBottom: 8, color: C.muted }}>PU</th>
                <th style={{ textAlign: "right", paddingBottom: 8, color: C.muted }}>Total</th>
              </tr>
            </thead>
            <tbody>{lignesHtml}</tbody>
          </table>
          <div style={{ textAlign: "right", fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 20 }}>
            Total TTC : {devis.montant} EUR
          </div>

          {dejaSigne ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>OK</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>Ce devis a deja ete signe</div>
            </div>
          ) : dejaRefuse ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✕</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.red }}>Ce devis a ete refuse</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>L'entreprise a ete informee de votre reponse.</div>
            </div>
          ) : etape === 1 ? (
            confirmRefus ? (
              <div>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 14, textAlign: "center" }}>Confirmer le refus de ce devis ?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={refuser} disabled={refusing} style={{ flex: 1, background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: refusing ? 0.6 : 1 }}>
                    {refusing ? "..." : "Confirmer le refus"}
                  </button>
                  <button onClick={() => setConfirmRefus(false)} disabled={refusing} style={{ flex: 1, background: "transparent", color: C.muted, border: "1px solid " + C.border, borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEtape(2)} style={{ flex: 1, background: C.green, color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Accepter et signer ce devis
                </button>
                <button onClick={() => setConfirmRefus(true)} style={{ background: "transparent", color: C.red, border: "1px solid " + C.red, borderRadius: 8, padding: "12px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Refuser
                </button>
              </div>
            )
          ) : etape === 2 ? (
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tapez votre nom pour valider votre signature :</div>
              <input value={nomSignature} onChange={e => setNomSignature(e.target.value)} placeholder="Votre nom" style={{ background: C.card2, border: "1px solid " + C.border, borderRadius: 6, padding: "10px", color: C.text, fontSize: 13, width: "100%", marginBottom: 10, boxSizing: "border-box" }} />
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Signature electronique conforme eIDAS</div>
              <button onClick={signer} disabled={signing || !nomSignature.trim()} style={{ width: "100%", background: C.green, color: "#000", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: signing ? 0.6 : 1 }}>
                {signing ? "Signature en cours..." : "Confirmer ma signature"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>OK</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 8 }}>Devis signe avec succes !</div>
              <div style={{ fontSize: 12, color: C.muted }}>Vous recevrez une confirmation par email.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DevisPublicPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, fontFamily: "'Segoe UI',sans-serif" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      </div>
    }>
      <DevisPublicPageInner />
    </Suspense>
  );
}
