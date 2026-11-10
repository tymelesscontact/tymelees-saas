// Feuille d'heures mensuelle d'un collaborateur, calculee a partir des donnees reelles :
// missions pointees (heure d'arrivee / de fin reelles), pointage journalier si pas de mission
// pointee ce jour-la, absences validees, acomptes valides, notes de frais validees.
// Le calcul de la paie (majorations, cotisations) reste au cabinet : on lui livre des variables propres.

type Ligne = { type: 'mission' | 'pointage'; libelle: string; arrivee: string | null; fin: string | null; minutes: number };
export type FeuilleHeures = {
  mois: string;
  employe: { id: string; nom: string; contrat: string | null; heures_semaine: number };
  jours: { date: string; lignes: Ligne[]; minutes: number }[];
  semaines: { semaine: string; minutes: number; au_dela: number }[];
  total_minutes: number;
  minutes_au_dela: number;
  libelle_au_dela: string;
  heures_contrat_mois: number;
  absences: { type: string; debut: string; fin: string; jours: number }[];
  acomptes_total: number;
  frais_total: number;
};

const enMinutes = (t: string) => { const [h, m] = String(t).slice(0, 5).split(':').map(Number); return h * 60 + (m || 0); };

function dureeEntre(arrivee?: string | null, fin?: string | null): number {
  if (!arrivee || !fin) return 0;
  let d = enMinutes(fin) - enMinutes(arrivee);
  if (d < 0) d += 24 * 60;
  return d;
}

// Lundi (YYYY-MM-DD) de la semaine d'une date
function lundiDe(date: string): string {
  const d = new Date(date + 'T12:00:00Z');
  const jour = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - jour);
  return d.toISOString().slice(0, 10);
}

export async function calculerFeuilleHeures(sb: any, tenantId: string, employeId: string, mois: string): Promise<FeuilleHeures | null> {
  if (!/^\d{4}-\d{2}$/.test(mois)) return null;
  const { data: emp } = await sb.from('equipe').select('id,nom,prenom,contrat,heures_semaine').eq('id', employeId).eq('tenant_id', tenantId).maybeSingle();
  if (!emp) return null;
  const debut = `${mois}-01`;
  const [a, m] = mois.split('-').map(Number);
  const fin = new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
  const nomEmp = `${emp.prenom || ''} ${emp.nom || ''}`.trim();
  const heuresSemaine = Number(emp.heures_semaine) > 0 ? Number(emp.heures_semaine) : 35;

  const [{ data: liens }, { data: pointages }, { data: absences }, { data: acomptes }, { data: frais }] = await Promise.all([
    sb.from('missions_collaborateurs').select('mission_id, missions!inner(id,tenant_id,date_mission,heure_arrivee_reelle,heure_fin_reelle,client_nom,service,statut)')
      .eq('collaborateur_id', employeId).eq('missions.tenant_id', tenantId).gte('missions.date_mission', debut).lte('missions.date_mission', fin),
    sb.from('pointages').select('date,heure_arrivee,heure_depart,heures_travaillees').eq('employe_id', employeId).eq('tenant_id', tenantId).gte('date', debut).lte('date', fin),
    sb.from('absences').select('type,debut,fin,jours,statut').eq('employe_id', employeId).eq('tenant_id', tenantId).eq('statut', 'validee').lte('debut', fin).gte('fin', debut),
    sb.from('acomptes').select('montant,statut,created_at').eq('employe_id', employeId).eq('tenant_id', tenantId).in('statut', ['validé', 'valide']).gte('created_at', debut).lte('created_at', fin + 'T23:59:59'),
    sb.from('notes_frais').select('montant,statut,employe,date').eq('tenant_id', tenantId).in('statut', ['validé', 'remboursé']).gte('date', debut).lte('date', fin),
  ]);

  const parJour: Record<string, Ligne[]> = {};
  for (const l of (liens || [])) {
    const mi = (l as any).missions;
    if (!mi || mi.statut === 'annule' || !mi.heure_arrivee_reelle || !mi.heure_fin_reelle) continue;
    (parJour[mi.date_mission] ||= []).push({
      type: 'mission', libelle: [mi.service, mi.client_nom].filter(Boolean).join(' — ') || 'Mission',
      arrivee: String(mi.heure_arrivee_reelle).slice(0, 5), fin: String(mi.heure_fin_reelle).slice(0, 5),
      minutes: dureeEntre(mi.heure_arrivee_reelle, mi.heure_fin_reelle),
    });
  }
  // Pointage journalier : seulement les jours sans mission pointee (pas de double compte)
  for (const p of (pointages || [])) {
    if (parJour[p.date]?.length) continue;
    const minutes = p.heure_arrivee && p.heure_depart ? dureeEntre(p.heure_arrivee, p.heure_depart) : Math.round(Number(p.heures_travaillees || 0) * 60);
    if (minutes <= 0) continue;
    (parJour[p.date] ||= []).push({ type: 'pointage', libelle: 'Pointage de la journée', arrivee: p.heure_arrivee || null, fin: p.heure_depart || null, minutes });
  }

  const jours = Object.keys(parJour).sort().map((date) => ({ date, lignes: parJour[date], minutes: parJour[date].reduce((s, x) => s + x.minutes, 0) }));
  const total = jours.reduce((s, j) => s + j.minutes, 0);

  // Heures au-dela du contrat, semaine par semaine (supplementaires a temps plein, complementaires a temps partiel)
  const parSemaine: Record<string, number> = {};
  for (const j of jours) parSemaine[lundiDe(j.date)] = (parSemaine[lundiDe(j.date)] || 0) + j.minutes;
  const semaines = Object.keys(parSemaine).sort().map((s) => ({ semaine: s, minutes: parSemaine[s], au_dela: Math.max(0, parSemaine[s] - heuresSemaine * 60) }));
  const auDela = semaines.reduce((s, x) => s + x.au_dela, 0);

  const nomMin = nomEmp.toLowerCase();
  return {
    mois,
    employe: { id: emp.id, nom: nomEmp, contrat: emp.contrat || null, heures_semaine: heuresSemaine },
    jours, semaines,
    total_minutes: total,
    minutes_au_dela: auDela,
    libelle_au_dela: heuresSemaine < 35 ? 'Heures complémentaires (temps partiel)' : 'Heures supplémentaires',
    heures_contrat_mois: Math.round(heuresSemaine * 52 / 12 * 100) / 100,
    absences: (absences || []).map((x: any) => ({ type: x.type, debut: x.debut, fin: x.fin, jours: Number(x.jours || 0) })),
    acomptes_total: Math.round((acomptes || []).reduce((s: number, x: any) => s + Number(x.montant || 0), 0) * 100) / 100,
    frais_total: Math.round((frais || []).filter((x: any) => String(x.employe || '').trim().toLowerCase() === nomMin).reduce((s: number, x: any) => s + Number(x.montant || 0), 0) * 100) / 100,
  };
}

export const hhmm = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
