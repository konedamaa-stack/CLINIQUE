export type Sexe = 'M' | 'F';

export type TrancheAge = '0-4 ans' | '5-14 ans' | '15-24 ans' | '25-49 ans' | '50 ans et plus';

export type ModeEntree = 
  | 'venu_lui_meme' 
  | 'refere_centre_sante' 
  | 'refere_tradipraticien' 
  | 'refere_communautaire'
  | 'autre';

export type StatutConjugal = 
  | 'celibataire' 
  | 'marie' 
  | 'concubinage' 
  | 'divorce' 
  | 'veuf';

export type TypePopulation = 
  | 'population_generale'
  | 'ts'    // Travailleuses du Sexe
  | 'ud'    // Usagers de Drogues
  | 'hsh'   // Hommes ayant des rapports sexuels avec des Hommes
  | 'pc'    // Personnes en milieu Carcéral
  | 'autre_vulnerable';

export type ProtectionSociale = 
  | 'cmu'              // Couverture Maladie Universelle (Côte d'Ivoire)
  | 'assurance_privee' 
  | 'mutuelle'
  | 'indigent'
  | 'aucune';

export type ClassificationIMC = 
  | 'denutrition_severe'  // < 16.0
  | 'denutrition_moderee' // 16.0 - 16.9
  | 'maigreur'            // 17.0 - 18.4
  | 'normal'              // 18.5 - 24.9
  | 'surpoids'            // 25.0 - 29.9
  | 'obesite';            // >= 30.0

export type ClassificationHTA = 
  | 'optimale'       // <120 / <80
  | 'normale'        // 120-129 / 80-84
  | 'normale_haute'  // 130-139 / 85-89
  | 'hta_grade_1'    // 140-159 / 90-99
  | 'hta_grade_2'    // 160-179 / 100-109
  | 'hta_grade_3';   // >= 180 / >= 110

export type ClassificationPB = 
  | 'mas'     // Malnutrition Aiguë Sévère (< 115 mm) - Rouge
  | 'mam'     // Malnutrition Aiguë Modérée (115 - 124 mm) - Jaune
  | 'normal'; // >= 125 mm - Vert

export type ClassificationZScore = 
  | 'severe'   // < -3 ET
  | 'modere'   // -3 à -2 ET
  | 'normal'   // -2 à +2 ET
  | 'eleve';   // > +2 ET

export interface AdministrativeData {
  numOrdre: string;
  dateConsultation: string;
  nom: string;
  prenoms: string;
  sexe: Sexe;
  dateNaissance?: string;
  age: number;
  trancheAge: TrancheAge;
  telephone: string;
  residence: string;
  modeEntree: ModeEntree;
  modeEntreeAutre?: string;
  statutConjugal: StatutConjugal;
  typePopulation: TypePopulation;
  typePopulationPrecision?: string;
  protectionSociale: ProtectionSociale;
  numeroAssurance?: string;
}

export interface TriageConstantesData {
  poidsKg?: number;
  tailleCm?: number;
  imc?: number;
  classificationIMC?: ClassificationIMC;
  zScore?: number;
  classificationZScore?: ClassificationZScore;
  temperature?: number;
  isFever?: boolean;
  frequenceRespiratoire?: number;
  isTachypnea?: boolean;
  tensionSystolique?: number;
  tensionDiastolique?: number;
  classificationHTA?: ClassificationHTA;
  perimetreBrachialMm?: number; // PB en mm pour enfants
  classificationPB?: ClassificationPB;
  glycemieCapillaireG_L?: number;
}

export interface DepistageTBData {
  touxPersistante: boolean; // >= 2 semaines (ou toux présente)
  dureeTouxJours?: number;
  fievreProlongee: boolean;
  sueursNocturnes: boolean;
  pertePoids: boolean;
  tbPresume: boolean; // Auto-calculé: au moins 1 signe positif
  prelevementCrachatEffectue: boolean;
  examenTBPropose: 'genexpert' | 'microscopie' | 'radio_thorax' | 'aucun';
  resultatExamenTB?: 'en_attente' | 'positif' | 'negatif' | 'indetermine';
}

export interface AntecedentsData {
  htaConnue: boolean;
  diabete: boolean;
  asthme: boolean;
  vihConnu: boolean;
  statutVIH?: 'positif' | 'negatif' | 'inconnu';
  tbAnterieure: boolean;
  anneeTBAnterieure?: string;
  autresAntecedentsMedicaux?: string;
  chirurgie: boolean;
  precisionChirurgie?: string;
  // Gynéco-obstétrique (femmes)
  ddr?: string; // Date des Dernières Règles
  gestite?: number; // Nombre de grossesses
  parite?: number;  // Nombre d'accouchements
  grossesseEnCours: boolean;
  allaitementEnCours: boolean;
  referenceCPN: boolean;
}

export interface OrientationData {
  motifsConsultation: string;
  examenPhysiqueResume?: string;
  examensDemandes: string[];
  decisionClinique: 
    | 'prise_en_charge_locale'
    | 'mise_sous_traitement_tb'
    | 'tpi_preventif'
    | 'reference_hopital'
    | 'autre';
  centreReference?: string;
  motifReference?: string;
  ordonnancePrescription?: string;
}

export interface SuiviData {
  dateProchainRdv?: string;
  contactAccompagnant?: string;
  agentCommunautaireAssigne?: string;
  statutSuivi: 'en_cours' | 'venu_rdv' | 'perdu_de_vue' | 'refere_confirme';
  notesSuivi?: string;
}

export interface FicheConsultation {
  id: string;
  codePatient: string;
  siteNom: string;
  agentNom: string;
  createdAt: string;
  updatedAt: string;
  estComplete: boolean;
  admin: AdministrativeData;
  triage: TriageConstantesData;
  tb: DepistageTBData;
  antecedents: AntecedentsData;
  orientation: OrientationData;
  suivi: SuiviData;
}

export interface KPIStats {
  totalConsultations: number;
  fichesCompletesPct: number;
  depistesTBPct: number;
  constantesMesureesPct: number;
  casPresumesTBTotal: number;
  casPresumesTBTestesPct: number;
  patientsReferesTotal: number;
  patientsReferesConfirmesPct: number;
  repartitionPopulations: Record<TypePopulation, number>;
  repartitionTranchesAge: Record<TrancheAge, number>;
  casHTAGrade2Ou3: number;
  casMalnutritionSevere: number;
}
