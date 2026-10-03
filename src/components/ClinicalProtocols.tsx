import React from 'react';
import { 
  Stethoscope, 
  Activity, 
  Users, 
  AlertTriangle
} from 'lucide-react';

export const ClinicalProtocols: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: '#ffffff' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Stethoscope size={26} color="#5eead4" />
          Protocoles & Directives Cliniques Nationales (Côte d'Ivoire)
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccfbf1' }}>
          Référentiels opérationnels pour le remplissage de la fiche intégrée, les seuils d'alerte et l'orientation des patients.
        </p>
      </div>

      {/* Protocol 1: Tuberculose */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
              Protocole National de Dépistage de la Tuberculose (PNT)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Recherche active systématique chez 100% des consultants</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              1. Les 4 Signes Cardinaux (Définition de Cas Présumé)
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Toux persistante :</strong> ≥ 2 semaines (ou toux de n'importe quelle durée chez PVVIH ou contact TB).</li>
              <li><strong>Fièvre prolongée :</strong> Sensation de chaleur surtout le soir ou la nuit.</li>
              <li><strong>Sueurs nocturnes profuses :</strong> Nécessitant de changer de vêtements la nuit.</li>
              <li><strong>Perte de poids inexpliquée :</strong> Ou cassure de la courbe de poids chez l'enfant.</li>
            </ul>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
              ➔ 1 seul signe présent = Statut "Cas Présumé TB"
            </div>
          </div>

          <div style={{ background: '#f0fdfa', padding: '16px', borderRadius: '10px', border: '1px solid #99f6e4' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f766e', marginBottom: '8px' }}>
              2. Conduite à Tenir Immédiate (CAT)
            </h4>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#134e4a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Isolement gouttelettes :</strong> Remise d'un masque chirurgical au patient et aération du box.</li>
              <li><strong>Prélèvement crachat :</strong> 1 échantillon spot immédiat + 1 échantillon matinal.</li>
              <li><strong>Examen prioritaire :</strong> GeneXpert MTB/RIF (résultat en 2 heures avec détection résistance rifampicine).</li>
              <li><strong>Mise sous traitement :</strong> Enregistrement au registre TB et initiation du schéma 2RHZE / 4RH si positif.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Protocol 2: Nutrition & Constantes */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px' }}>
            <Activity size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
              Protocole Nutritionnel & Seuils Anthropométriques
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>IMC Adulte, Périmètre Brachial (PB) et Z-score Enfant</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Classification de l'IMC (Adultes)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                <span>&lt; 16.0 kg/m²</span>
                <span>Dénutrition Sévère (Urgence)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#ffedd5', color: '#9a3412', fontWeight: 600 }}>
                <span>16.0 - 16.9 kg/m²</span>
                <span>Dénutrition Modérée</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                <span>17.0 - 18.4 kg/m²</span>
                <span>Maigreur</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                <span>18.5 - 24.9 kg/m²</span>
                <span>Poids Normal (Satisfaisant)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#075985', fontWeight: 600 }}>
                <span>25.0 - 29.9 kg/m²</span>
                <span>Surpoids</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#6b21a8', fontWeight: 600 }}>
                <span>≥ 30.0 kg/m²</span>
                <span>Obésité</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Périmètre Brachial Enfant (6 à 59 mois)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                <strong style={{ color: '#b91c1c' }}>Rouge (&lt; 115 mm) : Malnutrition Aiguë Sévère (MAS)</strong>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Référence immédiate CRENAS ou CRENI si complications / œdèmes bilatéraux. ATPE (Plumpy'Nut).
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px' }}>
                <strong style={{ color: '#b45309' }}>Jaune (115 - 124 mm) : Malnutrition Aiguë Modérée (MAM)</strong>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Admission CRENAM, supplémentation nutritionnelle et suivi de la courbe pondérale.
                </div>
              </div>

              <div style={{ padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                <strong style={{ color: '#15803d' }}>Vert (≥ 125 mm) : État nutritionnel satisfaisant</strong>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Sensibilisation à l'alimentation de complément et suivi vaccinal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol 3: Populations Clés & Éthique */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '10px', borderRadius: '10px' }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6b21a8', margin: 0 }}>
              Accueil & Prise en Charge des Populations Clés (TS, UD, HSH, PC)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Charte de non-discrimination et respect du secret professionnel</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#faf5ff', padding: '16px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#581c87', marginBottom: '8px' }}>
              Principes Directeurs
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#4c1d95', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Confidentialité absolue :</strong> Aucun partage de statut ou d'identité hors personnel de soins autorisé.</li>
              <li><strong>Attitude bienveillante :</strong> Accueil empathique, écoute active, absence totale de jugement moral.</li>
              <li><strong>Espaces dédiés :</strong> Box de consultation fermé garantissant l'intimité du consultant.</li>
            </ul>
          </div>

          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
              Paquet de Services Proposé
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#0c4a6e', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Dépistage combiné rapide VIH / Hépatite B / Syphilis.</li>
              <li>Offre de la Prophylaxie Pré-Exposition (PrEP) et préservatifs/gels.</li>
              <li>Programme de Réduction des Risques (RDR) pour les usagers de drogues.</li>
              <li>Accompagnement par pairs-éducateurs et médiateurs de santé.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
