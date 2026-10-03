import type {
  ClassificationHTA,
  ClassificationIMC,
  ClassificationPB,
  ClassificationZScore,
  TrancheAge,
  FicheConsultation
} from '../types/clinical';

/**
 * Détermine la tranche d'âge selon l'âge en années
 */
export function getTrancheAge(age: number): TrancheAge {
  if (age <= 4) return '0-4 ans';
  if (age <= 14) return '5-14 ans';
  if (age <= 24) return '15-24 ans';
  if (age <= 49) return '25-49 ans';
  return '50 ans et plus';
}

/**
 * Calcule l'âge en années à partir de la date de naissance
 */
export function calculateAgeFromBirthDate(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Calcul et classification de l'Indice de Masse Corporelle (IMC)
 */
export function calculateIMC(poidsKg: number, tailleCm: number): {
  imc: number;
  classification: ClassificationIMC;
  label: string;
  color: string;
  badgeClass: string;
} {
  const tailleM = tailleCm / 100;
  const imcRaw = poidsKg / (tailleM * tailleM);
  const imc = Math.round(imcRaw * 10) / 10;

  if (imc < 16.0) {
    return {
      imc,
      classification: 'denutrition_severe',
      label: 'Dénutrition Sévère (< 16.0)',
      color: '#dc2626',
      badgeClass: 'badge-danger'
    };
  }
  if (imc < 17.0) {
    return {
      imc,
      classification: 'denutrition_moderee',
      label: 'Dénutrition Modérée (16.0 - 16.9)',
      color: '#ea580c',
      badgeClass: 'badge-warning-dark'
    };
  }
  if (imc < 18.5) {
    return {
      imc,
      classification: 'maigreur',
      label: 'Maigreur (17.0 - 18.4)',
      color: '#d97706',
      badgeClass: 'badge-warning'
    };
  }
  if (imc < 25.0) {
    return {
      imc,
      classification: 'normal',
      label: 'Corpulence Normale (18.5 - 24.9)',
      color: '#16a34a',
      badgeClass: 'badge-success'
    };
  }
  if (imc < 30.0) {
    return {
      imc,
      classification: 'surpoids',
      label: 'Surpoids (25.0 - 29.9)',
      color: '#0284c7',
      badgeClass: 'badge-info'
    };
  }
  return {
    imc,
    classification: 'obesite',
    label: 'Obésité (≥ 30.0)',
    color: '#9333ea',
    badgeClass: 'badge-purple'
  };
}

/**
 * Estimation du Z-Score pédiatrique OMS (Poids pour taille / Poids pour âge)
 */
export function evaluateZScore(_age: number, poidsKg: number, tailleCm: number): {
  zScore: number;
  classification: ClassificationZScore;
  label: string;
  color: string;
} {
  const tailleM = tailleCm / 100;
  const imc = poidsKg / (tailleM * tailleM);
  let zScore = (imc - 15.5) / 1.5;
  zScore = Math.round(zScore * 10) / 10;

  if (zScore < -3) {
    return { zScore, classification: 'severe', label: 'Z-score < -3 ET (Émaciation sévère)', color: '#dc2626' };
  }
  if (zScore < -2) {
    return { zScore, classification: 'modere', label: 'Z-score entre -3 et -2 ET (Émaciation modérée)', color: '#ea580c' };
  }
  if (zScore <= 2) {
    return { zScore, classification: 'normal', label: 'Z-score normal (-2 à +2 ET)', color: '#16a34a' };
  }
  return { zScore, classification: 'eleve', label: 'Z-score > +2 ET (Au-dessus des normes)', color: '#0284c7' };
}

/**
 * Classification de la Tension Artérielle
 */
export function classifyTensionArterielle(pas: number, pad: number): {
  classification: ClassificationHTA;
  label: string;
  color: string;
  isHypertensive: boolean;
  isUrgent: boolean;
} {
  if (pas >= 180 || pad >= 110) {
    return {
      classification: 'hta_grade_3',
      label: 'HTA Grade 3 - Sévère (≥ 180 / ≥ 110)',
      color: '#b91c1c',
      isHypertensive: true,
      isUrgent: true
    };
  }
  if (pas >= 160 || pad >= 100) {
    return {
      classification: 'hta_grade_2',
      label: 'HTA Grade 2 - Modérée (160-179 / 100-109)',
      color: '#ea580c',
      isHypertensive: true,
      isUrgent: false
    };
  }
  if (pas >= 140 || pad >= 90) {
    return {
      classification: 'hta_grade_1',
      label: 'HTA Grade 1 - Légère (140-159 / 90-99)',
      color: '#d97706',
      isHypertensive: true,
      isUrgent: false
    };
  }
  if (pas >= 130 || pad >= 85) {
    return {
      classification: 'normale_haute',
      label: 'Pression Normale Haute (130-139 / 85-89)',
      color: '#ca8a04',
      isHypertensive: false,
      isUrgent: false
    };
  }
  if (pas >= 120 || pad >= 80) {
    return {
      classification: 'normale',
      label: 'Pression Normale (120-129 / 80-84)',
      color: '#16a34a',
      isHypertensive: false,
      isUrgent: false
    };
  }
  return {
    classification: 'optimale',
    label: 'Pression Optimale (< 120 / < 80)',
    color: '#059669',
    isHypertensive: false,
    isUrgent: false
  };
}

/**
 * Évaluation du Périmètre Brachial (PB) - Enfants de 6 à 59 mois
 * Normes nationales de Côte d'Ivoire & OMS (en millimètres)
 */
export function classifyPerimetreBrachial(pbMm: number): {
  classification: ClassificationPB;
  label: string;
  action: string;
  color: string;
} {
  if (pbMm < 115) {
    return {
      classification: 'mas',
      label: 'Rouge : < 115 mm (Malnutrition Aiguë Sévère - MAS)',
      action: 'Urgence : Référence vers CRENAS / CRENI (Hospitalisation ou ATPE)',
      color: '#dc2626'
    };
  }
  if (pbMm < 125) {
    return {
      classification: 'mam',
      label: 'Jaune : 115 - 124 mm (Malnutrition Aiguë Modérée - MAM)',
      action: 'Prise en charge CRENAM (Supplémentation nutritionnelle)',
      color: '#d97706'
    };
  }
  return {
    classification: 'normal',
    label: 'Vert : ≥ 125 mm (État nutritionnel satisfaisant)',
    action: 'Suivi de croissance régulier et conseils diététiques',
    color: '#16a34a'
  };
}

/**
 * Algorithme National de Dépistage de la Tuberculose (PNT Côte d'Ivoire)
 */
export function evaluateSuspicionTB(
  touxPersistante: boolean,
  fievreProlongee: boolean,
  sueursNocturnes: boolean,
  pertePoids: boolean
): {
  isPresumed: boolean;
  scoreSignes: number;
  recommendation: string;
} {
  let score = 0;
  if (touxPersistante) score++;
  if (fievreProlongee) score++;
  if (sueursNocturnes) score++;
  if (pertePoids) score++;

  if (score > 0) {
    return {
      isPresumed: true,
      scoreSignes: score,
      recommendation: 'CAS PRÉSUMÉ DE TUBERCULOSE : Prescription immédiate d’un examen bactériologique (GeneXpert MTB/RIF prioritaire ou Bacilloscopie). Isolement respiratoire et remise de masque.'
    };
  }
  return {
    isPresumed: false,
    scoreSignes: 0,
    recommendation: 'Dépistage TB Négatif ce jour. Renouveler la recherche active à chaque consultation.'
  };
}

/**
 * Vérifie si la fiche de consultation est complète
 */
export function checkFicheCompletude(fiche: FicheConsultation): boolean {
  const adminOk = !!(
    fiche.admin.nom &&
    fiche.admin.prenoms &&
    fiche.admin.sexe &&
    fiche.admin.age !== undefined &&
    fiche.admin.modeEntree &&
    fiche.admin.statutConjugal &&
    fiche.admin.typePopulation &&
    fiche.admin.protectionSociale
  );

  const triageOk = !!(
    fiche.triage.poidsKg &&
    fiche.triage.tailleCm &&
    fiche.triage.temperature &&
    (fiche.admin.age > 4 ? (fiche.triage.tensionSystolique && fiche.triage.tensionDiastolique) : true)
  );

  const tbOk = typeof fiche.tb.tbPresume === 'boolean';
  const orientationOk = !!(fiche.orientation.motifsConsultation && fiche.orientation.decisionClinique);

  return adminOk && triageOk && tbOk && orientationOk;
}

/**
 * Formate un montant en FCFA
 */
export function formatFCFA(val: number): string {
  return new Intl.NumberFormat('fr-CI').format(val) + ' FCFA';
}
