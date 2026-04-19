export default function ReseauPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🤝 Réseau - Prospection</h1>

      <button
        style={{
          background: "#0f172a",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        🚀 Lancer la prospection
      </button>

      <h3>📋 Prospects récents</h3>

      <ul>
        <li>✈️ FBO Paris - contact@fbo-paris.com</li>
        <li>🏢 Gestion Immo Luxe - contact@immo.com</li>
        <li>🛫 Jet Services - contact@jetservices.com</li>
      </ul>
    </div>
  );
}