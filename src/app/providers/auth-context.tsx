import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/utils/token-storage";
import type { ClientProfile, EmployeeProfile, MeOut } from "@/types/user";

interface AuthContextValue {
  me: MeOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<MeOut>;
  loginWithGoogle: (idToken: string) => Promise<MeOut>;
  register: (email: string, password: string, password2: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  /**
   * Atualiza `me.client`/`me.employee` localmente com o objeto já retornado
   * por um endpoint de update/upload, sem disparar um novo GET /auth/me.
   */
  updateProfile: (profile: ClientProfile | EmployeeProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      // Sem access em memória (reload de página, aba nova) — tenta um
      // refresh silencioso via cookie httpOnly antes de desistir.
      if (!tokenStorage.getAccess()) {
        const { access } = await authService.refresh();
        tokenStorage.setAccess(access);
      }
      const profile = await authService.me();
      setMe(profile);
    } catch {
      tokenStorage.clear();
      setMe(null);
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setIsLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authService.login(email, password);
    tokenStorage.setAccess(tokens.access);
    const profile = await authService.me();
    setMe(profile);
    return profile;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const tokens = await authService.loginWithGoogle(idToken);
    tokenStorage.setAccess(tokens.access);
    const profile = await authService.me();
    setMe(profile);
    return profile;
  }, []);

  const register = useCallback(async (email: string, password: string, password2: string) => {
    // O backend cria o usuário com is_active=False até o e-mail ser confirmado.
    // Os tokens retornados aqui NÃO funcionam em nenhum endpoint autenticado
    // (JWTAuth rejeita usuário inativo com 401) — por isso não guardamos
    // tokens nem chamamos /me aqui. O usuário loga normalmente depois que
    // confirmar o e-mail.
    await authService.register({ email, password, password2 });
  }, []);

  const updateProfile = useCallback((profile: ClientProfile | EmployeeProfile) => {
    setMe((prev) => {
      if (!prev) return prev;
      if (prev.user.role === "employee") {
        return { ...prev, employee: profile as EmployeeProfile };
      }
      return { ...prev, client: profile as ClientProfile };
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clear();
      setMe(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        me,
        isLoading,
        isAuthenticated: !!me,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshMe,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}