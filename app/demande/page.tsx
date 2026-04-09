"use client";

import emailjs from "@emailjs/browser";

export default function Demande() {

  const sendEmail = (e: any) => {
    e.preventDefault();

    emailjs.sendForm(
      "service_nboq4jp",
      "template_70zypij",
      e.target,
      "euXKPxZ5wKR9p0KLI"
    ).then(
      () => {
        alert("✅ Demande envoyée avec succès !");
      },
      () => {
        alert("❌ Erreur, réessaie.");
      }
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E6] px-4">

      <h1 className="text-4xl font-semibold mb-6">
        Demande de devis
      </h1>

      <form
        onSubmit={sendEmail}
        className="flex flex-col gap-4 w-full max-w-md"
      >

        <input name="nom" placeholder="Nom" className="p-3 border rounded-lg" required />
        <input name="email" placeholder="Email" className="p-3 border rounded-lg" required />
        <input name="telephone" placeholder="Téléphone" className="p-3 border rounded-lg" />

        <select name="service" className="p-3 border rounded-lg">
          <option>Conciergerie</option>
          <option>Sécurité privée</option>
          <option>Nettoyage haut de gamme</option>
          <option>Rapatriement</option>
          <option>Broker yachting</option>
        </select>

        <textarea name="message" placeholder="Votre demande..." className="p-3 border rounded-lg" required />

        <button
          type="submit"
          className="bg-[#D4AF37] text-white py-3 rounded-full"
        >
          Envoyer la demande
        </button>

      </form>

    </main>
  );
}