import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Scissors } from "lucide-react";
import authHeroImage from "@/assets/auth-hero.jpg";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authHeroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-ink-950/55" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/70"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-crimson-900/25 via-transparent to-gold-500/10" aria-hidden="true" />

        <Logo className="relative z-10" />
        <div className="relative z-10">
          <Scissors className="h-12 w-12 text-crimson-500" strokeWidth={1.2} />
          <h2 className="mt-6 max-w-sm text-3xl leading-tight">
            Estilo, confiança e atitude em um só lugar.
          </h2>
          <p className="mt-3 text-accent-script text-xl">Faça parte da experiência.</p>
        </div>
        <p className="relative z-10 text-xs text-bone-600">
          © {new Date().getFullYear()} Fórmula da Beleza
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-bone-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}