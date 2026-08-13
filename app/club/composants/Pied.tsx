export default function Pied() {
  return (
    <footer style={{ borderTop: "0.5px solid #1f1c16", padding: "34px 32px", textAlign: "center" }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontStyle: "italic", color: "#c9a96e", marginBottom: 12 }}>Xyra Club</div>
      <div style={{ fontSize: 11, color: "#4f4a43", lineHeight: 1.8 }}>
        Club prive edite par Xyra. Adhesion reservee aux professionnels.<br />
        Toutes les candidatures ne sont pas retenues.
      </div>
      <a href="/inscription" style={{ display: "inline-block", marginTop: 18, fontSize: 11, color: "#78716a", textDecoration: "underline" }}>
        Utiliser Xyra sans rejoindre le club
      </a>
    </footer>
  );
}
