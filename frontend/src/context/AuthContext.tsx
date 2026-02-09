import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { deportistaService } from '../services/deportista.service';

export type UserRole = 'deportista' | 'admin' | 'administrativo';

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
const TOKEN_KEY = 'token';

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
  loading: boolean;
  resetDeportistaPassword: (deportistaId: number, newPassword: string) => Promise<boolean>;
  resetAdminPassword: (adminId: number, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredAuth);
  const [loading, setLoading] = useState(false);

  // Verificar si hay token al cargar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !user) {
      // Intentar obtener el perfil del usuario
      authService.getProfile().then(response => {
        if (response.success) {
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
        }
      }).catch(() => {
        // Token inválido, limpiar
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_KEY);
      });
    }
  }, [user]);

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
        const { user: userData, token } = response.data;
        
        // Guardar token
        localStorage.setItem(TOKEN_KEY, token);
        
        // Crear objeto de usuario
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
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
