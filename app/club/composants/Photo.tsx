"use client";
import { useState } from "react";

export default function Photo({ nom, hauteur, style = {} }: any) {
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
