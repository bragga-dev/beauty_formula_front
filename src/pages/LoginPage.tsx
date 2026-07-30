import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { AuthDivider } from "@/features/auth/AuthDivider";
import { GoogleAuthButton } from "@/features/auth/GoogleAuthButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/providers/auth-context";
import { useToast } from "@/app/providers/toast-context";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToDestination() {
    const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.dashboard;
    navigate(from, { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      push("Login realizado com sucesso!", "success");
      goToDestination();
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      push("Login realizado com sucesso!", "success");
      goToDestination();
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Faça login e agende seu horário com praticidade."
      footer={
        <span className="text-bone-500">
          Não tem uma conta?{" "}
          <Link to={ROUTES.register} className="text-gold-400 hover:text-gold-300">
            Cadastre-se
          </Link>
        </span>
      }
    >
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
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link to={ROUTES.forgotPassword} className="text-xs text-bone-500 hover:text-gold-400">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" isLoading={isLoading} disabled={isGoogleLoading}>
          Entrar
        </Button>
      </form>

      <AuthDivider />

      <GoogleAuthButton
        text="signin_with"
        disabled={isLoading || isGoogleLoading}
        onCredential={handleGoogleCredential}
        onError={(message) => setError(message)}
      />
    </AuthLayout>
  );
}