import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  BadgeAlert, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import type { AuthUser } from '../types/auth';
import { signInWithEmail, getAllStaffAccounts } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        setErrorMsg('Veuillez renseigner votre nom ou identifiant et votre mot de passe.');
        setIsLoading(false);
        return;
      }

      const { user, error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoKey: string, cleanName: string) => {
    const allAccounts = getAllStaffAccounts();
    const demo = allAccounts[demoKey.toLowerCase()];
    if (demo) {
      setEmail(cleanName);
      setPassword(demo.password);
      setErrorMsg(null);
      setSuccessMsg(`Connexion prête pour : ${cleanName}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #042f2e 100%)',
      padding: '36px 16px 80px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Background soft ambient glows */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '350px',
        height: '350px',
        background: 'rgba(20, 184, 166, 0.12)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '400px',
        height: '400px',
        background: 'rgba(234, 88, 12, 0.10)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      {/* Main Container Card */}
      <div style={{
        maxWidth: '490px',
        width: '100%',
        margin: 'auto 0',
        background: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        zIndex: 10
      }}>
        {/* Top Header / Flag & Branding */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 118, 110, 0.6) 100%)',
          padding: '24px 28px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          {/* Flag CI stripe */}
          <div style={{ display: 'inline-flex', height: '6px', width: '48px', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{ background: '#f97316', width: '33.3%' }}></div>
            <div style={{ background: '#ffffff', width: '33.3%' }}></div>
            <div style={{ background: '#22c55e', width: '33.3%' }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
            }}>
              <Activity size={22} color="#ffffff" />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              CLINIQUE<span style={{ color: '#38bdf8' }}>-PLUS</span> CI
            </h1>
          </div>

          <p style={{
            margin: 0,
            fontSize: '0.82rem',
            color: '#94a3b8',
            lineHeight: 1.4
          }}>
            Ministère de la Santé, de l'Hygiène Publique et de la CMU • Côte d'Ivoire
          </p>
        </div>

        {/* Security Warning / Super Admin Access Policy */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(234, 88, 12, 0.1)',
          borderBottom: '1px solid rgba(234, 88, 12, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={20} color="#fb923c" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#fed7aa', lineHeight: 1.45 }}>
            <strong>Accès Réglementé :</strong> La création de comptes (Médecin Chef, Directeur, Soignants) est <strong>strictement réservée au Super Administrateur</strong>. Rapprochez-vous de votre direction sanitaire pour recevoir vos accès.
          </span>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Error & Success Messages */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BadgeAlert size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Login / Nom de connexion */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                Votre Nom de Connexion *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder="Entrez votre Nom (ex: Adama, Koné, Souleymane, Amlan, Yao...)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                👤 Connexion directe avec votre <strong>Nom</strong> (sans adresse email).
              </span>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                Mot de Passe *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 36px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <span>Vérification des accès...</span>
              ) : (
                <>
                  <span>Se connecter au Portail</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill section */}
          <div style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px dashed rgba(255, 255, 255, 0.12)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="#2dd4bf" />
                Accès Rapide Praticiens (Comptes Démo)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('adama', 'Adama Koné')}
                style={{
                  background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(180, 83, 9, 0.25) 100%)',
                  border: '1px solid rgba(234, 88, 12, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#fdba74',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.4)')}
              >
                <div style={{ fontWeight: 700, color: '#fb923c' }}>👑 Super Admin</div>
                <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Adama Koné</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('kone', 'Dr. Koné')}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              >
                <div style={{ fontWeight: 600, color: '#38bdf8' }}>Dr. Koné</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Médecin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('amlan', 'Inf. Amlan')}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              >
                <div style={{ fontWeight: 600, color: '#a78bfa' }}>Inf. Amlan</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Infirmière</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('yao', 'Agent Yao')}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#14b8a6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              >
                <div style={{ fontWeight: 600, color: '#34d399' }}>Agent Yao</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Commun.</div>
              </button>
            </div>

            {/* Offline / Guest Mode bypass button */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onContinueAsGuest}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                Continuer sans authentification (Mode Invité / Urgence)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security badge */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '10px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Données de santé sécurisées & chiffrées • Conforme Directives MSHP-CMU</span>
        </div>
      </div>
    </div>
  );
};
