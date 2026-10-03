import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Layers
} from 'lucide-react';
import { formatFCFA } from '../utils/clinicalCalculators';

export const ImplementationPlanView: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState([
    { poste: 'Impression des fiches et registres', detail: 'Fiches intégrées A4, registres papier consultations (5000 ex)', montant: 850000 },
    { poste: 'Matériel de mesure et triage', detail: 'Tensiomètres électroniques, balances pèse-personne, toises, rubans PB', montant: 1450000 },
    { poste: 'Formation du personnel de santé', detail: '3 sessions de 3 jours, supports, restauration, per diem soignants', montant: 3200000 },
    { poste: 'Supervision formative sur site', detail: 'Missions hebdomadaires mois 3-4, transport, indemnités superviseurs', montant: 1800000 },
    { poste: 'Gestion des données & Tablettes', detail: 'Tablettes tactiles de saisie, routeur 4G, synchronisation cloud', montant: 2100000 },
    { poste: 'Imprévus opérationnels (10%)', detail: 'Frais logistiques complémentaires et consommables', montant: 940000 }
  ]);

  const totalBudget = budgetItems.reduce((acc, curr) => acc + curr.montant, 0);

  const handleMontantChange = (index: number, val: number) => {
    setBudgetItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], montant: val };
      return copy;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Title */}
      <div className="card" style={{ padding: '24px', borderLeft: '6px solid #ea580c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-warning-dark">PLAN D'OPÉRATIONNALISATION 2026</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Côte d'Ivoire • Octobre 2026</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px 0' }}>
          Plan d'Implémentation Clinique : Déploiement de la Fiche Unique de Consultation
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
          Feuille de route pour standardiser l'accueil, l'évaluation clinique et l'orientation de tout patient à l'aide d'une fiche unique, de la phase préparatoire au passage à l'échelle national.
        </p>
      </div>

      {/* 5 Étapes du Circuit Patient (Tableau Récapitulatif) */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#0d9488" />
          5. Circuit Standardisé du Patient
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 14px' }}>Étape</th>
                <th style={{ padding: '10px 14px' }}>Poste</th>
                <th style={{ padding: '10px 14px' }}>Activités Principales</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e' }}>1</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Accueil / Enregistrement</td>
                <td style={{ padding: '12px 14px' }}>
                  Numéro d'ordre unique, identité, mode d'entrée (venu de lui-même, référé centre/tradipraticien), résidence, statut conjugal, type de population (TS, UD, HSH, PC, Générale), protection sociale (CMU, assurance, indigent).
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e' }}>2</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Triage</td>
                <td style={{ padding: '12px 14px' }}>
                  Poids, taille, calcul automatique IMC, Z-score pédiatrique, température, fréquence respiratoire, tension artérielle, périmètre brachial chez l'enfant de 6 à 59 mois.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e' }}>3</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Consultation</td>
                <td style={{ padding: '12px 14px' }}>
                  Motifs de consultation, antécédents médicaux/chirurgicaux/gynéco-obstétriques, recherche active systématique des 4 signes de la TB (toux, fièvre, sueurs, amaigrissement), examen physique.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e' }}>4</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Orientation</td>
                <td style={{ padding: '12px 14px' }}>
                  Examens complémentaires (GeneXpert MTB/RIF, tests rapides, glycémie, NFS), prise en charge sur place ou référence vers hôpital avec fiche de liaison.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e' }}>5</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Suivi</td>
                <td style={{ padding: '12px 14px' }}>
                  Programmation du rendez-vous, contre-référence, contact personne de confiance, relance active des perdus de vue via les agents de santé communautaire (ASC).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chronogramme & Budget Prévisionnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Chronogramme */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#0d9488" />
            11. Chronogramme de Déploiement
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ borderLeft: '3px solid #0d9488', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#0f766e' }}>Mois 1 : Préparation & Validation de la Fiche</div>
              <div style={{ color: '#64748b' }}>Comité de pilotage, état des lieux matériel, levée des ambiguïtés, impression pilote.</div>
            </div>

            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#2563eb' }}>Mois 2 : Formation du Personnel</div>
              <div style={{ color: '#64748b' }}>Sessions de 2 à 3 jours par groupe (médecins, infirmiers, sages-femmes, agents psychosociaux).</div>
            </div>

            <div style={{ borderLeft: '3px solid #ea580c', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#ea580c' }}>Mois 3-4 : Lancement Pilote (1 à 2 sites)</div>
              <div style={{ color: '#64748b' }}>Supervision formative hebdomadaire, revues de dossiers, ajustements de terrain.</div>
            </div>

            <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#16a34a' }}>Mois 5-6 et au-delà : Évaluation & Passage à l'Échelle</div>
              <div style={{ color: '#64748b' }}>Extension progressive à l'ensemble des centres sanitaires du district.</div>
            </div>
          </div>
        </div>

        {/* Budget Prévisionnel Interactif */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="#0d9488" />
              12. Budget Prévisionnel Ajustable
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
              Total : {formatFCFA(totalBudget)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {budgetItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.85rem', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.poste}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.detail}</div>
                </div>
                <div style={{ width: '130px' }}>
                  <input 
                    type="number"
                    step="50000"
                    className="form-input"
                    style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'right' }}
                    value={item.montant}
                    onChange={(e) => handleMontantChange(idx, parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risques et Mesures d'Atténuation */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="#ea580c" />
          14. Matrice des Risques & Mesures d'Atténuation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '4px' }}>Surcharge de travail du personnel</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              Déléguer des tâches de premier contact aux infirmiers et agents communautaires ; pré-remplissage informatique et ergonomie de la fiche.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#ea580c', display: 'block', marginBottom: '4px' }}>Rupture d'intrants (Fiches / Matériel)</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              Constitution d'un stock tampon de sécurité (3 mois) et suivi mensuel informatisé des consommations.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#7e22ce', display: 'block', marginBottom: '4px' }}>Stigmatisation des populations clés</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              Sensibilisation continue du personnel de santé, créneaux ou espaces de consultation confidentiels avec pairs-éducateurs.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0369a1', display: 'block', marginBottom: '4px' }}>Perdus de vue après consultation</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              Système de relance téléphonique et visites à domicile des agents de santé communautaire (ASC) assignés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
