import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Rede de segurança de última instância: se qualquer componente da árvore
 * estourar durante a renderização, mostra uma tela de erro amigável em vez
 * de deixar o React derrubar a aplicação inteira (tela branca).
 *
 * Não substitui tratamento de erro local (try/catch em mutations, ErrorState
 * em queries) — é só o fallback pra quando algo escapa disso.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na aplicação:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-900 px-4 text-center">
        <Logo />
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-10 w-10 text-danger-500" />
          <h1 className="text-2xl text-bone-50">Algo deu errado</h1>
          <p className="max-w-sm text-sm text-bone-500">
            Encontramos um problema inesperado. Tente recarregar a página — se persistir, entre em contato com o
            suporte.
          </p>
        </div>
        <Button onClick={this.handleReload}>
          <RotateCcw className="h-4 w-4" /> Recarregar
        </Button>
      </div>
    );
  }
}