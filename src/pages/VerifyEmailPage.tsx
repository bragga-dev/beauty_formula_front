import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";
import { ROUTES } from "@/constants/routes";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email");
  const message = searchParams.get("message");
  const success = status === "success";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      {success ? (
        <>
          <CheckCircle2 className="h-16 w-16 text-success-500" />
          <div>
            <h1 className="text-2xl">E-mail verificado!</h1>
            <p className="mt-2 text-bone-500">{email ? `${email} confirmado com sucesso.` : "Sua conta foi confirmada com sucesso."}</p>
          </div>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-danger-500" />
          <div>
            <h1 className="text-2xl">Não foi possível verificar</h1>
            <p className="mt-2 text-bone-500">{message ?? "O link de verificação é inválido ou expirou."}</p>
          </div>
        </>
      )}
      <ButtonLink to={ROUTES.login}>Ir para o login</ButtonLink>
    </div>
  );
}
