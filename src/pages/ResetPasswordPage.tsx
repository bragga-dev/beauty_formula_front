import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";
import { useToast } from "@/app/providers/toast-context";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { push } = useToast();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.confirmPasswordReset(uid, token, password, password2);
      push("Senha redefinida com sucesso! Faça login com sua nova senha.", "success");
      navigate(ROUTES.login);
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsLoading(false);
    }
  }

  if (!uid || !token) {
    return (
      <AuthLayout title="Link inválido" subtitle="Solicite um novo link de recuperação de senha.">
        <Link to={ROUTES.forgotPassword} className="text-gold-400 hover:text-gold-300">
          Solicitar novo link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Redefinir Senha" subtitle="Escolha uma nova senha para sua conta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-card border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-500">
            {error}
          </p>
        )}
        <Input
          label="Nova senha"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Redefinir senha
        </Button>
      </form>
    </AuthLayout>
  );
}
