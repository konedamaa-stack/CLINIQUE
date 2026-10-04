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

export function normalizeLogin(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (é -> e, etc.)
    .replace(/^(dr\.?|inf\.?|agent|prof\.?)\s+/i, '') // strip title prefixes
    .replace(/[^a-z0-9]/g, '') // keep only alphanumeric
    .trim();
}

export function isPasswordMatch(expected: string, given: string): boolean {
  if (expected === given) return true;
  if (expected.toLowerCase() === given.toLowerCase()) return true;
  return false;
}

const USER_SUPER_ADMIN: AuthUser = {
  id: 'super-admin-adama-kone',
  email: 'konedamaa@gmail.com',
  nomComplet: 'Adama Koné (Super Administrateur Réseau)',
  role: 'super_admin',
  structureNom: 'Direction Générale de la Santé & CMU (Côte d\'Ivoire)',
  numeroMatricule: 'MSHP-SUPER-ADMIN-01'
};

const USER_DR_KONE: AuthUser = {
  id: 'demo-dr-kone',
  email: 'dr.kone@sante.gouv.ci',
  nomComplet: 'Dr. Koné Souleymane (Médecin Chef)',
  role: 'medecin',
  structureNom: 'Centre de Santé Urbain de Treichville (Abidjan)',
  numeroMatricule: 'MSHP-CI-48291'
};

const USER_INF_AMLAN: AuthUser = {
  id: 'demo-inf-amlan',
  email: 'infirmiere.amlan@sante.gouv.ci',
  nomComplet: 'Inf. Amlan Kouakou',
  role: 'infirmier',
  structureNom: 'Formation Sanitaire Urbaine de Yopougon Attié',
  numeroMatricule: 'MSHP-CI-91024'
};

const USER_DIR_BAKAYOKO: AuthUser = {
  id: 'demo-super-admin',
  email: 'directeur.mshp@sante.gouv.ci',
  nomComplet: 'Dr. Bakayoko Ibrahima (Directeur Général Santé)',
  role: 'administrateur',
  structureNom: 'Direction Générale de la Santé & CMU (Côte d\'Ivoire)',
  numeroMatricule: 'MSHP-DIR-0001'
};

const USER_AGENT_YAO: AuthUser = {
  id: 'demo-agent-yao',
  email: 'agent.yao@sante.gouv.ci',
  nomComplet: 'Agent Yao N\'Guessan',
  role: 'agent_communautaire',
  structureNom: 'Centre de Santé Rural de Bouaké-Koko',
  numeroMatricule: 'MSHP-CI-11409'
};

// Comptes configurés accessibles par NOM simplement ou email
export const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  // Super Admin: Login avec "adama", "adama kone", "kone", ou email
  'adama': { password: 'madouu1966@', user: USER_SUPER_ADMIN },
  'adama kone': { password: 'madouu1966@', user: USER_SUPER_ADMIN },
  'adamakone': { password: 'madouu1966@', user: USER_SUPER_ADMIN },
  'konedamaa@gmail.com': { password: 'madouu1966@', user: USER_SUPER_ADMIN },

  // Dr. Koné: Login avec "kone", "dr. kone", "souleymane"
  'kone': { password: 'Password123!', user: USER_DR_KONE },
  'dr. kone': { password: 'Password123!', user: USER_DR_KONE },
  'dr.kone': { password: 'Password123!', user: USER_DR_KONE },
  'drkone': { password: 'Password123!', user: USER_DR_KONE },
  'souleymane': { password: 'Password123!', user: USER_DR_KONE },
  'dr.kone@sante.gouv.ci': { password: 'Password123!', user: USER_DR_KONE },

  // Inf. Amlan: Login avec "amlan", "amlan kouakou"
  'amlan': { password: 'Password123!', user: USER_INF_AMLAN },
  'inf. amlan': { password: 'Password123!', user: USER_INF_AMLAN },
  'infamlan': { password: 'Password123!', user: USER_INF_AMLAN },
  'amlan kouakou': { password: 'Password123!', user: USER_INF_AMLAN },
  'infirmiere.amlan@sante.gouv.ci': { password: 'Password123!', user: USER_INF_AMLAN },

  // Directeur Bakayoko: Login avec "bakayoko", "directeur"
  'bakayoko': { password: 'Password123!', user: USER_DIR_BAKAYOKO },
  'directeur': { password: 'Password123!', user: USER_DIR_BAKAYOKO },
  'directeur.mshp@sante.gouv.ci': { password: 'Password123!', user: USER_DIR_BAKAYOKO },

  // Agent Yao: Login avec "yao", "agent yao"
  'yao': { password: 'Password123!', user: USER_AGENT_YAO },
  'agent yao': { password: 'Password123!', user: USER_AGENT_YAO },
  'agentyao': { password: 'Password123!', user: USER_AGENT_YAO },
  'yao n\'guessan': { password: 'Password123!', user: USER_AGENT_YAO },
  'agent.yao@sante.gouv.ci': { password: 'Password123!', user: USER_AGENT_YAO },
};

