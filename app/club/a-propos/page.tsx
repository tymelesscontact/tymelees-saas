"use client";
import Entete from "../composants/Entete";
import Photo from "../composants/Photo";
import Pied from "../composants/Pied";

const OR = "#d4b678";
const IVOIRE = "#f5f0e3";
const NOIR = "#141130";
const GRIS = "#9d95c0";
const TRAIT = "#362e64";

export default function APropos() {
  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@media (max-width: 820px) { .duo { grid-template-columns: 1fr !important; } .grand-titre { font-size: 28px !important; } }`}</style>
      <Entete />

      <section style={{ padding: "60px 32px 44px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#b9a3f5", marginBottom: 14 }}>A PROPOS</div>
        <h1 className="grand-titre" style={{ fontFamily: "Georgia,serif", fontSize: 36, fontStyle: "italic", lineHeight: 1.2, maxWidth: 560, margin: "0 0 20px", fontWeight: 400 }}>
          Pourquoi ce club existe
        </h1>
      </section>

      <Photo nom="a-propos.jpg" hauteur={380} />

      <section style={{ padding: "60px 32px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 15, color: "#b3aacf", lineHeight: 1.95, marginBottom: 28 }}>
          La plupart des reseaux d&apos;affaires collectionnent des contacts. On y echange des cartes, on se suit, et rien ne se passe.
        </p>
        <p style={{ fontSize: 15, color: "#b3aacf", lineHeight: 1.95, marginBottom: 28 }}>
          Le Xyra Club a ete cree pour l&apos;inverse : que ses membres se donnent du business. Chaque metier n&apos;est represente qu&apos;une fois par zone, pour qu&apos;une recommandation aille toujours a quelqu&apos;un de precis.
        </p>
        <p style={{ fontSize: 15, color: "#b3aacf", lineHeight: 1.95 }}>
          Et parce qu&apos;une affaire ne s&apos;arrete pas a la poignee de main, chaque membre dispose de Xyra pour la mener a bien : devis, contrat signe, facture, paiement securise.
        </p>
      </section>

      <section className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `0.5px solid ${TRAIT}` }}>
        <div style={{ padding: "56px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#b9a3f5", marginBottom: 14 }}>DEUX CONTINENTS</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 24, lineHeight: 1.4, marginBottom: 14 }}>France et Afrique francophone</div>
          <div style={{ fontSize: 13, color: GRIS, lineHeight: 1.8 }}>
            Un membre a Paris, un autre a Abidjan, un troisieme a Dakar. Les affaires ne s&apos;arretent pas aux frontieres, le club non plus.
          </div>
        </div>
        <Photo nom="continents.jpg" hauteur={300} />
      </section>

      <section style={{ padding: "60px 32px", textAlign: "center", borderTop: `0.5px solid ${TRAIT}` }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontStyle: "italic", color: "#b3aacf", maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.8 }}>
          &laquo; Le club existe pour que ses membres se donnent du business, pas pour collectionner des contacts. &raquo;
        </div>
        <div style={{ fontSize: 11, color: GRIS, letterSpacing: "0.12em" }}>CURTISS &mdash; FONDATEUR</div>
      </section>

      <section style={{ padding: "50px 32px 70px", textAlign: "center" }}>
        <a href="/club/rejoindre" style={{ display: "inline-block", padding: "14px 32px", background: OR, color: NOIR, fontSize: 13, textDecoration: "none" }}>
          Deposer une candidature
        </a>
      </section>

      <Pied />
    </div>
  );
}
