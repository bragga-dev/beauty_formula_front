import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface CardSkeletonProps {
  /** Classes de largura/altura de cada linha de texto abaixo da imagem, em ordem. */
  lines?: string[];
}

const DEFAULT_LINES = ["h-4 w-2/3", "h-3 w-1/3"];

/**
 * Skeleton de carregamento para os cards de listagem (funcionário, serviço,
 * produto). Todos usam a mesma imagem 4:3 + padding — só o número/tamanho
 * das linhas de texto varia, então isso fica configurável via `lines`.
 */
export function CardSkeleton({ lines = DEFAULT_LINES }: CardSkeletonProps) {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        {lines.map((cls, i) => (
          <Skeleton key={i} className={cls} />
        ))}
      </div>
    </Card>
  );
}