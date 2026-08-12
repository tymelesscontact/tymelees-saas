"use client";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════
   VOS PHOTOS
   Deposez-les dans  public/club/  avec ces noms exacts :
     hero.jpg          l'image principale, en haut
     rarete.jpg        bloc "un seul par metier"
     relation.jpg      bloc "les mises en relation"
     evenement.jpg     bandeau evenement
     galerie-1.jpg  a  galerie-6.jpg    la galerie qui defile
     temoin-1.jpg   a  temoin-3.jpg     les temoignages
   Pour changer une photo : remplacez le fichier. C'est tout.
   ═══════════════════════════════════════════════════════════ */

const OR = "#c9a96e";
const IVOIRE = "#f0ead6";
const NOIR = "#0a0a0a";
const GRIS = "#78716a";
const GRIS_CLAIR = "#a39c8e";
const TRAIT = "#1f1c16";

function Photo({ nom, hauteur, style = {} }: any) {
  const [absente, setAbsente] = useState(false);
  if (absente) {
    return (
      <div style={{ height: hauteur, background: "#151208", display: "flex", alignItems: "center", justifyContent: "center", color: "#33302a", fontSize: 11, letterSpacing: "0.15em", ...style }}>
        {nom.toUpperCase()}
      </div>
    );
  }
  return (
    <img src={`/club/${nom}`} alt="" onError={() => setAbsente(true)}
      style={{ height: hauteur, width: "100%", objectFit: "cover", display: "block", ...style }} />
  );
}

