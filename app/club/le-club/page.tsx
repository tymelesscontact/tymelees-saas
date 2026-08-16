"use client";
import Entete from "../composants/Entete";
import Photo from "../composants/Photo";
import Pied from "../composants/Pied";

const OR = "#d4b678";
const IVOIRE = "#f5f0e3";
const NOIR = "#141130";
const GRIS = "#9d95c0";
const GRIS_CLAIR = "#b3aacf";
const TRAIT = "#362e64";

export default function LeClub() {
  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@media (max-width: 820px) { .six { grid-template-columns: 1fr !important; } .grand-titre { font-size: 28px !important; } }`}</style>
      <Entete />

      <section style={{ padding: "60px 32px 44px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#b9a3f5", marginBottom: 14 }}>LE CLUB</div>
        <h1 className="grand-titre" style={{ fontFamily: "Georgia,serif", fontSize: 36, fontStyle: "italic", lineHeight: 1.2, maxWidth: 560, margin: "0 0 20px", fontWeight: 400 }}>
          Un cercle ferme, une place par metier
        </h1>
        <p style={{ fontSize: 14, color: GRIS, maxWidth: 540, lineHeight: 1.9 }}>
          Le club reunit des entrepreneurs et dirigeants qui cherchent a developper leur activite par la recommandation. Chaque metier n&apos;est represente qu&apos;une fois par zone, pour qu&apos;aucune recommandation ne soit ambigue.
        </p>
      </section>

      <Photo nom="le-club.jpg" hauteur={380} />

      <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#b9a3f5", marginBottom: 32 }}>AVANTAGES RESERVES AUX MEMBRES</div>
        <div className="six" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "40px 44px" }}>
          {[
            ["Un seul par metier", "Votre metier n'est represente qu'une fois dans votre zone. Aucune concurrence interne, aucune ambiguite sur qui recoit une recommandation."],
            ["Mise en relation ciblee", "Vous declarez ce que vous cherchez. Lea, notre assistante, previent les membres qui correspondent. Vous recevez sans avoir a chercher."],
            ["Deals securises", "Contrat signe electroniquement, paiement bloque jusqu'a validation de la prestation, litige arbitre par le club."],
            ["Diners et rencontres", "Des evenements prives en France et en Afrique francophone. C'est la que se nouent les affaires."],
            ["L'outil Xyra", "Devis, factures, stock, comptabilite. L'outil de gestion complet, inclus dans votre adhesion."],
            ["Bilan annuel", "Chaque annee, le detail de ce que le club vous a rapporte : mises en relation, deals conclus, chiffre d'affaires."],
          ].map(([titre, texte], i) => (
            <div key={i}>
              <div style={{ width: 28, height: 1, background: OR, marginBottom: 16 }} />
              <div style={{ fontSize: 16, color: IVOIRE, marginBottom: 10 }}>{titre}</div>
              <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>{texte}</div>
            </div>
          ))}
        </div>
      </section>

      <Photo nom="evenement.jpg" hauteur={320} />

      <section style={{ padding: "60px 32px", maxWidth: 620, margin: "0 auto" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 28, marginBottom: 26 }}>L&apos;adhesion</div>
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
          <a href="/club/rejoindre" style={{ display: "block", marginTop: 26, padding: "14px", background: OR, color: NOIR, fontSize: 13, textAlign: "center", textDecoration: "none" }}>
            Deposer une candidature
          </a>
        </div>
      </section>

      <Pied />
    </div>
  );
}
