import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPIOverview } from './components/KPIOverview';
import { ConsultationForm } from './components/ConsultationForm';
import { PatientRegistry } from './components/PatientRegistry';
import { PrintableFiche } from './components/PrintableFiche';
import { ClinicalProtocols } from './components/ClinicalProtocols';
import { ImplementationPlanView } from './components/ImplementationPlanView';
import { AppointmentsView } from './components/AppointmentsView';
import { LoginView } from './components/LoginView';
import { SuperAdminView } from './components/SuperAdminView';
import { ClinicTeamView } from './components/ClinicTeamView';
import type { FicheConsultation, TypePopulation } from './types/clinical';
import type { AuthUser } from './types/auth';
import type { ClinicStructure } from './types/clinic';
import { INITIAL_MOCK_FICHES, calculateKPIsFromFiches } from './data/mockPatients';
import { INITIAL_CLINICS } from './data/mockClinics';
import {
  isSupabaseConfigured,
  fetchConsultationsFromSupabase,
  upsertConsultationToSupabase,
  deleteConsultationFromSupabase,
  getCurrentAuthUser,
  signOutUser
} from './lib/supabase';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Établissements sanitaires supervisés par le Super Admin
  const [clinics, setClinics] = useState<ClinicStructure[]>(() => {
    const saved = localStorage.getItem('clinique_structures_ci');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved clinics:', e);
      }
    }
    return INITIAL_CLINICS;
  });

  const [fiches, setFiches] = useState<FicheConsultation[]>(() => {
    const saved = localStorage.getItem('clinique_consultations_ci');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved fiches:', e);
      }
    }
    return INITIAL_MOCK_FICHES;
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan' | 'superadmin' | 'team'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'superadmin' || hash === 'admin') return 'superadmin';
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'superadmin') return 'superadmin';
    }
    return 'dashboard';
  });
  const [selectedSite, setSelectedSite] = useState<string>('Centre de Santé Urbain de Treichville (Abidjan)');
  const [editingFiche, setEditingFiche] = useState<FicheConsultation | null>(null);
  const [previewFiche, setPreviewFiche] = useState<FicheConsultation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Registry filter pre-selection from dashboard clicks
  const [registryFilterTB, setRegistryFilterTB] = useState<boolean>(false);
  const [registryFilterPop, setRegistryFilterPop] = useState<TypePopulation | null>(null);

  useEffect(() => {
    localStorage.setItem('clinique_structures_ci', JSON.stringify(clinics));
  }, [clinics]);

  // Synchronisation de l'URL hash avec l'onglet courant
  useEffect(() => {
    if (currentTab === 'superadmin') {
      window.location.hash = 'superadmin';
    } else if (window.location.hash === '#superadmin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [currentTab]);

  // Multi-tenant automatic domain / subdomain resolution
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const domainParam = (searchParams.get('domain') || searchParams.get('subdomain') || '').toLowerCase();

    // 1. Check URL query param (for testing in local dev or Vercel preview URLs)
    if (domainParam) {
      const matched = clinics.find(c => 
        c.slug?.toLowerCase() === domainParam ||
        c.subdomain?.toLowerCase() === domainParam ||
        c.subdomain?.toLowerCase().startsWith(domainParam + '.') ||
        c.customDomain?.toLowerCase() === domainParam ||
        c.nom.toLowerCase().includes(domainParam)
      );
      if (matched) {
        setSelectedSite(matched.nom);
        return;
      }
    }

    // 2. Check full hostname in production (e.g. treichville.clinique.ci or csu-treichville.ci)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.vercel.app')) {
      const matched = clinics.find(c => {
        const custom = c.customDomain?.toLowerCase();
        const sub = c.subdomain?.toLowerCase();
        const slug = c.slug?.toLowerCase();
        return (
          (custom && (hostname === custom || hostname === `www.${custom}`)) ||
          (sub && hostname === sub) ||
          (slug && hostname.startsWith(slug + '.'))
        );
      });
      if (matched) {
        setSelectedSite(matched.nom);
      }
    }
  }, [clinics]);

  // Check auth on mount
  useEffect(() => {
    getCurrentAuthUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        if (user.structureNom) {
          setSelectedSite(user.structureNom);
        }
        if (user.role === 'super_admin' && (window.location.hash === '#superadmin' || !window.location.hash)) {
          setCurrentTab('superadmin');
        }
      }
      setIsAuthLoading(false);
    });
  }, []);

  // Sync with Supabase on mount if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchConsultationsFromSupabase().then(({ data, error }) => {
        if (data && data.length > 0) {
          setFiches(data);
          showToast(`✓ ${data.length} consultations chargées depuis Supabase`);
        } else if (error) {
          console.warn('Supabase fetch notice:', error);
        }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clinique_consultations_ci', JSON.stringify(fiches));
  }, [fiches]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsGuestMode(false);
    setShowLoginModal(false);
    if (user.structureNom) {
      setSelectedSite(user.structureNom);
    }
    // Basculer automatiquement sur le tableau de bord Super Admin
    if (user.role === 'super_admin' || user.email === 'konedamaa@gmail.com') {
      setCurrentTab('superadmin');
    }
    showToast(`👑 Bienvenue ${user.nomComplet}`);
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsGuestMode(false);
    showToast('Déconnexion effectuée.');
  };

  const handleAddClinic = (newClinic: ClinicStructure) => {
    setClinics((prev) => [newClinic, ...prev]);
    showToast(`✓ Établissement "${newClinic.nom}" ajouté au réseau sanitaire.`);
  };

  const handleUpdateClinic = (updatedClinic: ClinicStructure) => {
    setClinics((prev) => prev.map((c) => (c.id === updatedClinic.id ? updatedClinic : c)));
    showToast(`✓ Paramètres de "${updatedClinic.nom}" mis à jour.`);
  };

  const handleSelectClinicForControl = (clinicNom: string) => {
    setSelectedSite(clinicNom);
    setCurrentTab('dashboard');
    showToast(`👑 Prise de contrôle : ${clinicNom}`);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSaveFiche = (savedFiche: FicheConsultation) => {
    setFiches((prev) => {
      const existsIndex = prev.findIndex((f) => f.id === savedFiche.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedFiche;
        return updated;
      } else {
        return [savedFiche, ...prev];
      }
    });

    // Cloud sync
    if (isSupabaseConfigured) {
      upsertConsultationToSupabase(savedFiche).catch((err) => {
        console.error('Supabase sync error on save:', err);
      });
    }

    showToast(`✓ Fiche enregistrée pour ${savedFiche.admin.nom} ${savedFiche.admin.prenoms} (N° ${savedFiche.admin.numOrdre})`);
    setEditingFiche(null);
    setCurrentTab('registry');
  };

  const handleDeleteFiche = (id: string) => {
    setFiches((prev) => prev.filter((f) => f.id !== id));
    if (isSupabaseConfigured) {
      deleteConsultationFromSupabase(id).catch((err) => {
        console.error('Supabase delete error:', err);
      });
    }
    showToast('Fiche supprimée du registre.');
  };

  const handleNewConsultation = () => {
    setEditingFiche(null);
    setCurrentTab('consultation');
  };

  const handleEditFiche = (fiche: FicheConsultation) => {
    setEditingFiche(fiche);
    setCurrentTab('consultation');
  };

  const handleNewVisitForPatient = (existingFiche: FicheConsultation) => {
    const newVisitFiche: FicheConsultation = {
      id: 'fiche-' + Date.now(),
      codePatient: existingFiche.codePatient,
      siteNom: selectedSite,
      agentNom: currentUser ? currentUser.nomComplet : (existingFiche.agentNom || 'Personnel Soignant de Service'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estComplete: false,
      admin: {
        ...existingFiche.admin,
        numOrdre: String(Math.floor(1000 + Math.random() * 9000)),
        dateConsultation: new Date().toISOString().split('T')[0]
      },
      triage: {
        poidsKg: existingFiche.triage.poidsKg,
        tailleCm: existingFiche.triage.tailleCm,
        temperature: 37.0,
        frequenceRespiratoire: 18,
        tensionSystolique: undefined,
        tensionDiastolique: undefined,
        perimetreBrachialMm: undefined,
        glycemieCapillaireG_L: undefined
      },
      tb: {
        touxPersistante: false,
        fievreProlongee: false,
        sueursNocturnes: false,
        pertePoids: false,
        tbPresume: false,
        prelevementCrachatEffectue: false,
        examenTBPropose: 'aucun'
      },
      antecedents: {
        ...existingFiche.antecedents
      },
      orientation: {
        motifsConsultation: '',
        examenPhysiqueResume: '',
        examensDemandes: [],
        decisionClinique: 'prise_en_charge_locale',
        ordonnancePrescription: ''
      },
      suivi: {
        dateProchainRdv: '',
        contactAccompagnant: existingFiche.suivi.contactAccompagnant,
        agentCommunautaireAssigne: existingFiche.suivi.agentCommunautaireAssigne,
        statutSuivi: 'en_cours',
        notesSuivi: ''
      }
    };

    setEditingFiche(newVisitFiche);
    setCurrentTab('consultation');
    showToast(`Dossier médical de ${existingFiche.admin.nom} ${existingFiche.admin.prenoms} prêt. Renseignez la nouvelle pathologie.`);
  };

  const handleUpdateFicheSuivi = (ficheId: string, updates: Partial<FicheConsultation['suivi']>) => {
    let updatedFiche: FicheConsultation | null = null;
    setFiches((prev) => prev.map((f) => {
      if (f.id === ficheId) {
        updatedFiche = {
          ...f,
          suivi: {
            ...f.suivi,
            ...updates
          }
        };
        return updatedFiche;
      }
      return f;
    }));

    if (isSupabaseConfigured && updatedFiche) {
      upsertConsultationToSupabase(updatedFiche).catch((err) => {
        console.error('Supabase sync error on update suivi:', err);
      });
    }

    showToast('Statut du rendez-vous mis à jour.');
  };

  const handlePrintPreview = (fiche: FicheConsultation) => {
    setPreviewFiche(fiche);
  };

  const handleDashboardFilterTB = () => {
    setRegistryFilterTB(true);
    setRegistryFilterPop(null);
    setCurrentTab('registry');
  };

  const handleDashboardFilterPop = (pop: TypePopulation) => {
    setRegistryFilterPop(pop);
    setRegistryFilterTB(false);
    setCurrentTab('registry');
  };

  // Live KPI statistics
  const stats = calculateKPIsFromFiches(fiches);

  // Écran de chargement initial
  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(20, 184, 166, 0.2)',
          borderTopColor: '#14b8a6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
          Vérification de la session médicale sécurisée...
        </p>
      </div>
    );
  }

  // Écran de connexion obligatoire si aucun utilisateur connecté et pas en mode invité
  if (!currentUser && !isGuestMode) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          showToast('Mode Invité activé. Vous pouvez vous connecter à tout moment.');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1100,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '4px solid #14b8a6',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {notification}
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'consultation' && currentTab !== 'consultation') {
            setEditingFiche(null);
          }
          setCurrentTab(tab);
        }}
        selectedSite={selectedSite}
        onSelectSite={setSelectedSite}
        casPresumesTBCount={stats.casPresumesTBTotal}
        isSupabaseConnected={isSupabaseConfigured}
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowLoginModal={() => setShowLoginModal(true)}
        availableClinics={clinics.map(c => ({ id: c.id, nom: c.nom, domain: c.customDomain || c.subdomain }))}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* TAB 1: DASHBOARD & KPIS */}
        {currentTab === 'dashboard' && (
          <KPIOverview
            stats={stats}
            onFilterByPopulation={handleDashboardFilterPop}
            onFilterByTB={handleDashboardFilterTB}
            onFilterByHTA={() => {
              setRegistryFilterPop(null);
              setRegistryFilterTB(false);
              setCurrentTab('registry');
            }}
          />
        )}

        {/* TAB 2: CONSULTATION FORM (5 ÉTAPES) */}
        {currentTab === 'consultation' && (
          <ConsultationForm
            key={editingFiche?.id || 'new'}
            initialFiche={editingFiche}
            existingFiches={fiches}
            onSave={handleSaveFiche}
            onCancel={() => {
              setEditingFiche(null);
              setCurrentTab('registry');
            }}
            onPrintPreview={handlePrintPreview}
            siteNom={selectedSite}
            currentAgentNom={currentUser?.nomComplet}
          />
        )}

        {/* TAB 3: REGISTRE DES CONSULTATIONS */}
        {currentTab === 'registry' && (
          <PatientRegistry
            fiches={fiches}
            onSelectFiche={handleEditFiche}
            onEditFiche={handleEditFiche}
            onDeleteFiche={handleDeleteFiche}
            onPrintFiche={handlePrintPreview}
            onNewConsultation={handleNewConsultation}
            onNewVisitForPatient={handleNewVisitForPatient}
            initialFilterTB={registryFilterTB}
            initialFilterPop={registryFilterPop}
          />
        )}

        {/* TAB 4: GESTION DES RENDEZ-VOUS & RELANCES */}
        {currentTab === 'appointments' && (
          <AppointmentsView
            fiches={fiches}
            onStartNewVisit={handleNewVisitForPatient}
            onUpdateFicheSuivi={handleUpdateFicheSuivi}
          />
        )}

        {/* TAB 5: PROTOCOLES CLINIQUES CI */}
        {currentTab === 'protocols' && <ClinicalProtocols />}

        {/* TAB 6: PLAN D'IMPLÉMENTATION 2026 */}
        {currentTab === 'plan' && <ImplementationPlanView />}

        {/* TAB 7: SUPER ADMIN MULTI-CLINIQUES */}
        {currentTab === 'superadmin' && (
          <SuperAdminView
            clinics={clinics}
            onAddClinic={handleAddClinic}
            onUpdateClinic={handleUpdateClinic}
            onSelectClinicForControl={handleSelectClinicForControl}
            fiches={fiches}
          />
        )}

        {/* TAB 8: ÉQUIPE MÉDICALE & GESTION DU PERSONNEL PAR LE DIRECTEUR */}
        {currentTab === 'team' && (
          <ClinicTeamView
            selectedSite={selectedSite}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Printable Sheet Modal */}
      {previewFiche && (
        <PrintableFiche
          fiche={previewFiche}
          onClose={() => setPreviewFiche(null)}
        />
      )}

      {/* Login Modal Overlay (when in guest mode) */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '24px 16px 80px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '490px', margin: 'auto 0' }}>
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 30,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>
            <LoginView
              onLoginSuccess={handleLoginSuccess}
              onContinueAsGuest={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }} className="no-print">
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>CLINIQUE-PLUS CI</strong> • Système Intégré de Consultation & Triage Clinique (Octobre 2026)
          </div>
          <div>
            Conforme aux directives du Ministère de la Santé, de l'Hygiène Publique et de la CMU (Côte d'Ivoire)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
