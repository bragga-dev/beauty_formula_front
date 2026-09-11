import { api } from "./api";
import type { MeOut, AccessTokenOut, EmployeeCreatedOut, SessionOut } from "@/types/user";
import type { MessageOut } from "@/types/common";

export interface RegisterPayload {
  email: string;
  password: string;
  password2: string;
}

export const authService = {
  // O refresh token não aparece mais em nenhuma resposta — o backend seta
  // ele direto num cookie httpOnly. Só o access volta no corpo.
  login: (email: string, password: string) =>
    api.post<AccessTokenOut>("/auth/login", { email, password }).then((r) => r.data),

  loginWithGoogle: (id_token: string) =>
    api.post<AccessTokenOut>("/auth/google", { id_token }).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AccessTokenOut>("/auth/register", payload).then((r) => r.data),

  // Não retorna mais tokens do funcionário recém-criado pro admin que fez
  // a chamada (era um vazamento de sessão). Só confirma o e-mail cadastrado.
  registerEmployee: (email: string) =>
    api.post<EmployeeCreatedOut>("/auth/register-employee", { email }).then((r) => r.data),

  // Sem parâmetro: o refresh vai sozinho no cookie httpOnly.
  refresh: () => api.post<AccessTokenOut>("/auth/refresh", {}).then((r) => r.data),

  logout: () => api.post<MessageOut>("/auth/logout").then((r) => r.data),

  logoutAll: () => api.post<MessageOut>("/auth/logout-all").then((r) => r.data),

  me: () => api.get<MeOut>("/auth/me").then((r) => r.data),

  requestPasswordReset: (email: string) =>
    api.post<MessageOut>("/auth/password-reset/request", { email }).then((r) => r.data),

  confirmPasswordReset: (uid: string, token: string, new_password: string, new_password2: string) =>
    api
      .post<MessageOut>("/auth/password-reset/confirm", { uid, token, new_password, new_password2 })
      .then((r) => r.data),

  changePassword: (old_password: string, new_password: string, new_password2: string) =>
    api
      .post<AccessTokenOut>("/auth/change-password", { old_password, new_password, new_password2 })
      .then((r) => r.data),

  resendVerification: (email: string) =>
    api.post<MessageOut>("/auth/resend-verification", null, { params: { email } }).then((r) => r.data),

  listSessions: () => api.get<SessionOut[]>("/auth/sessions").then((r) => r.data),

  revokeSession: (sessionId: number) =>
    api.delete<MessageOut>(`/auth/sessions/${sessionId}`).then((r) => r.data),

  deleteAccount: (password: string) =>
    api.delete<MessageOut>("/auth/delete-account", { data: { password } }).then((r) => r.data),

  /** LGPD — portabilidade: retorna os dados pessoais do usuário logado em JSON estruturado. */
  exportMyData: () => api.get<Record<string, unknown>>("/auth/export-my-data").then((r) => r.data),
};