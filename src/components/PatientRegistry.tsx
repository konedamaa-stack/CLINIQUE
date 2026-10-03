import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  Download, 
  AlertTriangle, 
  Plus,
  PlusCircle,
  History,
  X,
  Calendar
} from 'lucide-react';
import type { FicheConsultation, TypePopulation } from '../types/clinical';

interface PatientRegistryProps {
  fiches: FicheConsultation[];
  onSelectFiche: (fiche: FicheConsultation) => void;
  onEditFiche: (fiche: FicheConsultation) => void;
  onDeleteFiche: (id: string) => void;
  onPrintFiche: (fiche: FicheConsultation) => void;
  onNewConsultation: () => void;
  onNewVisitForPatient: (fiche: FicheConsultation) => void;
  initialFilterTB?: boolean;
  initialFilterPop?: TypePopulation | null;
}

export const PatientRegistry: React.FC<PatientRegistryProps> = ({
  fiches,
  onEditFiche,
  onDeleteFiche,
  onPrintFiche,
  onNewConsultation,
  onNewVisitForPatient,
  initialFilterTB = false,
  initialFilterPop = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPopulation, setFilterPopulation] = useState<string>(initialFilterPop || 'all');
  const [filterTB, setFilterTB] = useState<string>(initialFilterTB ? 'presumed' : 'all');
  const [filterTrancheAge, setFilterTrancheAge] = useState<string>('all');
  const [filterCompletude, setFilterCompletude] = useState<string>('all');
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<string | null>(null);

  // Compute number of consultations per patient code
  const countByPatient = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of fiches) {
      counts[f.codePatient] = (counts[f.codePatient] || 0) + 1;
    }
    return counts;
  }, [fiches]);

  // History list for the selected patient
  const patientHistoryFiches = useMemo(() => {
    if (!selectedPatientForHistory) return [];
    return fiches.filter(f => f.codePatient === selectedPatientForHistory)
      .sort((a, b) => new Date(b.admin.dateConsultation).getTime() - new Date(a.admin.dateConsultation).getTime());
  }, [fiches, selectedPatientForHistory]);

  const filteredFiches = useMemo(() => {
    return fiches.filter((f) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = `${f.admin.nom} ${f.admin.prenoms}`.toLowerCase().includes(term);
        const matchesCode = f.codePatient.toLowerCase().includes(term);
        const matchesNum = f.admin.numOrdre.toLowerCase().includes(term);
        const matchesTel = f.admin.telephone.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesNum && !matchesTel) return false;
      }

      // Filter population
      if (filterPopulation !== 'all' && f.admin.typePopulation !== filterPopulation) {
        return false;
      }

      // Filter TB
      if (filterTB === 'presumed' && !f.tb.tbPresume) return false;
      if (filterTB === 'negative' && f.tb.tbPresume) return false;

      // Filter Age
      if (filterTrancheAge !== 'all' && f.admin.trancheAge !== filterTrancheAge) {
        return false;
      }

      // Filter Complétude
      if (filterCompletude === 'complete' && !f.estComplete) return false;
      if (filterCompletude === 'incomplete' && f.estComplete) return false;

      return true;
    });
  }, [fiches, searchTerm, filterPopulation, filterTB, filterTrancheAge, filterCompletude]);

  // Export to CSV compatible with DHIS2
  const exportToCSV = () => {
    const headers = [
      'NumOrdre',
      'CodePatient',
      'DateConsultation',
      'Nom',
      'Prenoms',
      'Sexe',
      'Age',
      'TrancheAge',
      'TypePopulation',
      'ProtectionSociale',
      'PoidsKg',
      'TailleCm',
      'IMC',
      'TASystolique',
      'TADiastolique',
      'ClassificationHTA',
      'TBPresume',
      'ExamenTBPrescrit',
      'DecisionClinique',
      'StatutSuivi'
    ];

    const rows = filteredFiches.map(f => [
      `"${f.admin.numOrdre}"`,
      `"${f.codePatient}"`,
      `"${f.admin.dateConsultation}"`,
      `"${f.admin.nom}"`,
      `"${f.admin.prenoms}"`,
      `"${f.admin.sexe}"`,
      f.admin.age,
      `"${f.admin.trancheAge}"`,
      `"${f.admin.typePopulation}"`,
      `"${f.admin.protectionSociale}"`,
      f.triage.poidsKg ?? '',
      f.triage.tailleCm ?? '',
      f.triage.imc ?? '',
      f.triage.tensionSystolique ?? '',
      f.triage.tensionDiastolique ?? '',
      `"${f.triage.classificationHTA ?? ''}"`,
      f.tb.tbPresume ? 'OUI' : 'NON',
      `"${f.tb.examenTBPropose ?? ''}"`,
      `"${f.orientation.decisionClinique}"`,
      `"${f.suivi.statutSuivi}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registre_consultations_clinique_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Registre Numérique des Consultations
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Base de données des fiches intégrées ({filteredFiches.length} affichée(s) sur {fiches.length} consultations)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={exportToCSV}
              className="btn btn-secondary"
              title="Exporter vers format CSV pour intégration DHIS2"
            >
              <Download size={16} />
              Exporter CSV (DHIS2)
            </button>

            <button 
              onClick={onNewConsultation}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Nouvelle Consultation
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Rechercher par nom, code, n°..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Population */}
          <div>
            <select 
              className="form-select"
              value={filterPopulation}
              onChange={(e) => setFilterPopulation(e.target.value)}
            >
              <option value="all">Toutes les populations</option>
              <option value="population_generale">Population Générale</option>
              <option value="ts">TS (Travailleuses du sexe)</option>
              <option value="ud">UD (Usagers de drogues)</option>
              <option value="hsh">HSH</option>
              <option value="pc">PC (Milieu Carcéral)</option>
              <option value="autre_vulnerable">Autres Vulnérables</option>
            </select>
          </div>

          {/* Filter TB */}
          <div>
            <select 
              className="form-select"
              value={filterTB}
              onChange={(e) => setFilterTB(e.target.value)}
            >
              <option value="all">Statut Tuberculose : Tous</option>
              <option value="presumed">Cas Présumés TB uniquement</option>
              <option value="negative">Dépistage TB Négatif</option>
            </select>
          </div>

          {/* Filter Tranche Age */}
          <div>
            <select 
              className="form-select"
              value={filterTrancheAge}
              onChange={(e) => setFilterTrancheAge(e.target.value)}
            >
              <option value="all">Toutes les tranches d'âge</option>
              <option value="0-4 ans">0-4 ans (Pédiatrie)</option>
              <option value="5-14 ans">5-14 ans</option>
              <option value="15-24 ans">15-24 ans</option>
              <option value="25-49 ans">25-49 ans</option>
              <option value="50 ans et plus">50 ans et plus</option>
            </select>
          </div>

          {/* Filter Complétude */}
          <div>
            <select 
              className="form-select"
              value={filterCompletude}
              onChange={(e) => setFilterCompletude(e.target.value)}
            >
              <option value="all">Complétude : Toutes</option>
              <option value="complete">Fiches Complètes (≥ 90%)</option>
              <option value="incomplete">Fiches Incomplètes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>N° Ordre / Code</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Patient & Dossier</th>
                <th style={{ padding: '12px 16px' }}>Population</th>
                <th style={{ padding: '12px 16px' }}>Constantes (IMC / TA)</th>
                <th style={{ padding: '12px 16px' }}>Dépistage TB</th>
                <th style={{ padding: '12px 16px' }}>Motifs & Décision</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiches.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    Aucun dossier patient ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredFiches.map((f) => {
                  const visitCount = countByPatient[f.codePatient] || 1;
                  return (
                    <tr 
                      key={f.id}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* N° Ordre & Code */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>
                          N° {f.admin.numOrdre}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {f.codePatient}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {f.admin.dateConsultation}
                      </td>

                      {/* Patient */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {f.admin.nom} {f.admin.prenoms}
                          </span>
                          {visitCount > 1 && (
                            <button
                              onClick={() => setSelectedPatientForHistory(f.codePatient)}
                              className="badge badge-info"
                              style={{ cursor: 'pointer', border: 'none', fontSize: '0.7rem' }}
                              title="Voir l'historique des consultations de ce patient"
                            >
                              <History size={10} />
                              {visitCount} visites
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {f.admin.sexe} • {f.admin.age} ans ({f.admin.trancheAge})
                        </div>
                      </td>

                      {/* Population */}
                      <td style={{ padding: '12px 16px' }}>
                        {f.admin.typePopulation === 'population_generale' ? (
                          <span className="badge badge-neutral">Générale</span>
                        ) : f.admin.typePopulation === 'ts' ? (
                          <span className="badge badge-purple">TS</span>
                        ) : f.admin.typePopulation === 'ud' ? (
                          <span className="badge badge-warning-dark">UD</span>
                        ) : f.admin.typePopulation === 'hsh' ? (
                          <span className="badge badge-info">HSH</span>
                        ) : f.admin.typePopulation === 'pc' ? (
                          <span className="badge badge-warning">PC</span>
                        ) : (
                          <span className="badge badge-success">Vulnérable</span>
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                          {f.admin.protectionSociale.toUpperCase()}
                        </div>
                      </td>

                      {/* Constantes */}
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <strong>IMC : </strong> 
                          {f.triage.imc ? (
                            <span style={{ fontWeight: 700, color: f.triage.imc < 18.5 ? '#ea580c' : f.triage.imc >= 30 ? '#9333ea' : '#16a34a' }}>
                              {f.triage.imc}
                            </span>
                          ) : '-'}
                        </div>
                        <div style={{ fontSize: '0.78rem' }}>
                          <strong>TA : </strong> 
                          {f.triage.tensionSystolique ? `${f.triage.tensionSystolique}/${f.triage.tensionDiastolique}` : '-'}
                        </div>
                      </td>

                      {/* Dépistage TB */}
                      <td style={{ padding: '12px 16px' }}>
                        {f.tb.tbPresume ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} />
                            Cas Présumé TB
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            ✓ Négatif
                          </span>
                        )}
                        {f.tb.examenTBPropose !== 'aucun' && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            {f.tb.examenTBPropose.toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Motifs & Décision */}
                      <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {f.orientation.motifsConsultation || 'Consultation standard'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: f.orientation.decisionClinique === 'reference_hopital' ? '#ea580c' : '#0f766e', fontWeight: 600 }}>
                          {f.orientation.decisionClinique === 'reference_hopital' 
                            ? 'Référé Hôpital' 
                            : f.orientation.decisionClinique === 'mise_sous_traitement_tb'
                            ? 'Traitement TB'
                            : 'Prise en charge locale'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Bouton clé : Nouvelle consultation pour ce même patient */}
                          <button
                            onClick={() => onNewVisitForPatient(f)}
                            className="btn btn-primary btn-sm"
                            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', padding: '5px 10px' }}
                            title="Ajouter une nouvelle consultation pour ce patient (autre maladie / nouvelle visite)"
                          >
                            <PlusCircle size={14} />
                            <span>Nouvelle Visite</span>
                          </button>

                          {/* Bouton Historique */}
                          <button
                            onClick={() => setSelectedPatientForHistory(f.codePatient)}
                            className="btn btn-secondary btn-sm"
                            title="Consulter l'historique complet de ce patient"
                          >
                            <History size={14} />
                          </button>

                          <button
                            onClick={() => onPrintFiche(f)}
                            className="btn btn-secondary btn-sm"
                            title="Aperçu & Imprimer Format Officiel A4"
                          >
                            <Printer size={14} />
                          </button>

                          <button
                            onClick={() => onEditFiche(f)}
                            className="btn btn-outline-primary btn-sm"
                            title="Modifier cette consultation"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer cette consultation du ${f.admin.dateConsultation} pour ${f.admin.nom} ${f.admin.prenoms} ?`)) {
                                onDeleteFiche(f.id);
                              }
                            }}
                            className="btn btn-danger btn-sm"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Historique Médical du Patient */}
      {selectedPatientForHistory && patientHistoryFiches.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="#2dd4bf" />
                  Dossier Médical : {patientHistoryFiches[0].admin.nom} {patientHistoryFiches[0].admin.prenoms}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Code Unique : <strong>{selectedPatientForHistory}</strong> • {patientHistoryFiches[0].admin.sexe} • {patientHistoryFiches[0].admin.age} ans • CMU : {patientHistoryFiches[0].admin.numeroAssurance || 'Non renseigné'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const latest = patientHistoryFiches[0];
                    setSelectedPatientForHistory(null);
                    onNewVisitForPatient(latest);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0d9488' }}
                >
                  <PlusCircle size={15} />
                  Nouvelle Consultation
                </button>

                <button
                  onClick={() => setSelectedPatientForHistory(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ background: 'transparent', color: '#ffffff', borderColor: '#475569' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Timeline of Visits */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {patientHistoryFiches.length} consultation(s) enregistrée(s) pour ce patient :
              </div>

              {patientHistoryFiches.map((consult, index) => (
                <div 
                  key={consult.id}
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    background: '#f8fafc',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        Visite #{patientHistoryFiches.length - index}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={15} color="#0d9488" />
                        {consult.admin.dateConsultation}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        (N° Ordre : {consult.admin.numOrdre})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedPatientForHistory(null);
                          onPrintFiche(consult);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Printer size={13} />
                        Imprimer Fiche
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatientForHistory(null);
                          onEditFiche(consult);
                        }}
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Edit3 size={13} />
                        Modifier
                      </button>
                    </div>
                  </div>

                  {/* Details of that consultation */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem', marginTop: '10px' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>MOTIF / MALADIE :</strong>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{consult.orientation.motifsConsultation || 'Non renseigné'}</span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>CONSTANTES DU JOUR :</strong>
                      <span>Poids : {consult.triage.poidsKg ?? '-'} kg | IMC : {consult.triage.imc ?? '-'} | TA : {consult.triage.tensionSystolique ? `${consult.triage.tensionSystolique}/${consult.triage.tensionDiastolique}` : '-'}</span>
                    </div>

                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>DÉPISTAGE TUBERCULOSE :</strong>
                      {consult.tb.tbPresume ? (
                        <span className="badge badge-danger">Cas Présumé TB</span>
                      ) : (
                        <span className="badge badge-success">✓ Négatif</span>
                      )}
                    </div>

                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>PRISE EN CHARGE / DÉCISION :</strong>
                      <span>{consult.orientation.decisionClinique.replace(/_/g, ' ')}</span>
                      {consult.orientation.ordonnancePrescription && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Rx : {consult.orientation.ordonnancePrescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
