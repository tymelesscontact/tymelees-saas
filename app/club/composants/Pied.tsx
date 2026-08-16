export default function Pied() {
  return (
    <footer style={{ borderTop: "0.5px solid #362e64", padding: "34px 32px", textAlign: "center" }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontStyle: "italic", color: "#d4b678", marginBottom: 12 }}>Xyra Club</div>
      <div style={{ fontSize: 11, color: "#7a72a0", lineHeight: 1.8 }}>
        Club prive edite par Xyra. Adhesion reservee aux professionnels.<br />
        Toutes les candidatures ne sont pas retenues.
      </div>
      <a href="/inscription" style={{ display: "inline-block", marginTop: 18, fontSize: 11, color: "#9d95c0", textDecoration: "underline" }}>
        Utiliser Xyra sans rejoindre le club
      </a>
    </footer>
  );
}
