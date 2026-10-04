export type UserRole = 'medecin' | 'infirmier' | 'agent_communautaire' | 'administrateur';

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