/**
 * Récupère les comptes créés par le Super Administrateur
 */
export function getSuperAdminStaffAccounts(): Record<string, { password: string; user: AuthUser }> {
  try {
    const saved = localStorage.getItem('clinique_superadmin_staff_accounts');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erreur lecture comptes praticiens:', e);
  }
  return {};
}

/**
 * Enregistre ou met à jour un compte créé par le Super Administrateur ou un Directeur
 */
export function saveSuperAdminStaffAccount(identifier: string, password: string, user: AuthUser): void {
  const accounts = getSuperAdminStaffAccounts();
  const cleanKey = identifier.trim().toLowerCase();
  accounts[cleanKey] = { password, user };

  const normKey = normalizeLogin(cleanKey);
  if (normKey) {
    accounts[normKey] = { password, user };
  }

  // Indexer par toutes les variantes du Nom pour garantir une connexion simple par le nom
  if (user.nomComplet) {
    const rawNom = user.nomComplet.trim().toLowerCase();
    accounts[rawNom] = { password, user };

    const normNom = normalizeLogin(rawNom);
    if (normNom) {
      accounts[normNom] = { password, user };
    }

    // Indexer chaque mot du nom (ex: "souleymane", "kone", "yao", "amlan")
    const words = rawNom
      .replace(/^(dr\.?|inf\.?|agent|prof\.?)\s+/i, '')
      .split(/\s+/);
    words.forEach(w => {
      const cleanW = w.trim();
      if (cleanW.length >= 2) {
        accounts[cleanW] = { password, user };
        const normW = normalizeLogin(cleanW);
        if (normW) {
          accounts[normW] = { password, user };
        }
      }
    });
  }

  if (cleanKey.includes('@')) {
    const prefix = cleanKey.split('@')[0];
    accounts[prefix] = { password, user };
    accounts[normalizeLogin(prefix)] = { password, user };
  }

  localStorage.setItem('clinique_superadmin_staff_accounts', JSON.stringify(accounts));
}

/**
 * Supprime un compte praticien
 */
export function deleteSuperAdminStaffAccount(email: string): void {
  const accounts = getSuperAdminStaffAccounts();
  const cleanKey = email.trim().toLowerCase();
  delete accounts[cleanKey];
  if (cleanKey.includes('@')) {
    delete accounts[cleanKey.split('@')[0]];
  }
  localStorage.setItem('clinique_superadmin_staff_accounts', JSON.stringify(accounts));
}

/**
 * Retourne l'ensemble des comptes praticiens (démo + créés par Super Admin)
 */
export function getAllStaffAccounts(): Record<string, { password: string; user: AuthUser }> {
  const custom = getSuperAdminStaffAccounts();
  return {
    ...DEMO_USERS,
    ...custom
  };
}

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
 * Connexion avec Nom de l'utilisateur ou Identifiant et mot de passe (Connexion par Nom)
 */
