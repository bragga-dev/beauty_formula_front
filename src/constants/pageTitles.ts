import { ROUTES } from "@/constants/routes";

export const SITE_TITLE = "Fórmula da Beleza";

/**
 * Mapa de padrão de rota (mesma sintaxe do react-router) → título de aba.
 * Usado pelo `PageTitleManager` pra atualizar `document.title` a cada
 * navegação, sem precisar que cada página faça isso manualmente.
 */
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.home]: "Início",
  [ROUTES.about]: "Sobre",
  [ROUTES.services]: "Serviços",
  "/servicos/:serviceId": "Detalhes do Serviço",
  [ROUTES.products]: "Produtos",
  "/produtos/:productId": "Detalhes do Produto",
  [ROUTES.team]: "Nosso Time",
  "/nosso-time/:employeeId": "Detalhes do Profissional",
  [ROUTES.ratings]: "Avaliações",
  [ROUTES.contact]: "Contato",
  [ROUTES.booking]: "Agendar Horário",

  [ROUTES.login]: "Entrar",
  [ROUTES.register]: "Criar Conta",
  [ROUTES.forgotPassword]: "Recuperar Senha",
  [ROUTES.resetPassword]: "Redefinir Senha",
  [ROUTES.verifyEmail]: "Verificação de E-mail",

  [ROUTES.dashboard]: "Painel",
  [ROUTES.dashboardProfile]: "Meu Perfil",
  [ROUTES.dashboardServices]: "Serviços — Painel",
  [ROUTES.dashboardProducts]: "Produtos — Painel",
  [ROUTES.dashboardContacts]: "Contatos — Painel",
  [ROUTES.dashboardUsers]: "Usuários — Painel",
  [ROUTES.dashboardTeam]: "Equipe — Painel",
  [ROUTES.dashboardAppointments]: "Agendamentos — Painel",
  "/painel/agendamentos/:appointmentId": "Detalhes do Agendamento",
  [ROUTES.dashboardMyServices]: "Meus Serviços",
  [ROUTES.dashboardMySchedule]: "Minha Agenda",
  [ROUTES.dashboardMyTimeOff]: "Meus Bloqueios",
  [ROUTES.dashboardMyAppointments]: "Meus Agendamentos",
  "/painel/meus-agendamentos/:appointmentId": "Detalhes do Agendamento",
  [ROUTES.dashboardMyClientAppointments]: "Meus Atendimentos",
  "/painel/meus-atendimentos/:appointmentId": "Detalhes do Atendimento",
  [ROUTES.dashboardRatings]: "Avaliações — Painel",
};