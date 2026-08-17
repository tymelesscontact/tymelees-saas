/**
 * Ouvre une conversation avec un contact depuis n'importe quel module.
 * Retrouve la conversation existante si elle existe, sinon la cree.
 */
export async function ouvrirChat(
  contact: { nom?: string; email?: string; tel?: string; type?: string },
  setPage?: (p: string) => void,
  showToast?: (m: string) => void
) {
  if (!contact?.nom) {
    showToast?.("⚠️ Ce contact n'a pas de nom");
    return false;
  }
  if (!contact.email && !contact.tel) {
    showToast?.("⚠️ Ce contact n'a ni email ni telephone");
    return false;
  }
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'creer_conversation',
        espace: 'externe',
        contact_nom: contact.nom,
        contact_type: contact.type || 'client',
        contact_email: contact.email || null,
        contact_tel: contact.tel || null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast?.(data.existante ? `Conversation avec ${contact.nom}` : `✅ Conversation ouverte avec ${contact.nom}`);
      setPage?.('chat');
      return true;
    }
    showToast?.("❌ " + (data.error || "Erreur"));
    return false;
  } catch {
    showToast?.("❌ Erreur de connexion");
    return false;
  }
}