export async function signInWithEmail(identifier: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanId = identifier.trim().toLowerCase();
  const normInput = normalizeLogin(cleanId);
  const allStaff = getAllStaffAccounts();

  // 1. Recherche directe dans la liste
  if (allStaff[cleanId]) {
    if (isPasswordMatch(allStaff[cleanId].password, password)) {
      const staffUser = allStaff[cleanId].user;
      localStorage.setItem('clinique_auth_user', JSON.stringify(staffUser));
      return { user: staffUser, error: null };
    } else {
      return { user: null, error: 'Mot de passe incorrect pour cet identifiant.' };
    }
  }

  // 2. Recherche par clé normalisée (sans accents, sans dr/inf, sans espaces)
  if (normInput && allStaff[normInput]) {
    if (isPasswordMatch(allStaff[normInput].password, password)) {
      const staffUser = allStaff[normInput].user;
      localStorage.setItem('clinique_auth_user', JSON.stringify(staffUser));
      return { user: staffUser, error: null };
    } else {
      return { user: null, error: 'Mot de passe incorrect pour cet identifiant.' };
    }
  }

  // 3. Recherche tolérante par Nom complet (avec ou sans accents, avec ou sans titre)
  for (const [key, account] of Object.entries(allStaff)) {
    const rawNom = account.user.nomComplet.toLowerCase();
    const normNom = normalizeLogin(rawNom);
    const userEmail = account.user.email.toLowerCase();
    const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;
    const username = account.user.username?.toLowerCase() || '';

    const matches = (
      key.toLowerCase() === cleanId ||
      normalizeLogin(key) === normInput ||
      userEmail === cleanId ||
      emailPrefix === cleanId ||
      username === cleanId ||
      rawNom === cleanId ||
      normNom === normInput ||
      (normInput.length >= 3 && normNom.includes(normInput)) ||
      (normInput.length >= 3 && normInput.includes(normNom)) ||
      rawNom.split(/\s+/).some(part => {
        const normPart = normalizeLogin(part);
        return normPart.length >= 3 && (normPart === normInput || normPart.includes(normInput) || normInput.includes(normPart));
      })
    );

    if (matches) {
      if (isPasswordMatch(account.password, password)) {
        localStorage.setItem('clinique_auth_user', JSON.stringify(account.user));
        return { user: account.user, error: null };
      } else {
        return { user: null, error: 'Mot de passe incorrect pour cet identifiant.' };
      }
    }
  }

  // 3. Connexion via Supabase Auth (si adresse email fournie)
  if (isSupabaseConfigured && cleanId.includes('@')) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: password
      });

      if (!error && data?.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || cleanId,
          nomComplet: data.user.user_metadata?.full_name || cleanId.split('@')[0],
          role: (data.user.user_metadata?.role as UserRole) || 'medecin',
          structureNom: data.user.user_metadata?.structure_nom || 'Centre de Santé Urbain de Treichville (Abidjan)',
          numeroMatricule: data.user.user_metadata?.matricule
        };
        localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
        return { user: authUser, error: null };
      }

      // Contournement si Supabase renvoie "Email not confirmed"
      if (error && (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('not confirmed'))) {
        const authUser: AuthUser = {
          id: 'user-' + Date.now(),
          email: cleanId,
          nomComplet: cleanId.split('@')[0],
          role: 'medecin',
          structureNom: 'Centre de Santé Urbain de Treichville (Abidjan)'
        };
        localStorage.setItem('clinique_auth_user', JSON.stringify(authUser));
        return { user: authUser, error: null };
      }

      if (error) {
        return { user: null, error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase auth warning:', err);
    }
  }

  return { 
    user: null, 
    error: `Identifiant ou mot de passe incorrect. Vous pouvez vous connecter avec votre Nom (ex: mister, kone, adama) ou votre email.` 
  };
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
