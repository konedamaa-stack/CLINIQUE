import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Activity, 
  Stethoscope, 
  Navigation, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Printer, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';
import type { 
  FicheConsultation, 
  AdministrativeData, 
  TriageConstantesData, 
  DepistageTBData, 
  AntecedentsData, 
  OrientationData, 
  SuiviData, 
  Sexe, 
  ModeEntree, 
  StatutConjugal, 
  TypePopulation, 
  ProtectionSociale 
} from '../types/clinical';
import { 
  calculateIMC, 
  classifyTensionArterielle, 
  classifyPerimetreBrachial, 
  evaluateZScore, 
  getTrancheAge, 
  calculateAgeFromBirthDate,
  evaluateSuspicionTB,
  checkFicheCompletude
} from '../utils/clinicalCalculators';

interface ConsultationFormProps {
  initialFiche?: FicheConsultation | null;
  existingFiches?: FicheConsultation[];
  onSave: (fiche: FicheConsultation) => void;
  onCancel: () => void;
  onPrintPreview: (fiche: FicheConsultation) => void;
  siteNom: string;
  currentAgentNom?: string;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  initialFiche,
  existingFiches = [],
  onSave,
  onCancel,
  onPrintPreview,
  siteNom,
  currentAgentNom
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [patientCode, setPatientCode] = useState<string>(
    initialFiche?.codePatient || `CI-ABJ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
  );

  // Étape 1: Admin
  const [admin, setAdmin] = useState<AdministrativeData>(initialFiche?.admin || {
    numOrdre: String(Math.floor(1000 + Math.random() * 9000)),
    dateConsultation: new Date().toISOString().split('T')[0],
    nom: '',
    prenoms: '',
    sexe: 'F',
    dateNaissance: '',
    age: 25,
    trancheAge: '25-49 ans',
    telephone: '+225 ',
    residence: '',
    modeEntree: 'venu_lui_meme',
    statutConjugal: 'celibataire',
    typePopulation: 'population_generale',
    typePopulationPrecision: '',
    protectionSociale: 'cmu',
    numeroAssurance: ''
  });

  // Étape 2: Triage
  const [triage, setTriage] = useState<TriageConstantesData>(initialFiche?.triage || {
    poidsKg: undefined,
    tailleCm: undefined,
    temperature: 37.0,
    frequenceRespiratoire: 18,
    tensionSystolique: undefined,
    tensionDiastolique: undefined,
    perimetreBrachialMm: undefined,
    glycemieCapillaireG_L: undefined
  });

  // Étape 3: TB & Antécédents
  const [tb, setTB] = useState<DepistageTBData>(initialFiche?.tb || {
    touxPersistante: false,
    dureeTouxJours: undefined,
    fievreProlongee: false,
    sueursNocturnes: false,
    pertePoids: false,
    tbPresume: false,
    prelevementCrachatEffectue: false,
    examenTBPropose: 'aucun'
  });

  const [antecedents, setAntecedents] = useState<AntecedentsData>(initialFiche?.antecedents || {
    htaConnue: false,
    diabete: false,
    asthme: false,
    vihConnu: false,
    statutVIH: 'inconnu',
    tbAnterieure: false,
    chirurgie: false,
    grossesseEnCours: false,
    allaitementEnCours: false,
    referenceCPN: false
  });

  // Étape 4: Orientation
  const [orientation, setOrientation] = useState<OrientationData>(initialFiche?.orientation || {
    motifsConsultation: '',
    examenPhysiqueResume: '',
    examensDemandes: [],
    decisionClinique: 'prise_en_charge_locale',
    centreReference: '',
    motifReference: '',
    ordonnancePrescription: ''
  });

  // Étape 5: Suivi
  const [suivi, setSuivi] = useState<SuiviData>(initialFiche?.suivi || {
    dateProchainRdv: '',
    contactAccompagnant: '',
    agentCommunautaireAssigne: '',
    statutSuivi: 'en_cours',
    notesSuivi: ''
  });

  // Dynamic calculations when Triage values change
  const imcInfo = triage.poidsKg && triage.tailleCm ? calculateIMC(triage.poidsKg, triage.tailleCm) : null;
  const htaInfo = triage.tensionSystolique && triage.tensionDiastolique 
    ? classifyTensionArterielle(triage.tensionSystolique, triage.tensionDiastolique) 
    : null;
  const pbInfo = triage.perimetreBrachialMm ? classifyPerimetreBrachial(triage.perimetreBrachialMm) : null;
  const zScoreInfo = (admin.age <= 5 && triage.poidsKg && triage.tailleCm) 
    ? evaluateZScore(admin.age, triage.poidsKg, triage.tailleCm) 
    : null;

  // TB Suspicion recalculation
  const tbEval = evaluateSuspicionTB(tb.touxPersistante, tb.fievreProlongee, tb.sueursNocturnes, tb.pertePoids);

  // Synchronize TB presume state
  useEffect(() => {
    setTB(prev => ({
      ...prev,
      tbPresume: tbEval.isPresumed,
      examenTBPropose: tbEval.isPresumed && prev.examenTBPropose === 'aucun' ? 'genexpert' : prev.examenTBPropose
    }));
  }, [tb.touxPersistante, tb.fievreProlongee, tb.sueursNocturnes, tb.pertePoids, tbEval.isPresumed]);

  const handleBirthDateChange = (val: string) => {
    const computedAge = calculateAgeFromBirthDate(val);
    const computedTranche = getTrancheAge(computedAge);
    setAdmin(prev => ({
      ...prev,
      dateNaissance: val,
      age: computedAge,
      trancheAge: computedTranche
    }));
  };

  const handleAgeChange = (ageVal: number) => {
    setAdmin(prev => ({
      ...prev,
      age: ageVal,
      trancheAge: getTrancheAge(ageVal)
    }));
  };

  const toggleExamen = (examen: string) => {
    setOrientation(prev => {
      const exists = prev.examensDemandes.includes(examen);
      return {
        ...prev,
        examensDemandes: exists 
          ? prev.examensDemandes.filter(e => e !== examen)
          : [...prev.examensDemandes, examen]
      };
    });
  };

  // Search state for existing patients
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [loadedPatientBanner, setLoadedPatientBanner] = useState<FicheConsultation | null>(null);

  // Extract unique known patients for quick re-consultation
  const uniqueExistingPatients = useMemo(() => {
    const map = new Map<string, FicheConsultation>();
    for (const f of existingFiches) {
      if (!map.has(f.codePatient)) {
        map.set(f.codePatient, f);
      }
    }
    return Array.from(map.values());
  }, [existingFiches]);

  // Interactive filter for search bar
  const filteredExistingPatients = useMemo(() => {
    const q = patientSearchTerm.trim().toLowerCase();
    if (!q) return [];
    return uniqueExistingPatients.filter(p => {
      const nomComplet = `${p.admin.nom} ${p.admin.prenoms}`.toLowerCase();
      const code = (p.codePatient || '').toLowerCase();
      const tel = (p.admin.telephone || '').toLowerCase();
      const numOrdre = (p.admin.numOrdre || '').toLowerCase();
      const residence = (p.admin.residence || '').toLowerCase();
      return nomComplet.includes(q) || code.includes(q) || tel.includes(q) || numOrdre.includes(q) || residence.includes(q);
    }).slice(0, 8);
  }, [patientSearchTerm, uniqueExistingPatients]);

  // Duplicate Numéro d'ordre detection
  const duplicateNumOrdreFiche = useMemo(() => {
    const trimmed = admin.numOrdre?.trim();
    if (!trimmed) return null;
    return existingFiches.find(f => 
      f.id !== initialFiche?.id && 
      f.admin.numOrdre?.trim() === trimmed
    ) || null;
  }, [admin.numOrdre, existingFiches, initialFiche]);

  const handleSelectExistingPatient = (selected: FicheConsultation) => {
    setAdmin(prev => ({
      ...selected.admin,
      numOrdre: prev.numOrdre,
      dateConsultation: new Date().toISOString().split('T')[0]
    }));
    setAntecedents({ ...selected.antecedents });
    if (selected.suivi) {
      setSuivi(prev => ({
        ...prev,
        contactAccompagnant: selected.suivi.contactAccompagnant || prev.contactAccompagnant,
        agentCommunautaireAssigne: selected.suivi.agentCommunautaireAssigne || prev.agentCommunautaireAssigne
      }));
    }
    setPatientCode(selected.codePatient);
    setLoadedPatientBanner(selected);
    setPatientSearchTerm('');
  };


  const buildCurrentFiche = (): FicheConsultation => {
    const updatedTriage: TriageConstantesData = {
      ...triage,
      imc: imcInfo?.imc,
      classificationIMC: imcInfo?.classification,
      classificationHTA: htaInfo?.classification,
      isFever: triage.temperature ? triage.temperature >= 38.0 : false,
      isTachypnea: triage.frequenceRespiratoire ? triage.frequenceRespiratoire >= 24 : false,
      perimetreBrachialMm: triage.perimetreBrachialMm,
      classificationPB: pbInfo?.classification,
      zScore: zScoreInfo?.zScore,
      classificationZScore: zScoreInfo?.classification
    };

    const tempFiche: FicheConsultation = {
      id: initialFiche?.id || 'fiche-' + Date.now(),
      codePatient: patientCode,
      siteNom: initialFiche?.siteNom || siteNom,
      agentNom: initialFiche?.agentNom || currentAgentNom || 'Personnel Soignant de Service',
      createdAt: initialFiche?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estComplete: false,
      admin,
      triage: updatedTriage,
      tb,
      antecedents,
      orientation,
      suivi
    };

    tempFiche.estComplete = checkFicheCompletude(tempFiche);
    return tempFiche;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateNumOrdreFiche) {
      alert(`⚠️ Numéro d'ordre en doublon !\nLe N° d'ordre "${admin.numOrdre}" est déjà attribué au patient ${duplicateNumOrdreFiche.admin.nom} ${duplicateNumOrdreFiche.admin.prenoms}.\nVeuillez choisir un autre numéro d'ordre avant d'enregistrer.`);
      setActiveStep(1);
      return;
    }
    const finalFiche = buildCurrentFiche();
    onSave(finalFiche);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', borderLeft: '5px solid #0d9488' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">Fiche Intégrée CI</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                N° Ordre : <strong style={{ color: '#0f172a' }}>{admin.numOrdre}</strong>
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Site : <strong style={{ color: '#0f172a' }}>{siteNom}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
              {initialFiche ? `Modifier la Consultation : ${admin.nom} ${admin.prenoms}` : 'Nouvelle Consultation Patient'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
              Circuit standardisé en 5 étapes conformément au plan d'implémentation national.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => onPrintPreview(buildCurrentFiche())}
              className="btn btn-secondary"
            >
              <Printer size={16} />
              Aperçu Format Fiche A4
            </button>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          {[
            { step: 1, label: '1. Accueil & Admin' },
            { step: 2, label: '2. Triage & Constantes' },
            { step: 3, label: '3. TB & Antécédents' },
            { step: 4, label: '4. Orientation & Soins' },
            { step: 5, label: '5. Suivi & RDV' }
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            const isDone = activeStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                id={`step-btn-${item.step}`}
                onClick={() => setActiveStep(item.step)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isCurrent ? '#0f766e' : isDone ? '#f0fdfa' : '#f8fafc',
                  border: isCurrent ? '1.5px solid #0f766e' : isDone ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                  color: isCurrent ? '#ffffff' : isDone ? '#0f766e' : '#64748b',
                  fontWeight: isCurrent ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCurrent ? '#ffffff' : isDone ? '#0d9488' : '#e2e8f0',
                  color: isCurrent ? '#0f766e' : isDone ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {isDone ? <Check size={14} /> : item.step}
                </div>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Body */}
      <form onSubmit={handleSubmit}>
        {/* ================= STEP 1: ACCUEIL & DONNÉES ADMINISTRATIVES ================= */}
        {activeStep === 1 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#0d9488" />
              Étape 1 : Accueil & Données Administratives du Consultant
            </h3>

            {/* Bannière de confirmation patient chargé */}
            {loadedPatientBanner && !initialFiche && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: '10px',
                padding: '10px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                animation: 'fadeIn 0.25s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#059669" />
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46' }}>
                      Dossier patient chargé : {loadedPatientBanner.admin.nom} {loadedPatientBanner.admin.prenoms}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#047857', marginLeft: '8px' }}>
                      ({loadedPatientBanner.codePatient} • {loadedPatientBanner.admin.sexe === 'F' ? 'Femme' : 'Homme'}, {loadedPatientBanner.admin.age} ans • Tél : {loadedPatientBanner.admin.telephone})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoadedPatientBanner(null);
                    setPatientCode(`CI-ABJ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`);
                    setAdmin({
                      numOrdre: admin.numOrdre,
                      dateConsultation: new Date().toISOString().split('T')[0],
                      nom: '',
                      prenoms: '',
                      sexe: 'F',
                      dateNaissance: '',
                      age: 25,
                      trancheAge: '25-49 ans',
                      telephone: '+225 ',
                      residence: '',
                      modeEntree: 'venu_lui_meme',
                      statutConjugal: 'celibataire',
                      typePopulation: 'population_generale',
                      typePopulationPrecision: '',
                      protectionSociale: 'cmu',
                      numeroAssurance: ''
                    });
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    color: '#065f46',
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ✕ Réinitialiser (Nouveau patient)
                </button>
              </div>
            )}

            {/* Barre de Recherche Interactive pour Ancien Patient */}
            {!initialFiche && (
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #ccfbf1',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={18} color="#0d9488" />
                    <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f766e' }}>
                      Rechercher un Ancien Patient
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {uniqueExistingPatients.length} patient(s) enregistré(s)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Recherche par <strong>Nom</strong>, <strong>Prénom</strong>, <strong>Téléphone</strong>, <strong>N° Ordre</strong> ou <strong>Code Patient</strong>
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      id="input-search-ancien-patient"
                      type="text"
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        paddingRight: patientSearchTerm ? '34px' : '12px',
                        borderColor: patientSearchTerm ? '#0d9488' : '#cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.88rem',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      placeholder="Ex : KONE, Bakary, +225 07..., 0095, CI-ABJ..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                    />
                    <Search size={17} color="#0d9488" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    {patientSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setPatientSearchTerm('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Effacer la recherche"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Liste des résultats de recherche instantanée */}
                  {patientSearchTerm.trim().length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1.5px solid #0d9488',
                      borderRadius: '10px',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                      zIndex: 60,
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {filteredExistingPatients.length > 0 ? (
                        <div>
                          <div style={{ padding: '8px 14px', fontSize: '0.74rem', background: '#f0fdfa', color: '#0f766e', fontWeight: 700, borderBottom: '1px solid #ccfbf1' }}>
                            {filteredExistingPatients.length} patient(s) trouvé(s) — Cliquez pour charger automatiquement les données :
                          </div>
                          {filteredExistingPatients.map((p) => (
                            <div
                              key={p.codePatient}
                              onClick={() => handleSelectExistingPatient(p)}
                              style={{
                                padding: '10px 14px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdfa')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  background: p.admin.sexe === 'F' ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.88rem',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}>
                                  {p.admin.nom.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.90rem', color: '#0f172a' }}>
                                    {p.admin.nom} {p.admin.prenoms}
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                    {p.admin.sexe === 'F' ? 'Femme' : 'Homme'} • {p.admin.age} ans • Tél : {p.admin.telephone || 'Non renseigné'}
                                    {p.admin.residence && ` • ${p.admin.residence}`}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', color: '#0f766e', padding: '3px 7px', borderRadius: '4px' }}>
                                  {p.codePatient}
                                </span>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                                  N° Ordre : <strong style={{ color: '#475569' }}>{p.admin.numOrdre}</strong> • {p.admin.dateConsultation}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '18px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          🔍 Aucun ancien patient ne correspond à « <strong>{patientSearchTerm}</strong> ». Vous pouvez saisir un nouveau patient ci-dessous.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label form-label-required">Numéro d'ordre</label>
                  {duplicateNumOrdreFiche && (
                    <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} /> DÉJÀ EXISTANT
                    </span>
                  )}
                </div>
                <input 
                  id="input-num-ordre"
                  type="text" 
                  className="form-input"
                  required
                  value={admin.numOrdre}
                  onChange={(e) => setAdmin({ ...admin, numOrdre: e.target.value })}
                  placeholder="Ex: 0095"
                  style={{
                    borderColor: duplicateNumOrdreFiche ? '#dc2626' : undefined,
                    backgroundColor: duplicateNumOrdreFiche ? '#fef2f2' : undefined,
                    color: duplicateNumOrdreFiche ? '#991b1b' : undefined,
                    fontWeight: duplicateNumOrdreFiche ? 700 : undefined
                  }}
                />
                {duplicateNumOrdreFiche && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: '0.80rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    animation: 'fadeIn 0.2s ease-in'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ lineHeight: 1.4 }}>
                        <strong>⚠️ Alerte Doublon :</strong> Le N° d'ordre <strong>"{admin.numOrdre}"</strong> est déjà attribué au patient <strong>{duplicateNumOrdreFiche.admin.nom} {duplicateNumOrdreFiche.admin.prenoms}</strong> ({duplicateNumOrdreFiche.codePatient} - Consultation du {duplicateNumOrdreFiche.admin.dateConsultation}).
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const existingNums = new Set(existingFiches.map(f => f.admin.numOrdre?.trim()));
                          let candidate = Math.floor(1000 + Math.random() * 9000);
                          while (existingNums.has(String(candidate))) {
                            candidate = Math.floor(1000 + Math.random() * 9000);
                          }
                          setAdmin(prev => ({ ...prev, numOrdre: String(candidate) }));
                        }}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ Générer un N° disponible
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectExistingPatient(duplicateNumOrdreFiche);
                        }}
                        style={{
                          background: '#ffffff',
                          color: '#0f766e',
                          border: '1px solid #0d9488',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        📋 Charger ce patient ({duplicateNumOrdreFiche.admin.nom})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Date de consultation</label>
                <input 
                  id="input-date-consultation"
                  type="date" 
                  className="form-input"
                  required
                  value={admin.dateConsultation}
                  onChange={(e) => setAdmin({ ...admin, dateConsultation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Nom de famille</label>
                <input 
                  id="input-nom"
                  type="text" 
                  className="form-input"
                  required
                  value={admin.nom}
                  onChange={(e) => setAdmin({ ...admin, nom: e.target.value.toUpperCase() })}
                  placeholder="Ex: KONE"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Prénoms</label>
                <input 
                  id="input-prenoms"
                  type="text" 
                  className="form-input"
                  required
                  value={admin.prenoms}
                  onChange={(e) => setAdmin({ ...admin, prenoms: e.target.value })}
                  placeholder="Ex: Bakary"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Sexe</label>
                <select 
                  id="select-sexe"
                  className="form-select"
                  value={admin.sexe}
                  onChange={(e) => setAdmin({ ...admin, sexe: e.target.value as Sexe })}
                >
                  <option value="F">Féminin (F)</option>
                  <option value="M">Masculin (M)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input 
                  id="input-date-naissance"
                  type="date" 
                  className="form-input"
                  value={admin.dateNaissance || ''}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Âge (en années)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    id="input-age"
                    type="number" 
                    min="0"
                    max="120"
                    className="form-input"
                    required
                    value={admin.age}
                    onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
                  />
                  <span className="badge badge-info" style={{ whiteSpace: 'nowrap', padding: '8px 12px' }}>
                    {admin.trancheAge}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone / Contact</label>
                <input 
                  id="input-telephone"
                  type="tel" 
                  className="form-input"
                  value={admin.telephone}
                  onChange={(e) => setAdmin({ ...admin, telephone: e.target.value })}
                  placeholder="+225 07..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Résidence habituelle / Quartier</label>
                <input 
                  id="input-residence"
                  type="text" 
                  className="form-input"
                  value={admin.residence}
                  onChange={(e) => setAdmin({ ...admin, residence: e.target.value })}
                  placeholder="Ex: Treichville Rue 12"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Mode d'entrée</label>
                <select 
                  id="select-mode-entree"
                  className="form-select"
                  value={admin.modeEntree}
                  onChange={(e) => setAdmin({ ...admin, modeEntree: e.target.value as ModeEntree })}
                >
                  <option value="venu_lui_meme">Venu de lui-même</option>
                  <option value="refere_centre_sante">Référé d'un centre de santé</option>
                  <option value="refere_tradipraticien">Référé d'un tradipraticien</option>
                  <option value="refere_communautaire">Référé par un agent communautaire (ASC)</option>
                  <option value="autre">Autre mode d'entrée</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Statut conjugal</label>
                <select 
                  id="select-statut-conjugal"
                  className="form-select"
                  value={admin.statutConjugal}
                  onChange={(e) => setAdmin({ ...admin, statutConjugal: e.target.value as StatutConjugal })}
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="concubinage">Concubinage / Union libre</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf / Veuve</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Type de population</label>
                <select 
                  id="select-type-population"
                  className="form-select"
                  value={admin.typePopulation}
                  onChange={(e) => setAdmin({ ...admin, typePopulation: e.target.value as TypePopulation })}
                  style={{ borderColor: admin.typePopulation !== 'population_generale' ? '#0d9488' : undefined }}
                >
                  <option value="population_generale">Population Générale</option>
                  <option value="ts">TS - Travailleuse du Sexe</option>
                  <option value="ud">UD - Usager de Drogues</option>
                  <option value="hsh">HSH - Homme ayant des rapports avec des Hommes</option>
                  <option value="pc">PC - Personne en Milieu Carcéral</option>
                  <option value="autre_vulnerable">Autre population à haut risque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Protection sociale</label>
                <select 
                  id="select-protection-sociale"
                  className="form-select"
                  value={admin.protectionSociale}
                  onChange={(e) => setAdmin({ ...admin, protectionSociale: e.target.value as ProtectionSociale })}
                >
                  <option value="cmu">CMU (Couverture Maladie Universelle CI)</option>
                  <option value="assurance_privee">Assurance privée</option>
                  <option value="mutuelle">Mutuelle de santé</option>
                  <option value="indigent">Indigent pris en charge</option>
                  <option value="aucune">Aucune couverture sociale</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Numéro CMU / Matricule Assuré</label>
                <input 
                  id="input-numero-assurance"
                  type="text" 
                  className="form-input"
                  value={admin.numeroAssurance || ''}
                  onChange={(e) => setAdmin({ ...admin, numeroAssurance: e.target.value })}
                  placeholder="Ex: CMU-CI-892104-B"
                />
              </div>
            </div>

            {/* Note d'éthique et non-stigmatisation */}
            {admin.typePopulation !== 'population_generale' && (
              <div className="alert-banner alert-info" style={{ marginTop: '16px' }}>
                <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Accueil bienveillant et confidentialité renforcée (Section 6 & 7 du Plan) :</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    Le patient fait partie d'une population clé prioritaire. Veillez à garantir un accueil sans jugement ni stigmatisation, dans le strict respect du secret médical. Proposer le paquet de services adapté (dépistage VIH/IST, PrEP, réduction des risques).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: TRIAGE & CONSTANTES PHYSIQUES ================= */}
        {activeStep === 2 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#0d9488" />
              Étape 2 : Triage & Constantes Physiques (Calculs & Alertes en Temps Réel)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label form-label-required">Poids (kg)</label>
                <input 
                  id="input-poids"
                  type="number" 
                  step="0.1" 
                  min="1" 
                  max="300"
                  className="form-input"
                  required
                  value={triage.poidsKg ?? ''}
                  onChange={(e) => setTriage({ ...triage, poidsKg: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 65.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Taille (cm)</label>
                <input 
                  id="input-taille"
                  type="number" 
                  step="1" 
                  min="30" 
                  max="250"
                  className="form-input"
                  required
                  value={triage.tailleCm ?? ''}
                  onChange={(e) => setTriage({ ...triage, tailleCm: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 172"
                />
              </div>

              {/* Jauge IMC Calculée */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span className="form-label" style={{ marginBottom: '2px' }}>IMC Calculé (kg/m²)</span>
                {imcInfo ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: imcInfo.color }}>
                        {imcInfo.imc}
                      </span>
                      <span className={`badge ${imcInfo.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                        {imcInfo.label}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Saisir poids et taille</span>
                )}
              </div>

