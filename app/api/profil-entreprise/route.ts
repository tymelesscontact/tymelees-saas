import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTenantIdFromRequest } from '../../lib/supabaseServer';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHAMPS = 'civilite,prenom,nom,fonction,telephone_contact,email,societe,forme_juridique,siret,siren,tva_intracommunautaire,code_ape,rcs_ville,capital_social,date_creation_entreprise,adresse,ville,code_postal,pays,telephone_entreprise,site_web,photo_url,theme';

const FORMES_JURIDIQUES: Record<string, string> = {
  '1000': 'Entrepreneur individuel',
  '5202': 'Société en nom collectif (SNC)',
  '5306': 'Société en commandite simple (SCS)',
  '5307': 'Société en commandite par actions (SCA)',
  '5498': 'EURL',
  '5499': 'SARL',
  '5710': 'SAS',
  '5720': 'SASU',
  '5800': 'Société européenne (SE)',
};

function calculerTvaDepuisSiren(siren: string): string | null {
  const s = siren.replace(/\s/g, '');
  if (!/^\d{9}$/.test(s)) return null;
  const cle = (12 + 3 * (parseInt(s, 10) % 97)) % 97;
  return `FR${String(cle).padStart(2, '0')}${s}`;
}

export async function GET(req: NextRequest) {
  // Jamais d'identifiant venu de l'exterieur -- uniquement celui de la vraie session connectee
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

  const { data, error } = await sb.from('tenants').select(CHAMPS).eq('id', tenantId).single();
  if (error || !data) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 404 });
  return NextResponse.json({ profil: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'verifier_siret') {
    const { siret } = body;
    if (!siret || !/^\d{14}$/.test(siret.replace(/\s/g, ''))) {
      return NextResponse.json({ success: false, error: 'SIRET invalide (14 chiffres attendus)' }, { status: 400 });
    }
    const siretPropre = siret.replace(/\s/g, '');
    try {
      const res = await fetch(`https://api.insee.fr/api-sirene/3.11/siret/${siretPropre}?date=2999-12-31`, {
        headers: { 'X-INSEE-Api-Key-Integration': process.env.INSEE_API_KEY!, 'Accept': 'application/json' }
      });
      if (!res.ok) return NextResponse.json({ success: false, error: 'Etablissement introuvable dans SIRENE' }, { status: 404 });
      const data = await res.json();
      const etab = data.etablissement;
      const uniteLegale = etab?.uniteLegale;
      const adresse = etab?.adresseEtablissement;
      const siren = etab?.siren;
      const suggestion = {
        societe: uniteLegale?.denominationUniteLegale || '',
        forme_juridique: FORMES_JURIDIQUES[uniteLegale?.categorieJuridiqueUniteLegale] || uniteLegale?.categorieJuridiqueUniteLegale || '',
        siren: siren || '',
        siret: siretPropre,
        tva_intracommunautaire: siren ? calculerTvaDepuisSiren(siren) : null,
        code_ape: uniteLegale?.activitePrincipaleUniteLegale || '',
        date_creation_entreprise: uniteLegale?.dateCreationUniteLegale || '',
        adresse: [adresse?.numeroVoieEtablissement, adresse?.typeVoieEtablissement, adresse?.libelleVoieEtablissement].filter(Boolean).join(' '),
        ville: adresse?.libelleCommuneEtablissement || '',
        code_postal: adresse?.codePostalEtablissement || '',
      };
      return NextResponse.json({ success: true, suggestion });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }


  // Tout le reste (sauvegarde) exige une vraie session
  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) return NextResponse.json({ success: false, error: 'Session invalide' }, { status: 401 });

  if (action === 'sauvegarder') {
    const champsAutorises = ['civilite','prenom','nom','fonction','telephone_contact','societe','forme_juridique','siret','siren','tva_intracommunautaire','code_ape','rcs_ville','capital_social','date_creation_entreprise','adresse','ville','code_postal','pays','telephone_entreprise','site_web','photo_url','theme'];
    const maj: Record<string, any> = {};
    for (const c of champsAutorises) if (c in body) maj[c] = body[c];
    if (Object.keys(maj).length === 0) return NextResponse.json({ success: false, error: 'Aucun champ a sauvegarder' }, { status: 400 });

    const { error } = await sb.from('tenants').update(maj).eq('id', tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'action inconnue' }, { status: 400 });
}
