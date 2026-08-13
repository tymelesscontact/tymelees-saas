"use client";
import { useState } from "react";

/* Photos temporaires, affichees tant que votre fichier n'est pas
   depose dans public/club/. Des que vous y mettez votre image
   (meme nom, ex: hero.jpg), elle remplace automatiquement celle-ci. */
const TEMPORAIRES: Record<string, string> = {
  "hero.jpg":        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80",
  "rarete.jpg":      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80",
  "relation.jpg":    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&q=80",
  "evenement.jpg":   "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  "le-club.jpg":     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
  "a-propos.jpg":    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=80",
  "continents.jpg":  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&q=80",
  "rejoindre.jpg":   "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80",
  "galerie-1.jpg":   "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=80",
  "galerie-2.jpg":   "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&q=80",
  "galerie-3.jpg":   "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=700&q=80",
  "galerie-4.jpg":   "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=700&q=80",
  "galerie-5.jpg":   "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=700&q=80",
  "galerie-6.jpg":   "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=700&q=80",
};

export default function Photo({ nom, hauteur, style = {} }: any) {
  const [source, setSource] = useState(`/club/${nom}`);
  const [echec, setEchec] = useState(false);

  const surErreur = () => {
    if (source.startsWith("/club/") && TEMPORAIRES[nom]) setSource(TEMPORAIRES[nom]);
    else setEchec(true);
  };

  if (echec) {
    return (
      <div style={{ height: hauteur, background: "#151208", display: "flex", alignItems: "center", justifyContent: "center", color: "#33302a", fontSize: 11, letterSpacing: "0.15em", ...style }}>
        {nom.toUpperCase()}
      </div>
    );
  }

  return (
    <img src={source} alt="" onError={surErreur}
      style={{ height: hauteur, width: "100%", objectFit: "cover", display: "block", ...style }} />
  );
}
