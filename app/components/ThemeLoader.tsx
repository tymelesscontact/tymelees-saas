"use client";
import { useEffect } from "react";
import { appliquerTheme } from "../lib/theme";

export default function ThemeLoader() {
  useEffect(() => {
    fetch('/api/profil-entreprise')
      .then(r => r.json())
      .then(d => {
        if (d.profil) {
          appliquerTheme(d.profil.theme || "dark", d.profil.couleur_primaire);
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
