import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageTitleManager } from "@/app/PageTitleManager";

import { HomePage } from "@/pages/HomePage";
import { ROUTES } from "@/constants/routes";

// Code splitting: cada página abaixo vira um chunk separado, baixado só
// quando a rota é visitada. A HomePage fica de fora (import eager acima)
// porque é a porta de entrada mais comum do site público — não faz
// sentido ela esperar um roundtrip de JS extra. Todo o resto (páginas
// internas, autenticação, painel administrativo) é lazy: quem só visita
// o site público nunca baixa o JS do painel, e vice-versa.
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import("@/pages/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() =>
  import("@/pages/ServiceDetailPage").then((m) => ({ default: m.ServiceDetailPage })),
);
const ProductsPage = lazy(() => import("@/pages/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() =>
  import("@/pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })),
);
const TeamPage = lazy(() => import("@/pages/TeamPage").then((m) => ({ default: m.TeamPage })));
const TeamMemberDetailPage = lazy(() =>
  import("@/pages/TeamMemberDetailPage").then((m) => ({ default: m.TeamMemberDetailPage })),
);
const AllRatingsPage = lazy(() => import("@/pages/AllRatingsPage").then((m) => ({ default: m.AllRatingsPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const BookingPage = lazy(() => import("@/pages/BookingPage").then((m) => ({ default: m.BookingPage })));

const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import("@/pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })),
);
const EmailVerificationRequiredPage = lazy(() =>
  import("@/pages/EmailVerificationRequiredPage").then((m) => ({ default: m.EmailVerificationRequiredPage })),
);

const DashboardOverviewPage = lazy(() =>
  import("@/pages/dashboard/DashboardOverviewPage").then((m) => ({ default: m.DashboardOverviewPage })),
);
const ProfilePage = lazy(() => import("@/pages/dashboard/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const DashboardServicesPage = lazy(() =>
  import("@/pages/dashboard/DashboardServicesPage").then((m) => ({ default: m.DashboardServicesPage })),
);
const DashboardProductsPage = lazy(() =>
  import("@/pages/dashboard/DashboardProductsPage").then((m) => ({ default: m.DashboardProductsPage })),
);
const DashboardContactsPage = lazy(() =>
  import("@/pages/dashboard/DashboardContactsPage").then((m) => ({ default: m.DashboardContactsPage })),
);
const DashboardUsersPage = lazy(() =>
  import("@/pages/dashboard/DashboardUsersPage").then((m) => ({ default: m.DashboardUsersPage })),
);
const DashboardTeamPage = lazy(() =>
  import("@/pages/dashboard/DashboardTeamPage").then((m) => ({ default: m.DashboardTeamPage })),
);
const DashboardEmployeeDetailPage = lazy(() =>
  import("@/pages/dashboard/DashboardEmployeeDetailPage").then((m) => ({ default: m.DashboardEmployeeDetailPage })),
);
const DashboardAppointmentsPage = lazy(() =>
  import("@/pages/dashboard/DashboardAppointmentsPage").then((m) => ({ default: m.DashboardAppointmentsPage })),
);
const DashboardAppointmentAdminDetailPage = lazy(() =>
  import("@/pages/dashboard/DashboardAppointmentAdminDetailPage").then((m) => ({
    default: m.DashboardAppointmentAdminDetailPage,
  })),
);
const DashboardMyServicesPage = lazy(() =>
  import("@/pages/dashboard/DashboardMyServicesPage").then((m) => ({ default: m.DashboardMyServicesPage })),
);
const DashboardMySchedulePage = lazy(() =>
  import("@/pages/dashboard/DashboardMySchedulePage").then((m) => ({ default: m.DashboardMySchedulePage })),
);
const DashboardMyTimeOffPage = lazy(() =>
  import("@/pages/dashboard/DashboardMyTimeOffPage").then((m) => ({ default: m.DashboardMyTimeOffPage })),
);
const DashboardMyCommissionsPage = lazy(() =>
  import("@/pages/dashboard/DashboardMyCommissionsPage").then((m) => ({ default: m.DashboardMyCommissionsPage })),
);
const DashboardMyAppointmentsPage = lazy(() =>
  import("@/pages/dashboard/DashboardMyAppointmentsPage").then((m) => ({ default: m.DashboardMyAppointmentsPage })),
);
const DashboardAppointmentDetailPage = lazy(() =>
  import("@/pages/dashboard/DashboardAppointmentDetailPage").then((m) => ({
    default: m.DashboardAppointmentDetailPage,
  })),
);
const DashboardMyClientAppointmentsPage = lazy(() =>
  import("@/pages/dashboard/DashboardMyClientAppointmentsPage").then((m) => ({
    default: m.DashboardMyClientAppointmentsPage,
  })),
);
const DashboardClientAppointmentDetailPage = lazy(() =>
  import("@/pages/dashboard/DashboardClientAppointmentDetailPage").then((m) => ({
    default: m.DashboardClientAppointmentDetailPage,
  })),
);
const DashboardRatingsPage = lazy(() =>
  import("@/pages/dashboard/DashboardRatingsPage").then((m) => ({ default: m.DashboardRatingsPage })),
);
const DashboardPaymentsPage = lazy(() =>
  import("@/pages/dashboard/DashboardPaymentsPage").then((m) => ({ default: m.DashboardPaymentsPage })),
);
const DashboardReportsPage = lazy(() =>
  import("@/pages/dashboard/DashboardReportsPage").then((m) => ({ default: m.DashboardReportsPage })),
);

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return <LoadingState label="Carregando página..." />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <PageTitleManager />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.services} element={<ServicesPage />} />
            <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
            <Route path={ROUTES.products} element={<ProductsPage />} />
            <Route path="/produtos/:productId" element={<ProductDetailPage />} />
            <Route path={ROUTES.team} element={<TeamPage />} />
            <Route path="/nosso-time/:employeeId" element={<TeamMemberDetailPage />} />
            <Route path={ROUTES.ratings} element={<AllRatingsPage />} />
            <Route path={ROUTES.contact} element={<ContactPage />} />
            <Route path={ROUTES.booking} element={<BookingPage />} />
          </Route>

          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
          <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
          <Route path={ROUTES.emailVerificationRequired} element={<EmailVerificationRequiredPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboard} element={<DashboardOverviewPage />} />
              <Route path={ROUTES.dashboardProfile} element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboardServices} element={<DashboardServicesPage />} />
              <Route path={ROUTES.dashboardProducts} element={<DashboardProductsPage />} />
              <Route path={ROUTES.dashboardContacts} element={<DashboardContactsPage />} />
              <Route path={ROUTES.dashboardUsers} element={<DashboardUsersPage />} />
              <Route path={ROUTES.dashboardTeam} element={<DashboardTeamPage />} />
              <Route path="/painel/equipe/:employeeId" element={<DashboardEmployeeDetailPage />} />
              <Route path={ROUTES.dashboardAppointments} element={<DashboardAppointmentsPage />} />
              <Route path="/painel/agendamentos/:appointmentId" element={<DashboardAppointmentAdminDetailPage />} />
              <Route path={ROUTES.dashboardPayments} element={<DashboardPaymentsPage />} />
              <Route path={ROUTES.dashboardReports} element={<DashboardReportsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allow={["employee"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboardMyServices} element={<DashboardMyServicesPage />} />
              <Route path={ROUTES.dashboardMySchedule} element={<DashboardMySchedulePage />} />
              <Route path={ROUTES.dashboardMyTimeOff} element={<DashboardMyTimeOffPage />} />
              <Route path={ROUTES.dashboardMyCommissions} element={<DashboardMyCommissionsPage />} />
              <Route path={ROUTES.dashboardMyClientAppointments} element={<DashboardMyClientAppointmentsPage />} />
              <Route
                path="/painel/meus-atendimentos/:appointmentId"
                element={<DashboardClientAppointmentDetailPage />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allow={["client"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboardMyAppointments} element={<DashboardMyAppointmentsPage />} />
              <Route path="/painel/meus-agendamentos/:appointmentId" element={<DashboardAppointmentDetailPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allow={["admin", "employee"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboardRatings} element={<DashboardRatingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}