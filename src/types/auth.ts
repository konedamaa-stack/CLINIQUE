export type UserRole = 'super_admin' | 'administrateur' | 'medecin' | 'infirmier' | 'agent_communautaire';

export interface AuthUser {
  id: string;
  email: string;
  nomComplet: string;
  role: UserRole;
  structureNom: string;
  numeroMatricule?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
