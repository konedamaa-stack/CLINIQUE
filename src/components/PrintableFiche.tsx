import React from 'react';
import { Printer, X } from 'lucide-react';
import type { FicheConsultation } from '../types/clinical';
import { calculateIMC, classifyTensionArterielle, classifyPerimetreBrachial } from '../utils/clinicalCalculators';

interface PrintableFicheProps {
  fiche: FicheConsultation;
  onClose: () => void;
}

export const PrintableFiche: React.FC<PrintableFicheProps> = ({ fiche, onClose }) => {
  const imcInfo = fiche.triage.poidsKg && fiche.triage.tailleCm 
    ? calculateIMC(fiche.triage.poidsKg, fiche.triage.tailleCm) 
    : null;

  const htaInfo = fiche.triage.tensionSystolique && fiche.triage.tensionDiastolique 
    ? classifyTensionArterielle(fiche.triage.tensionSystolique, fiche.triage.tensionDiastolique) 
    : null;

  const pbInfo = fiche.triage.perimetreBrachialMm 
    ? classifyPerimetreBrachial(fiche.triage.perimetreBrachialMm) 
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '880px',
        maxHeight: '92vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Action Header Modal */}
        <div style={{
          padding: '12px 20px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>Aperçu de la Fiche Clinique Officielle (Prête à imprimer A4)</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ background: '#0d9488' }}
            >
              <Printer size={15} />
              Imprimer la Fiche
            </button>
            <button 
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <X size={15} />
              Fermer
            </button>
          </div>
        </div>

        {/* Official Printable Sheet Container */}
        <div style={{
          padding: '30px',
          overflowY: 'auto',
          fontSize: '11pt',
          color: '#000000',
          fontFamily: 'serif'
        }}>
          {/* Header Côte d'Ivoire */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ width: '45%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
              <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>Union - Discipline - Travail</div>
              <div style={{ marginTop: '4px', fontSize: '10pt', fontWeight: 600 }}>MINISTÈRE DE LA SANTÉ, DE L'HYGIÈNE PUBLIQUE ET DE LA COUVERTURE MALADIE UNIVERSELLE</div>
              <div style={{ fontSize: '9pt', marginTop: '4px' }}><strong>Établissement :</strong> {fiche.siteNom}</div>
            </div>

            <div style={{ textAlign: 'center', width: '30%' }}>
              <div style={{ display: 'inline-block', border: '2px solid #000', padding: '6px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '8pt', textTransform: 'uppercase' }}>Numéro d'Ordre</div>
                <div style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '0.05em' }}>{fiche.admin.numOrdre}</div>
              </div>
              <div style={{ fontSize: '8pt', marginTop: '4px' }}>Date : {fiche.admin.dateConsultation}</div>
            </div>

            <div style={{ textAlign: 'right', width: '25%', fontSize: '9pt' }}>
              <div>Code : <strong>{fiche.codePatient}</strong></div>
              <div>Protection : <strong>{fiche.admin.protectionSociale.toUpperCase()}</strong></div>
              {fiche.admin.numeroAssurance && <div>N° CMU : {fiche.admin.numeroAssurance}</div>}
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '10px 0 16px 0' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>
              FICHE INTÉGRÉE DE CONSULTATION ET DE TRIAGE
            </h2>
            <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>
              Données administratives, examen clinique & constantes, recherche active de la tuberculose
            </div>
          </div>

          {/* Section 1: Données Administratives */}
          <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', background: '#f1f5f9', padding: '2px 6px', marginBottom: '6px', borderBottom: '1px solid #000' }}>
              1. DONNÉES ADMINISTRATIVES DU CONSULTANT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '9.5pt' }}>
              <div><strong>Nom :</strong> {fiche.admin.nom}</div>
              <div><strong>Prénoms :</strong> {fiche.admin.prenoms}</div>
              <div><strong>Sexe :</strong> {fiche.admin.sexe} &nbsp;&nbsp; <strong>Âge :</strong> {fiche.admin.age} ans ({fiche.admin.trancheAge})</div>
              <div><strong>Téléphone :</strong> {fiche.admin.telephone}</div>
              <div><strong>Résidence :</strong> {fiche.admin.residence || 'Non renseignée'}</div>
              <div><strong>Statut conjugal :</strong> {fiche.admin.statutConjugal}</div>
              <div><strong>Mode d'entrée :</strong> {fiche.admin.modeEntree.replace('_', ' ')}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Type de population :</strong> {fiche.admin.typePopulation.toUpperCase()} 
                {fiche.admin.typePopulation !== 'population_generale' && ' (Population prioritaire spécifique)'}
              </div>
            </div>
          </div>

          {/* Section 2: Examen Clinique & Triage */}
          <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', background: '#f1f5f9', padding: '2px 6px', marginBottom: '6px', borderBottom: '1px solid #000' }}>
              2. EXAMEN CLINIQUE & CONSTANTES PHYSIQUES (TRIAGE)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '9.5pt' }}>
              <div><strong>Poids :</strong> {fiche.triage.poidsKg ? `${fiche.triage.poidsKg} kg` : '-'}</div>
              <div><strong>Taille :</strong> {fiche.triage.tailleCm ? `${fiche.triage.tailleCm} cm` : '-'}</div>
              <div>
                <strong>IMC :</strong> {imcInfo ? `${imcInfo.imc} kg/m²` : '-'}
                {imcInfo && <span style={{ fontSize: '8pt', display: 'block' }}>({imcInfo.label})</span>}
              </div>
              <div><strong>Température :</strong> {fiche.triage.temperature ? `${fiche.triage.temperature} °C` : '-'}</div>

              <div>
                <strong>Tension Artérielle :</strong> 
                <div>{fiche.triage.tensionSystolique ? `${fiche.triage.tensionSystolique}/${fiche.triage.tensionDiastolique} mmHg` : '-'}</div>
                {htaInfo && <span style={{ fontSize: '8pt', display: 'block' }}>({htaInfo.label})</span>}
              </div>
              <div><strong>Fréq. Respiratoire :</strong> {fiche.triage.frequenceRespiratoire ? `${fiche.triage.frequenceRespiratoire} /min` : '-'}</div>
              <div>
                <strong>Périmètre Brachial :</strong> {fiche.triage.perimetreBrachialMm ? `${fiche.triage.perimetreBrachialMm} mm` : '-'}
                {pbInfo && <span style={{ fontSize: '8pt', display: 'block' }}>({pbInfo.label})</span>}
              </div>
              <div><strong>Glycémie :</strong> {fiche.triage.glycemieCapillaireG_L ? `${fiche.triage.glycemieCapillaireG_L} g/L` : '-'}</div>
            </div>
          </div>

          {/* Section 3: Recherche Active Tuberculose & Antécédents */}
          <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', background: '#f1f5f9', padding: '2px 6px', marginBottom: '6px', borderBottom: '1px solid #000' }}>
              3. RECHERCHE ACTIVE DE LA TUBERCULOSE & ANTÉCÉDENTS
            </div>
            
            <div style={{ fontSize: '9pt', marginBottom: '8px' }}>
              <strong>Signes cardinaux TB :</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                <div>[{fiche.tb.touxPersistante ? 'X' : ' '}] Toux persistante</div>
                <div>[{fiche.tb.fievreProlongee ? 'X' : ' '}] Fièvre prolongée</div>
                <div>[{fiche.tb.sueursNocturnes ? 'X' : ' '}] Sueurs nocturnes</div>
                <div>[{fiche.tb.pertePoids ? 'X' : ' '}] Perte de poids</div>
              </div>
            </div>

            <div style={{ padding: '6px 8px', background: fiche.tb.tbPresume ? '#fee2e2' : '#f0fdf4', border: '1px dashed #000', fontSize: '9.5pt', marginBottom: '8px' }}>
              <strong>CONCLUSION DÉPISTAGE TB : </strong> 
              {fiche.tb.tbPresume ? (
                <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>CAS PRÉSUMÉ DE TUBERCULOSE (GeneXpert / Examen crachat prescrit)</span>
              ) : (
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Dépistage négatif ce jour</span>
              )}
            </div>

            <div style={{ fontSize: '9pt' }}>
              <strong>Antécédents : </strong>
              <span>HTA : {fiche.antecedents.htaConnue ? 'Oui' : 'Non'} | </span>
              <span>Diabète : {fiche.antecedents.diabete ? 'Oui' : 'Non'} | </span>
              <span>VIH : {fiche.antecedents.vihConnu ? 'Connu' : 'Inconnu/Négatif'} | </span>
              <span>TB antérieure : {fiche.antecedents.tbAnterieure ? 'Oui' : 'Non'} | </span>
              <span>Chirurgie : {fiche.antecedents.chirurgie ? (fiche.antecedents.precisionChirurgie || 'Oui') : 'Non'}</span>
              {fiche.admin.sexe === 'F' && (
                <div style={{ marginTop: '4px' }}>
                  <span>DDR : {fiche.antecedents.ddr || '-'} | </span>
                  <span>Gestité/Parité : G{fiche.antecedents.gestite ?? '-'} P{fiche.antecedents.parite ?? '-'} | </span>
                  <span>Enceinte : {fiche.antecedents.grossesseEnCours ? 'Oui' : 'Non'} | </span>
                  <span>Allaitement : {fiche.antecedents.allaitementEnCours ? 'Oui' : 'Non'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Motifs, Examens & Prise en Charge */}
          <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', background: '#f1f5f9', padding: '2px 6px', marginBottom: '6px', borderBottom: '1px solid #000' }}>
              4. MOTIFS DE CONSULTATION, EXAMENS & ORIENTATION
            </div>
            <div style={{ fontSize: '9.5pt', marginBottom: '6px' }}>
              <strong>Motifs / Examen physique :</strong> {fiche.orientation.motifsConsultation}
              {fiche.orientation.examenPhysiqueResume && <div><em>Détails : {fiche.orientation.examenPhysiqueResume}</em></div>}
            </div>
            <div style={{ fontSize: '9.5pt', marginBottom: '6px' }}>
              <strong>Examens demandés :</strong> {fiche.orientation.examensDemandes.join(', ') || 'Aucun examen complémentaire'}
            </div>
            <div style={{ fontSize: '9.5pt', marginBottom: '6px' }}>
              <strong>Décision clinique :</strong> {fiche.orientation.decisionClinique.replace(/_/g, ' ').toUpperCase()}
              {fiche.orientation.centreReference && <span> vers {fiche.orientation.centreReference} (Motif : {fiche.orientation.motifReference})</span>}
            </div>
            {fiche.orientation.ordonnancePrescription && (
              <div style={{ fontSize: '9.5pt', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                <strong>Prescription / CAT :</strong> {fiche.orientation.ordonnancePrescription}
              </div>
            )}
          </div>

          {/* Section 5: Suivi & Signatures */}
          <div style={{ border: '1px solid #000', padding: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10pt', background: '#f1f5f9', padding: '2px 6px', marginBottom: '6px', borderBottom: '1px solid #000' }}>
              5. SUIVI DU PATIENT & VALIDATION MÉDICALE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '9.5pt', marginBottom: '20px' }}>
              <div><strong>Prochain RDV :</strong> {fiche.suivi.dateProchainRdv || 'À la demande'}</div>
              <div><strong>Contact Accompagnant :</strong> {fiche.suivi.contactAccompagnant || '-'}</div>
              <div><strong>ASC / Médiateur assigné :</strong> {fiche.suivi.agentCommunautaireAssigne || '-'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '9.5pt' }}>
              <div>
                <div>Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}</div>
                <div style={{ fontStyle: 'italic', fontSize: '8.5pt', marginTop: '2px' }}>Fiche enregistrée sous CLINIQUE-PLUS CI</div>
              </div>
              <div style={{ textAlign: 'center', width: '250px' }}>
                <div><strong>Signature & Cachet du Praticien</strong></div>
                <div style={{ height: '50px' }}></div>
                <div style={{ borderTop: '1px solid #000', paddingTop: '2px', fontSize: '8.5pt' }}>
                  {fiche.agentNom}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