export default function ClubPrive() {
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      <style>{`
        @keyframes defile { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .piste { display: flex; gap: 14px; width: max-content; animation: defile 50s linear infinite; }
        .piste:hover { animation-play-state: paused; }
        input::placeholder { color: #4f4a43; }
        @media (max-width: 820px) {
          .duo { grid-template-columns: 1fr !important; }
          .trio { grid-template-columns: 1fr !important; }
          .six { grid-template-columns: 1fr 1fr !important; }
          .grand-titre { font-size: 30px !important; }
        }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", borderBottom: `0.5px solid ${TRAIT}`, position: "sticky", top: 0, background: NOIR, zIndex: 50 }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontStyle: "italic", color: OR }}>Xyra Club</div>
        <a href="#candidature" style={{ border: `0.5px solid ${OR}`, color: OR, padding: "9px 18px", fontSize: 11, letterSpacing: "0.1em", textDecoration: "none" }}>DEVENIR MEMBRE</a>
      </nav>

      <section style={{ padding: "64px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <h1 className="grand-titre" style={{ fontFamily: "Georgia,serif", fontSize: 42, fontStyle: "italic", lineHeight: 1.15, maxWidth: 620, margin: "0 0 22px", fontWeight: 400 }}>
          Rejoignez le club prive des entrepreneurs qui font affaire ensemble
        </h1>
        <p style={{ fontSize: 15, color: GRIS, maxWidth: 500, lineHeight: 1.8, margin: "0 0 30px" }}>
          Un seul representant par metier et par zone. Vous dites ce que vous cherchez, le club vous presente qui le fait.
        </p>
        <a href="#candidature" style={{ display: "inline-block", padding: "14px 30px", background: OR, color: NOIR, fontSize: 13, textDecoration: "none", marginBottom: 56 }}>
          Je m&apos;inscris sur liste d&apos;attente
        </a>
      </section>

      <Photo nom="hero.jpg" hauteur={460} />

      <section className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <Photo nom="rarete.jpg" hauteur={300} />
        <div style={{ padding: "56px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", marginBottom: 14 }}>LA RARETE</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 26, lineHeight: 1.35, marginBottom: 14 }}>Votre place, ou celle d&apos;un autre.</div>
          <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>Un architecte a Abidjan. Un notaire a Lyon. Jamais deux.</div>
        </div>
      </section>

      <section className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "56px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", marginBottom: 14 }}>LES MISES EN RELATION</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 26, lineHeight: 1.35, marginBottom: 14 }}>Vous ne cherchez plus.</div>
          <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>Vous dites ce dont vous avez besoin. Lea vous presente qui le fait.</div>
        </div>
        <Photo nom="relation.jpg" hauteur={300} />
      </section>

      <section style={{ padding: "56px 0", borderTop: `0.5px solid ${TRAIT}`, borderBottom: `0.5px solid ${TRAIT}`, overflow: "hidden" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", textAlign: "center", marginBottom: 28 }}>LE CLUB EN IMAGES</div>
        <div className="piste">
          {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((n, i) => (
            <div key={i} style={{ width: 300, flexShrink: 0 }}>
              <Photo nom={`galerie-${n}.jpg`} hauteur={200} style={{ borderRadius: 3 }} />
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", marginBottom: 28 }}>AVANTAGES RESERVES AUX MEMBRES</div>
        <div className="six" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "34px 28px" }}>
          {[
            ["Un seul par metier", "Aucune concurrence interne, par zone."],
            ["Mise en relation ciblee", "Lea vous presente qui correspond."],
            ["Deals securises", "Contrat signe, paiement protege."],
            ["Diners et rencontres", "En France et en Afrique."],
            ["L'outil Xyra", "Devis, factures, stock inclus."],
            ["Bilan annuel", "Ce que le club vous a rapporte."],
          ].map(([titre, texte], i) => (
            <div key={i}>
              <div style={{ width: 26, height: 1, background: OR, marginBottom: 14 }} />
              <div style={{ fontSize: 14, color: IVOIRE, marginBottom: 7 }}>{titre}</div>
              <div style={{ fontSize: 12, color: GRIS, lineHeight: 1.7 }}>{texte}</div>
            </div>
          ))}
        </div>
      </section>

      <Photo nom="evenement.jpg" hauteur={320} />

      <section style={{ padding: "56px 32px", maxWidth: 1100, margin: "0 auto", borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", marginBottom: 8 }}>REJOIGNEZ-NOUS</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 28, marginBottom: 34 }}>Comment devenir membre</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {[
            ["01", "Pre-inscription", "Le formulaire prend quelques minutes. Il ne vous engage a rien."],
            ["02", "Entretien", "Un echange pour faire connaissance et repondre a vos questions."],
            ["03", "Examen du dossier", "Nous verifions la societe et la place disponible dans votre metier."],
            ["04", "Invitation officielle", "Si le dossier est retenu, vous recevez les modalites d'adhesion."],
            ["05", "Vous etes membre", "Apres reglement, l'annuaire et les evenements vous sont ouverts."],
          ].map(([num, titre, texte], i) => (
            <div key={i} style={{ display: "flex", gap: 22 }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 22, color: OR, minWidth: 34 }}>{num}</div>
              <div>
                <div style={{ fontSize: 14, color: IVOIRE, marginBottom: 5 }}>{titre}</div>
                <div style={{ fontSize: 12, color: GRIS, lineHeight: 1.75 }}>{texte}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 32px", maxWidth: 1100, margin: "0 auto", borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a7a55", textAlign: "center", marginBottom: 10 }}>TEMOIGNAGES</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 26, textAlign: "center", marginBottom: 34 }}>Nos membres parlent du club</div>
        <div className="trio" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <Photo nom={`temoin-${n}.jpg`} hauteur={230} style={{ borderRadius: 3 }} />
              <div style={{ fontSize: 13, color: IVOIRE, marginTop: 12 }}>&nbsp;</div>
              <div style={{ fontSize: 11, color: GRIS }}>&nbsp;</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 32px", maxWidth: 620, margin: "0 auto", borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 28, marginBottom: 26 }}>L&apos;adhesion au club</div>
        <div style={{ border: `0.5px solid ${TRAIT}`, padding: 32, borderRadius: 3 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 34, color: OR }}>2 000 &euro;</div>
            <div style={{ fontSize: 13, color: GRIS }}>TTC / an</div>
          </div>
          <div style={{ fontSize: 12, color: GRIS, marginBottom: 26 }}>+ 500 &euro; de droit d&apos;entree, une seule fois</div>
          {[
            "L'annuaire complet et les mises en relation",
            "Les evenements prives du club",
            "Les deals securises entre membres",
            "L'outil de gestion Xyra",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 13 }}>
              <span style={{ color: OR, fontSize: 13 }}>&#10003;</span>
              <span style={{ fontSize: 13, color: GRIS_CLAIR }}>{t}</span>
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

      <section id="candidature" style={{ padding: "56px 32px 72px", maxWidth: 620, margin: "0 auto" }}>
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
                {champ("nom", "Nom et prenom")}
                {champ("email", "Email", "email")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("tel", "Telephone")}
                {champ("societe", "Societe")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("siren", "SIREN ou equivalent")}
                {champ("metier", "Metier")}
              </div>
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {champ("pays", "Pays")}
                {champ("ville", "Ville")}
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

      <footer style={{ borderTop: `0.5px solid ${TRAIT}`, padding: "34px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontStyle: "italic", color: OR, marginBottom: 12 }}>Xyra Club</div>
        <div style={{ fontSize: 11, color: "#4f4a43", lineHeight: 1.8 }}>
          Club prive edite par Xyra. Adhesion reservee aux professionnels.<br />
          Toutes les candidatures ne sont pas retenues.
        </div>
        <a href="/inscription" style={{ display: "inline-block", marginTop: 18, fontSize: 11, color: GRIS, textDecoration: "underline" }}>
          Utiliser Xyra sans rejoindre le club
        </a>
      </footer>
    </div>
  );
}
