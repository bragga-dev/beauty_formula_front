import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-bone-500">
      <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
