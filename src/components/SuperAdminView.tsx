import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  AlertTriangle, 
  Users, 
  Activity, 
  FileSpreadsheet, 
  Sliders, 
  Power, 
  ExternalLink, 
  X, 
  MapPin, 
  Award
} from 'lucide-react';
import type { ClinicStructure, ClinicType, ClinicStatus } from '../types/clinic';
import type { FicheConsultation } from '../types/clinical';

interface SuperAdminViewProps {
  clinics: ClinicStructure[];
  onAddClinic: (newClinic: ClinicStructure) => void;
  onUpdateClinic: (updatedClinic: ClinicStructure) => void;
  onSelectClinicForControl: (clinicNom: string) => void;
  fiches: FicheConsultation[];
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  clinics,
  onAddClinic,
  onUpdateClinic,
  onSelectClinicForControl,
  fiches
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [configClinic, setConfigClinic] = useState<ClinicStructure | null>(null);

  // New Clinic Form State
  const [newNom, setNewNom] = useState('');
  const [newType, setNewType] = useState<ClinicType>('CSU');
  const [newRegion, setNewRegion] = useState('Abidjan 1');
  const [newDistrict, setNewDistrict] = useState('');
  const [newDirecteur, setNewDirecteur] = useState('');
  const [newTelephone, setNewTelephone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAdresse, setNewAdresse] = useState('');

  // Filtering
  const filteredClinics = clinics.filter((c) => {
    const matchesSearch = 
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.districtSanitaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.directeurNom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || c.regionSanitaire === selectedRegion;
    const matchesType = selectedType === 'all' || c.typeStructure === selectedType;
    const matchesStatus = selectedStatus === 'all' || c.statut === selectedStatus;

    return matchesSearch && matchesRegion && matchesType && matchesStatus;
  });

  // Calculate National KPIs
  const totalCliniques = clinics.length;
  const totalCliniquesActives = clinics.filter(c => c.statut === 'actif').length;
  const totalPersonnel = clinics.reduce((acc, c) => acc + c.personnelMedicalCount, 0);
  const totalConsultations = clinics.reduce((acc, c) => acc + c.consultationsCount, 0) + fiches.length;
  const totalCasTB = clinics.reduce((acc, c) => acc + c.casTBDetectesCount, 0) + fiches.filter(f => f.tb.tbPresume).length;

