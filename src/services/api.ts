import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/constants/env";
import { tokenStorage } from "@/utils/token-storage";
import type { ApiError } from "@/types/common";

export const api = axios.create({
  baseURL: API_URL,
  // O refresh token vive num cookie httpOnly setado pelo backend — sem
  // isso o browser não manda o cookie em requisições cross-origin
  // (front em :5173/:3000, back em :8000) e o refresh nunca funcionaria.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fila de requisições que aguardam o refresh do access token, para
// não disparar N refreshes em paralelo quando várias chamadas falham
// com 401 ao mesmo tempo.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(normalizeError(error));
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        // Sem body: o refresh token vai sozinho no cookie httpOnly
        // (withCredentials acima cuida de mandar ele).
        const { data } = await axios.post<{ access: string }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        tokenStorage.setAccess(data.access);
        resolveQueue(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenStorage.clear();
        resolveQueue(null);
        window.location.href = "/entrar";
        return Promise.reject(normalizeError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError): ApiError {
  const data = error.response?.data as { detail?: unknown } | undefined;
  if (!error.response) {
    return { detail: "Falha de conexão. Verifique sua internet e tente novamente." };
  }
  return {
    detail: extractDetailMessage(data?.detail),
    status: error.response.status,
  };
}

// O back (Django Ninja / Pydantic) responde erro de validação como uma
// LISTA de objetos ({loc, msg, type, ...}), não como string. Em algum
// lugar da UI isso quase sempre acaba indo direto pra dentro de um
// <p>{mensagem}</p> — e o React derruba a árvore inteira (tela preta)
// ao tentar renderizar objeto como filho. Normalizamos tudo pra string
// aqui, num único lugar, pra nenhuma tela precisar se preocupar com isso.
function extractDetailMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String((item as { msg: unknown }).msg) : null))
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length) return messages.join(" ");
  }
  if (detail && typeof detail === "object" && "msg" in detail) {
    return String((detail as { msg: unknown }).msg);
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}