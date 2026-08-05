export const ROUTES = {
  home: "/",
  about: "/sobre",
  services: "/servicos",
  serviceDetail: (id: string) => `/servicos/${id}`,
  team: "/nosso-time",
  teamDetail: (id: string) => `/nosso-time/${id}`,
  contact: "/contato",

  login: "/entrar",
  register: "/cadastro",
  forgotPassword: "/recuperar-senha",
  resetPassword: "/redefinir-senha",
  verifyEmail: "/verificacao-concluida",

  booking: "/agendar",

  dashboard: "/painel",
  dashboardProfile: "/painel/perfil",
  dashboardServices: "/painel/servicos",
  dashboardTeam: "/painel/equipe",
  dashboardMyServices: "/painel/meus-servicos",
  dashboardMySchedule: "/painel/minha-agenda",
  dashboardMyTimeOff: "/painel/meus-bloqueios",

  dashboardMyAppointments: "/painel/meus-agendamentos",
  dashboardAppointmentDetail: (id: string) => `/painel/meus-agendamentos/${id}`,

  dashboardMyClientAppointments: "/painel/meus-atendimentos",
  dashboardClientAppointmentDetail: (id: string) => `/painel/meus-atendimentos/${id}`,
} as const;