              {/* Z-Score pédiatrique pour enfants */}
              {admin.age <= 5 && (
                <div className="form-group" style={{ background: '#f0fdfa', padding: '12px', borderRadius: '10px', border: '1px solid #99f6e4' }}>
                  <span className="form-label" style={{ marginBottom: '2px' }}>Z-Score Pédiatrique (&lt; 5 ans)</span>
                  {zScoreInfo ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: zScoreInfo.color }}>
                          {zScoreInfo.zScore} ET
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: zScoreInfo.color }}>
                          {zScoreInfo.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Calculé automatiquement</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label form-label-required">Température (°C)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    id="input-temperature"
                    type="number" 
                    step="0.1" 
                    min="30" 
                    max="45"
                    className="form-input"
                    required
                    value={triage.temperature ?? ''}
                    onChange={(e) => setTriage({ ...triage, temperature: parseFloat(e.target.value) || undefined })}
                    placeholder="Ex: 37.2"
                  />
                  {triage.temperature && triage.temperature >= 38.0 && (
                    <span className="badge badge-danger">Fièvre (≥38°C)</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fréquence Respiratoire (FR/min)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    id="input-fr"
                    type="number" 
                    min="8" 
                    max="80"
                    className="form-input"
                    value={triage.frequenceRespiratoire ?? ''}
                    onChange={(e) => setTriage({ ...triage, frequenceRespiratoire: parseInt(e.target.value) || undefined })}
                    placeholder="Ex: 18"
                  />
                  {triage.frequenceRespiratoire && triage.frequenceRespiratoire >= 24 && (
                    <span className="badge badge-warning">Tachypnée</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tension Artérielle Systolique (mmHg)</label>
                <input 
                  id="input-ta-systolique"
                  type="number" 
                  min="50" 
                  max="280"
                  className="form-input"
                  value={triage.tensionSystolique ?? ''}
                  onChange={(e) => setTriage({ ...triage, tensionSystolique: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tension Artérielle Diastolique (mmHg)</label>
                <input 
                  id="input-ta-diastolique"
                  type="number" 
                  min="30" 
                  max="160"
                  className="form-input"
                  value={triage.tensionDiastolique ?? ''}
                  onChange={(e) => setTriage({ ...triage, tensionDiastolique: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 80"
                />
              </div>

              {/* Périmètre brachial pour pédiatrie 6-59 mois */}
              <div className="form-group">
                <label className="form-label">Périmètre Brachial (PB en mm - Enfant 6-59m)</label>
                <input 
                  id="input-perimetre-brachial"
                  type="number" 
                  min="60" 
                  max="250"
                  className="form-input"
                  value={triage.perimetreBrachialMm ?? ''}
                  onChange={(e) => setTriage({ ...triage, perimetreBrachialMm: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 130 mm"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Glycémie Capillaire (g/L)</label>
                <input 
                  id="input-glycemie"
                  type="number" 
                  step="0.01" 
                  min="0.2" 
                  max="6"
                  className="form-input"
                  value={triage.glycemieCapillaireG_L ?? ''}
                  onChange={(e) => setTriage({ ...triage, glycemieCapillaireG_L: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 0.95"
                />
              </div>
            </div>

            {/* Diagnostic instantané HTA */}
            {htaInfo && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: htaInfo.isHypertensive ? '#fff7ed' : '#f0fdf4',
                border: `1.5px solid ${htaInfo.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ color: htaInfo.color }}>Classification Tensionnelle : {htaInfo.label}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {htaInfo.isUrgent 
                      ? '⚠ Urgence hypertensive : prise en charge immédiate ou transfert médicalisé requis !'
                      : htaInfo.isHypertensive 
                      ? 'Confirmer par 2 mesures supplémentaires au repos. Conseils hygiéno-diététiques et suivi.'
                      : 'Valeur tensionnelle satisfaisante.'}
                  </div>
                </div>
                <span className={`badge ${htaInfo.isHypertensive ? 'badge-warning' : 'badge-success'}`}>
                  {triage.tensionSystolique}/{triage.tensionDiastolique} mmHg
                </span>
              </div>
            )}

            {/* Diagnostic instantané PB */}
            {pbInfo && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: pbInfo.classification === 'mas' ? '#fef2f2' : pbInfo.classification === 'mam' ? '#fffbeb' : '#f0fdf4',
                border: `1.5px solid ${pbInfo.color}`
              }}>
                <strong style={{ color: pbInfo.color }}>Évaluation Périmètre Brachial : {pbInfo.label}</strong>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                  Conduite à tenir : {pbInfo.action}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: DÉPISTAGE TB & ANTÉCÉDENTS ================= */}
        {activeStep === 3 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} color="#0d9488" />
              Étape 3 : Recherche Active de la Tuberculose & Antécédents
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Algorithme national de dépistage systématique de la TB chez tout consultant (Section 2 & 6).
            </p>

            {/* TB 4 Signes Cardinaux Box */}
            <div style={{
              background: '#f8fafc',
              border: '2px solid #cbd5e1',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                Recherche Active des 4 Signes Cardinaux de la Tuberculose :
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <label className="form-checkbox-label">
                  <input 
                    id="checkbox-tb-toux"
                    type="checkbox"
                    className="form-checkbox"
                    checked={tb.touxPersistante}
                    onChange={(e) => setTB({ ...tb, touxPersistante: e.target.checked })}
                  />
                  <span>
                    <strong>1. Toux persistante</strong> (≥ 2 semaines ou toux présente)
                  </span>
                </label>

                <label className="form-checkbox-label">
                  <input 
                    id="checkbox-tb-fievre"
                    type="checkbox"
                    className="form-checkbox"
                    checked={tb.fievreProlongee}
                    onChange={(e) => setTB({ ...tb, fievreProlongee: e.target.checked })}
                  />
                  <span>
                    <strong>2. Fièvre prolongée</strong> (habituellement vespérale)
                  </span>
                </label>

                <label className="form-checkbox-label">
                  <input 
                    id="checkbox-tb-sueurs"
                    type="checkbox"
                    className="form-checkbox"
                    checked={tb.sueursNocturnes}
                    onChange={(e) => setTB({ ...tb, sueursNocturnes: e.target.checked })}
                  />
                  <span>
                    <strong>3. Sueurs nocturnes</strong> abondantes
                  </span>
                </label>

                <label className="form-checkbox-label">
                  <input 
                    id="checkbox-tb-poids"
                    type="checkbox"
                    className="form-checkbox"
                    checked={tb.pertePoids}
                    onChange={(e) => setTB({ ...tb, pertePoids: e.target.checked })}
                  />
                  <span>
                    <strong>4. Perte de poids</strong> / stagnation chez l'enfant
                  </span>
                </label>
              </div>

              {tb.touxPersistante && (
                <div style={{ marginTop: '14px', maxWidth: '300px' }}>
                  <label className="form-label">Durée de la toux (en jours)</label>
                  <input 
                    id="input-duree-toux"
                    type="number"
                    min="1"
                    className="form-input"
                    value={tb.dureeTouxJours ?? ''}
                    onChange={(e) => setTB({ ...tb, dureeTouxJours: parseInt(e.target.value) || undefined })}
                    placeholder="Ex: 21"
                  />
                </div>
              )}
            </div>

            {/* Instant TB Alert Banner */}
            {tbEval.isPresumed ? (
              <div className="alert-banner alert-danger pulse-tb-alert" style={{ marginBottom: '20px' }}>
                <AlertTriangle size={28} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    ALERTE CLINIQUE : CAS PRÉSUMÉ DE TUBERCULOSE ({tbEval.scoreSignes}/4 signes)
                  </div>
                  <p style={{ margin: '4px 0 10px 0', fontSize: '0.9rem' }}>
                    {tbEval.recommendation}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label className="form-checkbox-label" style={{ color: '#991b1b', fontWeight: 600 }}>
                      <input 
                        id="checkbox-prelevement-crachat"
                        type="checkbox"
                        className="form-checkbox"
                        checked={tb.prelevementCrachatEffectue}
                        onChange={(e) => setTB({ ...tb, prelevementCrachatEffectue: e.target.checked })}
                      />
                      Prélèvement de crachat (crachat du matin) effectué ce jour
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Examen TB prescrit :</span>
                      <select 
                        id="select-examen-tb"
                        className="form-select"
                        value={tb.examenTBPropose}
                        onChange={(e) => setTB({ ...tb, examenTBPropose: e.target.value as any })}
                        style={{ width: 'auto', padding: '6px 10px' }}
                      >
                        <option value="genexpert">GeneXpert MTB/RIF (Recommandé PNT)</option>
                        <option value="microscopie">Bacilloscopie (Frottis crachat)</option>
                        <option value="radio_thorax">Radiographie thoracique</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert-banner alert-success" style={{ marginBottom: '20px' }}>
                <Check size={22} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Dépistage Tuberculose Négatif ce jour (0/4 signe) :</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>
                    Aucun signe cardinal détecté. Maintenir la sensibilisation et renouveler la recherche active lors des consultations ultérieures.
                  </p>
                </div>
              </div>
            )}

            {/* Antécédents Médicaux, Chirurgicaux & Gynéco-obstétrique */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              Antécédents du Patient
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.htaConnue}
                  onChange={(e) => setAntecedents({ ...antecedents, htaConnue: e.target.checked })}
                />
                <span>Hypertension artérielle (HTA)</span>
              </label>

              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.diabete}
                  onChange={(e) => setAntecedents({ ...antecedents, diabete: e.target.checked })}
                />
                <span>Diabète</span>
              </label>

              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.asthme}
                  onChange={(e) => setAntecedents({ ...antecedents, asthme: e.target.checked })}
                />
                <span>Asthme / BPCO</span>
              </label>

              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.vihConnu}
                  onChange={(e) => setAntecedents({ ...antecedents, vihConnu: e.target.checked })}
                />
                <span>VIH connu</span>
              </label>

              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.tbAnterieure}
                  onChange={(e) => setAntecedents({ ...antecedents, tbAnterieure: e.target.checked })}
                />
                <span>Épisode antérieur de TB</span>
              </label>

              <label className="form-checkbox-label">
                <input 
                  type="checkbox"
                  className="form-checkbox"
                  checked={antecedents.chirurgie}
                  onChange={(e) => setAntecedents({ ...antecedents, chirurgie: e.target.checked })}
                />
                <span>Antécédents chirurgicaux</span>
              </label>
            </div>

            {antecedents.chirurgie && (
              <div className="form-group">
                <label className="form-label">Préciser la chirurgie antérieure</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={antecedents.precisionChirurgie || ''}
                  onChange={(e) => setAntecedents({ ...antecedents, precisionChirurgie: e.target.value })}
                  placeholder="Ex: Césarienne en 2021, Hernie en 2018..."
                />
              </div>
            )}

            {/* Rubrique Gynéco-obstétrique (Femmes) */}
            {admin.sexe === 'F' && admin.age >= 12 && (
              <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '10px', border: '1px solid #fbcfe8', marginTop: '16px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9d174d', marginBottom: '12px' }}>
                  Suivi Gynéco-Obstétrique (Section 6 - Santé Maternelle)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date des Dernières Règles (DDR)</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={antecedents.ddr || ''}
                      onChange={(e) => setAntecedents({ ...antecedents, ddr: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Gestité (G) / Parité (P)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="G"
                        value={antecedents.gestite ?? ''}
                        onChange={(e) => setAntecedents({ ...antecedents, gestite: parseInt(e.target.value) || 0 })}
                      />
                      <input 
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="P"
                        value={antecedents.parite ?? ''}
                        onChange={(e) => setAntecedents({ ...antecedents, parite: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    <label className="form-checkbox-label">
                      <input 
                        type="checkbox"
                        className="form-checkbox"
                        checked={antecedents.grossesseEnCours}
                        onChange={(e) => setAntecedents({ ...antecedents, grossesseEnCours: e.target.checked })}
                      />
                      <span>Grossesse en cours</span>
                    </label>

                    <label className="form-checkbox-label">
                      <input 
                        type="checkbox"
                        className="form-checkbox"
                        checked={antecedents.allaitementEnCours}
                        onChange={(e) => setAntecedents({ ...antecedents, allaitementEnCours: e.target.checked })}
                      />
                      <span>Allaitement maternel</span>
                    </label>

                    <label className="form-checkbox-label">
                      <input 
                        type="checkbox"
                        className="form-checkbox"
                        checked={antecedents.referenceCPN}
                        onChange={(e) => setAntecedents({ ...antecedents, referenceCPN: e.target.checked })}
                      />
                      <span>Orientation vers la CPN (Consultation Prénatale)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: ORIENTATION, EXAMENS & PRISE EN CHARGE ================= */}
        {activeStep === 4 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={20} color="#0d9488" />
              Étape 4 : Orientation, Examens Complémentaires & Prise en Charge
            </h3>

            <div className="form-group">
              <label className="form-label form-label-required">Motifs de consultation & Plaintes principales</label>
              <textarea 
                id="textarea-motifs"
                rows={3}
                className="form-textarea"
                required
                value={orientation.motifsConsultation}
                onChange={(e) => setOrientation({ ...orientation, motifsConsultation: e.target.value })}
                placeholder="Ex: Toux fébrile depuis 2 semaines, céphalées occipitales..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Résumé de l'examen physique</label>
              <textarea 
                id="textarea-examen-physique"
                rows={2}
                className="form-textarea"
                value={orientation.examenPhysiqueResume || ''}
                onChange={(e) => setOrientation({ ...orientation, examenPhysiqueResume: e.target.value })}
                placeholder="Auscultation cardio-pulmonaire, palpation abdominale, conjonctives..."
              />
            </div>

            {/* Examens demandés */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Examens complémentaires prescrits / réalisés</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  'GeneXpert MTB/RIF',
                  'Bacilloscopie des crachats',
                  'TDR Paludisme',
                  'Dépistage Rapide VIH',
                  'Glycémie capillaire / à jeun',
                  'Bandelette Urinaire (Protéines/Sucre)',
                  'Numération Formule Sanguine (NFS)',
                  'Sérologie Hépatite B (Ag HBs)',
                  'Sérologie Syphilis (VDRL/TPHA)'
                ].map((examen) => {
                  const isChecked = orientation.examensDemandes.includes(examen);
                  return (
                    <label 
                      key={examen} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isChecked ? '#f0fdfa' : '#ffffff',
                        border: isChecked ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExamen(examen)}
                        className="form-checkbox"
                      />
                      <span>{examen}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Décision clinique */}
            <div className="form-group">
              <label className="form-label form-label-required">Décision clinique & Orientation</label>
              <select 
                id="select-decision-clinique"
                className="form-select"
                value={orientation.decisionClinique}
                onChange={(e) => setOrientation({ ...orientation, decisionClinique: e.target.value as any })}
              >
                <option value="prise_en_charge_locale">Prise en charge sur place (Centre de santé)</option>
                <option value="mise_sous_traitement_tb">Mise sous traitement antituberculeux (CAT TB)</option>
                <option value="tpi_preventif">Traitement Préventif à l'Isoniazide (TPI)</option>
                <option value="reference_hopital">Référence vers centre spécialisé / Hôpital de référence</option>
                <option value="autre">Autre orientation</option>
              </select>
            </div>

            {/* Si référence vers hôpital */}
            {orientation.decisionClinique === 'reference_hopital' && (
              <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '10px', border: '1.5px solid #fdba74', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9a3412', marginBottom: '12px' }}>
                  Détails de la Référence Médicale
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label form-label-required">Centre ou Service de Référence</label>
                    <input 
                      type="text"
                      className="form-input"
                      required
                      value={orientation.centreReference || ''}
                      onChange={(e) => setOrientation({ ...orientation, centreReference: e.target.value })}
                      placeholder="Ex: CHU de Treichville / Centre Antituberculeux (CAT)"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label form-label-required">Motif de la Référence</label>
                    <input 
                      type="text"
                      className="form-input"
                      required
                      value={orientation.motifReference || ''}
                      onChange={(e) => setOrientation({ ...orientation, motifReference: e.target.value })}
                      placeholder="Ex: HTA maligne, Suspicion TB avec détresse, MAS pédiatrique..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Ordonnance / Prescription */}
            <div className="form-group">
              <label className="form-label">Prescription médicale & Conseils</label>
              <textarea 
                id="textarea-ordonnance"
                rows={3}
                className="form-textarea"
                value={orientation.ordonnancePrescription || ''}
                onChange={(e) => setOrientation({ ...orientation, ordonnancePrescription: e.target.value })}
                placeholder="Traitements prescrits, posologie, conseils hygiéno-diététiques..."
              />
            </div>
          </div>
        )}

        {/* ================= STEP 5: SUIVI, RENDEZ-VOUS & CLÔTURE ================= */}
        {activeStep === 5 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#0d9488" />
              Étape 5 : Suivi, Continuité des Soins & Relance des Perdus de Vue
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date du prochain rendez-vous</label>
                <input 
                  id="input-prochain-rdv"
                  type="date"
                  className="form-input"
                  value={suivi.dateProchainRdv || ''}
                  onChange={(e) => setSuivi({ ...suivi, dateProchainRdv: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact accompagnant / Personne de confiance</label>
                <input 
                  id="input-contact-accompagnant"
                  type="text"
                  className="form-input"
                  value={suivi.contactAccompagnant || ''}
                  onChange={(e) => setSuivi({ ...suivi, contactAccompagnant: e.target.value })}
                  placeholder="Ex: +225 07... (Conjoint, parent, pair-éducateur)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Agent de Santé Communautaire (ASC) assigné</label>
                <input 
                  id="input-asc"
                  type="text"
                  className="form-input"
                  value={suivi.agentCommunautaireAssigne || ''}
                  onChange={(e) => setSuivi({ ...suivi, agentCommunautaireAssigne: e.target.value })}
                  placeholder="Ex: M. Bamba (Médiateur TB / ASC)"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Statut du suivi</label>
                <select 
                  id="select-statut-suivi"
                  className="form-select"
                  value={suivi.statutSuivi}
                  onChange={(e) => setSuivi({ ...suivi, statutSuivi: e.target.value as any })}
                >
                  <option value="en_cours">En cours (Suivi régulier programmé)</option>
                  <option value="venu_rdv">Venu au rendez-vous</option>
                  <option value="refere_confirme">Référé confirmé (Contre-référence reçue)</option>
                  <option value="perdu_de_vue">Perdu de vue (Relance active nécessaire)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes d'observation & Synthèse du dossier</label>
              <textarea 
                id="textarea-notes-suivi"
                rows={3}
                className="form-textarea"
                value={suivi.notesSuivi || ''}
                onChange={(e) => setSuivi({ ...suivi, notesSuivi: e.target.value })}
                placeholder="Renseigner tout élément utile à la continuité de la prise en charge..."
              />
            </div>

            {/* Validation Box & Summary */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '18px',
              marginTop: '16px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Récapitulatif de la Consultation :
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
                <div>Patient : <strong>{admin.nom} {admin.prenoms}</strong> ({admin.sexe}, {admin.age} ans)</div>
                <div>Population : <strong>{admin.typePopulation}</strong></div>
                <div>Protection : <strong>{admin.protectionSociale}</strong></div>
                <div>IMC : <strong>{imcInfo ? `${imcInfo.imc} (${imcInfo.label})` : 'Non calculé'}</strong></div>
                <div>TA : <strong>{triage.tensionSystolique ? `${triage.tensionSystolique}/${triage.tensionDiastolique} mmHg` : 'Non mesurée'}</strong></div>
                <div>Dépistage TB : <strong>{tb.tbPresume ? '⚠ CAS PRÉSUMÉ' : 'Négatif ce jour'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Form Navigation & Submit buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '24px',
          padding: '16px 20px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            {activeStep > 1 && (
              <button 
                type="button" 
                onClick={() => setActiveStep(activeStep - 1)}
                className="btn btn-secondary"
              >
                <ChevronLeft size={18} />
                Étape Précédente
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Annuler
            </button>

            {activeStep < 5 ? (
              <button 
                type="button" 
                id="btn-next-step"
                onClick={() => setActiveStep(activeStep + 1)}
                className="btn btn-primary"
              >
                Étape Suivante
                <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="submit" 
                id="btn-save-fiche"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)' }}
              >
                <Save size={18} />
                Enregistrer la Fiche Complète
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
