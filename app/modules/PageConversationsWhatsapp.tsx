"use client";
import { useState, useEffect } from "react";
import { C, Card, CT, Btn, BtnGhost } from "../lib/ui";

const PageConversationsWhatsApp = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations-whatsapp");
      const data = await res.json();
      setConversations(data.conversations || []);
      if (selected) {
        const updated = (data.conversations || []).find((c: any) => c.whatsapp === selected.whatsapp);
        if (updated) setSelected(updated);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const envoyerMessage = async () => {
    if (!messageInput.trim() || !selected) return;
    setSending(true);
    try {
      await fetch("/api/conversations-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "envoyer", whatsapp: selected.whatsapp, message: messageInput }),
      });
      setMessageInput("");
      await load();
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const reactiverIA = async () => {
    if (!selected) return;
    await fetch("/api/conversations-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactiver_ia", whatsapp: selected.whatsapp }),
    });
    await load();
  };

  const supprimerMessage = async (index: number) => {
    if (!selected || !confirm("Supprimer ce message ?")) return;
    await fetch("/api/conversations-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "supprimer_message", whatsapp: selected.whatsapp, messageIndex: index }),
    });
    await load();
  };

  const supprimerConversation = async () => {
    if (!selected || !confirm("Supprimer TOUTE cette conversation ? Cette action est irreversible.")) return;
    await fetch("/api/conversations-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "supprimer_conversation", whatsapp: selected.whatsapp }),
    });
    setSelected(null);
    await load();
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif", marginBottom: 4 }}>
        💬 Conversations WhatsApp — Lea
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
        Toutes les conversations gerees par Lea · Prenez la main a tout moment
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 500 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {loading && conversations.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 12 }}>Chargement...</div>
            )}
            {!loading && conversations.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 12 }}>Aucune conversation</div>
            )}
            {conversations.map((c: any) => (
              <div
                key={c.whatsapp}
                onClick={() => setSelected(c)}
                style={{
                  padding: "12px 14px",
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                  background: selected?.whatsapp === c.whatsapp ? `${C.purple}15` : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.nom || c.whatsapp}</div>
                  {c.ia_pausee && (
                    <span style={{ fontSize: 9, background: `${C.orange}22`, color: C.orange, borderRadius: 10, padding: "1px 6px" }}>
                      Pausee
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{c.whatsapp}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          {!selected ? (
            <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 12 }}>Selectionnez une conversation</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{selected.nom || selected.whatsapp}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{selected.whatsapp}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {selected.ia_pausee && (
                    <Btn onClick={reactiverIA} color={C.green} style={{ fontSize: 11 }}>
                      ▶ Reactiver Lea
                    </Btn>
                  )}
                  <BtnGhost onClick={supprimerConversation} style={{ fontSize: 11, color: C.red, borderColor: `${C.red}44` }}>
                    🗑 Suppr. conversation
                  </BtnGhost>
                </div>
              </div>
              <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {(selected.historique || []).map((m: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                      maxWidth: "75%",
                      background: m.role === "user" ? C.card2 : m.role === "owner" ? `${C.blue}22` : `${C.purple}22`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      position: "relative",
                    }}
          >
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>
                      {m.role === "user" ? "Client" : m.role === "owner" ? "Vous" : "Lea"}
                    </div>
                    <div style={{ fontSize: 12, color: C.text }}>{m.content}</div>
                    <button
                      onClick={() => supprimerMessage(i)}
                      style={{ position: "absolute", top: 2, right: 4, background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 10 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && envoyerMessage()}
                  placeholder="Ecrire un message (prend la main automatiquement)..."
                  style={{ flex: 1, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 12, fontFamily: "inherit" }}
                />
                <Btn onClick={envoyerMessage} disabled={sending || !messageInput.trim()}>
                  {sending ? "..." : "Envoyer"}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PageConversationsWhatsApp;
