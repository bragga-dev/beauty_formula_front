import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  User,
  Scissors,
  Users,
  UserCog,
  CalendarClock,
  CalendarOff,
  CalendarCheck,
  Star,
  Package,
  MailQuestion,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/app/providers/auth-context";
import { ROUTES } from "@/constants/routes";
import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
}

export function DashboardLayout() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = me?.user.role;

  const items: NavItem[] = [{ to: ROUTES.dashboard, label: "Visão Geral", icon: LayoutGrid }];

  if (role === "admin") {
    items.push(
      { to: ROUTES.dashboardAppointments, label: "Agendamentos", icon: CalendarCheck },
      { to: ROUTES.dashboardServices, label: "Serviços", icon: Scissors },
      { to: ROUTES.dashboardProducts, label: "Produtos", icon: Package },
      { to: ROUTES.dashboardContacts, label: "Contatos", icon: MailQuestion },
      { to: ROUTES.dashboardUsers, label: "Usuários", icon: UserCog },
      { to: ROUTES.dashboardTeam, label: "Equipe", icon: Users },
      { to: ROUTES.dashboardRatings, label: "Avaliações", icon: Star },
    );
  }

  if (role === "employee") {
    items.push(
      { to: ROUTES.dashboardMyServices, label: "Meus Serviços", icon: Scissors },
      { to: ROUTES.dashboardMyClientAppointments, label: "Meus Atendimentos", icon: CalendarCheck },
      { to: ROUTES.dashboardMySchedule, label: "Minha Agenda", icon: CalendarClock },
      { to: ROUTES.dashboardMyTimeOff, label: "Meus Bloqueios", icon: CalendarOff },
      { to: ROUTES.dashboardRatings, label: "Avaliações", icon: Star },
    );
  }

  if (role === "client") {
    items.push({ to: ROUTES.dashboardMyAppointments, label: "Meus Agendamentos", icon: CalendarCheck });
  }

  items.push({ to: ROUTES.dashboardProfile, label: "Meu Perfil", icon: User });

  const displayName = me?.client?.first_name ?? me?.employee?.first_name ?? me?.user.email;

  async function handleLogout() {
    await logout();
    navigate(ROUTES.home);
  }

  const NavContent = (
    <>
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.dashboard}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-card px-3 py-2.5 text-sm text-bone-400 transition-colors hover:bg-ink-800 hover:text-bone-100",
                isActive && "bg-ink-800 text-gold-400",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 rounded-card border border-ink-700 p-3">
        <Avatar
          src={me?.client?.photo_url ?? me?.employee?.photo_url}
          alt={String(displayName)}
          fallback={initials(me?.client?.first_name ?? me?.employee?.first_name, me?.client?.last_name ?? me?.employee?.last_name)}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-bone-100">{displayName}</p>
          <p className="truncate text-xs text-bone-600">{me?.user.role_label}</p>
        </div>
        <button onClick={handleLogout} aria-label="Sair" className="text-bone-500 hover:text-danger-500">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-900 p-4 lg:flex">
        {NavContent}
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-4 py-3 lg:hidden">
          <Logo />
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu className="h-6 w-6 text-bone-100" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-ink-950/80" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10 flex w-72 flex-col bg-ink-900 p-4">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-4 top-4 text-bone-400"
              >
                <X className="h-5 w-5" />
              </button>
              {NavContent}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}