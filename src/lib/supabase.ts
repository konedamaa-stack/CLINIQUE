import { createClient } from '@supabase/supabase-js';
import type { FicheConsultation } from '../types/clinical';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmamycrltmhbhidpwlzx.supabase.co';
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_uR8o7L_NGiObU8oudwBwDQ_cXtQFL2j';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseAnonKey.trim() !== ''
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Charge les fiches depuis Supabase si configuré
 */
export async function fetchConsultationsFromSupabase(): Promise<{ data: FicheConsultation[] | null; error: any }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase anon key non configurée' };
  }

  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert raw_data or database row to FicheConsultation
    const fiches: FicheConsultation[] = (data || []).map((row: any) => {
      if (row.raw_data) {
        return row.raw_data as FicheConsultation;
      }
      return row as FicheConsultation;
    });

    return { data: fiches, error: null };
  } catch (err) {
    console.warn('Erreur lors du chargement Supabase:', err);
    return { data: null, error: err };
  }
}

/**
 * Enregistre ou met à jour une fiche dans Supabase
 */
export async function upsertConsultationToSupabase(fiche: FicheConsultation): Promise<{ success: boolean; error: any }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase anon key non configurée' };
  }

  try {
    const payload = {
      id: fiche.id,
      code_patient: fiche.codePatient,
      num_ordre: fiche.admin.numOrdre,
      date_consultation: fiche.admin.dateConsultation,
      nom: fiche.admin.nom,
      prenoms: fiche.admin.prenoms,
      sexe: fiche.admin.sexe,
      age: fiche.admin.age,
      tranche_age: fiche.admin.trancheAge,
      telephone: fiche.admin.telephone,
      type_population: fiche.admin.typePopulation,
      protection_sociale: fiche.admin.protectionSociale,
      poids_kg: fiche.triage.poidsKg ?? null,
      taille_cm: fiche.triage.tailleCm ?? null,
      imc: fiche.triage.imc ?? null,
      tension_systolique: fiche.triage.tensionSystolique ?? null,
      tension_diastolique: fiche.triage.tensionDiastolique ?? null,
      tb_presume: fiche.tb.tbPresume,
      decision_clinique: fiche.orientation.decisionClinique,
      date_prochain_rdv: fiche.suivi.dateProchainRdv || null,
      statut_suivi: fiche.suivi.statutSuivi,
      site_nom: fiche.siteNom,
      raw_data: fiche,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('consultations')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.warn('Erreur lors de la sauvegarde Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Supprime une fiche dans Supabase
 */
export async function deleteConsultationFromSupabase(ficheId: string): Promise<{ success: boolean; error: any }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase anon key non configurée' };
  }

  try {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', ficheId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.warn('Erreur lors de la suppression Supabase:', err);
    return { success: false, error: err };
  }
}