  const handleCreateClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom) return;

    const created: ClinicStructure = {
      id: 'clinic-' + Date.now(),
      nom: newNom,
      codeDistrict: 'DIST-' + Math.floor(100 + Math.random() * 900),
      districtSanitaire: newDistrict || 'District Sanitaire Central',
      regionSanitaire: newRegion,
      typeStructure: newType,
      statut: 'actif',
      directeurNom: newDirecteur || 'Personnel Médical en Chef',
      telephone: newTelephone || '+225 27 00 00 00',
      email: newEmail || 'contact@sante.gouv.ci',
      adresse: newAdresse || 'Côte d\'Ivoire',
      dateCreation: new Date().toISOString().split('T')[0],
      personnelMedicalCount: 8,
      consultationsCount: 0,
      casTBDetectesCount: 0,
      derniereActivite: 'Nouvellement enregistré',
      modulesActifs: {
        triageConstantes: true,
        depistageTB: true,
        populationsCles: true,
        couvertureCMU: true,
        rendezVousRelances: true,
        exportDHIS2: true
      }
    };

    onAddClinic(created);
    setIsAddModalOpen(false);
    // Reset
    setNewNom('');
    setNewDistrict('');
    setNewDirecteur('');
    setNewTelephone('');
    setNewEmail('');
    setNewAdresse('');
  };

  const handleToggleModule = (key: keyof ClinicStructure['modulesActifs']) => {
    if (!configClinic) return;
    const updated: ClinicStructure = {
      ...configClinic,
      modulesActifs: {
        ...configClinic.modulesActifs,
        [key]: !configClinic.modulesActifs[key]
      }
    };
    setConfigClinic(updated);
    onUpdateClinic(updated);
  };

  const handleToggleStatus = (clinic: ClinicStructure) => {
    const nextStatus: ClinicStatus = clinic.statut === 'actif' ? 'maintenance' : clinic.statut === 'maintenance' ? 'suspendu' : 'actif';
    const updated: ClinicStructure = {
      ...clinic,
      statut: nextStatus
    };
    onUpdateClinic(updated);
  };

  const handleExportNationalCSV = () => {
    const headers = ['ID', 'Nom', 'Type', 'Region', 'District', 'Statut', 'Directeur', 'Personnel', 'Consultations', 'Cas_TB'];
    const rows = clinics.map(c => [
      c.id,
      `"${c.nom}"`,
      c.typeStructure,
      `"${c.regionSanitaire}"`,
      `"${c.districtSanitaire}"`,
      c.statut,
      `"${c.directeurNom}"`,
      c.personnelMedicalCount,
      c.consultationsCount,
      c.casTBDetectesCount
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `supervision_nationale_cliniques_ci_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Super Admin Executive Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
        color: '#ffffff',
        padding: '28px 32px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: '#ea580c',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Module Super Administrateur
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              MSHP-CMU • Direction Générale de la Santé
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Supervision & Contrôle Global du Réseau Sanitaire
          </h2>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Tableau de bord de gouvernance centrale pour piloter l'ensemble des centres de santé, surveiller les indicateurs cliniques et configurer les modules en temps réel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportNationalCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '11px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileSpreadsheet size={18} color="#2dd4bf" />
            Exporter Bilan National DHIS2
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '11px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)'
            }}
          >
            <PlusCircle size={18} />
            Ajouter un Établissement
          </button>
        </div>
      </div>

      {/* KPI Cards across the country */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Établissements Raccordés</span>
            <Building2 size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalCliniques}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
            ✓ {totalCliniquesActives} opérationnels en ligne
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Consultations Nationales</span>
            <Activity size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            {totalConsultations.toLocaleString('fr-FR')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Circuit triage standardisé CI
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cas Présumés TB Alertés</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b91c1c' }}>{totalCasTB}</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
            Recherche active 4 signes cardinaux
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Effectif Soignant Total</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalPersonnel}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Médecins, Infirmiers & ASC
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Couverture CMU Réseau</span>
            <Award size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>88.4 %</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
            Tiers payant garanti
          </div>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Rechercher par nom de clinique, district, ville ou médecin chef..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                color: '#334155'
              }}
            >
              <option value="all">Toutes les Régions</option>
              <option value="Abidjan 1">Région Abidjan 1</option>
              <option value="Abidjan 2">Région Abidjan 2</option>
              <option value="Gbêkê">Région Gbêkê (Bouaké)</option>
              <option value="San-Pédro">Région San-Pédro</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                color: '#334155'
              }}
            >
              <option value="all">Tous les Types</option>
              <option value="CSU">Centre de Santé Urbain (CSU)</option>
              <option value="FSU">Formation Sanitaire (FSU)</option>
              <option value="CSR">Centre de Santé Rural (CSR)</option>
              <option value="HG">Hôpital Général (HG)</option>
              <option value="CHU">Centre Hospitalier (CHU)</option>
              <option value="Clinique_Privee">Clinique Privée</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                color: '#334155'
              }}
            >
              <option value="all">Tous les Statuts</option>
              <option value="actif">Opérationnel (Actif)</option>
              <option value="maintenance">En Maintenance</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table of Clinics */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            Répertoire des Établissements Sanitaires Sous Contrôle ({filteredClinics.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Cliquez sur <strong>"Contrôler"</strong> pour basculer instantanément la console sur cette clinique
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Établissement & District</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Directeur / Contact</th>
                <th style={{ padding: '12px 16px' }}>Statut Réseau</th>
                <th style={{ padding: '12px 16px' }}>Activité (Consultations)</th>
                <th style={{ padding: '12px 16px' }}>Modules Activés</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions Super Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.map((c) => {
                const isActif = c.statut === 'actif';
                const isMaintenance = c.statut === 'maintenance';
                return (
                  <tr 
                    key={c.id} 
                    style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    {/* Nom & Localisation */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{c.nom}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginTop: '3px' }}>
                        <MapPin size={13} color="#0d9488" />
                        <span>{c.districtSanitaire} • Région {c.regionSanitaire}</span>
                      </div>
                    </td>

                    {/* Type Structure */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {c.typeStructure.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Directeur & Tel */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{c.directeurNom}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>{c.telephone}</div>
                    </td>

                    {/* Statut Réseau */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        title="Cliquer pour changer le statut"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isActif ? '#dcfce7' : isMaintenance ? '#fef3c7' : '#fee2e2',
                          color: isActif ? '#15803d' : isMaintenance ? '#b45309' : '#b91c1c',
                          border: `1px solid ${isActif ? '#86efac' : isMaintenance ? '#fde68a' : '#fca5a5'}`,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Power size={12} />
                        <span>{isActif ? 'Actif' : isMaintenance ? 'Maintenance' : 'Suspendu'}</span>
                      </button>
                    </td>

                    {/* Activité */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.consultationsCount} consult.</div>
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                        {c.casTBDetectesCount} cas TB alertés
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.personnelMedicalCount} soignants</div>
                    </td>

                    {/* Modules Activés */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {c.modulesActifs.triageConstantes && (
                          <span style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>Triage</span>
                        )}
                        {c.modulesActifs.depistageTB && (
                          <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Dépistage TB</span>
                        )}
                        {c.modulesActifs.populationsCles && (
                          <span style={{ fontSize: '0.68rem', background: '#fdf4ff', color: '#a21caf', padding: '2px 6px', borderRadius: '4px' }}>Pop. Clés</span>
                        )}
                        {c.modulesActifs.couvertureCMU && (
                          <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>CMU</span>
                        )}
                        {c.modulesActifs.rendezVousRelances && (
                          <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>RDV</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setConfigClinic(c)}
                          title="Paramétrer les modules"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          <Sliders size={14} />
                          Modules
                        </button>

                        <button
                          onClick={() => onSelectClinicForControl(c.nom)}
                          style={{
                            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                          }}
                        >
                          <ExternalLink size={14} />
                          Contrôler
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW CLINIC */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#5eead4" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  Enregistrer un Nouvel Établissement Sanitaire
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClinicSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nom Officiel de la Structure *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centre de Santé Urbain de Port-Bouët"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Type d'Établissement *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ClinicType)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    <option value="CSU">Centre de Santé Urbain (CSU)</option>
                    <option value="FSU">Formation Sanitaire Urbaine (FSU)</option>
                    <option value="CSR">Centre de Santé Rural (CSR)</option>
                    <option value="HG">Hôpital Général (HG)</option>
                    <option value="CHU">Centre Hospitalier Universitaire (CHU)</option>
                    <option value="Clinique_Privee">Clinique Privée</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Région Sanitaire *
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    <option value="Abidjan 1">Abidjan 1 (Yopougon, Abobo, Anyama)</option>
                    <option value="Abidjan 2">Abidjan 2 (Treichville, Cocody, Koumassi)</option>
                    <option value="Gbêkê">Gbêkê (Bouaké, Sakassou, Béoumi)</option>
                    <option value="San-Pédro">San-Pédro (Bas-Sassandra)</option>
                    <option value="Poro">Poro (Korhogo)</option>
                    <option value="Haut-Sassandra">Haut-Sassandra (Daloa)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    District Sanitaire
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: District Sanitaire de Port-Bouët"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Directeur / Médecin Chef
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Kouamé Adjoua"
                    value={newDirecteur}
                    onChange={(e) => setNewDirecteur(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Téléphone Ligne Directe
                  </label>
                  <input
                    type="text"
                    placeholder="+225 27 XX XX XX XX"
                    value={newTelephone}
                    onChange={(e) => setNewTelephone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Institutionnel
                  </label>
                  <input
                    type="email"
                    placeholder="direction@sante.gouv.ci"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Adresse / Repère Géographique
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rue des Brasseries, en face de la Mairie"
                  value={newAdresse}
                  onChange={(e) => setNewAdresse(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Valider & Enregistrer dans le Réseau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIG CLINIC MODULES */}
      {configClinic && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  Paramétrage des Modules Sanitaires
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {configClinic.nom}
                </p>
              </div>
              <button 
                onClick={() => setConfigClinic(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>
                En tant que Super Administrateur, activez ou suspendez les fonctionnalités disponibles pour le personnel soignant de cet établissement :
              </p>

              {[
                { key: 'triageConstantes', label: 'Triage & Constantes Physiques', desc: 'Calcul IMC, Z-Score, Tension & Alertes HTA' },
                { key: 'depistageTB', label: 'Recherche Active Tuberculose (TB)', desc: 'Algorithme des 4 signes cardinaux et orientation crachats' },
                { key: 'populationsCles', label: 'Volet Populations Clés & Vulnérables', desc: 'Filtres de suivi TS, UD, HSH et PC' },
                { key: 'couvertureCMU', label: 'Intégration Protection Sociale CMU', desc: 'Vérification des droits et prise en charge' },
                { key: 'rendezVousRelances', label: 'Gestion des Rendez-vous & Relances', desc: 'Suivi des perdus de vue et calendrier de consultations' },
                { key: 'exportDHIS2', label: 'Synchronisation & Export DHIS2', desc: 'Rapports agrégés conformes au standard national MSHP' }
              ].map(({ key, label, desc }) => {
                const isEnabled = configClinic.modulesActifs[key as keyof ClinicStructure['modulesActifs']];
                return (
                  <div 
                    key={key} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isEnabled ? '#f0fdfa' : '#f8fafc',
                      border: `1px solid ${isEnabled ? '#99f6e4' : '#e2e8f0'}`
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleModule(key as keyof ClinicStructure['modulesActifs'])}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: isEnabled ? '#0d9488' : '#cbd5e1',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isEnabled ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setConfigClinic(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Fermer & Enregistrer les Modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
