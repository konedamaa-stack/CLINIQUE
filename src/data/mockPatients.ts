import type { FicheConsultation, KPIStats, TypePopulation, TrancheAge } from '../types/clinical';
import { checkFicheCompletude } from '../utils/clinicalCalculators';

export const INITIAL_MOCK_FICHES: FicheConsultation[] = [
  {
    id: 'f-ci-001',
    codePatient: 'CI-ABJ-2026-0089',
    siteNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
    agentNom: 'Dr. Kouadio Yves / Inf. Traoré Fatou',
    createdAt: '2026-10-02T08:30:00Z',
    updatedAt: '2026-10-02T09:15:00Z',
    estComplete: true,
    admin: {
      numOrdre: '0089',
      dateConsultation: '2026-10-02',
      nom: 'KOUAME',
      prenoms: 'Aya Madeleine',
      sexe: 'F',
      dateNaissance: '1994-06-14',
      age: 32,
      trancheAge: '25-49 ans',
      telephone: '+225 07 48 21 00 12',
      residence: 'Treichville Avenue 16, Abidjan',
      modeEntree: 'venu_lui_meme',
      statutConjugal: 'concubinage',
      typePopulation: 'ts',
      protectionSociale: 'cmu',
      numeroAssurance: 'CMU-CI-7849102-A'
    },
    triage: {
      poidsKg: 51,
      tailleCm: 162,
      imc: 19.4,
      classificationIMC: 'normal',
      temperature: 38.6,
      isFever: true,
      frequenceRespiratoire: 24,
      isTachypnea: true,
      tensionSystolique: 118,
      tensionDiastolique: 76,
      classificationHTA: 'optimale',
      glycemieCapillaireG_L: 0.95
    },
    tb: {
      touxPersistante: true,
      dureeTouxJours: 21,
      fievreProlongee: true,
      sueursNocturnes: true,
      pertePoids: true,
      tbPresume: true,
      prelevementCrachatEffectue: true,
      examenTBPropose: 'genexpert',
      resultatExamenTB: 'en_attente'
    },
    antecedents: {
      htaConnue: false,
      diabete: false,
      asthme: false,
      vihConnu: true,
      statutVIH: 'positif',
      tbAnterieure: false,
      chirurgie: false,
      ddr: '2026-09-12',
      gestite: 2,
      parite: 2,
      grossesseEnCours: false,
      allaitementEnCours: false,
      referenceCPN: false
    },
    orientation: {
      motifsConsultation: 'Toux grasse productive depuis 3 semaines, sueurs la nuit et amaigrissement important.',
      examenPhysiqueResume: 'Râles crépitants apex pulmonaire droit, pâleur conjonctivale modérée.',
      examensDemandes: ['GeneXpert MTB/RIF', 'NFS', 'Charge virale VIH de contrôle'],
      decisionClinique: 'prise_en_charge_locale',
      ordonnancePrescription: 'Paracétamol 1g x3/j, Amoxicilline 1g x2/j en attente résultat GeneXpert dans 24h. Masque chirurgical remis.'
    },
    suivi: {
      dateProchainRdv: '2026-10-04',
      contactAccompagnant: '+225 05 12 34 56 78',
      agentCommunautaireAssigne: 'Mme Bamba (Médiatrice Santé)',
      statutSuivi: 'en_cours',
      notesSuivi: 'Priorité résultat GeneXpert. Médiation psychosociale assurée sans stigmatisation.'
    }
  },
  {
    id: 'f-ci-002',
    codePatient: 'CI-ABJ-2026-0090',
    siteNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
    agentNom: 'Inf. Traoré Fatou',
    createdAt: '2026-10-02T09:40:00Z',
    updatedAt: '2026-10-02T10:10:00Z',
    estComplete: true,
    admin: {
      numOrdre: '0090',
      dateConsultation: '2026-10-02',
      nom: 'DIABATE',
      prenoms: 'Moussa',
      sexe: 'M',
      dateNaissance: '1971-02-18',
      age: 55,
      trancheAge: '50 ans et plus',
      telephone: '+225 01 02 44 88 99',
      residence: 'Marcory Anoumabo, Abidjan',
      modeEntree: 'venu_lui_meme',
      statutConjugal: 'marie',
      typePopulation: 'population_generale',
      protectionSociale: 'cmu',
      numeroAssurance: 'CMU-CI-3341908-C'
    },
    triage: {
      poidsKg: 89,
      tailleCm: 174,
      imc: 29.4,
      classificationIMC: 'surpoids',
      temperature: 36.8,
      isFever: false,
      frequenceRespiratoire: 16,
      isTachypnea: false,
      tensionSystolique: 172,
      tensionDiastolique: 104,
      classificationHTA: 'hta_grade_2',
      glycemieCapillaireG_L: 1.45
    },
    tb: {
      touxPersistante: false,
      fievreProlongee: false,
      sueursNocturnes: false,
      pertePoids: false,
      tbPresume: false,
      prelevementCrachatEffectue: false,
      examenTBPropose: 'aucun'
    },
    antecedents: {
      htaConnue: true,
      diabete: false,
      asthme: false,
      vihConnu: false,
      tbAnterieure: false,
      chirurgie: true,
      precisionChirurgie: 'Herniorraphie inguinale droite (2018)',
      grossesseEnCours: false,
      allaitementEnCours: false,
      referenceCPN: false
    },
    orientation: {
      motifsConsultation: 'Céphalées occipitales matinales, vertiges et palpitations.',
      examenPhysiqueResume: 'Bruits du cœur réguliers mais éclat du B2 au foyer aortique. Pas d’œdème des membres inférieurs.',
      examensDemandes: ['Créatininémie', 'ECG', 'Bilan lipidique', 'Bandelette urinaire (recherche protéinurie)'],
      decisionClinique: 'prise_en_charge_locale',
      ordonnancePrescription: 'Amlodipine 5mg 1 cp le matin. Conseils hygiéno-diététiques (réduction du sel).'
    },
    suivi: {
      dateProchainRdv: '2026-10-09',
      contactAccompagnant: '+225 07 09 88 77 66',
      agentCommunautaireAssigne: 'Koffi Serge',
      statutSuivi: 'en_cours',
      notesSuivi: 'Contrôle tensionnel dans 7 jours. Sensibilisation sur la régularité du traitement.'
    }
  },
  {
    id: 'f-ci-003',
    codePatient: 'CI-ABJ-2026-0091',
    siteNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
    agentNom: 'Sage-Femme Koné Awa',
    createdAt: '2026-10-02T10:30:00Z',
    updatedAt: '2026-10-02T11:00:00Z',
    estComplete: true,
    admin: {
      numOrdre: '0091',
      dateConsultation: '2026-10-02',
      nom: 'YAO',
      prenoms: 'Affouet Grâce',
      sexe: 'F',
      dateNaissance: '2024-04-10',
      age: 2,
      trancheAge: '0-4 ans',
      telephone: '+225 05 66 77 88 99',
      residence: 'Koumassi Campement, Abidjan',
      modeEntree: 'refere_communautaire',
      statutConjugal: 'celibataire',
      typePopulation: 'autre_vulnerable',
      typePopulationPrecision: 'Enfant vulnérable référé par ASC',
      protectionSociale: 'indigent'
    },
    triage: {
      poidsKg: 8.8,
      tailleCm: 81,
      imc: 13.4,
      classificationIMC: 'denutrition_severe',
      zScore: -2.8,
      classificationZScore: 'modere',
      temperature: 37.9,
      isFever: false,
      frequenceRespiratoire: 32,
      isTachypnea: false,
      perimetreBrachialMm: 118,
      classificationPB: 'mam'
    },
    tb: {
      touxPersistante: false,
      fievreProlongee: false,
      sueursNocturnes: false,
      pertePoids: true,
      tbPresume: true,
      prelevementCrachatEffectue: false,
      examenTBPropose: 'radio_thorax',
      resultatExamenTB: 'en_attente'
    },
    antecedents: {
      htaConnue: false,
      diabete: false,
      asthme: false,
      vihConnu: false,
      tbAnterieure: false,
      chirurgie: false,
      grossesseEnCours: false,
      allaitementEnCours: false,
      referenceCPN: false
    },
    orientation: {
      motifsConsultation: 'Enfant amaigrie, appétit diminué, diarrhée intermittente signalée par la mère.',
      examenPhysiqueResume: 'Pâleur conjonctivale, fonte musculaire fessière modérée, pas d’œdèmes des membres inférieurs.',
      examensDemandes: ['TDR Paludisme', 'Test VIH pédiatrique', 'Examen parasitologique des selles'],
      decisionClinique: 'reference_hopital',
      centreReference: 'Unité CRENAM / Pédiatrie CHU de Treichville',
      motifReference: 'Malnutrition Aiguë Modérée avec suspicion de pathologie sous-jacente et amaigrissement continu.'
    },
    suivi: {
      dateProchainRdv: '2026-10-05',
      contactAccompagnant: '+225 05 66 77 88 99 (Mère)',
      agentCommunautaireAssigne: 'M. Diallo (ASC Koumassi)',
      statutSuivi: 'refere_confirme',
      notesSuivi: 'La mère a été accompagnée pour la référence au CRENAM. Ravitaillement en farines enrichies.'
    }
  },
  {
    id: 'f-ci-004',
    codePatient: 'CI-ABJ-2026-0092',
    siteNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
    agentNom: 'Dr. Kouadio Yves',
    createdAt: '2026-10-02T11:20:00Z',
    updatedAt: '2026-10-02T11:55:00Z',
    estComplete: true,
    admin: {
      numOrdre: '0092',
      dateConsultation: '2026-10-02',
      nom: 'SORO',
      prenoms: 'Lacina',
      sexe: 'M',
      dateNaissance: '1998-11-05',
      age: 27,
      trancheAge: '25-49 ans',
      telephone: '+225 07 11 22 33 44',
      residence: 'Yopougon Niangon, Abidjan',
      modeEntree: 'refere_centre_sante',
      statutConjugal: 'celibataire',
      typePopulation: 'ud',
      protectionSociale: 'aucune'
    },
    triage: {
      poidsKg: 62,
      tailleCm: 178,
      imc: 19.6,
      classificationIMC: 'normal',
      temperature: 37.1,
      isFever: false,
      frequenceRespiratoire: 18,
      isTachypnea: false,
      tensionSystolique: 122,
      tensionDiastolique: 80,
      classificationHTA: 'normale'
    },
    tb: {
      touxPersistante: false,
      fievreProlongee: false,
      sueursNocturnes: false,
      pertePoids: false,
      tbPresume: false,
      prelevementCrachatEffectue: false,
      examenTBPropose: 'aucun'
    },
    antecedents: {
      htaConnue: false,
      diabete: false,
      asthme: false,
      vihConnu: false,
      tbAnterieure: false,
      chirurgie: false,
      grossesseEnCours: false,
      allaitementEnCours: false,
      referenceCPN: false
    },
    orientation: {
      motifsConsultation: 'Consultation générale et orientation vers programme de Réduction des Risques (RDR).',
      examenPhysiqueResume: 'Traces d’injections cutanées avant-bras, cicatrisation propre. État général satisfaisant.',
      examensDemandes: ['Dépistage rapide VIH', 'Sérologie Hépatite B & C', 'Sérologie Syphilis (VDRL/TPHA)'],
      decisionClinique: 'prise_en_charge_locale',
      ordonnancePrescription: 'Kit matériel stérile RDR, orientation vers accompagnement psychosocial.'
    },
    suivi: {
      dateProchainRdv: '2026-10-16',
      contactAccompagnant: 'Confidentiel',
      agentCommunautaireAssigne: 'M. Sékou (Éducateur Pair RDR)',
      statutSuivi: 'en_cours',
      notesSuivi: 'Respect strict de la confidentialité et de la non-stigmatisation. Adhésion très positive.'
    }
  },
  {
    id: 'f-ci-005',
    codePatient: 'CI-ABJ-2026-0093',
    siteNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
    agentNom: 'Sage-Femme Koné Awa',
    createdAt: '2026-10-02T14:15:00Z',
    updatedAt: '2026-10-02T14:45:00Z',
    estComplete: true,
    admin: {
      numOrdre: '0093',
      dateConsultation: '2026-10-02',
      nom: 'TOURE',
      prenoms: 'Mariam',
      sexe: 'F',
      dateNaissance: '2001-08-20',
      age: 25,
      trancheAge: '25-49 ans',
      telephone: '+225 01 77 88 99 00',
      residence: 'Adjamé 220 Logements, Abidjan',
      modeEntree: 'venu_lui_meme',
      statutConjugal: 'marie',
      typePopulation: 'population_generale',
      protectionSociale: 'cmu',
      numeroAssurance: 'CMU-CI-9901452-D'
    },
    triage: {
      poidsKg: 64,
      tailleCm: 165,
      imc: 23.5,
      classificationIMC: 'normal',
      temperature: 36.9,
      isFever: false,
      frequenceRespiratoire: 18,
      isTachypnea: false,
      tensionSystolique: 110,
      tensionDiastolique: 70,
      classificationHTA: 'optimale'
    },
    tb: {
      touxPersistante: false,
      fievreProlongee: false,
      sueursNocturnes: false,
      pertePoids: false,
      tbPresume: false,
      prelevementCrachatEffectue: false,
      examenTBPropose: 'aucun'
    },
    antecedents: {
      htaConnue: false,
      diabete: false,
      asthme: false,
      vihConnu: false,
      tbAnterieure: false,
      chirurgie: false,
      ddr: '2026-07-28',
      gestite: 1,
      parite: 0,
      grossesseEnCours: true,
      allaitementEnCours: false,
      referenceCPN: true
    },
    orientation: {
      motifsConsultation: 'Retard de règles, nausées matinales, premier contact prénatal.',
      examenPhysiqueResume: 'Utérus gravide palpable au-dessus de la symphyse pubienne, bruits du cœur fœtaux audibles au Doppler.',
      examensDemandes: ['Échographie obstétricale T1', 'Groupe sanguin / Rhésus', 'Toxoplasmose / Rubéole', 'Glycémie à jeun'],
      decisionClinique: 'prise_en_charge_locale',
      ordonnancePrescription: 'Fer + Acide Folique 1 cp/j, Moustiquaire imprégnée d’insecticide de longue durée (MILD) remise.'
    },
    suivi: {
      dateProchainRdv: '2026-11-02',
      contactAccompagnant: '+225 07 44 55 66 77 (Époux)',
      agentCommunautaireAssigne: 'Mme Bamba',
      statutSuivi: 'en_cours',
      notesSuivi: 'Planification CPN 2 le mois prochain. Calendrier vaccinal vérifié.'
    }
  }
];

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

  for (const f of fiches) {
    if (checkFicheCompletude(f)) completes++;
    if (typeof f.tb.tbPresume === 'boolean') depistesTB++;
    if (f.triage.poidsKg && f.triage.tailleCm) constantesMesurees++;

    if (f.tb.tbPresume) {
      casPresumesTB++;
      if (f.tb.prelevementCrachatEffectue || f.tb.examenTBPropose !== 'aucun') {
        casPresumesTBTestes++;
      }
    }

    if (f.orientation.decisionClinique === 'reference_hopital') {
      patientsReferes++;
      if (f.suivi.statutSuivi === 'refere_confirme') {
        patientsReferesConfirmes++;
      }
    }

    if (f.triage.classificationHTA === 'hta_grade_2' || f.triage.classificationHTA === 'hta_grade_3') {
      casHTAGrade2Ou3++;
    }

    if (f.triage.classificationIMC === 'denutrition_severe' || f.triage.classificationPB === 'mas') {
      casMalnutritionSevere++;
    }

    const pop = f.admin.typePopulation || 'population_generale';
    repartitionPop[pop] = (repartitionPop[pop] || 0) + 1;

    const ageT = f.admin.trancheAge || '25-49 ans';
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
