import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React application error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('clinique_consultations_ci');
      localStorage.removeItem('clinique_superadmin_staff_accounts');
    } catch {}
    window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #042f2e 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px', color: '#ffffff' }}>
              Récupération de la Session Clinique
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px' }}>
              Une anomalie d'affichage a été interceptée et isolée automatiquement. Cliquez ci-dessous pour réinitialiser le cache local et recharger votre espace sécurisé.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '12px 18px',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)'
              }}
            >
              <RefreshCw size={18} />
              Réparer & Recharger l'Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
