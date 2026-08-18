import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      await register(email, password, password2);
      push("Conta criada! Verifique seu e-mail para confirmar o cadastro.", "success");
      navigate(ROUTES.login, { replace: true });
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
      push("Conta criada com sucesso!", "success");
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err) {
      setError((err as ApiError).detail as string);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Faça parte da Fórmula da Beleza!"
      subtitle="Crie sua conta e tenha acesso a agendamentos rápidos e benefícios exclusivos."
      footer={
        <span className="text-bone-500">
          Já tem uma conta?{" "}
          <Link to={ROUTES.login} className="text-gold-400 hover:text-gold-300">
            Faça login
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
          placeholder="Crie sua senha"
          hint="Mínimo de 8 caracteres."
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Confirme sua senha"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth size="lg" isLoading={isLoading} disabled={isGoogleLoading}>
          Cadastrar
        </Button>
        <p className="text-center text-xs text-bone-600">
          Ao cadastrar-se, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </form>

      <AuthDivider />

      <GoogleAuthButton
        text="signup_with"
        disabled={isLoading || isGoogleLoading}
        onCredential={handleGoogleCredential}
        onError={(message) => setError(message)}
      />
    </AuthLayout>
  );
}