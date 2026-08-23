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
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

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
    if (!form.client_nom || !form.date_mission || !form.heure_debut || (types.length > 0 && !form.type_mission_id)) {
      setErreur("Indiquez la prestation souhaitée, votre nom, la date et l'heure");
      return;
    }
    setEnvoiEnCours(true);
    try {
      const r = await fetch("/api/reservation-publique", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, ...form }),
      });
      const d = await r.json();
      if (d.success) setSucces(true);
      else setErreur(d.error || "Une erreur est survenue, merci de réessayer");
    } catch { setErreur("Impossible de joindre le serveur pour le moment"); }
    setEnvoiEnCours(false);
  };

  const OR = tenant?.couleur_primaire || "#C9A84C";
  const FOND = "#06060E";
  const CARTE = "#0C0C1A";
  const IVOIRE = "#EAE6DE";
  const MUTE = "#7d7594";
  const TRAIT = "#1E1E36";

  if (chargement) return (
    <div style={{ minHeight: "100vh", background: FOND, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: OR, fontFamily: "Georgia, serif", fontSize: 13, letterSpacing: "0.3em" }}>· · ·</div>
    </div>
  );

  if (erreur && !tenant) return (
    <div style={{ minHeight: "100vh", background: FOND, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
      <div>
        <div style={{ fontSize: 15, color: IVOIRE, fontFamily: "Georgia, serif", marginBottom: 8 }}>Cette page n'existe pas</div>
        <div style={{ fontSize: 12, color: MUTE }}>Le lien utilisé n'est plus valide.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: FOND, position: "relative", overflow: "hidden" }}>
      <style>{`
        .champ-privilege { background: transparent; border: none; border-bottom: 1px solid ${TRAIT}; border-radius: 0; padding: 10px 2px; color: ${IVOIRE}; font-size: 16px; font-family: inherit; width: 100%; box-sizing: border-box; outline: none; transition: border-color .25s ease; }
        .champ-privilege::placeholder { color: ${MUTE}; }
        .champ-privilege:focus { border-bottom: 1px solid ${OR}; }
        .champ-privilege option { background: ${CARTE}; color: ${IVOIRE}; }
        .bouton-privilege { transition: opacity .2s ease, transform .2s ease; }
        .bouton-privilege:active { transform: scale(0.98); }
        @media (prefers-reduced-motion: reduce) { .champ-privilege, .bouton-privilege { transition: none; } }
      `}</style>

      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${OR}18, transparent 70%)`, pointerEvents: "none" }} />

      {succes ? (
        <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 380, textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${OR}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", color: OR, fontSize: 18 }}>✓</div>
            <div style={{ fontSize: 20, color: IVOIRE, fontFamily: "Georgia, serif", marginBottom: 10 }}>Demande envoyée</div>
            <div style={{ fontSize: 13, color: MUTE, lineHeight: 1.7 }}>{tenant?.societe} revient vers vous très prochainement pour confirmer votre rendez-vous.</div>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", padding: "56px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              {tenant?.logo_url && <img src={tenant.logo_url} alt={tenant.societe} style={{ height: 42, marginBottom: 18 }} />}
              <div style={{ fontSize: 26, color: IVOIRE, fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}>{tenant?.societe}</div>
              <div style={{ fontSize: 10, color: OR, letterSpacing: "0.35em", textTransform: "uppercase", marginTop: 10 }}>Conciergerie privée</div>
              <div style={{ width: 40, height: 1, background: OR, opacity: 0.5, margin: "22px auto 0" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {types.length > 0 && (
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Prestation souhaitée</div>
                  <select className="champ-privilege" value={form.type_mission_id} onChange={e => setForm(f => ({ ...f, type_mission_id: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {types.map((t: any) => <option key={t.id} value={t.id}>{t.nom}{t.prix ? ` — ${t.prix}${t.devise === "EUR" ? "€" : t.devise}` : ""}</option>)}
                  </select>
                </label>
              )}

              <label style={{ display: "block" }}>
                <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Votre nom</div>
                <input className="champ-privilege" value={form.client_nom} onChange={e => setForm(f => ({ ...f, client_nom: e.target.value }))} placeholder="Nom et prénom" />
              </label>

              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "block", flex: 1 }}>
                  <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Email</div>
                  <input className="champ-privilege" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} type="email" placeholder="vous@email.com" />
                </label>
                <label style={{ display: "block", flex: 1 }}>
                  <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Téléphone</div>
                  <input className="champ-privilege" value={form.client_tel} onChange={e => setForm(f => ({ ...f, client_tel: e.target.value }))} placeholder="06 12 34 56 78" />
                </label>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "block", flex: 1 }}>
                  <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Date souhaitée</div>
                  <input className="champ-privilege" value={form.date_mission} onChange={e => setForm(f => ({ ...f, date_mission: e.target.value }))} type="date" />
                </label>
                <label style={{ display: "block", flex: 1 }}>
                  <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Heure</div>
                  <input className="champ-privilege" value={form.heure_debut} onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))} type="time" />
                </label>
              </div>

              <label style={{ display: "block" }}>
                <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Adresse — facultatif</div>
                <input className="champ-privilege" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} placeholder="Lieu de la prestation" />
              </label>

              <label style={{ display: "block" }}>
                <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Message — facultatif</div>
                <textarea className="champ-privilege" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Précisions utiles..." style={{ resize: "vertical" as any }} />
              </label>

              {erreur && <div style={{ fontSize: 12, color: "#e8998a" }}>{erreur}</div>}

              <button className="bouton-privilege" onClick={envoyer} disabled={envoiEnCours} style={{ background: OR, color: "#0A0A16", border: "none", padding: "15px", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: envoiEnCours ? "wait" : "pointer", marginTop: 10, opacity: envoiEnCours ? 0.7 : 1 }}>
                {envoiEnCours ? "Envoi..." : "Envoyer ma demande"}
              </button>

              <div style={{ fontSize: 11, color: MUTE, textAlign: "center", lineHeight: 1.6, marginTop: 4 }}>Réponse personnalisée sous 24 heures</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageReservationWrapper() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06060E" }} />}><PageReservation /></Suspense>;
}
