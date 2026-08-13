"use client";
import { useState } from "react";
import Entete from "../composants/Entete";
import Photo from "../composants/Photo";
import Pied from "../composants/Pied";

const OR = "#c9a96e";
const IVOIRE = "#f0ead6";
const NOIR = "#0a0a0a";
const GRIS = "#78716a";
const GRIS_CLAIR = "#a39c8e";
const TRAIT = "#1f1c16";

export default function Rejoindre() {
  const [faqOuverte, setFaqOuverte] = useState(-1);
  const [form, setForm] = useState({
    nom: "", email: "", tel: "", societe: "", siren: "",
    metier: "", pays: "", ville: "", recherche: "", propose: "", coopte_par: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  const candidater = async () => {
    if (envoi) return;
    if (!form.nom || !form.email || !form.metier) {
      setErreur("Nom, email et metier sont necessaires"); return;
    }
    setEnvoi(true); setErreur("");
    try {
      const res = await fetch("/api/club", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "candidature", ...form }),
      });
      const data = await res.json();
      if (data.success) setEnvoye(true);
      else setErreur(data.error || "Une erreur est survenue");
    } catch { setErreur("Erreur de connexion"); }
    setEnvoi(false);
  };

  const champ = (cle: string, libelle: string, type = "text") => (
    <div>
      <label style={{ fontSize: 11, color: GRIS, display: "block", marginBottom: 6 }}>{libelle}</label>
      <input type={type} value={(form as any)[cle]}
        onChange={(e) => setForm({ ...form, [cle]: e.target.value })}
        style={{ width: "100%", background: "transparent", border: `0.5px solid ${TRAIT}`, borderRadius: 2, padding: "11px 14px", color: IVOIRE, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
    </div>
  );

  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@media (max-width: 820px) { .duo { grid-template-columns: 1fr !important; } .grand-titre { font-size: 28px !important; } }`}</style>
      <Entete />

      <section style={{ padding: "60px 32px 44px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", marginBottom: 14 }}>REJOINDRE LE CLUB</div>
        <h1 className="grand-titre" style={{ fontFamily: "Georgia,serif", fontSize: 36, fontStyle: "italic", lineHeight: 1.2, maxWidth: 560, margin: "0 0 20px", fontWeight: 400 }}>
          Comment devenir membre
        </h1>
        <p style={{ fontSize: 14, color: GRIS, maxWidth: 520, lineHeight: 1.9 }}>
          Toutes les candidatures ne sont pas retenues. La place de votre metier dans votre zone peut deja etre prise.
        </p>
      </section>

      <Photo nom="rejoindre.jpg" hauteur={340} />

      <section style={{ padding: "60px 32px", maxWidth: 720, margin: "0 auto", borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {[
            ["01", "Pre-inscription", "Le formulaire prend quelques minutes. Il ne vous engage a rien."],
            ["02", "Entretien", "Un echange pour faire connaissance et repondre a vos questions."],
            ["03", "Examen du dossier", "Nous verifions la societe et la place disponible dans votre metier."],
            ["04", "Invitation officielle", "Si le dossier est retenu, vous recevez les modalites d'adhesion."],
            ["05", "Vous etes membre", "Apres reglement, l'annuaire et les evenements vous sont ouverts."],
          ].map(([num, titre, texte], i) => (
            <div key={i} style={{ display: "flex", gap: 24 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 24, color: OR, minWidth: 38 }}>{num}</div>
              <div>
                <div style={{ fontSize: 15, color: IVOIRE, marginBottom: 6 }}>{titre}</div>
                <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>{texte}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 32px", maxWidth: 700, margin: "0 auto", borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 26, marginBottom: 26 }}>Questions frequentes</div>
        {[
          ["Suis-je engage si je depose une candidature ?", "Aucunement. C'est une premiere prise de contact. Vous restez libre a chaque etape, et le paiement n'intervient qu'apres acceptation."],
          ["Pourquoi un seul membre par metier ?", "Pour qu'aucun membre ne soit en concurrence avec un autre. Une recommandation n'a de valeur que s'il n'y a pas d'ambiguite sur qui la recoit."],
          ["Qui sont les membres du club ?", "Des entrepreneurs et dirigeants, en France et en Afrique francophone, qui cherchent a developper leur activite par la recommandation."],
          ["Que se passe-t-il au bout d'un an ?", "Vous choisissez de renouveler ou non. Aucun prelevement automatique. Un mois de battement vous est laisse avant la sortie."],
          ["Le club est-il ouvert a l'international ?", "Oui, sous reserve que la place de votre metier soit libre dans votre zone."],
        ].map(([q, r], i) => (
          <div key={i} style={{ borderBottom: `0.5px solid ${TRAIT}` }}>
            <div onClick={() => setFaqOuverte(faqOuverte === i ? -1 : i)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "17px 0", cursor: "pointer", fontSize: 13, color: GRIS_CLAIR }}>
              <span>{q}</span>
              <span style={{ color: GRIS, fontSize: 17 }}>{faqOuverte === i ? "\u2212" : "+"}</span>
            </div>
            {faqOuverte === i && <div style={{ fontSize: 12, color: GRIS, lineHeight: 1.8, paddingBottom: 18 }}>{r}</div>}
          </div>
        ))}
      </section>

      <section id="formulaire" style={{ padding: "56px 32px 72px", maxWidth: 620, margin: "0 auto" }}>
        {envoye ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 28, color: OR, marginBottom: 16 }}>Candidature recue</div>
            <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>Nous revenons vers vous rapidement.<br />Votre dossier va etre examine.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 28, marginBottom: 10 }}>Deposer une candidature</div>
            <div style={{ fontSize: 12, color: GRIS, marginBottom: 32, lineHeight: 1.8 }}>Quelques minutes suffisent. Aucun engagement, aucun paiement a cette etape.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("nom", "Nom et prenom")}{champ("email", "Email", "email")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("tel", "Telephone")}{champ("societe", "Societe")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("siren", "SIREN ou equivalent")}{champ("metier", "Metier")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("pays", "Pays")}{champ("ville", "Ville")}
              </div>
              {champ("recherche", "Ce que vous cherchez")}
              {champ("propose", "Ce que vous proposez")}
              {champ("coopte_par", "Coopte par (facultatif)")}
              {erreur && <div style={{ fontSize: 12, color: "#c96e6e" }}>{erreur}</div>}
              <div onClick={candidater}
                style={{ marginTop: 10, padding: "15px", background: OR, color: NOIR, fontSize: 13, textAlign: "center", cursor: envoi ? "default" : "pointer", opacity: envoi ? 0.5 : 1 }}>
                {envoi ? "Envoi en cours..." : "Envoyer ma candidature"}
              </div>
            </div>
          </>
        )}
      </section>

      <Pied />
    </div>
  );
}
