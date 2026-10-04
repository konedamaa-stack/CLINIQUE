import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  UserCheck, 
  Stethoscope, 
  HeartHandshake,
  Edit2,
  KeyRound
} from 'lucide-react';
import type { AuthUser, UserRole } from '../types/auth';
import { 
  getAllStaffAccounts, 
  saveSuperAdminStaffAccount, 
  deleteSuperAdminStaffAccount 
} from '../lib/supabase';

interface ClinicTeamViewProps {
  selectedSite: string;
  currentUser: AuthUser | null;
}

export const ClinicTeamView: React.FC<ClinicTeamViewProps> = ({
  selectedSite,
  currentUser
}) => {
  const [staffAccounts, setStaffAccounts] = useState<Record<string, { password: string; user: AuthUser }>>(() => getAllStaffAccounts());
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Form states for new employee
  const [empNom, setEmpNom] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('infirmier');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('Password123!');
  const [empMatricule, setEmpMatricule] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit Account state
  const [editingAccount, setEditingAccount] = useState<{ email: string; user: AuthUser; password: string } | null>(null);
  const [editPassNom, setEditPassNom] = useState('');
  const [editPassPassword, setEditPassPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  // Filter employees belonging to this clinic
  // Also include accounts matching this clinic
  const clinicEmployees = Object.entries(staffAccounts).filter(([_, data]) => {
    return (
      data.user.structureNom === selectedSite ||
      data.user.structureNom.toLowerCase().includes(selectedSite.toLowerCase().split('(')[0].trim()) ||
      selectedSite.toLowerCase().includes(data.user.structureNom.toLowerCase())
    );
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNom || !empPassword) {
      setFeedback({ type: 'error', message: 'Veuillez remplir au minimum le Nom et le Mot de passe.' });
      return;
    }

    const cleanLogin = (empEmail.trim() || empNom.trim().split(' ')[0] || 'soignant').toLowerCase();
    const newEmployee: AuthUser = {
      id: 'staff-' + Date.now(),
      email: cleanLogin.includes('@') ? cleanLogin : `${cleanLogin}@clinique.ci`,
      username: cleanLogin,
      nomComplet: empNom.trim(),
      role: empRole,
      structureNom: selectedSite,
      numeroMatricule: empMatricule.trim() || `MSHP-CI-${Math.floor(10000 + Math.random() * 90000)}`
    };

    saveSuperAdminStaffAccount(cleanLogin, empPassword, newEmployee);
    setStaffAccounts(getAllStaffAccounts());
    setFeedback({
      type: 'success',
      message: `Compte créé avec succès pour ${newEmployee.nomComplet} ! Il peut se connecter directement avec son Nom "${newEmployee.nomComplet}".`
    });

    // Reset form
    setEmpNom('');
    setEmpEmail('');
    setEmpMatricule('');
    setEmpPassword('Password123!');
    setIsAddEmployeeOpen(false);
  };

  const handleDeleteEmployee = (email: string, employeeName: string) => {
    if (currentUser?.email === email) {
      alert('Vous ne pouvez pas révoquer votre propre compte connecté.');
      return;
    }
    if (window.confirm(`Confirmez-vous la révocation du compte de ${employeeName} (${email}) ?`)) {
      deleteSuperAdminStaffAccount(email);
      setStaffAccounts(getAllStaffAccounts());
      setFeedback({ type: 'success', message: `Le compte de ${employeeName} a été supprimé.` });
    }
  };

  const handleCopyCredentials = (email: string, pass: string, name: string) => {
    const cleanNameLogin = name.replace(/^(dr\.?|inf\.?|agent|prof\.?)\s+/i, '').split(' ')[0] || email;
    navigator.clipboard.writeText(`Établissement: ${selectedSite}\nNom: ${name}\nLogin de connexion (Nom): ${cleanNameLogin}\nMot de passe: ${pass}`);
    setCopiedKey(email);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenEditAccount = (email: string, user: AuthUser, pass: string) => {
    setEditingAccount({ email, user, password: pass });
    setEditPassNom(user.nomComplet);
    setEditPassPassword(pass);
    setShowEditPass(false);
  };

  const handleSaveAccountPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const cleanPassword = editPassPassword.trim() || 'Password123!';
    const cleanNom = editPassNom.trim() || editingAccount.user.nomComplet;

    const updatedUser: AuthUser = {
      ...editingAccount.user,
      nomComplet: cleanNom
    };

    saveSuperAdminStaffAccount(editingAccount.email, cleanPassword, updatedUser);
    setStaffAccounts(getAllStaffAccounts());
    setFeedback({
      type: 'success',
      message: `Identifiants et mot de passe mis à jour avec succès pour "${cleanNom}" !`
    });
    setEditingAccount(null);
  };

  // KPIs
  const totalEmployees = clinicEmployees.length;
  const countMedecins = clinicEmployees.filter(([_, d]) => d.user.role === 'medecin').length;
  const countInfirmiers = clinicEmployees.filter(([_, d]) => d.user.role === 'infirmier').length;
  const countCommunautaires = clinicEmployees.filter(([_, d]) => d.user.role === 'agent_communautaire').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Direction de Clinique */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
        color: '#ffffff',
        padding: '28px 32px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: '#0d9488',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Espace Direction & Gestion du Personnel
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              Établissement Sanitaire
            </span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Personnel & Équipe Soignante de l'Établissement
          </h2>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
            En tant que <strong>Directeur / Médecin Chef</strong> de <em>{selectedSite}</em>, vous administrez directement les accès, les soignants et les agents communautaires de votre établissement.
          </p>
        </div>

        <button
          onClick={() => { setIsAddEmployeeOpen(true); setFeedback(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            border: 'none',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)',
            transition: 'all 0.15s ease'
          }}
        >
          <UserPlus size={18} />
          Créer un Compte Soignant
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontWeight: 600,
          background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#166534' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Staff KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Effectif Médical Total</span>
            <Users size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{totalEmployees}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
            Soignants rattachés au site
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Médecins & Spécialistes</span>
            <Stethoscope size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{countMedecins}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Consultations & Prescriptions
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Infirmiers & Sages-Femmes</span>
            <UserCheck size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{countInfirmiers}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Triage, Soins & Dépistages
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Agents Communautaires</span>
            <HeartHandshake size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{countCommunautaires}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Relance & Suivi Terrain
          </div>
        </div>
      </div>

      {/* Main Employee Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Liste des Praticiens & Soignants Habilités
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Identifiants de connexion actifs pour le personnel médical de votre clinique
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
              🏥 Structure : {selectedSite.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {clinicEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Building2 size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>
              Aucun autre soignant n'a encore été créé pour cet établissement.
            </p>
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              style={{
                padding: '9px 18px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ajouter le premier soignant
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px' }}>Soignant / Employé</th>
                  <th style={{ padding: '12px 14px' }}>Fonction Médicale</th>
                  <th style={{ padding: '12px 14px' }}>Identifiant (Login)</th>
                  <th style={{ padding: '12px 14px' }}>Mot de Passe</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinicEmployees.map(([email, data]) => {
                  const isDirector = data.user.role === 'administrateur' || data.user.nomComplet.includes('Directeur') || data.user.nomComplet.includes('Médecin Chef');
                  const isVisible = !!showPasswords[email];
                  const isCopied = copiedKey === email;

                  return (
                    <tr key={email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{data.user.nomComplet}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Matricule : {data.user.numeroMatricule || 'Non renseigné'}
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: data.user.role === 'administrateur' ? '#f3e8ff' : data.user.role === 'medecin' ? '#e0f2fe' : data.user.role === 'infirmier' ? '#ecfdf5' : '#fff7ed',
                          color: data.user.role === 'administrateur' ? '#7e22ce' : data.user.role === 'medecin' ? '#0369a1' : data.user.role === 'infirmier' ? '#047857' : '#c2410c'
                        }}>
                          {data.user.role === 'administrateur' ? '🏢 Direction Clinique' : data.user.role === 'medecin' ? '🩺 Médecin' : data.user.role === 'infirmier' ? '💉 Infirmier(e)' : '🤝 Agent Communautaire'}
                        </span>
                      </td>

                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                        {data.user.email}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: isVisible ? '#0f172a' : '#64748b', fontWeight: 600 }}>
                            {isVisible ? data.password : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, [email]: !prev[email] }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            title={isVisible ? 'Masquer' : 'Afficher'}
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(data.user.email, data.password, data.user.nomComplet)}
                            style={{
                              background: isCopied ? '#dcfce7' : '#f1f5f9',
                              border: `1px solid ${isCopied ? '#86efac' : '#cbd5e1'}`,
                              borderRadius: '6px',
                              padding: '3px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              color: isCopied ? '#166534' : '#475569'
                            }}
                            title="Copier les identifiants pour le soignant"
                          >
                            {isCopied ? <CheckCircle2 size={12} color="#16a34a" /> : <Copy size={12} />}
                            <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditAccount(email, data.user, data.password)}
                            style={{
                              padding: '5px 10px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Modifier le mot de passe ou le nom"
                          >
                            <Edit2 size={13} />
                            Modifier
                          </button>

                          {!isDirector ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(email, data.user.nomComplet)}
                              style={{
                                padding: '5px 10px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#ef4444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={13} />
                              Révoquer
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                              Directeur
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
        )}
      </div>

      {/* Modal: Directeur crée un soignant */}
      {isAddEmployeeOpen && (
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
              background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  Créer un Compte Soignant / Employé
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#ccfbf1' }}>
                  Établissement : {selectedSite}
                </p>
              </div>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.8rem', color: '#0f766e', lineHeight: 1.4, display: 'block' }}>
                  ℹ️ Définissez le login et le mot de passe de votre soignant. Il pourra se connecter immédiatement sous votre établissement.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom et Prénoms du Soignant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inf. Amlan Kouakou ou Dr. Bamba"
                  value={empNom}
                  onChange={(e) => setEmpNom(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Fonction / Poste *
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as UserRole)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="infirmier">💉 Infirmier(e) / Sage-Femme</option>
                    <option value="medecin">🩺 Médecin Généraliste</option>
                    <option value="agent_communautaire">🤝 Agent Communautaire</option>
                    <option value="administrateur">🏢 Gestionnaire / Secrétaire</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    N° Matricule MSHP
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: MSHP-CI-91024"
                    value={empMatricule}
                    onChange={(e) => setEmpMatricule(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Login de Connexion (Optionnel - son Nom sera utilisé par défaut)
                </label>
                <input
                  type="text"
                  placeholder="Laisser vide pour utiliser son Nom (ou ex: kouassi, yao)"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  💡 L'employé se connectera directement avec son <strong>Nom</strong> et son mot de passe.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    Mot de Passe Attribué *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmpPassword(`Sante-${Math.floor(1000 + Math.random() * 9000)}@CI`)}
                    style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Générer automatique
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
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
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                  }}
                >
                  Enregistrer & Activer le Soignant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Mot de Passe / Nom de l'employé ou Directeur */}
      {editingAccount && (
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
              background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={20} color="#38bdf8" />
                  Modifier les Identifiants
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#bae6fd' }}>
                  Compte : {editingAccount.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccountPassword} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={editPassNom}
                  onChange={(e) => setEditPassNom(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Identifiant de connexion (Email / Login)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingAccount.email}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.83rem', fontWeight: 700, color: '#334155' }}>
                    Nouveau Mot de Passe *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPassPassword(`Pass-${Math.floor(1000 + Math.random() * 9000)}@CI`)}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⚡ Générer nouveau
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    required
                    value={editPassPassword}
                    onChange={(e) => setEditPassPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
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
                    {showEditPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  style={{
                    padding: '10px 16px',
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
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
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
