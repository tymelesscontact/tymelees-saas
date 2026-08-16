"use client";
import Entete from "../composants/Entete";
import Pied from "../composants/Pied";

const OR = "#d4b678";
const NOIR = "#141130";
const GRIS = "#9d95c0";

export default function Bienvenue() {
  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: "#f5f0e3", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <Entete />
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 38, fontStyle: "italic", color: OR, marginBottom: 22 }}>
          Bienvenue au Club
        </div>
        <div style={{ fontSize: 15, color: GRIS, lineHeight: 1.9, maxWidth: 440, marginBottom: 34 }}>
          Votre adhesion est enregistree. Vous recevez un email de confirmation avec vos acces.
        </div>
        <div style={{ fontSize: 13, color: "#7a72a0", lineHeight: 1.8, maxWidth: 400 }}>
          L&apos;annuaire, les mises en relation et les evenements vous sont desormais ouverts.
        </div>
        <a href="/club" style={{ marginTop: 40, display: "inline-block", padding: "14px 32px", border: `0.5px solid ${OR}`, color: OR, fontSize: 13, textDecoration: "none" }}>
          Retour au club
        </a>
      </section>
      <Pied />
    </div>
  );
}
