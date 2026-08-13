"use client";
import Entete from "./composants/Entete";
import Photo from "./composants/Photo";
import Pied from "./composants/Pied";

/* Photos a deposer dans public/club/ :
   hero.jpg  rarete.jpg  relation.jpg  evenement.jpg
   galerie-1.jpg a galerie-6.jpg  */

const OR = "#c9a96e";
const IVOIRE = "#f0ead6";
const NOIR = "#0a0a0a";
const GRIS = "#78716a";
const TRAIT = "#1f1c16";

export default function ClubAccueil() {
  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`
        @keyframes defile { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .piste { display: flex; gap: 14px; width: max-content; animation: defile 50s linear infinite; }
        .piste:hover { animation-play-state: paused; }
        @media (max-width: 820px) {
          .duo { grid-template-columns: 1fr !important; }
          .grand-titre { font-size: 30px !important; }
        }
      `}</style>

      <Entete />

      <section style={{ padding: "64px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <h1 className="grand-titre" style={{ fontFamily: "Georgia,serif", fontSize: 42, fontStyle: "italic", lineHeight: 1.15, maxWidth: 620, margin: "0 0 22px", fontWeight: 400 }}>
          Rejoignez le club prive des entrepreneurs qui font affaire ensemble
        </h1>
        <p style={{ fontSize: 15, color: GRIS, maxWidth: 500, lineHeight: 1.8, margin: "0 0 30px" }}>
          Un seul representant par metier et par zone. Vous dites ce que vous cherchez, le club vous presente qui le fait.
        </p>
        <a href="/club/rejoindre" style={{ display: "inline-block", padding: "14px 30px", background: OR, color: NOIR, fontSize: 13, textDecoration: "none", marginBottom: 56 }}>
          Je m&apos;inscris sur liste d&apos;attente
        </a>
      </section>

      <Photo nom="hero.jpg" hauteur={460} />

      <section style={{ padding: "60px 32px", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 28, color: OR, marginBottom: 18 }}>Rendre accessible l&apos;inaccessible</div>
        <div style={{ fontSize: 14, color: GRIS, lineHeight: 1.9, marginBottom: 30 }}>
          Un reseau qu&apos;on ne rejoint pas seul, et un outil pour travailler ensemble.
        </div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontStyle: "italic", color: "#a39c8e", lineHeight: 1.8 }}>
          &laquo; Le club existe pour que ses membres se donnent du business, pas pour collectionner des contacts. &raquo;
        </div>
        <div style={{ fontSize: 11, color: GRIS, marginTop: 16, letterSpacing: "0.12em" }}>CURTISS &mdash; FONDATEUR</div>
      </section>

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

      <section style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontStyle: "italic", marginBottom: 24, lineHeight: 1.4 }}>
          La place de votre metier<br />est peut-etre encore libre.
        </div>
        <a href="/club/rejoindre" style={{ display: "inline-block", padding: "14px 32px", background: OR, color: NOIR, fontSize: 13, textDecoration: "none" }}>
          Devenir membre
        </a>
      </section>

      <Pied />
    </div>
  );
}
