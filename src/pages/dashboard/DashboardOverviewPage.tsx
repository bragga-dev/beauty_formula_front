import { useQuery } from "@tanstack/react-query";
import { Scissors, Users, CalendarClock, CalendarOff, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/app/providers/auth-context";
import { servicesService } from "@/services/services.service";
import { teamService } from "@/services/team.service";
import { employeeServicesService } from "@/services/employee-services.service";
import { workingHoursService } from "@/services/working-hours.service";
import { timeOffService } from "@/services/time-off.service";
import { ROUTES } from "@/constants/routes";

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  to,
}: {
  icon: typeof Scissors;
  label: string;
  value: number | string;
  isLoading?: boolean;
  to: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
          <Icon className="h-5 w-5" />
        </span>
        <ButtonLink to={to} variant="ghost" size="sm">
          Ver <ArrowRight className="h-3.5 w-3.5" />
        </ButtonLink>
      </div>
      {isLoading ? (
        <Skeleton className="mt-4 h-8 w-16" />
      ) : (
        <p className="mt-4 font-display text-3xl text-bone-50">{value}</p>
      )}
      <p className="mt-1 text-xs uppercase tracking-wide text-bone-500">{label}</p>
    </Card>
  );
}

export function DashboardOverviewPage() {
  const { me } = useAuth();
  const role = me?.user.role;

  const adminServices = useQuery({
    queryKey: ["dashboard", "admin-services"],
    queryFn: () => servicesService.listPrivate(1, 1),
    enabled: role === "admin",
  });
  const adminTeam = useQuery({
    queryKey: ["dashboard", "admin-team"],
    queryFn: () => teamService.list(1, 1),
    enabled: role === "admin",
  });

  const myServices = useQuery({
    queryKey: ["dashboard", "my-services"],
    queryFn: () => employeeServicesService.listMine(true, 1, 1),
    enabled: role === "employee",
  });
  const myHours = useQuery({
    queryKey: ["dashboard", "my-hours"],
    queryFn: () => workingHoursService.listMine(),
    enabled: role === "employee",
  });
  const myTimeOff = useQuery({
    queryKey: ["dashboard", "my-time-off"],
    queryFn: () => timeOffService.listMine(1, 1),
    enabled: role === "employee",
  });

  const displayName = me?.client?.first_name ?? me?.employee?.first_name ?? me?.user.email;

  return (
    <div>
      <h1 className="text-3xl">Olá, {displayName}!</h1>
      <p className="mt-1 text-bone-500">
        {role === "admin" && "Aqui está um resumo do seu negócio."}
        {role === "employee" && "Aqui está um resumo da sua agenda e serviços."}
        {role === "client" && "Gerencie seu perfil e seus próximos agendamentos."}
      </p>

      {role === "admin" && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard icon={Scissors} label="Serviços cadastrados" value={adminServices.data?.total ?? 0} isLoading={adminServices.isLoading} to={ROUTES.dashboardServices} />
          <StatCard icon={Users} label="Profissionais na equipe" value={adminTeam.data?.total ?? 0} isLoading={adminTeam.isLoading} to={ROUTES.dashboardTeam} />
        </div>
      )}

      {role === "employee" && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard icon={Scissors} label="Serviços que atendo" value={myServices.data?.total ?? 0} isLoading={myServices.isLoading} to={ROUTES.dashboardMyServices} />
          <StatCard icon={CalendarClock} label="Turnos cadastrados" value={myHours.data?.length ?? 0} isLoading={myHours.isLoading} to={ROUTES.dashboardMySchedule} />
          <StatCard icon={CalendarOff} label="Bloqueios ativos" value={myTimeOff.data?.total ?? 0} isLoading={myTimeOff.isLoading} to={ROUTES.dashboardMyTimeOff} />
        </div>
      )}

      {role === "client" && (
        <Card className="mt-8 p-8 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-gold-400" />
          <p className="mt-3 text-bone-300">Pronto para o próximo corte?</p>
          <ButtonLink to={ROUTES.booking} className="mt-4 inline-flex">
            Agendar horário
          </ButtonLink>
        </Card>
      )}
    </div>
  );
}
