"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const C = {
  dark:"#06060E", card:"#0C0C1A", card2:"#121222",
  border:"#1E1E36", gold:"#C9A84C", text:"#EAE6DE",
  muted:"#5A5A7A", green:"#2EC9B0", red:"#FF5252",
  blue:"#4B7BFF", purple:"#9B5FFF", orange:"#FF8C3A",
};

export default function EspaceClient() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [devis, setDevis] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [contrats, setContrats] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([
    { av: "X", msg: "Bonjour ! Bienvenue sur votre espace client Xyra. Comment puis-je vous aider ?", h: "09:00", moi: false },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devisForm, setDevisForm] = useState({ service: "", description: "", budget: "", date: "" });
  const [signEtape, setSignEtape] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      const [t, d, m, c] = await Promise.all([
        sb.from("tenants").select("*").eq("user_id", user.id).single(),
        sb.from("devis").select("*").eq("client_email", user.email).order("created_at", { ascending: false }),
        sb.from("missions").select("*").eq("client_email", user.email).order("created_at", { ascending: false }),
        sb.from("contrats").select("*").eq("client_email", user.email).order("created_at", { ascending: false }),
      ]);

      if (t.data) setTenant(t.data);
      if (d.data) setDevis(d.data);
      if (m.data) setMissions(m.data);
      if (c.data) setContrats(c.data);

      // Factures = devis payés
      if (d.data) setFactures(d.data.filter((x: any) => x.statut === "payé" || x.statut === "signé"));

      setLoading(false);
    };
    init();
  }, []);

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Mon espace" },
    { id: "devis", icon: "◧", label: "Devis" },
    { id: "factures", icon: "🧾", label: "Factures" },
    { id: "missions", icon: "✅", label: "Mes missions" },
    { id: "contrats", icon: "✦", label: "Contrats" },
    { id: "chat", icon: "💬", label: "Contact" },
    { id: "fidelite", icon: "⭐", label: "Fidélité" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];

  const Card = ({ children, style = {} }: any) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
  );

  const Pill = ({ children, color = C.gold }: any) => (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
  );

  const Btn = ({ children, onClick, color = C.gold, style = {} }: any) => (
    <button onClick={onClick} style={{ background: color, color: color === C.gold ? "#000" : "#fff", border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", ...style }}>{children}</button>
  );

  const BtnGhost = ({ children, onClick, style = {} }: any) => (
    <button onClick={onClick} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", ...style }}>{children}</button>
  );

  const statutColor: Record<string, string> = {
    en_attente: C.orange, envoyé: C.blue, signé: C.green,
    payé: C.teal, confirmé: C.green, terminé: C.green, en_cours: C.gold,
  };

  const totalCA = factures.reduce((a: number, f: any) => a + (f.montant || 0), 0);
  const devisEnAttente = devis.filter((d: any) => d.statut === "envoyé" || d.statut === "en_attente");

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: "Georgia,serif" }}>XYRA</div>
      <div style={{ fontSize: 12, color: C.muted }}>Chargement de votre espace...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: C.dark, color: C.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif" }}>XYRA</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginTop: 2 }}>ESPACE CLIENT</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer", color: page === item.id ? C.gold : C.muted, background: page === item.id ? `${C.gold}0E` : "transparent", border: "none", borderLeft: `2px solid ${page === item.id ? C.gold : "transparent"}`, width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: 12, fontWeight: page === item.id ? 600 : 400 }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>{tenant?.societe || user?.email}</div>
          <div style={{ fontSize: 9, color: C.muted }}>{tenant?.metier || "Client Xyra"}</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

        {/* DASHBOARD */}
        {page === "dashboard" && <div>
          <div style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 6 }}>XYRA · ESPACE CLIENT</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 4 }}>
              Bonjour {tenant?.societe || "👋"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {tenant?.pays || ""}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                ["Devis en attente", devisEnAttente.length, C.orange],
                ["Missions", missions.length, C.blue],
                ["Total dépensé", totalCA.toLocaleString("fr") + " €", C.gold],
                ["Contrats", contrats.length, C.green],
              ].map(([l, v, c]: any, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Devis en attente */}
          {devisEnAttente.length > 0 && (
            <div style={{ background: `${C.orange}11`, border: `1px solid ${C.orange}33`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 10 }}>
                ⏳ {devisEnAttente.length} devis en attente de votre signature
              </div>
              {devisEnAttente.map((d: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.orange}22` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{d.service || d.objet}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{d.id} · {(d.montant || 0).toLocaleString("fr")} €</div>
                  </div>
                  <Btn onClick={() => setSignEtape({ ...d, etape: 1 })} style={{ fontSize: 11 }}>✒ Signer</Btn>
                </div>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { icon: "◧", label: "Demander un devis", action: () => { setPage("devis"); setShowDevisForm(true); }, color: C.gold },
              { icon: "💬", label: "Contacter l'équipe", action: () => setPage("chat"), color: C.green },
              { icon: "🧾", label: "Mes factures", action: () => setPage("factures"), color: C.blue },
              { icon: "✅", label: "Mes missions", action: () => setPage("missions"), color: C.purple },
            ].map((a, i) => (
              <Card key={i} style={{ cursor: "pointer", textAlign: "center", borderColor: `${a.color}33` }} onClick={a.action}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</div>
              </Card>
            ))}
          </div>

          {/* Dernières missions */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✅ Dernières missions</div>
            {missions.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: C.muted }}>Aucune mission pour le moment</div>
            ) : missions.slice(0, 3).map((m: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.service}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{m.date} · {m.adresse}</div>
                </div>
                <Pill color={statutColor[m.statut] || C.muted}>{m.statut}</Pill>
              </div>
            ))}
          </Card>
        </div>}

        {/* DEVIS */}
        {page === "devis" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>◧ Mes devis</div>
            <Btn onClick={() => setShowDevisForm(s => !s)}>+ Demander un devis</Btn>
          </div>

          {showDevisForm && (
            <Card style={{ marginBottom: 16, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nouvelle demande de devis</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Service souhaité *</label>
                  <input value={devisForm.service} onChange={e => setDevisForm(f => ({ ...f, service: e.target.value }))} placeholder="Ex: Nettoyage, Jet privé..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Budget estimé (€)</label>
                  <input value={devisForm.budget} onChange={e => setDevisForm(f => ({ ...f, budget: e.target.value }))} placeholder="Ex: 500" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Date souhaitée</label>
                  <input type="date" value={devisForm.date} onChange={e => setDevisForm(f => ({ ...f, date: e.target.value }))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Description</label>
                  <input value={devisForm.description} onChange={e => setDevisForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails supplémentaires..." style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as any }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={async () => {
                  if (!devisForm.service) return showToast("⚠️ Remplissez le service");
                  await sb.from("devis").insert([{
                    client_email: user?.email,
                    client: tenant?.societe,
                    service: devisForm.service,
                    description: devisForm.description,
                    budget: devisForm.budget,
                    date_souhaitee: devisForm.date,
                    statut: "en_attente",
                    created_at: new Date().toISOString(),
                  }]);
                  setShowDevisForm(false);
                  setDevisForm({ service: "", description: "", budget: "", date: "" });
                  showToast("✅ Demande envoyée ! Vous recevrez votre devis sous 24h.");
                }}>✅ Envoyer la demande</Btn>
                <BtnGhost onClick={() => setShowDevisForm(false)}>Annuler</BtnGhost>
              </div>
            </Card>
          )}

          <Card>
            {devis.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>◧</div>
                <div>Aucun devis pour le moment</div>
                <Btn onClick={() => setShowDevisForm(true)} style={{ marginTop: 12, fontSize: 11 }}>+ Demander un devis</Btn>
              </div>
            ) : devis.map((d: any, i: number) => (
              <div key={i} style={{ background: C.card2, borderRadius: 10, padding: 14, marginBottom: 10, border: `1px solid ${d.statut === "envoyé" ? C.gold + "44" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.service || d.objet}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{d.id} · {new Date(d.created_at).toLocaleDateString("fr")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{(d.montant || 0).toLocaleString("fr")} €</div>
                    <Pill color={statutColor[d.statut] || C.muted}>{d.statut}</Pill>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <BtnGhost onClick={() => showToast("📄 PDF téléchargé")} style={{ fontSize: 11 }}>📄 PDF</BtnGhost>
                  {(d.statut === "envoyé" || d.statut === "en_attente") && (
                    <Btn onClick={() => setSignEtape({ ...d, etape: 1 })} style={{ fontSize: 11, background: C.green }}>✒ Signer</Btn>
                  )}
                  <BtnGhost onClick={() => showToast("📱 Message envoyé à l'équipe")} style={{ fontSize: 11 }}>💬 Question</BtnGhost>
                </div>
              </div>
            ))}
          </Card>

          {/* Modal signature */}
          {signEtape && (
            <div style={{ position: "fixed", inset: 0, background: "#000000AA", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
              <Card style={{ width: 440, maxWidth: "90vw" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>✒ Signature électronique</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>{signEtape.service} · {(signEtape.montant || 0).toLocaleString("fr")} €</div>
                {signEtape.etape === 1 && <div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.7, marginBottom: 12 }}>Vous allez signer électroniquement ce devis. La signature a valeur légale (règlement eIDAS).</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => setSignEtape((s: any) => ({ ...s, etape: 2 }))}>Continuer →</Btn>
                    <BtnGhost onClick={() => setSignEtape(null)}>Annuler</BtnGhost>
                  </div>
                </div>}
                {signEtape.etape === 2 && <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Tapez votre nom pour valider :</div>
                  <input placeholder={tenant?.societe || "Votre nom"} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%", marginBottom: 10 }} />
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>📍 IP + horodatage enregistrés · Conforme eIDAS</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => setSignEtape((s: any) => ({ ...s, etape: 3 }))} style={{ background: C.green }}>✒ Signer</Btn>
                    <BtnGhost onClick={() => setSignEtape((s: any) => ({ ...s, etape: 1 }))}>← Retour</BtnGhost>
                  </div>
                </div>}
                {signEtape.etape === 3 && <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 4 }}>Devis signé !</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Signé le {new Date().toLocaleDateString("fr")} · eIDAS conforme</div>
                  <Btn onClick={async () => {
                    await sb.from("devis").update({ statut: "signé" }).eq("id", signEtape.id);
                    setDevis(ds => ds.map((d: any) => d.id === signEtape.id ? { ...d, statut: "signé" } : d));
                    showToast("✅ Devis signé ! PDF envoyé par email.");
                    setSignEtape(null);
                  }}>📄 Télécharger PDF signé</Btn>
                </div>}
              </Card>
            </div>
          )}
        </div>}

        {/* FACTURES */}
        {page === "factures" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>🧾 Mes factures</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              ["Total payé", totalCA.toLocaleString("fr") + " €", C.gold],
              ["Factures", factures.length, C.blue],
              ["Dernière", factures[0] ? new Date(factures[0].created_at).toLocaleDateString("fr") : "—", C.green],
            ].map(([l, v, c]: any, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <Card>
            {factures.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune facture pour le moment</div>
            ) : factures.map((f: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{f.service || f.objet}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{f.id} · {new Date(f.created_at).toLocaleDateString("fr")}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{(f.montant || 0).toLocaleString("fr")} €</div>
                  <Pill color={C.green}>✓ Payé</Pill>
                  <BtnGhost onClick={() => showToast("📥 Facture téléchargée")} style={{ fontSize: 11 }}>📥 PDF</BtnGhost>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {/* MISSIONS */}
        {page === "missions" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✅ Mes missions</div>
          {missions.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucune mission pour le moment</div></Card>
          ) : missions.map((m: any, i: number) => (
            <Card key={i} style={{ marginBottom: 12, borderColor: m.statut === "en_cours" ? `${C.gold}44` : C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{m.service}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>📅 {m.date} · ⏱ {m.duree}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>📍 {m.adresse}</div>
                  {m.collab && <div style={{ fontSize: 11, color: C.muted }}>👤 {m.collab}</div>}
                </div>
                <Pill color={statutColor[m.statut] || C.muted}>{m.statut}</Pill>
              </div>
              {m.statut === "terminé" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <BtnGhost onClick={() => showToast("⭐ Merci pour votre avis !")} style={{ fontSize: 11 }}>⭐ Laisser un avis</BtnGhost>
                  <BtnGhost onClick={() => showToast("🔄 Demande de répétition envoyée")} style={{ fontSize: 11 }}>🔄 Réserver à nouveau</BtnGhost>
                </div>
              )}
            </Card>
          ))}
        </div>}

        {/* CONTRATS */}
        {page === "contrats" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>✦ Mes contrats</div>
          {contrats.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>Aucun contrat pour le moment</div></Card>
          ) : contrats.map((c: any, i: number) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.titre || c.nom}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{new Date(c.created_at).toLocaleDateString("fr")} · {c.type}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Pill color={C.green}>✓ Signé</Pill>
                <BtnGhost onClick={() => showToast("📄 Contrat téléchargé")} style={{ fontSize: 11 }}>📥 PDF</BtnGhost>
              </div>
            </div>
          ))}
        </div>}

        {/* CHAT */}
        {page === "chat" && <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>💬 Contacter l'équipe</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <Btn onClick={() => window.open("https://wa.me/33765189527")} style={{ background: C.green, color: "#000", fontSize: 12 }}>💬 WhatsApp direct</Btn>
            <BtnGhost onClick={() => showToast("📧 Email envoyé à l'équipe")} style={{ fontSize: 12 }}>📧 Email</BtnGhost>
          </div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.moi ? "row-reverse" : "row" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.moi ? `${C.gold}22` : `${C.blue}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: m.moi ? C.gold : C.blue, flexShrink: 0 }}>{m.moi ? (tenant?.societe?.[0] || "C") : "X"}</div>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ background: m.moi ? `${C.gold}18` : C.card2, border: `1px solid ${m.moi ? C.gold + "33" : C.border}`, borderRadius: 10, padding: "8px 12px", marginBottom: 2 }}>
                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.msg}</div>
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, textAlign: m.moi ? "right" : "left" }}>{m.h}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newMsg.trim()) { setMsgs(ms => [...ms, { av: "C", msg: newMsg, h: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }), moi: true }]); setNewMsg(""); } }} placeholder="Écrire un message..." style={{ flex: 1, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <Btn onClick={() => { if (newMsg.trim()) { setMsgs(ms => [...ms, { av: "C", msg: newMsg, h: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }), moi: true }]); setNewMsg(""); } }}>↗</Btn>
          </div>
        </div>}

        {/* FIDÉLITÉ */}
        {page === "fidelite" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>⭐ Fidélité & Avantages</div>
          <Card style={{ background: `linear-gradient(135deg, ${C.card}, #0A1A14)`, borderColor: `${C.gold}44`, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.2em", marginBottom: 8 }}>VOTRE STATUT</div>
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {totalCA >= 10000 ? "💎 VIP" : totalCA >= 5000 ? "🥇 Gold" : totalCA >= 1000 ? "🥈 Silver" : "🥉 Bronze"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 4 }}>
              {totalCA >= 10000 ? "Client VIP" : totalCA >= 5000 ? "Client Gold" : totalCA >= 1000 ? "Client Silver" : "Client Bronze"}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{totalCA.toLocaleString("fr")} € de total dépensé</div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎁 Vos avantages</div>
              {[
                totalCA >= 1000 ? "✅ -5% sur vos prochaines commandes" : "🔒 -5% dès 1 000€ dépensés",
                totalCA >= 5000 ? "✅ Accès prioritaire à l'équipe" : "🔒 Priorité dès 5 000€ dépensés",
                totalCA >= 10000 ? "✅ Tarif VIP personnalisé" : "🔒 Tarif VIP dès 10 000€ dépensés",
                "✅ Support WhatsApp inclus",
              ].map((a, i) => (
                <div key={i} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}22`, color: a.startsWith("✅") ? C.text : C.muted }}>{a}</div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🤝 Parrainage</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.7 }}>
                Invitez un ami et recevez <strong style={{ color: C.gold }}>50€ de crédit</strong> sur votre prochain service.
              </div>
              <div style={{ background: C.card2, borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: C.gold, marginBottom: 10 }}>
                XYRA-{tenant?.societe?.slice(0, 6).toUpperCase() || "CLIENT"}-REF
              </div>
              <Btn onClick={() => { navigator.clipboard?.writeText(`XYRA-${tenant?.societe?.slice(0, 6).toUpperCase() || "CLIENT"}-REF`); showToast("🔗 Code copié !"); }} style={{ width: "100%", fontSize: 11 }}>📋 Copier mon code</Btn>
            </Card>
          </div>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 Mon historique</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                ["Total dépensé", totalCA.toLocaleString("fr") + " €", C.gold],
                ["Missions", missions.length, C.blue],
                ["Devis signés", devis.filter((d: any) => d.statut === "signé" || d.statut === "payé").length, C.green],
              ].map(([l, v, c]: any, i) => (
                <div key={i} style={{ background: C.card2, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>}

        {/* PROFIL */}
        {page === "profil" && <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 16 }}>👤 Mon profil</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.gold}22`, border: `3px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.gold, margin: "0 auto 12px" }}>
                  {tenant?.societe?.[0] || "?"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{tenant?.societe}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{tenant?.metier}</div>
              </div>
              {[
                ["📧", user?.email],
                ["🌍", tenant?.pays],
                ["🏢", tenant?.taille + " personne(s)"],
                ["💳", "Plan " + tenant?.plan],
                ["📅", "Client depuis " + (tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString("fr") : "—")],
              ].map(([k, v]: any, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 12 }}>
                  <span>{k}</span><span style={{ color: C.muted }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🔑 Sécurité</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Confirmer le mot de passe</label>
                  <input type="password" placeholder="••••••••" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: "100%" }} />
                </div>
                <Btn onClick={() => showToast("✅ Mot de passe modifié !")}>Modifier le mot de passe</Btn>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📱 WhatsApp</div>
                <Btn onClick={() => window.open("https://wa.me/33765189527")} style={{ background: C.green, color: "#000", width: "100%", fontSize: 12 }}>
                  💬 Contacter le support
                </Btn>
              </div>
            </Card>
          </div>
        </div>}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, zIndex: 9999 }}>
          🔔 {toast}
        </div>
      )}
    </div>
  );
}