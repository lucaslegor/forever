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
  login: (dni: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  // Revalidar sesión con la cookie HttpOnly al cargar
  useEffect(() => {
    authService.getProfile()
      .then(response => {
        if (response.success && response.data) {
          const userData = response.data;
          const authUser: AuthUser = {
            id: userData.id,
            email: userData.email,
            rol: userData.rol,
            activo: userData.activo,
            loginId: userData.email,
            role: mapRoleToUserRole(userData.rol),
            deportistaId: userData.deportista?.id,
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

  const login = useCallback(async (dni: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      console.log('Intentando login con:', { email: dni, passwordLength: password.length });
      const response = await authService.login({ email: dni, password });
      
      console.log('Respuesta del backend:', response);
      
      if (response.success && response.data) {
        const { user: userData } = response.data;
        // El token va en cookie HttpOnly (no se guarda en el frontend)

        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          rol: userData.rol,
          activo: userData.activo,
          loginId: dni,
          role: mapRoleToUserRole(userData.rol),
        };

        // Si es deportista, obtener su ID
        if (authUser.role === 'deportista') {
          try {
            const deportistaResponse = await deportistaService.getMiPerfil();
            if (deportistaResponse.success) {
              authUser.deportistaId = deportistaResponse.data.id;
            }
          } catch (err) {
            console.error('Error obteniendo perfil de deportista:', err);
          }
        }
        
        setUser(authUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error: any) {
      setLoading(false);
      console.error('Error completo en login:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión';
      return { success: false, error: errorMsg };
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
      console.error('Error al restablecer contraseña de deportista:', error);
      return false;
    }
  }, []);

  const resetAdminPassword = useCallback(async (adminId: number, newPassword: string): Promise<boolean> => {
    try {
      const response = await authService.resetAdminPassword(adminId, newPassword);
      return response.success;
    } catch (error) {
      console.error('Error al restablecer contraseña de admin:', error);
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
