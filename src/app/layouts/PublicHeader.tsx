import { useState } from "react";
import { NavLink, useNavigate }from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/app/providers/auth-context";
import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";
import formula1Image from "@/assets/formula-1.jpg";

const NAV_LINKS = [
  { to: ROUTES.home, label: "Início" },
  { to: ROUTES.about, label: "Sobre" },
  { to: ROUTES.services, label: "Serviços" },
  { to: ROUTES.products, label: "Produtos" },
  { to: ROUTES.team, label: "Nosso Time" },
  { to: ROUTES.ratings, label: "Avaliações" },
  { to: ROUTES.contact, label: "Contato" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, me, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = me?.client?.first_name ?? me?.employee?.first_name ?? me?.user.email;
  const dashboardLabel = me?.user.role === "client" ? "Minha Conta" : "Painel";

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to={ROUTES.home} className="flex items-center gap-3">
          <img src={formula1Image} alt="Fórmula da Beleza" className="h-12 w-auto object-contain" />
          <span className="font-display text-xl font-bold text-bone-50">
            Fórmula da Beleza
          </span>
        </NavLink>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  "font-display text-sm font-semibold uppercase tracking-widest text-bone-50 transition-colors hover:text-gold-400",
                  isActive && "text-crimson-400",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="gold" size="sm" onClick={() => navigate(ROUTES.booking)}>
            <CalendarClock className="h-4 w-4" /> Agendar
          </Button>
          {isAuthenticated ? (
            <Dropdown
              trigger={
                <Avatar
                  src={me?.client?.photo_url ?? me?.employee?.photo_url}
                  alt={String(displayName)}
                  fallback={initials(me?.client?.first_name ?? me?.employee?.first_name, me?.client?.last_name ?? me?.employee?.last_name)}
                  size="sm"
                />
              }
            >
              <div className="border-b border-ink-700 px-4 py-2.5">
                <p className="truncate text-sm text-bone-50">{displayName}</p>
                <p className="truncate text-xs text-bone-600">{me?.user.email}</p>
              </div>
              <DropdownItem onClick={() => navigate(ROUTES.dashboard)}>
                <LayoutDashboard className="h-4 w-4" /> {dashboardLabel}
              </DropdownItem>
              <DropdownItem onClick={handleLogout} className="text-danger-500 hover:text-danger-500">
                <LogOut className="h-4 w-4" /> Sair
              </DropdownItem>
            </Dropdown>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.login)}>
              <User className="h-4 w-4" /> Cadastro / Login
            </Button>
          )}
        </div>

        <button
          className="text-bone-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-700 bg-ink-950 px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === ROUTES.home}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-card px-3 py-3 font-display text-base font-semibold uppercase tracking-wide text-bone-50",
                    isActive && "bg-ink-800 text-crimson-400",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="gold" onClick={() => { setMobileOpen(false); navigate(ROUTES.booking); }}>
              <CalendarClock className="h-4 w-4" /> Agendar
            </Button>
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => { setMobileOpen(false); navigate(ROUTES.dashboard); }}>
                  {dashboardLabel}
                </Button>
                <Button variant="ghost" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                  Sair
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => { setMobileOpen(false); navigate(ROUTES.login); }}>
                Cadastro / Login
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}