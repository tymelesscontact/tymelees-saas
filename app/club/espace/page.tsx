"use client";
import { useState, useEffect } from "react";

const OR = "#c9a96e";
const IVOIRE = "#f0ead6";
const NOIR = "#0a0a0a";
const CARTE = "#111014";
const GRIS = "#78716a";
const GRIS_CLAIR = "#a39c8e";
const TRAIT = "#1f1c16";

export default function EspaceMembre() {
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [moi, setMoi] = useState<any>(null);
  const [lectureSeule, setLectureSeule] = useState(false);
  const [membres, setMembres] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [evenements, setEvenements] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [onglet, setOnglet] = useState("annuaire");
  const [recherche, setRecherche] = useState("");
  const [filtrePays, setFiltrePays] = useState("");
  const [selection, setSelection] = useState<any>(null);

  const charger = async () => {
    try {
      const res = await fetch("/api/club-espace?action=accueil");
      const d = await res.json();
      if (!res.ok) { setErreur(d.error || "acces_refuse"); setChargement(false); return; }
      setMoi(d.moi); setLectureSeule(!!d.lecture_seule);
      setMembres(d.membres || []); setDemandes(d.demandes || []);
      setEvenements(d.evenements || []);
      try {
        const rd = await fetch("/api/club-deals");
        const dd = await rd.json();
        if (rd.ok) setDeals(dd.deals || []);
      } catch {}
    } catch { setErreur("connexion"); }
    setChargement(false);
  };
  useEffect(() => { charger(); }, []);

  const pays = Array.from(new Set(membres.map((m) => m.pays).filter(Boolean))).sort();
  const filtres = membres.filter((m) => {
    if (filtrePays && m.pays !== filtrePays) return false;
    if (!recherche) return true;
    const t = recherche.toLowerCase();
    return [m.nom, m.metier, m.secteur, m.ville, m.pays, m.propose, m.recherche]
      .filter(Boolean).join(" ").toLowerCase().includes(t);
  });

  if (chargement) {
    return <div style={{ background: NOIR, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GRIS, fontFamily: "system-ui,sans-serif", fontSize: 13 }}>Chargement...</div>;
  }

  if (erreur) {
    const messages: Record<string, string> = {
      non_connecte: "Connectez-vous pour acceder a l'espace membre.",
      session_invalide: "Votre session a expire. Reconnectez-vous.",
      pas_membre: "Ce compte n'est pas rattache a un membre du club.",
      adhesion_inactive: "Votre adhesion n'est pas encore active.",
      adhesion_expiree: "Votre adhesion est arrivee a echeance.",
      connexion: "Impossible de joindre le serveur.",
    };
    return (
      <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontStyle: "italic", color: OR, marginBottom: 18 }}>Acces reserve</div>
        <div style={{ fontSize: 14, color: GRIS, lineHeight: 1.8, maxWidth: 380, marginBottom: 30 }}>{messages[erreur] || "Acces refuse."}</div>
        <a href="/club/connexion" style={{ padding: "13px 30px", border: `0.5px solid ${OR}`, color: OR, fontSize: 13, textDecoration: "none" }}>Se connecter</a>
        <a href="/club" style={{ marginTop: 18, fontSize: 12, color: GRIS, textDecoration: "underline" }}>Retour au club</a>
      </div>
    );
  }

  const Carte = ({ children, style = {} }: any) => (
    <div style={{ background: CARTE, border: `0.5px solid ${TRAIT}`, borderRadius: 4, padding: 20, ...style }}>{children}</div>
  );

  return (
    <div style={{ background: NOIR, minHeight: "100vh", color: IVOIRE, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`
        input, select, textarea { background: transparent; border: 0.5px solid ${TRAIT}; border-radius: 2px; padding: 10px 13px; color: ${IVOIRE}; font-size: 13px; font-family: inherit; outline: none; width: 100%; }
        input::placeholder, textarea::placeholder { color: #4f4a43; }
        @media (max-width: 780px) { .grille { grid-template-columns: 1fr !important; } .duo { grid-template-columns: 1fr !important; } }
      `}</style>

      <nav style={{ position: "sticky", top: 0, background: NOIR, zIndex: 50, borderBottom: `0.5px solid ${TRAIT}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontStyle: "italic", color: OR }}>Xyra Club</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 12 }}>
            <span style={{ color: GRIS }}>{moi?.nom}</span>
            <span style={{ color: "#4f4a43", fontSize: 11 }}>N&deg; {moi?.numero_adherent || "—"}</span>
          </div>
        </div>
      </nav>

      {lectureSeule && (
        <div style={{ background: "#3a2a0a", borderBottom: `0.5px solid ${OR}44`, padding: "12px 28px", fontSize: 12, color: "#d4b878", textAlign: "center" }}>
          Votre adhesion est arrivee a echeance. Vous disposez d&apos;un mois pour la renouveler.
        </div>
      )}

      <div style={{ display: "flex", gap: 4, padding: "18px 28px 0", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap" }}>
        {[["annuaire", "Annuaire"], ["demandes", "Demandes"], ["deals", "Mes deals"], ["evenements", "Evenements"], ["profil", "Mon profil"]].map(([id, label]) => (
          <button key={id} onClick={() => { setOnglet(id); setSelection(null); }}
            style={{ background: onglet === id ? CARTE : "transparent", border: "none", borderBottom: onglet === id ? `1px solid ${OR}` : "1px solid transparent", color: onglet === id ? OR : GRIS, padding: "11px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 60px" }}>

        {onglet === "annuaire" && (selection ? (
          <div>
            <button onClick={() => setSelection(null)} style={{ background: "none", border: "none", color: GRIS, fontSize: 12, cursor: "pointer", marginBottom: 18, fontFamily: "inherit" }}>&larr; Retour a l&apos;annuaire</button>
            <Carte>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 24, marginBottom: 4 }}>{selection.nom}</div>
              <div style={{ fontSize: 13, color: OR, marginBottom: 16 }}>{selection.metier}{selection.secteur ? " · " + selection.secteur : ""}</div>
              <div style={{ fontSize: 12, color: GRIS, marginBottom: 18 }}>{[selection.ville, selection.pays].filter(Boolean).join(", ")}</div>
              {selection.bio && <div style={{ fontSize: 13, color: GRIS_CLAIR, lineHeight: 1.8, marginBottom: 20 }}>{selection.bio}</div>}
              <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
                {selection.propose && <div><div style={{ fontSize: 11, color: "#8a7a55", marginBottom: 6, letterSpacing: "0.1em" }}>PROPOSE</div><div style={{ fontSize: 13, color: GRIS_CLAIR, lineHeight: 1.7 }}>{selection.propose}</div></div>}
                {selection.recherche && <div><div style={{ fontSize: 11, color: "#8a7a55", marginBottom: 6, letterSpacing: "0.1em" }}>CHERCHE</div><div style={{ fontSize: 13, color: GRIS_CLAIR, lineHeight: 1.7 }}>{selection.recherche}</div></div>}
              </div>
              {selection.expansion_pays && (
                <div style={{ borderLeft: `1px solid ${OR}`, paddingLeft: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "#8a7a55", marginBottom: 4, letterSpacing: "0.1em" }}>SE DEVELOPPE VERS</div>
                  <div style={{ fontSize: 13, color: IVOIRE }}>{selection.expansion_pays}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 22, fontSize: 12, color: GRIS, paddingTop: 16, borderTop: `0.5px solid ${TRAIT}` }}>
                <span>Reputation <strong style={{ color: OR }}>{selection.score_reputation || 0}</strong></span>
                <span>Deals <strong style={{ color: OR }}>{selection.nb_deals || 0}</strong></span>
                {selection.tel_visible && selection.tel && <span>{selection.tel}</span>}
                {selection.linkedin && <a href={selection.linkedin} target="_blank" rel="noreferrer" style={{ color: OR }}>LinkedIn</a>}
              </div>
            </Carte>
          </div>
        ) : (
          <div>
            <div className="duo" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 22 }}>
              <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un metier, une ville, un besoin..." />
              <select value={filtrePays} onChange={(e) => setFiltrePays(e.target.value)}>
                <option value="">Tous les pays</option>
                {pays.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 12, color: GRIS, marginBottom: 16 }}>{filtres.length} membre{filtres.length > 1 ? "s" : ""}</div>
            <div className="grille" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {filtres.map((m) => (
                <div key={m.id} onClick={() => setSelection(m)} style={{ background: CARTE, border: `0.5px solid ${TRAIT}`, borderRadius: 4, padding: 18, cursor: "pointer" }}>
                  <div style={{ fontSize: 15, marginBottom: 3 }}>{m.nom}</div>
                  <div style={{ fontSize: 12, color: OR, marginBottom: 8 }}>{m.metier}</div>
                  <div style={{ fontSize: 11, color: GRIS, marginBottom: 12 }}>{[m.ville, m.pays].filter(Boolean).join(", ")}</div>
                  {m.propose && <div style={{ fontSize: 12, color: GRIS_CLAIR, lineHeight: 1.6, marginBottom: 12 }}>{String(m.propose).slice(0, 90)}{String(m.propose).length > 90 ? "..." : ""}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRIS, paddingTop: 12, borderTop: `0.5px solid ${TRAIT}` }}>
                    <span>{m.nb_deals || 0} deal{(m.nb_deals || 0) > 1 ? "s" : ""}</span>
                    <span style={{ color: OR }}>{m.score_reputation || 0}</span>
                  </div>
                </div>
              ))}
              {filtres.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 50, color: GRIS, fontSize: 13 }}>Aucun membre ne correspond.</div>}
            </div>
          </div>
        ))}

        {onglet === "demandes" && (
          <div>
            <Carte style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 14 }}>PUBLIER UNE DEMANDE</div>
              <FormDemande onPublie={charger} desactive={lectureSeule} />
            </Carte>
            <div style={{ fontSize: 12, color: GRIS, marginBottom: 14 }}>{demandes.length} demande{demandes.length > 1 ? "s" : ""} en cours</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {demandes.map((d) => {
                const auteur = membres.find((m) => m.id === d.membre_id);
                return (
                  <div key={d.id} style={{ background: CARTE, border: `0.5px solid ${TRAIT}`, borderRadius: 4, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ fontSize: 14, marginBottom: 5 }}>{d.titre}</div>
                        {d.description && <div style={{ fontSize: 12, color: GRIS_CLAIR, lineHeight: 1.7, marginBottom: 10 }}>{d.description}</div>}
                        <div style={{ display: "flex", gap: 14, fontSize: 11, color: GRIS, flexWrap: "wrap" }}>
                          {d.metier_recherche && <span>Cherche : {d.metier_recherche}</span>}
                          {(d.ville || d.pays) && <span>{[d.ville, d.pays].filter(Boolean).join(", ")}</span>}
                          {d.budget && <span>Budget : {d.budget} &euro;</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: 11, color: GRIS }}>
                        <div style={{ color: OR, marginBottom: 3 }}>{auteur?.nom || "Membre"}</div>
                        <div>{auteur?.metier || ""}</div>
                        {d.membre_id === moi?.id && (
                          <button onClick={async () => {
                            await fetch("/api/club-espace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "fermer_demande", demande_id: d.id }) });
                            charger();
                          }} style={{ marginTop: 10, background: "none", border: `0.5px solid ${TRAIT}`, color: GRIS, fontSize: 11, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Fermer</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {demandes.length === 0 && <div style={{ textAlign: "center", padding: 50, color: GRIS, fontSize: 13 }}>Aucune demande en cours.</div>}
            </div>
          </div>
        )}

        {onglet === "evenements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {evenements.map((e) => (
              <div key={e.id} style={{ background: CARTE, border: `0.5px solid ${TRAIT}`, borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, color: OR, marginBottom: 6 }}>{e.date}{e.heure ? " · " + e.heure : ""}</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18, marginBottom: 8 }}>{e.titre || e.nom}</div>
                {e.description && <div style={{ fontSize: 12, color: GRIS_CLAIR, lineHeight: 1.7, marginBottom: 10 }}>{e.description}</div>}
                <div style={{ fontSize: 11, color: GRIS }}>{e.lieu || ""}{e.max_inscrits ? ` · ${e.max_inscrits} places` : ""}</div>
              </div>
            ))}
            {evenements.length === 0 && <div style={{ textAlign: "center", padding: 50, color: GRIS, fontSize: 13 }}>Aucun evenement a venir.</div>}
          </div>
        )}

        {onglet === "deals" && (
          <div>
            <Carte style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 6 }}>PROPOSER UN DEAL</div>
              <div style={{ fontSize: 11, color: "#4f4a43", marginBottom: 16, lineHeight: 1.6 }}>
                Le paiement est bloque jusqu&apos;a validation de la prestation. Xyra preleve 3%.
              </div>
              <FormDeal membres={membres} moi={moi} onCree={charger} desactive={lectureSeule} />
            </Carte>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {deals.map((d) => {
                const prest = membres.find((m) => m.id === d.membre_prestataire);
                const client = membres.find((m) => m.id === d.membre_client);
                const app = membres.find((m) => m.id === d.membre_apporteur);
                const jeSuisClient = d.membre_client === moi?.id;
                const jeSuisPrest = d.membre_prestataire === moi?.id;
                const couleurs: any = { propose: "#c9a96e", accepte: "#7ea8c9", paye: "#c9a96e", livre: "#a3c97e", valide: "#7ec99a", refuse: "#c96e6e" };
                const agir = async (act: string) => {
                  const r = await fetch("/api/club-deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: act, deal_id: d.id }) });
                  const dd = await r.json();
                  if (dd.url) { window.location.href = dd.url; return; }
                  charger();
                };
                return (
                  <div key={d.id} style={{ background: CARTE, border: `0.5px solid ${TRAIT}`, borderRadius: 4, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ fontSize: 11, color: GRIS, marginBottom: 4 }}>{d.reference}</div>
                        <div style={{ fontSize: 15, marginBottom: 6 }}>{d.titre}</div>
                        <div style={{ fontSize: 12, color: GRIS }}>
                          {prest?.nom || "—"} <span style={{ color: "#4f4a43" }}>pour</span> {client?.nom || "—"}
                          {app && <span style={{ color: OR }}> · apporte par {app.nom}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "Georgia,serif", fontSize: 22, color: OR }}>{Number(d.montant).toLocaleString("fr")} &euro;</div>
                        <div style={{ fontSize: 11, color: couleurs[d.statut] || GRIS, marginTop: 4 }}>{d.statut}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 18, fontSize: 11, color: GRIS, paddingTop: 12, borderTop: `0.5px solid ${TRAIT}`, flexWrap: "wrap" }}>
                      {Number(d.commission_apporteur_montant) > 0 && <span>Apport {d.commission_apporteur_pct}% : {Number(d.commission_apporteur_montant).toLocaleString("fr")} &euro;</span>}
                      <span>Xyra 3% : {Number(d.commission_xyra_montant).toLocaleString("fr")} &euro;</span>
                      <span style={{ color: GRIS_CLAIR }}>Net : {Number(d.montant_net).toLocaleString("fr")} &euro;</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                      {jeSuisClient && d.statut === "propose" && <>
                        <button onClick={() => agir("accepter")} style={{ background: OR, color: NOIR, border: "none", padding: "9px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Accepter</button>
                        <button onClick={() => agir("refuser")} style={{ background: "none", border: `0.5px solid ${TRAIT}`, color: GRIS, padding: "9px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Refuser</button>
                      </>}
                      {jeSuisClient && d.statut === "accepte" && <button onClick={() => agir("payer")} style={{ background: OR, color: NOIR, border: "none", padding: "9px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Payer {Number(d.montant).toLocaleString("fr")} &euro;</button>}
                      {jeSuisPrest && d.statut === "paye" && <button onClick={() => agir("livrer")} style={{ background: OR, color: NOIR, border: "none", padding: "9px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Marquer livre</button>}
                      {jeSuisClient && d.statut === "livre" && <button onClick={() => agir("valider")} style={{ background: "#7ec99a", color: NOIR, border: "none", padding: "9px 18px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Valider et liberer les fonds</button>}
                    </div>
                  </div>
                );
              })}
              {deals.length === 0 && <div style={{ textAlign: "center", padding: 50, color: GRIS, fontSize: 13 }}>Aucun deal en cours.</div>}
            </div>
          </div>
        )}

        {onglet === "profil" && <FormProfil moi={moi} onMaj={charger} desactive={lectureSeule} />}
      </div>
    </div>
  );
}

function FormDemande({ onPublie, desactive }: any) {
  const [f, setF] = useState({ titre: "", description: "", metier_recherche: "", ville: "", pays: "", budget: "" });
  const [envoi, setEnvoi] = useState(false);
  const publier = async () => {
    if (!f.titre || envoi) return;
    setEnvoi(true);
    await fetch("/api/club-espace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publier_demande", ...f, budget: f.budget ? Number(f.budget) : null }) });
    setF({ titre: "", description: "", metier_recherche: "", ville: "", pays: "", budget: "" });
    setEnvoi(false);
    onPublie();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} placeholder="Je cherche un fournisseur de textile a Dakar" />
      <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Precisez votre besoin" rows={3} />
      <div className="grille" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <input value={f.metier_recherche} onChange={(e) => setF({ ...f, metier_recherche: e.target.value })} placeholder="Metier" />
        <input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} placeholder="Ville" />
        <input value={f.pays} onChange={(e) => setF({ ...f, pays: e.target.value })} placeholder="Pays" />
        <input value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} placeholder="Budget" type="number" />
      </div>
      <div onClick={desactive ? undefined : publier} style={{ alignSelf: "flex-start", padding: "11px 26px", background: "#c9a96e", color: "#0a0a0a", fontSize: 12, cursor: desactive || envoi ? "default" : "pointer", opacity: desactive || envoi ? 0.4 : 1 }}>
        {envoi ? "Publication..." : "Publier"}
      </div>
    </div>
  );
}

function FormProfil({ moi, onMaj, desactive }: any) {
  const [f, setF] = useState<any>({
    metier: moi?.metier || "", secteur: moi?.secteur || "", ville: moi?.ville || "", pays: moi?.pays || "",
    bio: moi?.bio || "", propose: moi?.propose || "", recherche: moi?.recherche || "",
    expansion_pays: moi?.expansion_pays || "", expansion_type: moi?.expansion_type || "",
    interets: moi?.interets || "", references_pro: moi?.references_pro || "",
    tel: moi?.tel || "", linkedin: moi?.linkedin || "", tel_visible: moi?.tel_visible !== false,
  });
  const [envoi, setEnvoi] = useState(false);
  const [ok, setOk] = useState(false);
  const enregistrer = async () => {
    if (envoi) return;
    setEnvoi(true); setOk(false);
    await fetch("/api/club-espace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "maj_profil", ...f }) });
    setEnvoi(false); setOk(true); onMaj();
  };
  const champ = (cle: string, libelle: string, type = "text") => (
    <div>
      <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>{libelle}</label>
      <input type={type} value={f[cle]} onChange={(e) => setF({ ...f, [cle]: e.target.value })} />
    </div>
  );
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#111014", border: "0.5px solid #1f1c16", borderRadius: 4, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 16 }}>MON ACTIVITE</div>
        <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {champ("metier", "Metier")}{champ("secteur", "Secteur")}
          {champ("ville", "Ville")}{champ("pays", "Pays")}
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Presentation</label>
          <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} />
        </div>
      </div>

      <div style={{ background: "#111014", border: "0.5px solid #1f1c16", borderRadius: 4, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 16 }}>CE QUE J&apos;APPORTE, CE QUE JE CHERCHE</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Je propose</label>
          <textarea value={f.propose} onChange={(e) => setF({ ...f, propose: e.target.value })} rows={2} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Je cherche</label>
          <textarea value={f.recherche} onChange={(e) => setF({ ...f, recherche: e.target.value })} rows={2} />
        </div>
      </div>

      <div style={{ background: "#111014", border: "0.5px solid #1f1c16", borderRadius: 4, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 6 }}>MON DEVELOPPEMENT INTERNATIONAL</div>
        <div style={{ fontSize: 11, color: "#4f4a43", marginBottom: 16, lineHeight: 1.6 }}>Les membres sur place seront prevenus, et vous serez mis en relation.</div>
        <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {champ("expansion_pays", "Pays vises")}
          <div>
            <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Objectif</label>
            <select value={f.expansion_type} onChange={(e) => setF({ ...f, expansion_type: e.target.value })}>
              <option value="">—</option>
              <option value="vendre">Vendre a distance</option>
              <option value="implanter">M&apos;implanter sur place</option>
              <option value="les_deux">Les deux</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: "#111014", border: "0.5px solid #1f1c16", borderRadius: 4, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#8a7a55", letterSpacing: "0.1em", marginBottom: 16 }}>CONTACT ET REFERENCES</div>
        <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {champ("tel", "Telephone")}{champ("linkedin", "LinkedIn")}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>References</label>
          <textarea value={f.references_pro} onChange={(e) => setF({ ...f, references_pro: e.target.value })} rows={2} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Centres d&apos;interet</label>
          <input value={f.interets} onChange={(e) => setF({ ...f, interets: e.target.value })} placeholder="Art, voile, gastronomie..." />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#a39c8e", cursor: "pointer" }}>
          <input type="checkbox" checked={f.tel_visible} onChange={(e) => setF({ ...f, tel_visible: e.target.checked })} style={{ width: "auto" }} />
          Afficher mon telephone aux autres membres
        </label>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={desactive ? undefined : enregistrer} style={{ padding: "13px 30px", background: "#c9a96e", color: "#0a0a0a", fontSize: 13, cursor: desactive || envoi ? "default" : "pointer", opacity: desactive || envoi ? 0.4 : 1 }}>
          {envoi ? "Enregistrement..." : "Enregistrer"}
        </div>
        {ok && <span style={{ fontSize: 12, color: "#7ec99a" }}>Profil enregistre</span>}
      </div>
    </div>
  );
}

function FormDeal({ membres, moi, onCree, desactive }: any) {
  const [f, setF] = useState<any>({
    membre_client: "", membre_apporteur: "", titre: "", description: "",
    montant: "", commission_apporteur_pct: "5",
  });
  const [envoi, setEnvoi] = useState(false);
  const autres = (membres || []).filter((m: any) => m.id !== moi?.id);

  const m = Number(f.montant) || 0;
  const pctApp = f.membre_apporteur ? Number(f.commission_apporteur_pct) || 0 : 0;
  const commApp = Math.round(m * pctApp) / 100;
  const commXyra = Math.round(m * 3) / 100;
  const net = m - commApp - commXyra;

  const proposer = async () => {
    if (!f.membre_client || !f.titre || !f.montant || envoi) return;
    setEnvoi(true);
    await fetch("/api/club-deals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "proposer", ...f, montant: Number(f.montant) }),
    });
    setF({ membre_client: "", membre_apporteur: "", titre: "", description: "", montant: "", commission_apporteur_pct: "5" });
    setEnvoi(false);
    onCree();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} placeholder="Objet du deal" />
      <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Ce qui est convenu" rows={2} />
      <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Client</label>
          <select value={f.membre_client} onChange={(e) => setF({ ...f, membre_client: e.target.value })}>
            <option value="">— Choisir —</option>
            {autres.map((mm: any) => <option key={mm.id} value={mm.id}>{mm.nom} — {mm.metier}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Montant (&euro;)</label>
          <input type="number" value={f.montant} onChange={(e) => setF({ ...f, montant: e.target.value })} />
        </div>
      </div>
      <div className="duo" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Apporteur (facultatif)</label>
          <select value={f.membre_apporteur} onChange={(e) => setF({ ...f, membre_apporteur: e.target.value })}>
            <option value="">— Aucun —</option>
            {autres.filter((mm: any) => mm.id !== f.membre_client).map((mm: any) => <option key={mm.id} value={mm.id}>{mm.nom}</option>)}
          </select>
        </div>
        {f.membre_apporteur && (
          <div>
            <label style={{ fontSize: 11, color: "#78716a", display: "block", marginBottom: 6 }}>Sa commission (%)</label>
            <input type="number" value={f.commission_apporteur_pct} onChange={(e) => setF({ ...f, commission_apporteur_pct: e.target.value })} />
          </div>
        )}
      </div>

      {m > 0 && (
        <div style={{ background: "#0d0c10", border: "0.5px solid #1f1c16", borderRadius: 3, padding: 14, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#78716a" }}>
            <span>Montant du deal</span><span>{m.toLocaleString("fr")} &euro;</span>
          </div>
          {commApp > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#78716a" }}>
              <span>Apporteur ({pctApp}%)</span><span>&minus; {commApp.toLocaleString("fr")} &euro;</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#78716a" }}>
            <span>Xyra (3%)</span><span>&minus; {commXyra.toLocaleString("fr")} &euro;</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "0.5px solid #1f1c16", color: "#c9a96e", fontWeight: 600 }}>
            <span>Vous recevez</span><span>{net.toLocaleString("fr")} &euro;</span>
          </div>
        </div>
      )}

      <div onClick={desactive ? undefined : proposer}
        style={{ alignSelf: "flex-start", padding: "12px 28px", background: "#c9a96e", color: "#0a0a0a", fontSize: 12, cursor: desactive || envoi ? "default" : "pointer", opacity: desactive || envoi ? 0.4 : 1 }}>
        {envoi ? "Envoi..." : "Proposer le deal"}
      </div>
    </div>
  );
}
