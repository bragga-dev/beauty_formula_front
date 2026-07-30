import { Scissors } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Scissors className="h-12 w-12 text-crimson-500" strokeWidth={1.2} />
      <h1 className="text-5xl">404</h1>
      <p className="text-bone-500">Essa página não foi encontrada.</p>
      <ButtonLink to={ROUTES.home}>Voltar para o início</ButtonLink>
    </div>
  );
}
