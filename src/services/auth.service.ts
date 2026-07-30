import { api } from "./api";
import type { MeOut, TokenOut, SessionOut } from "@/types/user";
import type { MessageOut } from "@/types/common";

export interface RegisterPayload {
  email: string;
  password: string;
  password2: string;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<TokenOut>("/auth/login", { email, password }).then((r) => r.data),

  loginWithGoogle: (id_token: string) =>
    api.post<TokenOut>("/auth/google", { id_token }).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<TokenOut>("/auth/register", payload).then((r) => r.data),

  registerEmployee: (email: string) =>
    api.post<TokenOut>("/auth/register-employee", { email }).then((r) => r.data),

  logout: (refresh: string) =>
    api.post<MessageOut>("/auth/logout", { refresh }).then((r) => r.data),

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
      .post<TokenOut>("/auth/change-password", { old_password, new_password, new_password2 })
      .then((r) => r.data),

  resendVerification: (email: string) =>
    api.post<MessageOut>("/auth/resend-verification", null, { params: { email } }).then((r) => r.data),

  listSessions: () => api.get<SessionOut[]>("/auth/sessions").then((r) => r.data),

  revokeSession: (sessionId: number) =>
    api.delete<MessageOut>(`/auth/sessions/${sessionId}`).then((r) => r.data),

  deleteAccount: (password: string) =>
    api.delete<MessageOut>("/auth/delete-account", { data: { password } }).then((r) => r.data),
};
