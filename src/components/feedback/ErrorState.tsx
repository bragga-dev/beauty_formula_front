import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Não foi possível carregar os dados.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger-500/30 bg-danger-500/5 px-6 py-14 text-center">
      <AlertTriangle className="h-8 w-8 text-danger-500" />
      <p className="max-w-sm text-sm text-bone-300">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
