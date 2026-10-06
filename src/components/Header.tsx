import React from 'react';
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
      maxWidth: '100vw',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }} className="no-print">
      {/* Top micro-bar: Côte d'Ivoire Health Ministry branding */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '5px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          {/* Flag CI stripe */}
          <div style={{ display: 'flex', height: '12px', width: '18px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ background: '#f97316', width: '33.3%' }}></div>
            <div style={{ background: '#ffffff', width: '33.3%' }}></div>
            <div style={{ background: '#22c55e', width: '33.3%' }}></div>
          </div>
          <span style={{ fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            RÉPUBLIQUE DE CÔTE D'IVOIRE • MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE ET DE LA CMU
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, fontSize: '0.74rem' }}>
          <span style={{ color: '#99f6e4', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Activity size={13} /> Fiche Standardisée (Oct. 2026)
          </span>
          <span className="header-top-date" style={{ color: '#cbd5e1', whiteSpace: 'nowrap' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main navigation & Identity bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '10px',
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0
      }}>
        {/* Left: Logo & Titre de Clinique & Bouton Nouvelle Consultation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 }} 
            onClick={() => onSelectTab('dashboard')}
            title="Tableau de bord"
          >
            <div style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)',
              flexShrink: 0
            }}>
              <Activity size={22} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <h1 
                  className="header-clinic-title"
                  style={{ 
                    fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)', 
                    fontWeight: 800, 
                    letterSpacing: '-0.02em', 
                    margin: 0, 
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '260px'
                  }}
                  title={selectedSite || 'CLINIQUE-PLUS CI'}
                >
                  {selectedSite ? selectedSite : (
                    <>CLINIQUE<span style={{ color: '#38bdf8' }}>-PLUS</span> CI</>
                  )}
                </h1>
                <span className="badge header-badge-integrated" style={{ 
                  background: 'rgba(234, 88, 12, 0.25)', 
                  color: '#fdba74', 
                  border: '1px solid rgba(234, 88, 12, 0.5)', 
                  fontSize: '0.65rem', 
                  padding: '1px 6px', 
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  Circuit Intégré
                </span>
              </div>
              <p className="header-subtitle-text" style={{ 
                margin: 0, 
                fontSize: '0.72rem', 
                color: '#cbd5e1', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '280px' 
              }}>
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
              padding: '7px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            title="Nouvelle Consultation"
          >
            <PlusCircle size={16} />
            <span className="header-btn-consultation-label">Nouvelle Consultation</span>
          </button>
        </div>

        {/* Center: Site Sanitaire selector (compact & responsive) */}
        <div 
          className="header-site-box"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.08)', 
            padding: '5px 10px', 
            borderRadius: '10px', 
            border: '1px solid rgba(255, 255, 255, 0.15)',
            maxWidth: '240px',
            minWidth: '130px',
            flexShrink: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Building2 size={16} color="#5eead4" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Site Sanitaire</span>
              {currentClinicDomain && (
                <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, background: 'rgba(56, 189, 248, 0.15)', padding: '1px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
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
                fontSize: '0.80rem',
                outline: 'none',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                width: '100%',
                padding: 0
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Supabase Cloud Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            padding: '4px 8px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            color: isSupabaseConnected ? '#34d399' : '#fcd34d',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isSupabaseConnected ? '#10b981' : '#f59e0b',
              boxShadow: isSupabaseConnected ? '0 0 6px #10b981' : 'none'
            }} />
            <Database size={12} />
            <span className="header-cloud-label">{isSupabaseConnected ? 'Cloud Supabase' : 'Stockage Local'}</span>
          </div>

          {/* User Authentication Profile & Actions À DROITE */}
          {currentUser ? (
            (() => {
              const cleanDisplayName = currentUser.nomComplet.replace(/\s*\(.*?\)/g, '').trim() || currentUser.nomComplet;
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.10)',
                  padding: '3px 8px 3px 4px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  maxWidth: '220px',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
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
                    fontSize: '0.80rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    flexShrink: 0
                  }}>
                    {cleanDisplayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="header-user-info-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
                    <span 
                      style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 700, 
                        color: '#ffffff', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '85px'
                      }} 
                      title={currentUser.nomComplet}
                    >
                      {cleanDisplayName}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
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
                        padding: '3px 6px',
                        borderRadius: '10px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        marginLeft: '2px',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
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
                        padding: '4px',
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
                      <LogOut size={12} />
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
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <LogIn size={14} />
                Connexion
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs navigation avec scroll horizontal fluide sans débordement de page */}
      <div 
        className="header-tabs-container"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <button
          id="nav-tab-dashboard"
          onClick={() => onSelectTab('dashboard')}
          style={{
            padding: '9px 14px',
            background: currentTab === 'dashboard' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'dashboard' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'dashboard' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'dashboard' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <BarChart3 size={16} />
          Tableau de Bord & KPIs
        </button>

        <button
          id="nav-tab-consultation"
          onClick={() => onSelectTab('consultation')}
          style={{
            padding: '9px 14px',
            background: currentTab === 'consultation' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'consultation' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'consultation' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'consultation' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <FileText size={16} />
          Fiche Intégrée (Circuit 5 Étapes)
        </button>

        <button
          id="nav-tab-registry"
          onClick={() => onSelectTab('registry')}
          style={{
            padding: '9px 14px',
            background: currentTab === 'registry' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'registry' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'registry' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'registry' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Users size={16} />
          Registre des Patients
          {casPresumesTBCount > 0 && (
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '1px 6px',
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
            padding: '9px 14px',
            background: currentTab === 'appointments' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'appointments' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'appointments' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'appointments' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Calendar size={16} />
          Rendez-vous & Relances
        </button>

        <button
          id="nav-tab-protocols"
          onClick={() => onSelectTab('protocols')}
          style={{
            padding: '9px 14px',
            background: currentTab === 'protocols' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'protocols' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'protocols' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'protocols' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <BookOpen size={16} />
          Protocoles Cliniques CI
        </button>

        <button
          id="nav-tab-plan"
          onClick={() => onSelectTab('plan')}
          style={{
            padding: '9px 14px',
            background: currentTab === 'plan' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentTab === 'plan' ? '3px solid #2dd4bf' : '3px solid transparent',
            color: currentTab === 'plan' ? '#ffffff' : '#cbd5e1',
            fontWeight: currentTab === 'plan' ? 700 : 500,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <ShieldAlert size={16} />
          Plan d'Implémentation 2026
        </button>

        {/* TAB ÉQUIPE MÉDICALE (Visible uniquement pour Directeur / Admin / Super Admin) */}
        {isDirectorOrAdmin && (
          <button
            id="nav-tab-team"
            onClick={() => onSelectTab('team')}
            style={{
              padding: '9px 14px',
              background: currentTab === 'team' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: currentTab === 'team' ? '3px solid #2dd4bf' : '3px solid transparent',
              color: currentTab === 'team' ? '#ffffff' : '#cbd5e1',
              fontWeight: currentTab === 'team' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Users size={16} />
            <span>Équipe Médicale (Directeur)</span>
          </button>
        )}
      </div>
    </header>
  );
};
