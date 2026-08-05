import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { TeamPage } from "@/pages/TeamPage";
import { TeamMemberDetailPage } from "@/pages/TeamMemberDetailPage";
import { ContactPage } from "@/pages/ContactPage";
import { BookingPage } from "@/pages/BookingPage";

import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";

import { DashboardOverviewPage } from "@/pages/dashboard/DashboardOverviewPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { DashboardServicesPage } from "@/pages/dashboard/DashboardServicesPage";
import { DashboardTeamPage } from "@/pages/dashboard/DashboardTeamPage";
import { DashboardMyServicesPage } from "@/pages/dashboard/DashboardMyServicesPage";
import { DashboardMySchedulePage } from "@/pages/dashboard/DashboardMySchedulePage";
import { DashboardMyTimeOffPage } from "@/pages/dashboard/DashboardMyTimeOffPage";
import { DashboardMyAppointmentsPage } from "@/pages/dashboard/DashboardMyAppointmentsPage";
import { DashboardAppointmentDetailPage } from "@/pages/dashboard/DashboardAppointmentDetailPage";
import { DashboardMyClientAppointmentsPage } from "@/pages/dashboard/DashboardMyClientAppointmentsPage";
import { DashboardClientAppointmentDetailPage } from "@/pages/dashboard/DashboardClientAppointmentDetailPage";

import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/constants/routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          <Route path={ROUTES.services} element={<ServicesPage />} />
          <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
          <Route path={ROUTES.team} element={<TeamPage />} />
          <Route path="/nosso-time/:employeeId" element={<TeamMemberDetailPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.booking} element={<BookingPage />} />
        </Route>

        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
        <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboard} element={<DashboardOverviewPage />} />
            <Route path={ROUTES.dashboardProfile} element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboardServices} element={<DashboardServicesPage />} />
            <Route path={ROUTES.dashboardTeam} element={<DashboardTeamPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={["employee"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboardMyServices} element={<DashboardMyServicesPage />} />
            <Route path={ROUTES.dashboardMySchedule} element={<DashboardMySchedulePage />} />
            <Route path={ROUTES.dashboardMyTimeOff} element={<DashboardMyTimeOffPage />} />
            <Route path={ROUTES.dashboardMyClientAppointments} element={<DashboardMyClientAppointmentsPage />} />
            <Route path="/painel/meus-atendimentos/:appointmentId" element={<DashboardClientAppointmentDetailPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={["client"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboardMyAppointments} element={<DashboardMyAppointmentsPage />} />
            <Route path="/painel/meus-agendamentos/:appointmentId" element={<DashboardAppointmentDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}