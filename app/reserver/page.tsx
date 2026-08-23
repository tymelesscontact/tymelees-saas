"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PageReservation() {
  const params = useSearchParams();
  const tenantId = params.get("tenant");

  const [tenant, setTenant] = useState<any>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const [form, setForm] = useState({
    type_mission_id: "", client_nom: "", client_email: "", client_tel: "",
    date_mission: "", heure_debut: "", adresse: "", notes: "",
  });

  useEffect(() => {
    if (!tenantId) { setErreur("Lien invalide"); setChargement(false); return; }
    fetch(`/api/reservation-publique?tenant=${tenantId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setErreur(d.error);
        else { setTenant(d.tenant); setTypes(d.types); }
        setChargement(false);
      })
      .catch(() => { setErreur("connexion"); setChargement(false); });
  }, [tenantId]);

  const envoyer = async () => {
    if (!form.client_nom || !form.date_mission || !form.heure_debut) {
      setErreur("Merci de remplir votre nom, la date et l'heure");
      return;
    }
    try {
      const r = await fetch("/api/reservation-publique", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, ...form }),
      });
      const d = await r.json();
      if (d.success) setSucces(true);
      else setErreur(d.error || "Erreur, réessayez");
    } catch { setErreur("Erreur de connexion"); }
  };

  const or = tenant?.couleur_primaire || "#C9A84C";
  const fond = tenant?.couleur_secondaire || "#0A0A16";
  const accent = tenant?.couleur_accent || "#2EC9B0";

  if (chargement) return (
    <div style={{ minHeight: "100vh", background: "#0A0A16", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Chargement...
    </div>
  );

  if (erreur && !tenant) return (
    <div style={{ minHeight: "100vh", background: "#0A0A16", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: 20, textAlign: "center" }}>
      {erreur === "societe_introuvable" ? "Cette page de réservation n'existe pas." : "Une erreur est survenue."}
    </div>
  );

  if (succes) return (
    <div style={{ minHeight: "100vh", background: fond, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Demande envoyée !</div>
        <div style={{ fontSize: 14, color: "#666" }}>{tenant?.societe} va confirmer votre rendez-vous très prochainement.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: fond, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, marginTop: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {tenant?.logo_url && <img src={tenant.logo_url} alt={tenant.societe} style={{ height: 50, marginBottom: 12 }} />}
          <div style={{ fontSize: 22, fontWeight: 700, color: or, fontFamily: "Georgia, serif" }}>{tenant?.societe}</div>
          <div style={{ fontSize: 13, color: "#9d95c0", marginTop: 4 }}>Prendre rendez-vous</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {types.length > 0 && (
            <select value={form.type_mission_id} onChange={e => setForm(f => ({ ...f, type_mission_id: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}>
              <option value="">Choisir une prestation...</option>
              {types.map((t: any) => <option key={t.id} value={t.id}>{t.nom}{t.prix ? ` — ${t.prix}${t.devise === "EUR" ? "€" : t.devise}` : ""}</option>)}
            </select>
          )}
          <input value={form.client_nom} onChange={e => setForm(f => ({ ...f, client_nom: e.target.value }))} placeholder="Votre nom *" style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
          <input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="Votre email" type="email" style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
          <input value={form.client_tel} onChange={e => setForm(f => ({ ...f, client_tel: e.target.value }))} placeholder="Votre téléphone" style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <input value={form.date_mission} onChange={e => setForm(f => ({ ...f, date_mission: e.target.value }))} type="date" style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
            <input value={form.heure_debut} onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))} type="time" style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
          </div>
          <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} placeholder="Adresse (facultatif)" style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Un message ? (facultatif)" rows={3} style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16, fontFamily: "inherit", resize: "vertical" as any }} />

          {erreur && <div style={{ color: "#c0392b", fontSize: 13 }}>{erreur}</div>}

          <button onClick={envoyer} style={{ background: or, color: "#000", border: "none", borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            Envoyer ma demande
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PageReservationWrapper() {
  return <Suspense fallback={<div />}><PageReservation /></Suspense>;
}
