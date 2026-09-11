import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import authHeroImage from "@/assets/auth-hero.jpg";
import formula1Image from "@/assets/formula-1.jpg";
import { ROUTES } from "@/constants/routes";

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

        <Link to={ROUTES.home} className="relative z-10 flex items-center gap-3">
          <img src={formula1Image} alt="Fórmula da Beleza" className="h-12 w-auto object-contain" />
          <span className="font-display text-xl font-bold text-bone-50">
            Fórmula da Beleza
          </span>
        </Link>
        <div className="relative z-10">
          <h2 className="mt-6 max-w-sm text-3xl leading-tight">
            Estilo, confiança e atitude em um só lugar.
          </h2>
          <p className="mt-3 text-accent-script text-xl">Faça parte da experiência.</p>
        </div>
        <p className="relative z-10 text-xs text-bone-600">
          © {new Date().getFullYear()} Fórmula da Beleza
        </p>
      </div>

      <div className="flex min-w-0 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full min-w-0 max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              <img src={formula1Image} alt="Fórmula da Beleza" className="h-10 w-auto object-contain" />
              <span className="font-display text-lg font-bold text-bone-50">
                Fórmula da Beleza
              </span>
            </Link>
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