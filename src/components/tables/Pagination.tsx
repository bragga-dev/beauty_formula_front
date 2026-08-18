import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  function goTo(nextPage: number) {
    onChange(nextPage);
    // Sem isso, trocar de página em listas longas mantém o scroll onde
    // estava — o usuário troca de página e não vê nada mudar até rolar
    // manualmente pra cima.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-ink-700 pt-4">
      <p className="text-xs text-bone-500">
        Página <span className="text-bone-100">{page}</span> de {pages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => goTo(page - 1)} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => goTo(page + 1)} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}