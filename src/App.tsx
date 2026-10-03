import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPIOverview } from './components/KPIOverview';
import { ConsultationForm } from './components/ConsultationForm';
import { PatientRegistry } from './components/PatientRegistry';
import { PrintableFiche } from './components/PrintableFiche';
import { ClinicalProtocols } from './components/ClinicalProtocols';
import { ImplementationPlanView } from './components/ImplementationPlanView';
import { AppointmentsView } from './components/AppointmentsView';
import type { FicheConsultation, TypePopulation } from './types/clinical';
import { INITIAL_MOCK_FICHES, calculateKPIsFromFiches } from './data/mockPatients';

export const App: React.FC = () => {
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

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'consultation' | 'registry' | 'appointments' | 'protocols' | 'plan'>('dashboard');
  const [selectedSite, setSelectedSite] = useState<string>('Centre de Santé Urbain de Treichville (Abidjan)');
  const [editingFiche, setEditingFiche] = useState<FicheConsultation | null>(null);
  const [previewFiche, setPreviewFiche] = useState<FicheConsultation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Registry filter pre-selection from dashboard clicks
  const [registryFilterTB, setRegistryFilterTB] = useState<boolean>(false);
  const [registryFilterPop, setRegistryFilterPop] = useState<TypePopulation | null>(null);

  useEffect(() => {
    localStorage.setItem('clinique_consultations_ci', JSON.stringify(fiches));
  }, [fiches]);

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

    showToast(`✓ Fiche de consultation enregistrée pour ${savedFiche.admin.nom} ${savedFiche.admin.prenoms} (N° ${savedFiche.admin.numOrdre})`);
    setEditingFiche(null);
    setCurrentTab('registry');
  };

  const handleDeleteFiche = (id: string) => {
    setFiches((prev) => prev.filter((f) => f.id !== id));
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
      agentNom: 'Personnel Soignant de Service',
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
    setFiches((prev) => prev.map((f) => {
      if (f.id === ficheId) {
        return {
          ...f,
          suivi: {
            ...f.suivi,
            ...updates
          }
        };
      }
      return f;
    }));
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
      </main>

      {/* Printable Sheet Modal */}
      {previewFiche && (
        <PrintableFiche
          fiche={previewFiche}
          onClose={() => setPreviewFiche(null)}
        />
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
