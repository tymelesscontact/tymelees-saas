"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const C = {
  dark: "#06060E", card: "#0C0C1A", card2: "#121222",
  border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
  muted: "#5A5A7A", green: "#2EC9B0",
};

export default function CarrieresPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [entreprise, setEntreprise] = useState<any>(null);
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [offreOuverte, setOffreOuverte] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", email: "", tel: "", message: "" });
  const [cvFichier, setCvFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState<string | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState("");

  useEffect(() => {
    fetch(`/api/recrutement?action=public_offres&slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setErreur(data.error);
        else { setEntreprise(data.entreprise); setOffres(data.offres); }
        setLoading(false);
      })
      .catch(() => { setErreur("Erreur de chargement"); setLoading(false); });
  }, [slug]);

  const postuler = async (offreId: string) => {
    if (!form.nom) { setErreurEnvoi("Le nom est requis"); return; }
    setEnvoi(true);
    setErreurEnvoi("");
    try {
      const fd = new FormData();
      fd.append("offre_id", offreId);
      fd.append("nom", form.nom);
      fd.append("email", form.email);
      fd.append("tel", form.tel);
      fd.append("message", form.message);
      if (cvFichier) fd.append("cv", cvFichier);
      const res = await fetch("/api/recrutement", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) { setErreurEnvoi(data.error || "Erreur d'envoi"); setEnvoi(false); return; }
      setEnvoye(offreId);
      setForm({ nom: "", email: "", tel: "", message: "" });
      setCvFichier(null);
    } catch {
      setErreurEnvoi("Erreur de connexion");
    }
    setEnvoi(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "sans-serif" }}>Chargement...</div>;
  if (erreur || !entreprise) return <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", color: "#FF5252", fontFamily: "sans-serif" }}>{erreur || "Page introuvable"}</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "sans-serif", padding: "0 0 60px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, borderBottom: `1px solid ${C.border}`, padding: "40px 20px", textAlign: "center" }}>
        {entreprise.logo_url && <img src={entreprise.logo_url} alt="" style={{ height: 48, marginBottom: 16 }} />}
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>{entreprise.societe}</div>
        <div style={{ fontSize: 13, color: C.muted }}>Rejoignez l'équipe{entreprise.ville ? ` — ${entreprise.ville}` : ""}</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "30px 20px" }}>
        {offres.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 40, fontSize: 13 }}>Aucun poste ouvert pour le moment.</div>
        ) : offres.map((o) => (
          <div key={o.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOffreOuverte(offreOuverte === o.id ? null : o.id)}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{o.titre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{o.type_contrat}{o.lieu ? ` · ${o.lieu}` : ""}{o.salaire_min ? ` · ${o.salaire_min}€${o.salaire_max ? `–${o.salaire_max}€` : ""}` : ""}</div>
              </div>
              <div style={{ color: C.gold, fontSize: 18 }}>{offreOuverte === o.id ? "−" : "+"}</div>
            </div>
            {offreOuverte === o.id && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                {o.description && <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text, marginBottom: 18, whiteSpace: "pre-line" }}>{o.description}</div>}
                {envoye === o.id ? (
                  <div style={{ background: `${C.green}11`, border: `1px solid ${C.green}44`, borderRadius: 8, padding: 14, fontSize: 13, color: C.green, textAlign: "center" }}>✅ Candidature envoyée — merci, nous reviendrons vers vous rapidement.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} placeholder="Nom complet *" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                    <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                    <input value={form.tel} onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))} placeholder="Téléphone" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                    <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Message (facultatif)" rows={3} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
                    <label style={{ fontSize: 11, color: C.muted }}>CV (PDF)<br /><input type="file" accept="application/pdf" onChange={(e) => setCvFichier(e.target.files?.[0] || null)} style={{ fontSize: 12, color: C.text, marginTop: 4 }} /></label>
                    {erreurEnvoi && <div style={{ fontSize: 11, color: "#FF5252" }}>{erreurEnvoi}</div>}
                    <button onClick={() => postuler(o.id)} disabled={envoi} style={{ background: C.gold, color: "#000", border: "none", borderRadius: 7, padding: "10px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", marginTop: 4 }}>{envoi ? "Envoi..." : "Envoyer ma candidature"}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
