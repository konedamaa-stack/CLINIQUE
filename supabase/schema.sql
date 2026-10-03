-- =========================================================================
-- PROJET CLINIQUE-PLUS CI (Côte d'Ivoire)
-- Schéma de base de données PostgreSQL / Supabase
-- Projet : kmamycrltmhbhidpwlzx
-- =========================================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table principale des consultations intégrées
CREATE TABLE IF NOT EXISTS public.consultations (
    id TEXT PRIMARY KEY,
    code_patient TEXT NOT NULL,
    num_ordre TEXT NOT NULL,
    date_consultation DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Données administratives
    nom TEXT NOT NULL,
    prenoms TEXT NOT NULL,
    sexe VARCHAR(2) NOT NULL CHECK (sexe IN ('M', 'F')),
    age INTEGER NOT NULL,
    tranche_age TEXT NOT NULL,
    telephone TEXT,
    type_population TEXT NOT NULL DEFAULT 'population_generale',
    protection_sociale TEXT NOT NULL DEFAULT 'cmu',
    
    -- Constantes physiques & triage
    poids_kg NUMERIC(5, 2),
    taille_cm NUMERIC(5, 2),
    imc NUMERIC(4, 1),
    tension_systolique INTEGER,
    tension_diastolique INTEGER,
    
    -- Dépistage Tuberculose
    tb_presume BOOLEAN NOT NULL DEFAULT false,
    
    -- Orientation & Prise en charge
    decision_clinique TEXT NOT NULL DEFAULT 'prise_en_charge_locale',
    
    -- Suivi & Continuité des soins
    date_prochain_rdv DATE,
    statut_suivi TEXT NOT NULL DEFAULT 'en_cours',
    site_nom TEXT NOT NULL DEFAULT 'Centre de Santé Urbain de Treichville (Abidjan)',
    
    -- Données complètes JSONB pour restitution intégrale
    raw_data JSONB NOT NULL,
    
    -- Métadonnées d'audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour accélérer les recherches et les indicateurs
CREATE INDEX IF NOT EXISTS idx_consultations_code_patient ON public.consultations(code_patient);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(date_consultation);
CREATE INDEX IF NOT EXISTS idx_consultations_tb_presume ON public.consultations(tb_presume);
CREATE INDEX IF NOT EXISTS idx_consultations_statut_suivi ON public.consultations(statut_suivi);
CREATE INDEX IF NOT EXISTS idx_consultations_type_population ON public.consultations(type_population);
CREATE INDEX IF NOT EXISTS idx_consultations_rdv ON public.consultations(date_prochain_rdv);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Stratégies RLS (Lecture et Écriture pour les utilisateurs authentifiés et anonymes autorisés)
DROP POLICY IF EXISTS "Autoriser lecture consultations" ON public.consultations;
CREATE POLICY "Autoriser lecture consultations" 
ON public.consultations FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Autoriser insertion consultations" ON public.consultations;
CREATE POLICY "Autoriser insertion consultations" 
ON public.consultations FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Autoriser mise à jour consultations" ON public.consultations;
CREATE POLICY "Autoriser mise à jour consultations" 
ON public.consultations FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Autoriser suppression consultations" ON public.consultations;
CREATE POLICY "Autoriser suppression consultations" 
ON public.consultations FOR DELETE 
USING (true);
