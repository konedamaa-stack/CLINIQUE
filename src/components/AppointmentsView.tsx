import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  UserCheck, 
  PlusCircle
} from 'lucide-react';
import type { FicheConsultation } from '../types/clinical';

interface AppointmentsViewProps {
  fiches: FicheConsultation[];
  onStartNewVisit: (fiche: FicheConsultation) => void;
  onUpdateFicheSuivi: (ficheId: string, updates: Partial<FicheConsultation['suivi']>) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  fiches,
  onStartNewVisit,
  onUpdateFicheSuivi
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'attended'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter only consultations that have a scheduled next appointment
  const appointmentsData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr).getTime();

    return fiches
      .filter(f => !!f.suivi.dateProchainRdv)
      .map(f => {
        const rdvDateStr = f.suivi.dateProchainRdv!;
        const rdvTime = new Date(rdvDateStr).getTime();
        const diffDays = Math.round((rdvTime - today) / (1000 * 60 * 60 * 24));
        
        let timing: 'today' | 'upcoming' | 'overdue' = 'upcoming';
        if (diffDays === 0) timing = 'today';
        else if (diffDays < 0) timing = 'overdue';

        return {
          fiche: f,
          rdvDateStr,
          diffDays,
          timing
        };
      })
      .sort((a, b) => new Date(a.rdvDateStr).getTime() - new Date(b.rdvDateStr).getTime());
  }, [fiches]);

  // Statistics
  const stats = useMemo(() => {
    let todayCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    let attendedCount = 0;

    for (const item of appointmentsData) {
      if (item.fiche.suivi.statutSuivi === 'venu_rdv') {
        attendedCount++;
      } else {
        if (item.timing === 'today') todayCount++;
        else if (item.timing === 'overdue') overdueCount++;
        else upcomingCount++;
      }
    }

    return {
      total: appointmentsData.length,
      todayCount,
      overdueCount,
      upcomingCount,
      attendedCount
    };
  }, [appointmentsData]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointmentsData.filter(item => {
      // Period filter
      if (periodFilter === 'today' && item.timing !== 'today') return false;
      if (periodFilter === 'upcoming' && item.timing !== 'upcoming') return false;
      if (periodFilter === 'overdue' && (item.timing !== 'overdue' || item.fiche.suivi.statutSuivi === 'venu_rdv')) return false;
      if (periodFilter === 'attended' && item.fiche.suivi.statutSuivi !== 'venu_rdv') return false;

      // Status filter
      if (statusFilter !== 'all' && item.fiche.suivi.statutSuivi !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const name = `${item.fiche.admin.nom} ${item.fiche.admin.prenoms}`.toLowerCase();
        const code = item.fiche.codePatient.toLowerCase();
        const tel = item.fiche.admin.telephone.toLowerCase();
        const motif = (item.fiche.orientation.motifsConsultation || '').toLowerCase();
        if (!name.includes(q) && !code.includes(q) && !tel.includes(q) && !motif.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [appointmentsData, periodFilter, statusFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
                Continuité des Soins & Observance
              </span>
              <span style={{ fontSize: '0.85rem', color: '#ccfbf1' }}>
                Date du jour : <strong>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={26} color="#5eead4" />
              Gestion & Calendrier des Rendez-vous des Patients
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccfbf1' }}>
              Suivez les rendez-vous programmés, pointez les présences et relancez les patients en retard (prévention des perdus de vue TB et chroniques).
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards for Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* RDV Aujourd'hui */}
        <div 
          onClick={() => setPeriodFilter('today')}
          style={{
            background: periodFilter === 'today' ? '#f0fdfa' : '#ffffff',
            border: periodFilter === 'today' ? '2px solid #0d9488' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase' }}>
              Rendez-vous du Jour
            </span>
            <Clock size={20} color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f766e', margin: '8px 0 2px 0' }}>
            {stats.todayCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Attendus aujourd'hui à la clinique
          </div>
        </div>

        {/* En retard / À relancer */}
        <div 
          onClick={() => setPeriodFilter('overdue')}
          style={{
            background: stats.overdueCount > 0 ? (periodFilter === 'overdue' ? '#fee2e2' : '#fef2f2') : '#ffffff',
            border: stats.overdueCount > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
              En Retard (À Relancer)
            </span>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b91c1c', margin: '8px 0 2px 0' }}>
            {stats.overdueCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
            Rendez-vous dépassés sans visite
          </div>
        </div>

        {/* À venir */}
        <div 
          onClick={() => setPeriodFilter('upcoming')}
          style={{
            background: periodFilter === 'upcoming' ? '#eff6ff' : '#ffffff',
            border: periodFilter === 'upcoming' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              Rendez-vous à venir
            </span>
            <Calendar size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', margin: '8px 0 2px 0' }}>
            {stats.upcomingCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Prochaines dates programmées
          </div>
        </div>

        {/* Honorés / Venu au RDV */}
        <div 
          onClick={() => setPeriodFilter('attended')}
          style={{
            background: periodFilter === 'attended' ? '#f0fdf4' : '#ffffff',
            border: periodFilter === 'attended' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              Rendez-vous Honorés
            </span>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', margin: '8px 0 2px 0' }}>
            {stats.attendedCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Patients venus au rendez-vous
          </div>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Rechercher patient, code, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Period quick filter */}
          <div>
            <select
              className="form-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui uniquement</option>
              <option value="upcoming">Prochains jours (À venir)</option>
              <option value="overdue">En retard (À relancer)</option>
              <option value="attended">Déjà venus au RDV</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts de suivi</option>
              <option value="en_cours">En cours (Programmé)</option>
              <option value="venu_rdv">Venu au rendez-vous</option>
              <option value="refere_confirme">Référé confirmé</option>
              <option value="perdu_de_vue">Perdu de vue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#0d9488" />
            Liste des Rendez-vous ({filteredAppointments.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Triés par date d'échéance croissante
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Date du Rendez-vous</th>
                <th style={{ padding: '12px 16px' }}>Patient & Code</th>
                <th style={{ padding: '12px 16px' }}>Motif Initial / Contexte</th>
                <th style={{ padding: '12px 16px' }}>Contact & ASC Assigné</th>
                <th style={{ padding: '12px 16px' }}>Statut Suivi</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    Aucun rendez-vous ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(({ fiche, rdvDateStr, diffDays, timing }) => {
                  const isAttended = fiche.suivi.statutSuivi === 'venu_rdv';

                  return (
                    <tr 
                      key={fiche.id}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isAttended ? '#ffffff' : timing === 'overdue' ? '#fef2f2' : timing === 'today' ? '#f0fdfa' : '#ffffff',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Date RDV */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color={timing === 'overdue' && !isAttended ? '#dc2626' : '#0d9488'} />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            {rdvDateStr}
                          </span>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {isAttended ? (
                            <span className="badge badge-success">✓ Honoré</span>
                          ) : timing === 'today' ? (
                            <span className="badge badge-info" style={{ animation: 'pulseBorder 2s infinite ease-in-out' }}>
                              Aujourd'hui
                            </span>
                          ) : timing === 'overdue' ? (
                            <span className="badge badge-danger">
                              En retard ({Math.abs(diffDays)} j)
                            </span>
                          ) : (
                            <span className="badge badge-neutral">
                              Dans {diffDays} j
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {fiche.admin.nom} {fiche.admin.prenoms}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {fiche.codePatient} • {fiche.admin.sexe} • {fiche.admin.age} ans
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                          {fiche.admin.telephone}
                        </div>
                      </td>

                      {/* Motif / Pathologie */}
                      <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fiche.orientation.motifsConsultation || 'Consultation générale'}
                        </div>
                        {fiche.tb.tbPresume && (
                          <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700, marginTop: '2px' }}>
                            ⚠ Cas Présumé TB (Contrôle résultat GeneXpert)
                          </div>
                        )}
                        {fiche.triage.classificationHTA && fiche.triage.classificationHTA.startsWith('hta') && (
                          <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
                            Contrôle tensionnel HTA
                          </div>
                        )}
                      </td>

                      {/* Contact accompagnant & ASC */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          <strong>Accompagnant :</strong> {fiche.suivi.contactAccompagnant || 'Non renseigné'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          <strong>ASC / Médiateur :</strong> {fiche.suivi.agentCommunautaireAssigne || 'Non assigné'}
                        </div>
                      </td>

                      {/* Statut suivi */}
                      <td style={{ padding: '12px 16px' }}>
                        <select 
                          className="form-select"
                          value={fiche.suivi.statutSuivi}
                          onChange={(e) => onUpdateFicheSuivi(fiche.id, { statutSuivi: e.target.value as any })}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            borderColor: isAttended ? '#16a34a' : timing === 'overdue' ? '#dc2626' : '#cbd5e1'
                          }}
                        >
                          <option value="en_cours">En cours (Programmé)</option>
                          <option value="venu_rdv">Venu au rendez-vous</option>
                          <option value="refere_confirme">Référé confirmé</option>
                          <option value="perdu_de_vue">Perdu de vue</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Pointage Venu */}
                          {!isAttended && (
                            <button
                              onClick={() => onUpdateFicheSuivi(fiche.id, { statutSuivi: 'venu_rdv' })}
                              className="btn btn-secondary btn-sm"
                              style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                              title="Pointer le patient comme Venu ce jour"
                            >
                              <UserCheck size={14} />
                              Pointer Venu
                            </button>
                          )}

                          {/* Démarrer la consultation de suivi */}
                          <button
                            onClick={() => onStartNewVisit(fiche)}
                            className="btn btn-primary btn-sm"
                            title="Lancer la consultation de suivi pour ce patient"
                          >
                            <PlusCircle size={14} />
                            Consulter
                          </button>

                          {/* Relance téléphonique */}
                          <a
                            href={`tel:${fiche.admin.telephone.replace(/\s+/g, '')}`}
                            className="btn btn-secondary btn-sm"
                            title="Appeler le patient pour relancer son rendez-vous"
                          >
                            <Phone size={14} />
                          </a>
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
    </div>
  );
};
