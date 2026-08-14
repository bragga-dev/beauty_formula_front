import { useQuery } from "@tanstack/react-query";
import {
  Scissors,
  Users,
  CalendarClock,
  CalendarOff,
  CalendarCheck,
  Package,
  MailQuestion,
  UserCog,
  Star,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/app/providers/auth-context";
import { servicesService } from "@/services/services.service";
import { teamService } from "@/services/team.service";
import { employeeServicesService } from "@/services/employee-services.service";
import { workingHoursService } from "@/services/working-hours.service";
import { timeOffService } from "@/services/time-off.service";
import { schedulingService } from "@/services/scheduling.service";
import { productsService } from "@/services/products.service";
import { contactService } from "@/services/contact.service";
import { adminUsersService } from "@/services/admin-users.service";
import { ratingsService } from "@/services/ratings.service";
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
  const adminAppointments = useQuery({
    queryKey: ["dashboard", "admin-appointments"],
    queryFn: () => schedulingService.listAll({ page: 1, page_size: 1 }),
    enabled: role === "admin",
  });
  const adminProducts = useQuery({
    queryKey: ["dashboard", "admin-products"],
    queryFn: () => productsService.listPrivate(1, 1),
    enabled: role === "admin",
  });
  const adminContacts = useQuery({
    queryKey: ["dashboard", "admin-contacts"],
    queryFn: () => contactService.list({ page: 1, page_size: 1 }),
    enabled: role === "admin",
  });
  const adminUsers = useQuery({
    queryKey: ["dashboard", "admin-users"],
    queryFn: () => adminUsersService.list({ page: 1, page_size: 1 }),
    enabled: role === "admin",
  });
  const adminRatings = useQuery({
    queryKey: ["dashboard", "admin-ratings"],
    queryFn: () => ratingsService.listForModeration({}, 1, 1),
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
  const myClientAppointments = useQuery({
    queryKey: ["dashboard", "my-client-appointments"],
    queryFn: () => schedulingService.listForEmployee(1, 1),
    enabled: role === "employee",
  });
  const myRatings = useQuery({
    queryKey: ["dashboard", "my-employee-ratings"],
    queryFn: () => ratingsService.listForModeration({}, 1, 1),
    enabled: role === "employee",
  });

  const myAppointments = useQuery({
    queryKey: ["dashboard", "my-appointments"],
    queryFn: () => schedulingService.listMine(1, 1),
    enabled: role === "client",
  });

  const displayName = me?.client?.first_name ?? me?.employee?.first_name ?? me?.user.email;

  return (
    <div>
      <h1 className="text-3xl break-words">Olá, {displayName}!</h1>
      <p className="mt-1 text-bone-500">
        {role === "admin" && "Aqui está um resumo do seu negócio."}
        {role === "employee" && "Aqui está um resumo da sua agenda e serviços."}
        {role === "client" && "Gerencie seu perfil e seus próximos agendamentos."}
      </p>

      {role === "admin" && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={CalendarCheck} label="Agendamentos" value={adminAppointments.data?.total ?? 0} isLoading={adminAppointments.isLoading} to={ROUTES.dashboardAppointments} />
          <StatCard icon={Scissors} label="Serviços cadastrados" value={adminServices.data?.total ?? 0} isLoading={adminServices.isLoading} to={ROUTES.dashboardServices} />
          <StatCard icon={Package} label="Produtos cadastrados" value={adminProducts.data?.total ?? 0} isLoading={adminProducts.isLoading} to={ROUTES.dashboardProducts} />
          <StatCard icon={MailQuestion} label="Contatos recebidos" value={adminContacts.data?.total ?? 0} isLoading={adminContacts.isLoading} to={ROUTES.dashboardContacts} />
          <StatCard icon={UserCog} label="Usuários cadastrados" value={adminUsers.data?.total ?? 0} isLoading={adminUsers.isLoading} to={ROUTES.dashboardUsers} />
          <StatCard icon={Users} label="Profissionais na equipe" value={adminTeam.data?.total ?? 0} isLoading={adminTeam.isLoading} to={ROUTES.dashboardTeam} />
          <StatCard icon={Star} label="Avaliações" value={adminRatings.data?.total ?? 0} isLoading={adminRatings.isLoading} to={ROUTES.dashboardRatings} />
        </div>
      )}

      {role === "employee" && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Scissors} label="Serviços que atendo" value={myServices.data?.total ?? 0} isLoading={myServices.isLoading} to={ROUTES.dashboardMyServices} />
          <StatCard icon={CalendarCheck} label="Meus atendimentos" value={myClientAppointments.data?.total ?? 0} isLoading={myClientAppointments.isLoading} to={ROUTES.dashboardMyClientAppointments} />
          <StatCard icon={CalendarClock} label="Turnos cadastrados" value={myHours.data?.length ?? 0} isLoading={myHours.isLoading} to={ROUTES.dashboardMySchedule} />
          <StatCard icon={CalendarOff} label="Bloqueios ativos" value={myTimeOff.data?.total ?? 0} isLoading={myTimeOff.isLoading} to={ROUTES.dashboardMyTimeOff} />
          <StatCard icon={Star} label="Avaliações" value={myRatings.data?.total ?? 0} isLoading={myRatings.isLoading} to={ROUTES.dashboardRatings} />
        </div>
      )}

      {role === "client" && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatCard icon={CalendarCheck} label="Meus agendamentos" value={myAppointments.data?.total ?? 0} isLoading={myAppointments.isLoading} to={ROUTES.dashboardMyAppointments} />
          </div>      
        </>
      )}
    </div>
  );
}