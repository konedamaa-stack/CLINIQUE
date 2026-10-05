import type { FicheConsultation, KPIStats, TypePopulation, TrancheAge } from '../types/clinical';
import { checkFicheCompletude } from '../utils/clinicalCalculators';

/**
 * Registre initial des consultations (Vierge pour permettre les saisies réelles et les tests utilisateur)
 */
export const INITIAL_MOCK_FICHES: FicheConsultation[] = [];

export function calculateKPIsFromFiches(fiches: FicheConsultation[]): KPIStats {
  const total = fiches.length;
  if (total === 0) {
    return {
      totalConsultations: 0,
      fichesCompletesPct: 0,
      depistesTBPct: 0,
      constantesMesureesPct: 0,
      casPresumesTBTotal: 0,
      casPresumesTBTestesPct: 0,
      patientsReferesTotal: 0,
      patientsReferesConfirmesPct: 0,
      repartitionPopulations: {
        population_generale: 0,
        ts: 0,
        ud: 0,
        hsh: 0,
        pc: 0,
        autre_vulnerable: 0
      },
      repartitionTranchesAge: {
        '0-4 ans': 0,
        '5-14 ans': 0,
        '15-24 ans': 0,
        '25-49 ans': 0,
        '50 ans et plus': 0
      },
      casHTAGrade2Ou3: 0,
      casMalnutritionSevere: 0
    };
  }

  let completes = 0;
  let depistesTB = 0;
  let constantesMesurees = 0;
  let casPresumesTB = 0;
  let casPresumesTBTestes = 0;
  let patientsReferes = 0;
  let patientsReferesConfirmes = 0;
  let casHTAGrade2Ou3 = 0;
  let casMalnutritionSevere = 0;

  const repartitionPop: Record<TypePopulation, number> = {
    population_generale: 0,
    ts: 0,
    ud: 0,
    hsh: 0,
    pc: 0,
    autre_vulnerable: 0
  };

  const repartitionAge: Record<TrancheAge, number> = {
    '0-4 ans': 0,
    '5-14 ans': 0,
    '15-24 ans': 0,
    '25-49 ans': 0,
    '50 ans et plus': 0
  };

  const validFiches = (fiches || []).filter(
    (f): f is FicheConsultation => Boolean(f && f.admin && f.triage && f.tb && f.orientation)
  );

  for (const f of validFiches) {
    if (checkFicheCompletude(f)) completes++;
    if (f.tb && typeof f.tb.tbPresume === 'boolean') depistesTB++;
    if (f.triage && f.triage.poidsKg && f.triage.tailleCm) constantesMesurees++;

    if (f.tb && f.tb.tbPresume) {
      casPresumesTB++;
      if (f.tb.prelevementCrachatEffectue || f.tb.examenTBPropose !== 'aucun') {
        casPresumesTBTestes++;
      }
    }

    if (f.orientation && f.orientation.decisionClinique === 'reference_hopital') {
      patientsReferes++;
      if (f.suivi && f.suivi.statutSuivi === 'refere_confirme') {
        patientsReferesConfirmes++;
      }
    }

    if (f.triage && (f.triage.classificationHTA === 'hta_grade_2' || f.triage.classificationHTA === 'hta_grade_3')) {
      casHTAGrade2Ou3++;
    }

    if (f.triage && (f.triage.classificationIMC === 'denutrition_severe' || f.triage.classificationPB === 'mas')) {
      casMalnutritionSevere++;
    }

    const pop = (f.admin && f.admin.typePopulation) || 'population_generale';
    repartitionPop[pop] = (repartitionPop[pop] || 0) + 1;

    const ageT = (f.admin && f.admin.trancheAge) || '25-49 ans';
    repartitionAge[ageT] = (repartitionAge[ageT] || 0) + 1;
  }

  return {
    totalConsultations: total,
    fichesCompletesPct: Math.round((completes / total) * 100),
    depistesTBPct: Math.round((depistesTB / total) * 100),
    constantesMesureesPct: Math.round((constantesMesurees / total) * 100),
    casPresumesTBTotal: casPresumesTB,
    casPresumesTBTestesPct: casPresumesTB > 0 ? Math.round((casPresumesTBTestes / casPresumesTB) * 100) : 100,
    patientsReferesTotal: patientsReferes,
    patientsReferesConfirmesPct: patientsReferes > 0 ? Math.round((patientsReferesConfirmes / patientsReferes) * 100) : 100,
    repartitionPopulations: repartitionPop,
    repartitionTranchesAge: repartitionAge,
    casHTAGrade2Ou3,
    casMalnutritionSevere
  };
}
