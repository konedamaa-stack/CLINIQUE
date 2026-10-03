import React from 'react';
import { 
  AlertTriangle, 
  HeartPulse, 
  Stethoscope, 
  Users, 
  TrendingUp, 
  ArrowUpRight
} from 'lucide-react';
import type { KPIStats, TypePopulation, TrancheAge } from '../types/clinical';

interface KPIOverviewProps {
  stats: KPIStats;
  onFilterByPopulation?: (pop: TypePopulation) => void;
  onFilterByTB?: () => void;
  onFilterByHTA?: () => void;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  stats,
  onFilterByPopulation,
  onFilterByTB,
  onFilterByHTA
}) => {
  const getKpiStatus = (value: number, target: number) => {
    if (value >= target) {
      return { status: 'conforme', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    }
    if (value >= target - 10) {
      return { status: 'attention', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    }
    return { status: 'critique', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  };

  const popLabels: Record<TypePopulation, { label: string; desc: string; color: string }> = {
    population_generale: { label: 'Population Générale', desc: 'Consultants généraux', color: '#0284c7' },
    ts: { label: 'TS (Travailleuses du Sexe)', desc: 'Population clé prioritaire', color: '#ec4899' },
    ud: { label: 'UD (Usagers de Drogues)', desc: 'Programme RDR / Santé', color: '#8b5cf6' },
    hsh: { label: 'HSH', desc: 'Hommes ayant rapports avec Hommes', color: '#3b82f6' },
    pc: { label: 'PC (Milieu Carcéral)', desc: 'Personnes incarcérées / post-carcéral', color: '#f97316' },
    autre_vulnerable: { label: 'Autres Vulnérables', desc: 'Enfants malnutris, indigents', color: '#14b8a6' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Alert (Active Clinical Triage Alerts) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Cas TB Alert */}
        <div 
          onClick={onFilterByTB}
          style={{
            background: stats.casPresumesTBTotal > 0 ? '#fef2f2' : '#ffffff',
            border: stats.casPresumesTBTotal > 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: stats.casPresumesTBTotal > 0 ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>
                Cas Présumés Tuberculose
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b91c1c' }}>
                {stats.casPresumesTBTotal} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>cas détectés</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                {stats.casPresumesTBTestesPct}% ont eu prélèvement / GeneXpert
              </div>
            </div>
          </div>
          <ArrowUpRight size={20} color="#b91c1c" />
        </div>

        {/* HTA Sévère Alert */}
        <div 
          onClick={onFilterByHTA}
          style={{
            background: stats.casHTAGrade2Ou3 > 0 ? '#fff7ed' : '#ffffff',
            border: stats.casHTAGrade2Ou3 > 0 ? '2px solid #f97316' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: '#ffedd5',
              color: '#ea580c',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9a3412', textTransform: 'uppercase' }}>
                HTA Modérée à Sévère
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c' }}>
                {stats.casHTAGrade2Ou3} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>patients (Grade 2/3)</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c2410c' }}>
                Nécessite confirmation et trithérapie/bithérapie
              </div>
            </div>
          </div>
          <ArrowUpRight size={20} color="#ea580c" />
        </div>

        {/* Malnutrition Aiguë Alert */}
        <div style={{
          background: stats.casMalnutritionSevere > 0 ? '#fdf2f8' : '#ffffff',
          border: stats.casMalnutritionSevere > 0 ? '2px solid #ec4899' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: '#fce7f3',
              color: '#db2777',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9d174d', textTransform: 'uppercase' }}>
                Malnutrition Sévère / Émaciation
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#be185d' }}>
                {stats.casMalnutritionSevere} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>patients alertés</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#be185d' }}>
                PB &lt; 115mm ou IMC &lt; 16.0 (CRENAS/ATPE)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Indicateurs Spécifiques (Section 10 du Plan d'Implémentation Côte d'Ivoire) */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#0d9488" />
              Indicateurs de Suivi-Évaluation (Section 10 du Plan Officiel)
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Suivi mensuel de la performance du circuit patient et respect des cibles nationales
            </p>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
            Total Consultants : {stats.totalConsultations}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {/* Indicateur 1: Fiches complètes */}
          {(() => {
            const kpi = getKpiStatus(stats.fichesCompletesPct, 90);
            return (
              <div style={{
                background: kpi.bg,
                border: `1.5px solid ${kpi.border}`,
                borderRadius: '14px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Fiches Complètes
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>
                    {stats.fichesCompletesPct}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cible : ≥ 90%</span>
                </div>
                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: kpi.color, width: `${Math.min(100, stats.fichesCompletesPct)}%`, height: '100%' }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: kpi.color }}>
                  {stats.fichesCompletesPct >= 90 ? '✓ Objectif atteint' : '⚠ Améliorer la complétude'}
                </div>
              </div>
            );
          })()}

          {/* Indicateur 2: Consultants dépistés pour la TB */}
          {(() => {
            const kpi = getKpiStatus(stats.depistesTBPct, 95);
            return (
              <div style={{
                background: kpi.bg,
                border: `1.5px solid ${kpi.border}`,
                borderRadius: '14px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Consultants Dépistés TB
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>
                    {stats.depistesTBPct}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cible : ≥ 95%</span>
                </div>
                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: kpi.color, width: `${Math.min(100, stats.depistesTBPct)}%`, height: '100%' }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: kpi.color }}>
                  {stats.depistesTBPct >= 95 ? '✓ Dépistage systématique optimal' : '⚠ Dépistage à renforcer'}
                </div>
              </div>
            );
          })()}

          {/* Indicateur 3: Patients avec TA et IMC mesurés */}
          {(() => {
            const kpi = getKpiStatus(stats.constantesMesureesPct, 90);
            return (
              <div style={{
                background: kpi.bg,
                border: `1.5px solid ${kpi.border}`,
                borderRadius: '14px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  TA & IMC Mesurés
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>
                    {stats.constantesMesureesPct}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cible : ≥ 90%</span>
                </div>
                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: kpi.color, width: `${Math.min(100, stats.constantesMesureesPct)}%`, height: '100%' }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: kpi.color }}>
                  {stats.constantesMesureesPct >= 90 ? '✓ Triage physique conforme' : '⚠ Prise de constantes à améliorer'}
                </div>
              </div>
            );
          })()}

          {/* Indicateur 4: Cas présumés TB testés */}
          {(() => {
            const kpi = getKpiStatus(stats.casPresumesTBTestesPct, 90);
            return (
              <div style={{
                background: kpi.bg,
                border: `1.5px solid ${kpi.border}`,
                borderRadius: '14px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Cas Présumés TB Testés
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>
                    {stats.casPresumesTBTestesPct}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cible : ≥ 90%</span>
                </div>
                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: kpi.color, width: `${Math.min(100, stats.casPresumesTBTestesPct)}%`, height: '100%' }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: kpi.color }}>
                  {stats.casPresumesTBTestesPct >= 90 ? '✓ Prélèvements GeneXpert réalisés' : '⚠ Risque de sous-diagnostic'}
                </div>
              </div>
            );
          })()}

          {/* Indicateur 5: Patients référés ayant consulté */}
          {(() => {
            const kpi = getKpiStatus(stats.patientsReferesConfirmesPct, 80);
            return (
              <div style={{
                background: kpi.bg,
                border: `1.5px solid ${kpi.border}`,
                borderRadius: '14px',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Référés Ayant Consulté
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>
                    {stats.patientsReferesConfirmesPct}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cible : ≥ 80%</span>
                </div>
                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: kpi.color, width: `${Math.min(100, stats.patientsReferesConfirmesPct)}%`, height: '100%' }}></div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 600, color: kpi.color }}>
                  {stats.patientsReferesConfirmesPct >= 80 ? '✓ Contre-référence assurée' : '⚠ Relance ASC nécessaire'}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Grid: Populations Clés & Tranches d'âge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Card: Prise en charge des Populations Clés & Vulnérables */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#0d9488" />
              Répartition par Type de Population
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Confidentialité stricte
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(Object.keys(popLabels) as TypePopulation[]).map((popKey) => {
              const count = stats.repartitionPopulations[popKey] || 0;
              const pct = stats.totalConsultations > 0 ? Math.round((count / stats.totalConsultations) * 100) : 0;
              const info = popLabels[popKey];

              return (
                <div 
                  key={popKey}
                  onClick={() => onFilterByPopulation && onFilterByPopulation(popKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: info.color }}></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                        {info.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {info.desc}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card: Tranches d'Âge de la Fiche Clinique */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} color="#0d9488" />
              Répartition par Tranches d'Âge
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pédiatrie & Adultes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(Object.keys(stats.repartitionTranchesAge) as TrancheAge[]).map((ageKey) => {
              const count = stats.repartitionTranchesAge[ageKey] || 0;
              const pct = stats.totalConsultations > 0 ? Math.round((count / stats.totalConsultations) * 100) : 0;

              return (
                <div key={ageKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span style={{ color: '#334155' }}>{ageKey}</span>
                    <span style={{ color: '#0f172a' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      background: ageKey === '0-4 ans' ? '#0d9488' : ageKey === '50 ans et plus' ? '#ea580c' : '#3b82f6',
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
