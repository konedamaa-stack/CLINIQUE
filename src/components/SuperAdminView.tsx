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
  Award,
  Globe,
  CheckCircle2,
  Copy,
  UserPlus,
  ShieldCheck,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  KeyRound
} from 'lucide-react';
import type { ClinicStructure, ClinicType, ClinicStatus } from '../types/clinic';
import type { FicheConsultation } from '../types/clinical';
import type { AuthUser, UserRole } from '../types/auth';
import { 
  getAllStaffAccounts, 
  saveSuperAdminStaffAccount, 
  deleteSuperAdminStaffAccount 
} from '../lib/supabase';

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
  const [domainModalClinic, setDomainModalClinic] = useState<ClinicStructure | null>(null);
  const [editDirectorClinic, setEditDirectorClinic] = useState<ClinicStructure | null>(null);
  const [editDirectorNom, setEditDirectorNom] = useState('');
  const [editDirectorLogin, setEditDirectorLogin] = useState('');
  const [editDirectorPassword, setEditDirectorPassword] = useState('');
  const [showEditDirectorPass, setShowEditDirectorPass] = useState(false);

  // Domain edit state inside modal
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editCustomDomain, setEditCustomDomain] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Staff Accounts Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<'create' | 'list'>('create');
  const [staffAccounts, setStaffAccounts] = useState<Record<string, { password: string; user: AuthUser }>>(() => getAllStaffAccounts());
  const [editingStaffAccount, setEditingStaffAccount] = useState<{ email: string; user: AuthUser; password: string } | null>(null);
  const [editStaffNom, setEditStaffNom] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [showEditStaffPass, setShowEditStaffPass] = useState(false);

  // New Staff form state
  const [newStaffNom, setNewStaffNom] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('Password123!');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('medecin');
  const [newStaffStructure, setNewStaffStructure] = useState(clinics[0]?.nom || '');
  const [newStaffMatricule, setNewStaffMatricule] = useState('');
  const [staffFeedback, setStaffFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showStaffPasswords, setShowStaffPasswords] = useState<Record<string, boolean>>({});

  // New Clinic Form State
  const [newNom, setNewNom] = useState('');
  const [newType, setNewType] = useState<ClinicType>('CSU');
  const [newRegion, setNewRegion] = useState('Abidjan 1');
  const [newDistrict, setNewDistrict] = useState('');
  const [newDirecteur, setNewDirecteur] = useState('');
  const [newTelephone, setNewTelephone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAdresse, setNewAdresse] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [newDirecteurPassword, setNewDirecteurPassword] = useState('Password123!');

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

    const baseSlug = newNom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'clinique-' + Date.now();

    const finalSubdomain = newSubdomain 
      ? (newSubdomain.includes('.') ? newSubdomain.toLowerCase() : `${newSubdomain.toLowerCase()}.clinique.ci`) 
      : `${baseSlug}.clinique.ci`;

    const cleanDirectorEmail = (newEmail || (newDirecteur ? newDirecteur.replace(/^(dr\.?|inf\.?|agent|prof\.?)\s+/i, '').split(' ')[0].toLowerCase() : `${baseSlug}-dir`)).trim().toLowerCase();
    const cleanDirectorPassword = newDirecteurPassword.trim() || 'Password123!';

    const created: ClinicStructure = {
      id: 'clinic-' + Date.now(),
      nom: newNom,
      codeDistrict: 'DIST-' + Math.floor(100 + Math.random() * 900),
      districtSanitaire: newDistrict || 'District Sanitaire Central',
      regionSanitaire: newRegion,
      typeStructure: newType,
      statut: 'actif',
      directeurNom: newDirecteur || 'Directeur / Médecin Chef',
      directeurPassword: cleanDirectorPassword,
      telephone: newTelephone || '+225 27 00 00 00',
      email: cleanDirectorEmail,
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
      },
      slug: baseSlug,
      subdomain: finalSubdomain,
      customDomain: newCustomDomain ? newCustomDomain.trim().toLowerCase() : undefined,
      dnsStatus: 'actif',
      sslStatus: 'valide'
    };

    onAddClinic(created);

    // Automatiquement créer et activer le compte Administrateur / Directeur pour cet établissement
    const directorUser: AuthUser = {
      id: 'director-' + Date.now(),
      email: cleanDirectorEmail,
      nomComplet: newDirecteur.trim() || `Directeur ${created.nom}`,
      role: 'administrateur',
      structureNom: created.nom,
      numeroMatricule: `DIR-MSHP-${Math.floor(1000 + Math.random() * 9000)}`
    };
    saveSuperAdminStaffAccount(cleanDirectorEmail, cleanDirectorPassword, directorUser);
    setStaffAccounts(getAllStaffAccounts());

    setIsAddModalOpen(false);
    // Reset
    setNewNom('');
    setNewDistrict('');
    setNewDirecteur('');
    setNewTelephone('');
    setNewEmail('');
    setNewAdresse('');
    setNewSubdomain('');
    setNewCustomDomain('');
    setNewDirecteurPassword('Password123!');
  };

  const handleOpenDomainModal = (clinic: ClinicStructure) => {
    setDomainModalClinic(clinic);
    setEditSubdomain(clinic.subdomain || `${clinic.slug}.clinique.ci`);
    setEditCustomDomain(clinic.customDomain || '');
  };

  const handleSaveDomainChanges = () => {
    if (!domainModalClinic) return;
    const updated: ClinicStructure = {
      ...domainModalClinic,
      subdomain: editSubdomain.trim().toLowerCase(),
      customDomain: editCustomDomain.trim().toLowerCase() || undefined,
      dnsStatus: editCustomDomain ? 'actif' : domainModalClinic.dnsStatus
    };
    onUpdateClinic(updated);
    setDomainModalClinic(null);
  };

  const handleOpenEditDirector = (clinic: ClinicStructure) => {
    setEditDirectorClinic(clinic);
    setEditDirectorNom(clinic.directeurNom || '');
    setEditDirectorLogin(clinic.email || '');
    setEditDirectorPassword(clinic.directeurPassword || 'Password123!');
    setShowEditDirectorPass(false);
  };

  const handleSaveDirectorChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDirectorClinic) return;
    const cleanNom = editDirectorNom.trim() || editDirectorClinic.directeurNom;
    const cleanLogin = editDirectorLogin.trim().toLowerCase();
    const cleanPassword = editDirectorPassword.trim() || 'Password123!';

    if (!cleanLogin) {
      alert("L'identifiant / nom de connexion ne peut pas être vide.");
      return;
    }

    const updated: ClinicStructure = {
      ...editDirectorClinic,
      directeurNom: cleanNom,
      email: cleanLogin,
      directeurPassword: cleanPassword
    };
    onUpdateClinic(updated);

    const directorUser: AuthUser = {
      id: 'director-' + Date.now(),
      email: cleanLogin,
      nomComplet: cleanNom,
      role: 'administrateur',
      structureNom: updated.nom,
      numeroMatricule: `DIR-MSHP-${Math.floor(1000 + Math.random() * 9000)}`
    };
    saveSuperAdminStaffAccount(cleanLogin, cleanPassword, directorUser);
    setStaffAccounts(getAllStaffAccounts());

    setStaffFeedback({
      type: 'success',
      message: `Identifiants du Directeur mis à jour pour "${updated.nom}". Nouveau login : ${cleanLogin}`
    });
    setEditDirectorClinic(null);
  };

  const handleOpenEditStaffAccount = (email: string, user: AuthUser, pass: string) => {
    setEditingStaffAccount({ email, user, password: pass });
    setEditStaffNom(user.nomComplet);
    setEditStaffPassword(pass);
    setShowEditStaffPass(false);
  };

  const handleSaveStaffAccountChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffAccount) return;
    const cleanNom = editStaffNom.trim() || editingStaffAccount.user.nomComplet;
    const cleanPassword = editStaffPassword.trim() || 'Password123!';

    const updatedUser: AuthUser = {
      ...editingStaffAccount.user,
      nomComplet: cleanNom
    };
    saveSuperAdminStaffAccount(editingStaffAccount.email, cleanPassword, updatedUser);
    setStaffAccounts(getAllStaffAccounts());
    setStaffFeedback({
      type: 'success',
      message: `Identifiants et mot de passe mis à jour pour ${cleanNom} !`
    });
    setEditingStaffAccount(null);
  };

  const handleCopyClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
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

  const handleCreateStaffAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffNom || !newStaffEmail || !newStaffPassword) {
      setStaffFeedback({ type: 'error', message: 'Veuillez renseigner le nom, l\'email et le mot de passe.' });
      return;
    }

    const cleanEmail = newStaffEmail.trim().toLowerCase();
    const newUser: AuthUser = {
      id: 'staff-' + Date.now(),
      email: cleanEmail,
      nomComplet: newStaffNom.trim(),
      role: newStaffRole,
      structureNom: newStaffStructure || clinics[0]?.nom || 'Établissement Sanitaire CI',
      numeroMatricule: newStaffMatricule.trim() || `MSHP-CI-${Math.floor(10000 + Math.random() * 90000)}`
    };

    saveSuperAdminStaffAccount(cleanEmail, newStaffPassword, newUser);
    setStaffAccounts(getAllStaffAccounts());
    setStaffFeedback({ 
      type: 'success', 
      message: `Compte créé avec succès pour ${newUser.nomComplet} (${newUser.role === 'medecin' ? 'Médecin' : newUser.role === 'administrateur' ? 'Directeur / Admin' : newUser.role}) !` 
    });

    // Reset fields
    setNewStaffNom('');
    setNewStaffEmail('');
    setNewStaffMatricule('');
    setNewStaffPassword('Password123!');
  };

  const handleDeleteStaffAccount = (email: string) => {
    if (email === 'konedamaa@gmail.com') {
      alert('Impossible de révoquer le compte Super Administrateur National principal.');
      return;
    }
    if (window.confirm(`Confirmez-vous la révocation et la suppression des accès pour le compte ${email} ?`)) {
      deleteSuperAdminStaffAccount(email);
      setStaffAccounts(getAllStaffAccounts());
      setStaffFeedback({ type: 'success', message: `Compte ${email} révoqué et supprimé du réseau.` });
    }
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

          <button
            onClick={() => { setIsStaffModalOpen(true); setStaffFeedback(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '11px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={18} />
            Gérer les Comptes Praticiens
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
                    {/* Nom & Localisation & Domaine */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{c.nom}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginTop: '3px' }}>
                        <MapPin size={13} color="#0d9488" />
                        <span>{c.districtSanitaire} • Région {c.regionSanitaire}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                        <Globe size={13} color="#0284c7" />
                        <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, fontFamily: 'monospace' }}>
                          {c.customDomain ? c.customDomain : c.subdomain}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: c.dnsStatus === 'actif' ? '#dcfce7' : '#fef3c7',
                          color: c.dnsStatus === 'actif' ? '#15803d' : '#b45309',
                          fontWeight: 700
                        }}>
                          {c.dnsStatus === 'actif' ? 'SSL Actif' : 'DNS en attente'}
                        </span>
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

                    {/* Directeur & Compte Administrateur */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{c.directeurNom}</div>
                      <div style={{ color: '#0369a1', fontSize: '0.78rem', marginTop: '2px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {c.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#c2410c', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Pass: {c.directeurPassword || 'Password123!'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nameLogin = c.directeurNom.replace(/^(dr\.?|inf\.?|agent|prof\.?)\s+/i, '').split(' ')[0] || c.email;
                            navigator.clipboard.writeText(`Établissement: ${c.nom}\nDirecteur: ${c.directeurNom}\nLogin de connexion (Nom): ${nameLogin}\nMot de passe: ${c.directeurPassword || 'Password123!'}`);
                            setStaffFeedback({ type: 'success', message: `Identifiants du Directeur (${c.directeurNom}) copiés !` });
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0 2px' }}
                          title="Copier les identifiants du Directeur"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditDirector(c)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Modifier le nom, le login ou le mot de passe du Directeur"
                        >
                          <Edit2 size={11} />
                          <span>Modifier</span>
                        </button>
                      </div>
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenDomainModal(c)}
                          title="Gérer le domaine et le DNS de cette clinique"
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            color: '#0369a1',
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
                          <Globe size={14} />
                          Domaine
                        </button>

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
              </div>

              {/* Compte d'accès du Directeur / Médecin Chef */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  🔑 Compte d'Accès du Directeur de la Clinique (Créé par le Super Admin)
                </span>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#9a3412', lineHeight: 1.4 }}>
                  Le Super Admin attribue ici le login et mot de passe du Directeur. À son tour, le Directeur se connectera pour créer et administrer les soignants (médecins, infirmiers, agents) de son établissement.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Login du Directeur (Nom ou identifiant de connexion) *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: kouame, adjoua, ou dr.adjoua"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '3px', display: 'block' }}>
                      💡 Laisser vide pour utiliser automatiquement le prénom ou nom du directeur.
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                        Mot de passe du Directeur *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewDirecteurPassword(`Dir-${Math.floor(1000 + Math.random() * 9000)}@CI`)}
                        style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ⚡ Générer
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={newDirecteurPassword}
                      onChange={(e) => setNewDirecteurPassword(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Tenant Domain Configuration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    🌐 Sous-domaine dédié *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="ex: portbouet"
                      value={newSubdomain}
                      onChange={(e) => setNewSubdomain(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                    <span style={{ padding: '9px 8px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap' }}>
                      .clinique.ci
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Domaine Personnalisé (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: csu-portbouet.ci"
                    value={newCustomDomain}
                    onChange={(e) => setNewCustomDomain(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
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

      {/* MODAL 3: GESTION DU DOMAINE DE LA CLINIQUE (Multi-Tenant & DNS) */}
      {domainModalClinic && (
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
            maxWidth: '620px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0369a1 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={22} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Domaine & Sous-Domaine Dédié
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {domainModalClinic.nom}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDomainModalClinic(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '0.85rem',
                color: '#0369a1',
                lineHeight: 1.5
              }}>
                Chaque clinique dispose d'un espace <strong>multi-tenant isolé</strong> accessible sous son propre sous-domaine institutionnel ou sous un nom de domaine personnalisé.
              </div>

              {/* Subdomain field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  1. Sous-Domaine Réservé (Standard Réseau CI)
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editSubdomain}
                    onChange={(e) => setEditSubdomain(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px 0 0 8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyClipboard(`https://${editSubdomain}`)}
                    style={{
                      padding: '10px 14px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderLeft: 'none',
                      borderRadius: '0 8px 8px 0',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#475569'
                    }}
                  >
                    {copiedText === `https://${editSubdomain}` ? (
                      <>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Custom domain field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  2. Domaine Personnalisé Externe (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: csu-treichville.ci ou sante-treichville.com"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Permet à la clinique d'utiliser sa propre adresse web avec certificat SSL automatique.
                </span>
              </div>

              {/* Vercel DNS Records configuration box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Instructions DNS Vercel pour ce domaine :
                </span>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>Type</th>
                      <th style={{ padding: '6px 8px' }}>Nom / Hôte</th>
                      <th style={{ padding: '6px 8px' }}>Valeur / Cible</th>
                      <th style={{ padding: '6px 8px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>CNAME</td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{domainModalClinic.slug}</td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#0284c7' }}>cname.vercel-dns.com</td>
                      <td style={{ padding: '6px 8px', color: '#16a34a', fontWeight: 600 }}>✓ Prêt</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>A</td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>@</td>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#0284c7' }}>76.76.21.21</td>
                      <td style={{ padding: '6px 8px', color: '#16a34a', fontWeight: 600 }}>✓ Prêt</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectClinicForControl(domainModalClinic.nom);
                    setDomainModalClinic(null);
                  }}
                  style={{
                    padding: '9px 14px',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    color: '#0f766e',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={14} />
                  Tester l'Accès via ce Domaine
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDomainModalClinic(null)}
                    style={{ padding: '9px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDomainChanges}
                    style={{
                      padding: '9px 18px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Enregistrer le Domaine
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GESTION ET CRÉATION DES COMPTES UTILISATEURS (RÉSERVÉ SUPER ADMIN) */}
      {isStaffModalOpen && (
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
            maxWidth: '740px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #c2410c 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(234, 88, 12, 0.25)', padding: '8px', borderRadius: '10px' }}>
                  <ShieldCheck size={24} color="#fb923c" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    Gestion des Accès & Comptes Praticiens
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Attribution exclusive par le Super Administrateur National MSHP-CMU
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              padding: '0 24px'
            }}>
              <button
                type="button"
                onClick={() => { setStaffTab('create'); setStaffFeedback(null); }}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: staffTab === 'create' ? '#ea580c' : '#64748b',
                  fontWeight: staffTab === 'create' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderBottom: staffTab === 'create' ? '3px solid #ea580c' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={16} />
                Créer un Nouveau Compte Praticien
              </button>
              <button
                type="button"
                onClick={() => { setStaffTab('list'); setStaffFeedback(null); }}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: staffTab === 'list' ? '#ea580c' : '#64748b',
                  fontWeight: staffTab === 'list' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  borderBottom: staffTab === 'list' ? '3px solid #ea580c' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Users size={16} />
                Comptes Actifs ({Object.keys(staffAccounts).length})
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {staffFeedback && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: staffFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${staffFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: staffFeedback.type === 'success' ? '#166534' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {staffFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{staffFeedback.message}</span>
                </div>
              )}

              {staffTab === 'create' ? (
                <form onSubmit={handleCreateStaffAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#9a3412', lineHeight: 1.4, display: 'block' }}>
                      ℹ️ <strong>Règle de sécurité nationale :</strong> Les soignants ne peuvent pas s'inscrire eux-mêmes. Le Super Administrateur crée ici les identifiants pour les Directeurs, Médecins Chefs, Infirmiers et Agents Communautaires.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Nom et Prénoms du Praticien *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Dr. Kouamé Jean"
                        value={newStaffNom}
                        onChange={(e) => setNewStaffNom(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Fonction Médicale / Rôle *
                      </label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="medecin">🩺 Médecin Chef / Médecin Généraliste</option>
                        <option value="administrateur">🏢 Directeur de Clinique / Administrateur</option>
                        <option value="infirmier">💉 Infirmier Major / Sage-Femme</option>
                        <option value="agent_communautaire">🤝 Agent de Santé Communautaire</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Établissement Sanitaire de Rattachement *
                      </label>
                      <select
                        value={newStaffStructure}
                        onChange={(e) => setNewStaffStructure(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        {clinics.map((c) => (
                          <option key={c.id} value={c.nom}>{c.nom} ({c.typeStructure})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        N° Matricule MSHP (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: MSHP-CI-52910"
                        value={newStaffMatricule}
                        onChange={(e) => setNewStaffMatricule(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Email Professionnel (Identifiant de Connexion) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ex: dr.kouame@sante.gouv.ci"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                          Mot de Passe Initial *
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewStaffPassword(`CI-${Math.floor(1000 + Math.random() * 9000)}@Sante`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ea580c',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Générer automatique
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(false)}
                      style={{
                        padding: '10px 18px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '10px 22px',
                        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                      }}
                    >
                      Valider & Activer le Compte Praticien
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '10px 12px' }}>Praticien</th>
                          <th style={{ padding: '10px 12px' }}>Rôle</th>
                          <th style={{ padding: '10px 12px' }}>Établissement</th>
                          <th style={{ padding: '10px 12px' }}>Email & Mot de passe</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(staffAccounts).map(([email, data]) => {
                          const isMainSuperAdmin = email === 'konedamaa@gmail.com';
                          const isShowingPassword = !!showStaffPasswords[email];
                          return (
                            <tr key={email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{data.user.nomComplet}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Matricule : {data.user.numeroMatricule || 'Non renseigné'}
                                </div>
                              </td>

                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: data.user.role === 'super_admin' ? '#ffedd5' : data.user.role === 'administrateur' ? '#f3e8ff' : data.user.role === 'medecin' ? '#e0f2fe' : '#dcfce7',
                                  color: data.user.role === 'super_admin' ? '#c2410c' : data.user.role === 'administrateur' ? '#7e22ce' : data.user.role === 'medecin' ? '#0369a1' : '#15803d'
                                }}>
                                  {data.user.role === 'super_admin' ? '👑 Super Admin' : data.user.role === 'administrateur' ? '🏢 Directeur' : data.user.role === 'medecin' ? '🩺 Médecin Chef' : data.user.role === 'infirmier' ? '💉 Infirmier' : '🤝 Communautaire'}
                                </span>
                              </td>

                              <td style={{ padding: '12px', color: '#334155', fontSize: '0.8rem' }}>
                                {data.user.structureNom}
                              </td>

                              <td style={{ padding: '12px' }}>
                                <div style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>{data.user.email}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                                    {isShowingPassword ? data.password : '••••••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowStaffPasswords(prev => ({ ...prev, [email]: !prev[email] }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0 2px' }}
                                    title={isShowingPassword ? 'Masquer' : 'Afficher'}
                                  >
                                    {isShowingPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`Email: ${data.user.email}\nMot de passe: ${data.password}`);
                                      setStaffFeedback({ type: 'success', message: `Identifiants de ${data.user.nomComplet} copiés dans le presse-papier !` });
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '0 2px' }}
                                    title="Copier les identifiants"
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                              </td>

                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStaffAccount(email, data.user, data.password)}
                                    style={{
                                      padding: '5px 9px',
                                      background: '#eff6ff',
                                      border: '1px solid #bfdbfe',
                                      color: '#1d4ed8',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                    title="Modifier le nom et mot de passe"
                                  >
                                    <Edit2 size={12} />
                                    Modifier
                                  </button>

                                  {!isMainSuperAdmin ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStaffAccount(email)}
                                      style={{
                                        padding: '5px 9px',
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        color: '#ef4444',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                      title="Révoquer ce compte"
                                    >
                                      <Trash2 size={12} />
                                      Révoquer
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700, background: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}>
                                      Principal
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Modifier Identifiants du Directeur */}
      {editDirectorClinic && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0369a1 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={20} color="#38bdf8" />
                  Modifier Accès du Directeur
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#bae6fd' }}>
                  Établissement : {editDirectorClinic.nom}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditDirectorClinic(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDirectorChanges} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom & Titre du Directeur / Médecin Chef *
                </label>
                <input
                  type="text"
                  required
                  value={editDirectorNom}
                  onChange={(e) => setEditDirectorNom(e.target.value)}
                  placeholder="ex: Dr. Koné Souleymane (Médecin Chef)"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Login de Connexion (Nom d'utilisateur ou Email) *
                </label>
                <input
                  type="text"
                  required
                  value={editDirectorLogin}
                  onChange={(e) => setEditDirectorLogin(e.target.value)}
                  placeholder="ex: kone, souleymane, ou directeur@sante.gouv.ci"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  💡 Peut être un nom simple (ex: <strong>kone</strong>, <strong>adama</strong>) ou une adresse email.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nouveau Mot de Passe *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditDirectorPass ? 'text' : 'password'}
                    required
                    value={editDirectorPassword}
                    onChange={(e) => setEditDirectorPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditDirectorPass(!showEditDirectorPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    {showEditDirectorPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditDirectorClinic(null)}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  Enregistrer les Nouveaux Identifiants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier un Compte Praticien */}
      {editingStaffAccount && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #ea580c 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={20} color="#fed7aa" />
                  Modifier le Compte Soignant
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#ffedd5' }}>
                  Établissement : {editingStaffAccount.user.structureNom}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaffAccount(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaffAccountChanges} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom Complet du Praticien *
                </label>
                <input
                  type="text"
                  required
                  value={editStaffNom}
                  onChange={(e) => setEditStaffNom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Identifiant de Connexion (Login / Email)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingStaffAccount.email}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nouveau Mot de Passe *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditStaffPass ? 'text' : 'password'}
                    required
                    value={editStaffPassword}
                    onChange={(e) => setEditStaffPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditStaffPass(!showEditStaffPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    {showEditStaffPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingStaffAccount(null)}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
