import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/constants/env";
import { tokenStorage } from "@/utils/token-storage";
import type { ApiError } from "@/types/common";

export const api = axios.create({
  baseURL: API_URL,
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
      const refresh = tokenStorage.getRefresh();
      if (!refresh) {
        tokenStorage.clear();
        return Promise.reject(normalizeError(error));
      }

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
        const { data } = await axios.post<{ access: string }>(
          `${API_URL}/auth/refresh`,
          { refresh },
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
  const data = error.response?.data as { detail?: string } | undefined;
  if (!error.response) {
    return { detail: "Falha de conexão. Verifique sua internet e tente novamente." };
  }
  return {
    detail: data?.detail ?? "Ocorreu um erro inesperado. Tente novamente.",
    status: error.response.status,
  };
}
