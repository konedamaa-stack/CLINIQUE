export type ClinicType = 
  | 'CSU'             // Centre de Santé Urbain
  | 'FSU'             // Formation Sanitaire Urbaine
  | 'CSR'             // Centre de Santé Rural
  | 'HG'              // Hôpital Général
  | 'CHU'             // Centre Hospitalier Universitaire
  | 'Clinique_Privee' // Clinique Privée
  | 'Cabinet_Medical';// Cabinet Médical

export type ClinicStatus = 'actif' | 'suspendu' | 'maintenance' | 'en_attente';

export interface ClinicModules {
  triageConstantes: boolean;
  depistageTB: boolean;
  populationsCles: boolean;
  couvertureCMU: boolean;
  rendezVousRelances: boolean;
  exportDHIS2: boolean;
}

export interface ClinicStructure {
  id: string;
  nom: string;
  codeDistrict: string;
  districtSanitaire: string;
  regionSanitaire: string;
  typeStructure: ClinicType;
  statut: ClinicStatus;
  directeurNom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateCreation: string;
  personnelMedicalCount: number;
  consultationsCount: number;
  casTBDetectesCount: number;
  derniereActivite: string;
  modulesActifs: ClinicModules;
}

export interface SuperAdminKPIs {
  totalCliniques: number;
  totalCliniquesActives: number;
  totalConsultationsNationales: number;
  totalCasTBNationaux: number;
  totalPersonnelEnregistre: number;
  tauxCouvertureCMU: number;
  regionsCouvertesCount: number;
}
