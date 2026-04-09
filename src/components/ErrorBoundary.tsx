import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReload: () => void;
}

function ErrorFallback({ error, errorInfo, onReload }: ErrorFallbackProps) {
  const [copied, setCopied] = useState(false);

  const errorDetails = `
Erreur: ${error?.message || 'Erreur inconnue'}

Stack:
${error?.stack || 'Aucune stack trace disponible'}

Component Stack:
${errorInfo?.componentStack || 'Aucune information de composant'}
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Échec de la copie:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-card border-primary/20 shadow-[0_8px_32px_rgba(255,102,0,0.15)]">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Une erreur s'est produite</h1>
              <p className="text-muted-foreground mt-1">L'application a rencontré un problème inattendu</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-sm font-mono text-foreground break-words">
              {error?.message || 'Erreur inconnue'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReload} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recharger l'application
            </Button>
            <Button onClick={handleCopy} variant="outline" className="flex-1 border-primary/20 hover:bg-primary/10">
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier les détails
                </>
              )}
            </Button>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Détails techniques
            </summary>
            <div className="mt-4 bg-muted/30 rounded-lg p-4 border border-border">
              <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-words">
                {errorDetails}
              </pre>
            </div>
          </details>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Si le problème persiste, veuillez contacter l'administrateur avec les détails de l'erreur.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
