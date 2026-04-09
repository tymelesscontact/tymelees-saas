import { Playwrite_DE_Grund } from "next/font/google";
import Link from "next/link";
const playwrite = Playwrite_DE_Grund({
  weight: "400",
});
  
export default function Home() {
  return (
    <main className={`bg-[#F5F1E8] text-black ${playwrite.className}`}>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">

        <h1 className="text-5xl md:text-7xl font-bold tracking-widest">
  TYMELESS
</h1>

        <p className="text-xl mb-4 text-gray-700 max-w-xl">
          L’excellence du service sur mesure
        </p>

        <p className="text-sm text-gray-500 mb-10 max-w-md">
          Conciergerie • Sécurité • Nettoyage de luxe • Rapatriement • Yachting
        </p>

      </section>

      {/* SERVICES */}
      <section className="py-20 px-6 text-center">

        <h2 className="text-3xl font-semibold mb-12">
          Nos services
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">

          <div>Conciergerie privée</div>
          <div>Sécurité privée</div>
          <div>Nettoyage haut de gamme</div>
          <div>Rapatriement & prévoyance</div>
          <div>Broker yachting</div>

        </div>

      </section>

      {/* UNIVERS */}
      <section className="py-20 px-6 text-center">

        <h2 className="text-3xl font-semibold mb-6">
          Notre univers
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600">
          Villas de prestige, jets privés, yachts, résidences haut de gamme.  
          Nous intervenons là où l’exigence est la norme.
        </p>

      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center">

        <Link href="/demande">
          <button className="bg-[#D4AF37] text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition">
            Demander un devis
          </button>
        </Link>

      </section>

    </main>
  );
}
