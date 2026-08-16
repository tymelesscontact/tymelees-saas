"use client";
import { useState } from "react";

const OR = "#d4b678";
const NOIR = "#141130";
const TRAIT = "#362e64";

export default function Entete() {
  const [ouvert, setOuvert] = useState(false);
  const liens = [
    ["Accueil", "/club"],
    ["Le club", "/club/le-club"],
    ["A propos", "/club/a-propos"],
    ["Rejoindre le club", "/club/rejoindre"],
  ];
  return (
    <nav style={{ position: "sticky", top: 0, background: NOIR, zIndex: 50, borderBottom: `0.5px solid ${TRAIT}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <a href="/club" style={{ fontFamily: "Georgia,serif", fontSize: 17, fontStyle: "italic", color: OR, textDecoration: "none" }}>Xyra Club</a>
        <div className="menu-large" style={{ display: "flex", gap: 26, alignItems: "center" }}>
          {liens.map(([texte, url]) => (
            <a key={url} href={url} style={{ fontSize: 12, color: "#b3aacf", textDecoration: "none" }}>{texte}</a>
          ))}
          <a href="/club/rejoindre" style={{ border: `0.5px solid ${OR}`, color: OR, padding: "9px 18px", fontSize: 11, letterSpacing: "0.1em", textDecoration: "none" }}>DEVENIR MEMBRE</a>
        </div>
        <div className="menu-bouton" onClick={() => setOuvert(!ouvert)} style={{ display: "none", color: OR, fontSize: 22, cursor: "pointer" }}>
          {ouvert ? "\u00d7" : "\u2261"}
        </div>
      </div>
      {ouvert && (
        <div className="menu-mobile" style={{ borderTop: `0.5px solid ${TRAIT}`, padding: "8px 32px 20px" }}>
          {liens.map(([texte, url]) => (
            <a key={url} href={url} style={{ display: "block", padding: "13px 0", fontSize: 13, color: "#b3aacf", textDecoration: "none", borderBottom: `0.5px solid ${TRAIT}` }}>{texte}</a>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 780px) {
          .menu-large { display: none !important; }
          .menu-bouton { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
