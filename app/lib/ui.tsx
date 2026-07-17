export const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
  teal:"#2ECDC4", pink:"#FF5F9E",
};

export const DEVISES = [
  { code:"EUR", symbol:"€" },
  { code:"XOF", symbol:"₣" },
  { code:"USD", symbol:"$" },
];

export const fmt = (m: number, d: string = "EUR") => {
  const dv = DEVISES.find(x => x.code === d);
  if (d === "XOF") return Math.round(m).toLocaleString("fr") + " " + (dv?.symbol || "₣");
  return Number(m).toLocaleString("fr", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + (dv?.symbol || "€");
};

export const Card = ({ children, style = {} }: any) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
);

export const CT = ({ children, style = {} }: any) => (
  <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, ...style }}>{children}</div>
);

export const Btn = ({ children, onClick, color = C.gold, style = {} }: any) => (
  <button onClick={onClick} style={{ background: color, color: color === C.gold ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", ...style }}>{children}</button>
);

export const BtnGhost = ({ children, onClick, style = {} }: any) => (
  <button onClick={onClick} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", ...style }}>{children}</button>
);

export const TH = ({ children, style = {} }: any) => (
  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${C.border}`, ...style }}>{children}</th>
);

export const Td = ({ children, style = {}, onClick }: any) => (
  <td onClick={onClick} style={{ padding: "9px 10px", fontSize: 12, borderBottom: `1px solid ${C.border}22`, color: C.text, ...style }}>{children}</td>
);

export const KPI = ({ label, val, sub, color = C.gold, icon = "" }: any) => (
  <CT>
    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{icon} {label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Georgia,serif", lineHeight: 1.1 }}>{val}</div>
    {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
  </CT>
);

export const STitle = ({ children }: any) => (
  <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{children}</div>
);

export const Pill = ({ children, color = C.gold, bg }: any) => (
  <span style={{ background: bg || color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
);

export const Inp = ({ value, onChange, placeholder, style = {} }: any) => (
  <input value={value} onChange={onChange} placeholder={placeholder} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", ...style }}/>
);

export const Sel = ({ value, onChange, children, style = {} }: any) => (
  <select value={value} onChange={onChange} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 12px", color: C.text, fontSize: 12, fontFamily: "inherit", ...style }}>{children}</select>
);

export const SM = ({ val, max, color = C.green }: any) => (
  <div style={{ height: 4, borderRadius: 2, background: C.border, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, (val / max) * 100)}%`, background: color, borderRadius: 2 }}/></div>
);
