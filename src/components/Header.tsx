import { 
  Activity, 
  FileText, 
  Users, 
  BarChart3, 
  BookOpen, 
  Building2, 
  PlusCircle, 
  ShieldAlert,
  Calendar,
  Database,
  LogOut,
  LogIn
} from 'lucide-react';
import type { AuthUser } from '../types/auth';

interface HeaderProps {
  currentTab: 'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan';
  onSelectTab: (tab: 'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan') => void;
  selectedSite: string;
  onSelectSite: (site: string) => void;
  casPresumesTBCount: number;
  isSupabaseConnected?: boolean;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onShowLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedSite,
  onSelectSite,
  casPresumesTBCount,
  isSupabaseConnected = false,
  currentUser = null,
  onLogout,
  onShowLoginModal
}) => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
      color: '#ffffff',
      borderBottom: '4px solid #ea580c',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }} className="no-print">
      {/* Top micro-bar: Côte d'Ivoire Health Ministry branding */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Flag CI stripe */}
          <div style={{ display: 'flex', height: '14px', width: '22px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ background: '#f97316', width: '33.3%' }}></div>
            <div style={{ background: '#ffffff', width: '33.3%' }}></div>
            <div style={{ background: '#22c55e', width: '33.3%' }}></div>
          </div>
          <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            RÉPUBLIQUE DE CÔTE D'IVOIRE • MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE ET DE LA CMU
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#99f6e4', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Fiche Standardisée de Consultation & Triage (Oct. 2026)
          </span>
          <span style={{ color: '#cbd5e1' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main navigation & Identity bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* App Title & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
          }}>
            <Activity size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                CLINIQUE<span style={{ color: '#38bdf8' }}>-PLUS</span> CI
              </h1>
              <span className="badge" style={{ background: 'rgba(234, 88, 12, 0.25)', color: '#fdba74', border: '1px solid rgba(234, 88, 12, 0.5)' }}>
                Circuit Intégré
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
              Accueil • Triage • Dépistage TB • Orientation • Populations Clés
            </p>
          </div>
        </div>

        {/* Site selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <Building2 size={16} color="#5eead4" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site Sanitaire Pilote</span>
            <select 
              id="site-selector"
              value={selectedSite}
              onChange={(e) => onSelectSite(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Centre de Santé Urbain de Treichville (Abidjan)" style={{ color: '#0f172a' }}>CSU Treichville (Abidjan)</option>
              <option value="Formation Sanitaire Urbaine de Yopougon Attié" style={{ color: '#0f172a' }}>FSU Yopougon Attié (Abidjan)</option>
              <option value="Centre de Santé Rural de Bouaké-Koko" style={{ color: '#0f172a' }}>CSR Bouaké-Koko</option>
              <option value="Hôpital Général de San Pédro" style={{ color: '#0f172a' }}>HG San Pédro</option>
            </select>
          </div>
        </div>

        {/* Supabase Cloud Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: isSupabaseConnected ? '#34d399' : '#fcd34d'
        }}>
          <Database size={15} />
          <span>{isSupabaseConnected ? 'Supabase Cloud Actif' : 'Stockage Local (Offline-Ready)'}</span>
        </div>

        {/* User Authentication Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 10px 4px 6px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                {currentUser.nomComplet.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                  {currentUser.nomComplet}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#5eead4', textTransform: 'capitalize' }}>
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  title="Se déconnecter"
                  onClick={onLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#fca5a5',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            onShowLoginModal && (
              <button
                type="button"
                onClick={onShowLoginModal}
                style={{
                  background: 'rgba(20, 184, 166, 0.2)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  color: '#2dd4bf',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogIn size={15} />
                Connexion
              </button>
            )
          )}

          <button 
            id="btn-header-new-consultation"
            onClick={() => onSelectTab('consultation')}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              border: 'none'
            }}
          >
            <PlusCircle size={18} />
            Nouvelle Consultation
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto'
      }}>
        <button
          id="nav-tab-dashboard"
          onClick={() => onSelectTab('dashboard')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'dashboard' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'dashboard' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'dashboard' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'dashboard' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={17} />
          Tableau de Bord & KPIs
        </button>

        <button
          id="nav-tab-consultation"
          onClick={() => onSelectTab('consultation')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'consultation' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'consultation' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'consultation' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'consultation' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={17} />
          Fiche Intégrée (Circuit 5 étapes)
        </button>

        <button
          id="nav-tab-registry"
          onClick={() => onSelectTab('registry')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'registry' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'registry' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'registry' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'registry' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={17} />
          Registre des Patients
          {casPresumesTBCount > 0 && (
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '4px'
            }}>
              {casPresumesTBCount} TB
            </span>
          )}
        </button>

        <button
          id="nav-tab-appointments"
          onClick={() => onSelectTab('appointments')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'appointments' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'appointments' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'appointments' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'appointments' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <Calendar size={17} />
          Rendez-vous & Relances
        </button>

        <button
          id="nav-tab-protocols"
          onClick={() => onSelectTab('protocols')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'protocols' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'protocols' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'protocols' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'protocols' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={17} />
          Protocoles Cliniques CI
        </button>

        <button
          id="nav-tab-plan"
          onClick={() => onSelectTab('plan')}
          style={{
            padding: '10px 16px',
            background: currentTab === 'plan' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'plan' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'plan' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'plan' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={17} />
          Plan d'Implémentation 2026
        </button>
      </div>
    </header>
  );
};
