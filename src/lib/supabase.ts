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

import type { AuthUser, UserRole } from '../types/auth';

// Comptes de démonstration préconfigurés pour les structures sanitaires de Côte d'Ivoire
export const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'dr.kone@sante.gouv.ci': {
    password: 'Password123!',
    user: {
      id: 'demo-dr-kone',
      email: 'dr.kone@sante.gouv.ci',
      nomComplet: 'Dr. Koné Souleymane',
      role: 'medecin',
      structureNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
      numeroMatricule: 'MSHP-CI-48291'
    }
  },
  'infirmiere.amlan@sante.gouv.ci': {
    password: 'Password123!',
    user: {
      id: 'demo-inf-amlan',
      email: 'infirmiere.amlan@sante.gouv.ci',
      nomComplet: 'Inf. Amlan Kouakou',
      role: 'infirmier',
      structureNom: 'Formation Sanitaire Urbaine de Yopougon Attié',
      numeroMatricule: 'MSHP-CI-91024'
    }
  },
  'agent.yao@sante.gouv.ci': {
    password: 'Password123!',
    user: {
      id: 'demo-agent-yao',
      email: 'agent.yao@sante.gouv.ci',
      nomComplet: 'Agent Yao N\'Guessan',
      role: 'agent_communautaire',
      structureNom: 'Centre de Santé Rural de Bouaké-Koko',
      numeroMatricule: 'MSHP-CI-11409'
    }
  }
};

/**
 * Récupère l'utilisateur connecté via Supabase ou session locale
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  // Vérifier d'abord si une session locale de secours est active
  const localSaved = localStorage.getItem('clinique_auth_user');
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch {
      // Ignorer
    }
  }

  if (!isSupabaseConfigured) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      nomComplet: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Praticien',
      role: (user.user_metadata?.role as UserRole) || 'medecin',
      structureNom: user.user_metadata?.structure_nom || 'Structure Sanitaire MSHP',
      numeroMatricule: user.user_metadata?.matricule
    };

    localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
    return authUser;
  } catch {
    return null;
  }
}

/**
 * Connexion avec email et mot de passe (Supabase + fallback démo)
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Vérification rapide des comptes de démonstration (pour test immédiat sans internet/validation email)
  if (DEMO_USERS[cleanEmail] && DEMO_USERS[cleanEmail].password === password) {
    const demoUser = DEMO_USERS[cleanEmail].user;
    localStorage.setItem('clinique_auth_user', JSON.stringify(demoUser));
    return { user: demoUser, error: null };
  }

  // 2. Connexion via Supabase Auth
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data?.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          nomComplet: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          role: (data.user.user_metadata?.role as UserRole) || 'medecin',
          structureNom: data.user.user_metadata?.structure_nom || 'Structure Sanitaire MSHP',
          numeroMatricule: data.user.user_metadata?.matricule
        };
        localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
        return { user: authUser, error: null };
      }
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur de connexion' };
    }
  }

  return { user: null, error: 'Identifiants invalides. Vérifiez votre email et mot de passe.' };
}

/**
 * Inscription d'un nouveau praticien (Supabase Auth)
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  metadata: { nomComplet: string; role: UserRole; structureNom: string; numeroMatricule?: string }
): Promise<{ user: AuthUser | null; error: string | null; emailConfirmationRequired?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: metadata.nomComplet,
            role: metadata.role,
            structure_nom: metadata.structureNom,
            matricule: metadata.numeroMatricule
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data?.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          nomComplet: metadata.nomComplet,
          role: metadata.role,
          structureNom: metadata.structureNom,
          numeroMatricule: metadata.numeroMatricule
        };

        const session = data.session;
        if (session) {
          localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
          return { user: authUser, error: null, emailConfirmationRequired: false };
        } else {
          // Supabase demande la confirmation d'email
          localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
          return { user: authUser, error: null, emailConfirmationRequired: true };
        }
      }
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur lors de la création du compte' };
    }
  }

  // Fallback local si Supabase hors-ligne
  const localUser: AuthUser = {
    id: 'user-' + Date.now(),
    email: cleanEmail,
    nomComplet: metadata.nomComplet,
    role: metadata.role,
    structureNom: metadata.structureNom,
    numeroMatricule: metadata.numeroMatricule
  };
  localStorage.setItem('clinique_auth_user', JSON.stringify(localUser));
  return { user: localUser, error: null };
}

/**
 * Déconnexion
 */
export async function signOutUser(): Promise<void> {
  localStorage.removeItem('clinique_auth_user');
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
}
