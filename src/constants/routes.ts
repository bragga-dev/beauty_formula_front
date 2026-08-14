export const ROUTES = {
  home: "/",
  about: "/sobre",
  services: "/servicos",
  serviceDetail: (id: string) => `/servicos/${id}`,
  products: "/produtos",
  productDetail: (id: string) => `/produtos/${id}`,
  team: "/nosso-time",
  teamDetail: (id: string) => `/nosso-time/${id}`,
  ratings: "/avaliacoes",
  serviceReviews: (id: string) => `/avaliacoes?service=${id}`,
  teamMemberReviews: (id: string) => `/avaliacoes?employee=${id}`,
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
  dashboardProducts: "/painel/produtos",
  dashboardContacts: "/painel/contatos",
  dashboardUsers: "/painel/usuarios",
  dashboardTeam: "/painel/equipe",
  dashboardAppointments: "/painel/agendamentos",
  dashboardAppointmentAdminDetail: (id: string) => `/painel/agendamentos/${id}`,
  dashboardMyServices: "/painel/meus-servicos",
  dashboardMySchedule: "/painel/minha-agenda",
  dashboardMyTimeOff: "/painel/meus-bloqueios",

  dashboardMyAppointments: "/painel/meus-agendamentos",
  dashboardAppointmentDetail: (id: string) => `/painel/meus-agendamentos/${id}`,

  dashboardMyClientAppointments: "/painel/meus-atendimentos",
  dashboardClientAppointmentDetail: (id: string) => `/painel/meus-atendimentos/${id}`,

  dashboardRatings: "/painel/avaliacoes",

  dashboardMyPayments: "/painel/meus-pagamentos",
  dashboardPayments: "/painel/pagamentos",
} as const;