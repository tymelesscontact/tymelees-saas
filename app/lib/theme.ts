export const PALETTES: Record<string, Record<string, string>> = {
  dark: {
    dark: "#06060E", card: "#0C0C1A", card2: "#121222",
    border: "#1E1E36", gold: "#C9A84C", text: "#EAE6DE",
    muted: "#5A5A7A", green: "#2EC9B0", red: "#FF5252",
    blue: "#4B7BFF", purple: "#9B5FFF", orange: "#FF8C3A",
    teal: "#2ECDC4", pink: "#FF5F9E",
  },
  light: {
    dark: "#F7F5F0", card: "#FFFFFF", card2: "#F0EDE4",
    border: "#E2DDCE", gold: "#B8924A", text: "#1A1A24",
    muted: "#6E6E88", green: "#1FA891", red: "#E03E3E",
    blue: "#3563E0", purple: "#7C3FE0", orange: "#E06F1F",
    teal: "#1FA89E", pink: "#E0407F",
  },
};

export function appliquerTheme(themeId: string, couleurAccent?: string) {
  if (typeof document === "undefined") return;
  const palette = PALETTES[themeId] || PALETTES.dark;
  const racine = document.documentElement;
  Object.entries(palette).forEach(([cle, valeur]) => {
    racine.style.setProperty(`--c-${cle}`, valeur);
  });
  if (couleurAccent) {
    racine.style.setProperty("--c-gold", couleurAccent);
  }
}
