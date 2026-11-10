import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lit ses polices (Helvetica.afm...) sur le disque : ne pas l'emballer,
  // sinon aucun PDF (factures, devis, contrats) ne se genere en ligne.
  serverExternalPackages: ['pdfkit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
