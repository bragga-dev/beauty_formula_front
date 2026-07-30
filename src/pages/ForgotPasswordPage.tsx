import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar Senha"
      subtitle="Digite seu e-mail cadastrado que enviaremos um link para redefinir sua senha."
      footer={
        <Link to={ROUTES.login} className="text-gold-400 hover:text-gold-300">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-success-500/30 bg-success-500/5 p-6 text-center">
          <Lock className="h-8 w-8 text-success-500" />
          <p className="text-sm text-bone-300">
            Se este e-mail estiver cadastrado, você receberá as instruções em breve.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-card border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-500">
              {error}
            </p>
          )}
          <Input
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Enviar link de recuperação
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
