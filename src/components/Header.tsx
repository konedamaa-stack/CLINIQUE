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
  currentTab: 'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan' | 'superadmin' | 'team';
  onSelectTab: (tab: 'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan' | 'superadmin' | 'team') => void;
  selectedSite: string;
  onSelectSite: (site: string) => void;
  casPresumesTBCount: number;
  isSupabaseConnected?: boolean;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onShowLoginModal?: () => void;
  availableClinics?: { id: string; nom: string; domain?: string }[];
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
  onShowLoginModal,
  availableClinics = []
}) => {
  const currentClinic = availableClinics.find(c => c.nom === selectedSite);
  const currentClinicDomain = currentClinic?.domain;

  const isSuperAdmin = Boolean(
    currentUser && (
      currentUser.role === 'super_admin' || 
      currentUser.email?.toLowerCase() === 'konedamaa@gmail.com' ||
      currentUser.nomComplet?.toLowerCase().includes('super administrateur')
    )
  );
  const isDirectorOrAdmin = Boolean(
    isSuperAdmin || (currentUser && currentUser.role === 'administrateur')
  );
  return (
    <header style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
      color: '#ffffff',
      borderBottom: '4px solid #ea580c',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'clip'
    }} className="no-print">
      {/* Top micro-bar: Côte d'Ivoire Health Ministry branding */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
          {/* Flag CI stripe */}
          <div style={{ display: 'flex', height: '14px', width: '22px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ background: '#f97316', width: '33.3%' }}></div>
            <div style={{ background: '#ffffff', width: '33.3%' }}></div>
            <div style={{ background: '#22c55e', width: '33.3%' }}></div>
          </div>
          <span style={{ fontWeight: 600, letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            RÉPUBLIQUE DE CÔTE D'IVOIRE • MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE ET DE LA CMU
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, fontSize: '0.75rem' }}>
          <span style={{ color: '#99f6e4', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={13} /> Fiche Standardisée (Oct. 2026)
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
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '12px',
        boxSizing: 'border-box'
      }}>
        {/* Left: Logo & Nouvelle Consultation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
            <div style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              padding: '9px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
            }}>
              <Activity size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                  CLINIQUE<span style={{ color: '#38bdf8' }}>-PLUS</span> CI
                </h1>
                <span className="badge" style={{ background: 'rgba(234, 88, 12, 0.25)', color: '#fdba74', border: '1px solid rgba(234, 88, 12, 0.5)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px' }}>
                  Circuit Intégré
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#cbd5e1' }}>
                Accueil • Triage • Dépistage TB • Orientation • Populations Clés
              </p>
            </div>
          </div>

          <button 
            id="btn-header-new-consultation"
            onClick={() => onSelectTab('consultation')}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <PlusCircle size={17} />
            <span>Nouvelle Consultation</span>
          </button>
        </div>

        {/* Center: Site Sanitaire selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(255, 255, 255, 0.08)', 
          padding: '6px 14px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.15)',
          maxWidth: '380px',
          minWidth: '220px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Building2 size={17} color="#5eead4" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <span style={{ fontSize: '0.67rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site Sanitaire</span>
              {currentClinicDomain && (
                <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, background: 'rgba(56, 189, 248, 0.15)', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  🌐 {currentClinicDomain}
                </span>
              )}
            </div>
            <select 
              id="site-selector"
              value={selectedSite}
              onChange={(e) => onSelectSite(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
            >
              {availableClinics && availableClinics.length > 0 ? (
                availableClinics.map((cl) => (
                  <option key={cl.id} value={cl.nom} style={{ color: '#0f172a' }}>
                    {cl.nom}
                  </option>
                ))
              ) : (
                <option value="" style={{ color: '#0f172a' }}>
                  Aucun établissement (Créer via 👑 Admin)
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Right Section: Cloud Sync + User Profile Card ALIGNÉ À DROITE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Supabase Cloud Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.74rem',
            color: isSupabaseConnected ? '#34d399' : '#fcd34d',
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isSupabaseConnected ? '#10b981' : '#f59e0b',
              boxShadow: isSupabaseConnected ? '0 0 8px #10b981' : 'none'
            }} />
            <Database size={13} />
            <span>{isSupabaseConnected ? 'Cloud Supabase' : 'Stockage Local'}</span>
          </div>

          {/* User Authentication Profile & Actions À DROITE */}
          {currentUser ? (
            (() => {
              const cleanDisplayName = currentUser.nomComplet.replace(/\s*\(.*?\)/g, '').trim() || currentUser.nomComplet;
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.10)',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  maxWidth: '300px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isSuperAdmin 
                      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                      : currentUser.role === 'administrateur'
                      ? 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    flexShrink: 0
                  }}>
                    {cleanDisplayName.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
                    <span 
                      style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 700, 
                        color: '#ffffff', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px'
                      }} 
                      title={currentUser.nomComplet}
                    >
                      {cleanDisplayName}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: isSuperAdmin ? '#fdba74' : currentUser.role === 'administrateur' ? '#5eead4' : '#93c5fd',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {isSuperAdmin ? 'Super Admin' : currentUser.role === 'administrateur' ? 'Directeur' : currentUser.role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Accès discret Super Admin uniquement dans la carte de profil du Super Admin */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      title={currentTab === 'superadmin' ? 'Retour aux Fiches Cliniques' : 'Accéder au Contrôle Super Admin'}
                      onClick={() => onSelectTab(currentTab === 'superadmin' ? 'dashboard' : 'superadmin')}
                      style={{
                        background: currentTab === 'superadmin' ? 'rgba(234, 88, 12, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                        border: `1px solid ${currentTab === 'superadmin' ? '#f97316' : 'rgba(255, 255, 255, 0.25)'}`,
                        color: currentTab === 'superadmin' ? '#ffedd5' : '#cbd5e1',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '2px',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>👑</span>
                      <span>{currentTab === 'superadmin' ? 'Clinique' : 'Admin'}</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      type="button"
                      title="Se déconnecter"
                      onClick={onLogout}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        padding: '5px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '2px',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.45)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                    >
                      <LogOut size={13} />
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            onShowLoginModal && (
              <button
                type="button"
                onClick={onShowLoginModal}
                style={{
                  background: 'rgba(20, 184, 166, 0.2)',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  color: '#2dd4bf',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogIn size={15} />
                Connexion
              </button>
            )
          )}
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

        {/* TAB ÉQUIPE MÉDICALE (Visible uniquement pour Directeur / Admin / Super Admin) */}
        {isDirectorOrAdmin && (
          <button
            id="nav-tab-team"
            onClick={() => onSelectTab('team')}
            style={{
              padding: '10px 16px',
              background: currentTab === 'team' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: currentTab === 'team' ? '3px solid #2dd4bf' : '3px solid transparent',
              color: currentTab === 'team' ? '#ffffff' : '#cbd5e1',
              fontWeight: currentTab === 'team' ? 700 : 500,
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
            <span>Équipe Médicale (Directeur)</span>
          </button>
        )}
      </div>
    </header>
  );
};
