import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { deportistaService } from '../services/deportista.service';

export type UserRole = 'deportista' | 'admin' | 'administrativo';

/** Email del admin principal (único que puede crear otros admins y restablecer sus contraseñas) */
export const PRINCIPAL_ADMIN_EMAIL = (import.meta.env.VITE_PRINCIPAL_ADMIN_EMAIL || 'admin@foreverclub.com').toLowerCase();

export interface AuthUser {
  id: number;
  email: string;
  rol: string;
  activo: boolean;
  /** DNI para deportista, email para admin */
  loginId: string;
  role: UserRole;
  deportistaId?: number;
  /** Nombre para saludar (deportista o administrativo) */
  nombre?: string;
  /** Disciplina del deportista (para menú condicional: fixture LAPF / hockey / ocultar) */
  disciplinaNombre?: string;
}

const AUTH_KEY = 'forever_auth';

function getStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (dni: string, password: string, captchaToken: string) => Promise<{ success: boolean; error?: string; bloqueadoHasta?: string }>;
  logout: () => void;
  isAdmin: boolean;
  /** Solo el admin principal (admin@foreverclub.com) puede gestionar admins y restablecer sus contraseñas */
  isPrincipalAdmin: boolean;
  loading: boolean;
  resetDeportistaPassword: (deportistaId: number, newPassword: string) => Promise<boolean>;
  resetAdminPassword: (adminId: number, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredAuth);
  const [loading, setLoading] = useState(false);

  // Revalidar sesión con la cookie HttpOnly al cargar (solo si hay sesión guardada para evitar 401 en consola)
  useEffect(() => {
    if (!getStoredAuth()) return;
    authService.getProfile()
      .then(response => {
        if (response.success && response.data) {
          const userData = response.data;
          const perfil = userData.deportista || userData.administrativo;
          const authUser: AuthUser = {
            id: userData.id,
            email: userData.email,
            rol: userData.rol,
            activo: userData.activo,
            loginId: userData.email,
            role: mapRoleToUserRole(userData.rol),
            deportistaId: userData.deportista?.id,
            nombre: perfil?.nombre,
            disciplinaNombre: userData.deportista?.disciplina?.nombre,
          };
          setUser(authUser);
          localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
        } else {
          setUser(null);
          localStorage.removeItem(AUTH_KEY);
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
      });
  }, []);

  const mapRoleToUserRole = (rol: string): UserRole => {
    if (rol === 'Admin' || rol === 'ADMIN') return 'admin';
    if (rol === 'Administrativo' || rol === 'ADMINISTRATIVO') return 'admin';
    return 'deportista';
  };

  const login = useCallback(async (dni: string, password: string, captchaToken: string): Promise<{ success: boolean; error?: string; bloqueadoHasta?: string }> => {
    setLoading(true);
    try {
      const response = await authService.login({ email: dni, password, captchaToken });

      if (response.success && response.data) {
        const { user: userData } = response.data;
        // El token va en cookie HttpOnly (no se guarda en el frontend)
        // deportistaId viene en la respuesta del login para evitar una segunda llamada a getMiPerfil
const authUser: AuthUser = {
            id: userData.id,
            email: userData.email,
            rol: userData.rol,
            activo: userData.activo ?? true,
            loginId: dni,
            role: mapRoleToUserRole(userData.rol),
            deportistaId: userData.deportistaId,
            nombre: userData.nombre,
            disciplinaNombre: userData.disciplinaNombre,
          };

        setUser(authUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error: any) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión';
      const bloqueadoHasta = error.response?.data?.bloqueadoHasta as string | undefined;
      return { success: false, error: errorMsg, bloqueadoHasta };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const resetDeportistaPassword = useCallback(async (deportistaId: number, newPassword: string): Promise<boolean> => {
    try {
      const response = await deportistaService.resetPassword(deportistaId, newPassword);
      return response.success;
    } catch (error) {
      return false;
    }
  }, []);

  const resetAdminPassword = useCallback(async (adminId: number, newPassword: string): Promise<boolean> => {
    try {
      const response = await authService.resetAdminPassword(adminId, newPassword);
      return response.success;
    } catch (error) {
      return false;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isPrincipalAdmin: user?.role === 'admin' && (user?.email?.toLowerCase() === PRINCIPAL_ADMIN_EMAIL),
    loading,
    resetDeportistaPassword,
    resetAdminPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
