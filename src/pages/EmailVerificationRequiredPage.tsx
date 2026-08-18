import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailWarning } from "lucide-react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/app/providers/toast-context";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";

interface LocationState {
  email?: string;
}

export function EmailVerificationRequiredPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();

  // O e-mail vem do state da navegação (LoginPage manda pra cá logo após
  // o 403 de "e-mail não verificado"). Sem state (ex.: alguém cai direto
  // nessa URL), mostramos a tela sem pré-preencher e sem reenvio automático.
  const email = (location.state as LocationState | null)?.email ?? null;

  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) {
      navigate(ROUTES.login);
      return;
    }
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      setResent(true);
      push("E-mail de verificação reenviado. Confira sua caixa de entrada.", "success");
    } catch (err) {
      push((err as ApiError).detail, "error");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout
      title="Confirme seu e-mail"
      subtitle={
        email
          ? `Você precisa confirmar ${email} antes de fazer login.`
          : "Você precisa confirmar seu e-mail antes de fazer login."
      }
      footer={
        <span className="text-bone-500">
          Errou o e-mail?{" "}
          <Link to={ROUTES.register} className="text-gold-400 hover:text-gold-300">
            Cadastre-se novamente
          </Link>
        </span>
      }
    >
      <div className="flex flex-col items-center gap-6 py-2 text-center">
        <MailWarning className="h-14 w-14 text-gold-400" />

        <p className="text-sm text-bone-400">
          Enviamos um link de confirmação para o seu e-mail no momento do cadastro. Abra a
          mensagem e clique no link para ativar sua conta.
        </p>

        {resent && (
          <p role="status" className="text-sm text-success-500">
            E-mail reenviado! Verifique também a caixa de spam.
          </p>
        )}

        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            variant="gold"
            fullWidth
            size="lg"
            isLoading={isResending}
            disabled={!email}
            onClick={handleResend}
          >
            Reenviar e-mail de confirmação
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="lg"
            onClick={() => navigate(ROUTES.login, { replace: true })}
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}