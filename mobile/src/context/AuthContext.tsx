import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setUnauthorizedHandler } from '../config/api';
import { AUTH_KEY, TOKEN_KEY } from '../config/storageKeys';
import { getSecureItem, removeSecureItem, setSecureItem } from '../utils/secureStorage';
import { authService } from '../services/authService';
import { deportistaService } from '../services/deportistaService';
import type { AuthContextType, AuthUser } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

function isDeportistaRole(rol: string): boolean {
  return rol.toUpperCase() === 'DEPORTISTA';
}

async function readStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await getSecureItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}


async function clearSession(): Promise<void> {
  await removeSecureItem(TOKEN_KEY);
  await removeSecureItem(AUTH_KEY);
}

function mapLoginError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: string; message?: string } };
      message?: string;
    };

    const serverMessage = axiosError.response?.data?.error ?? axiosError.response?.data?.message;
    if (serverMessage) {
      if (serverMessage.toLowerCase().includes('contrasena') || serverMessage.toLowerCase().includes('contraseña')) {
        return 'DNI o contraseña incorrectos.';
      }
      return serverMessage;
    }

    if (axiosError.response?.status === 401) {
      return 'DNI o contraseña incorrectos.';
    }
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '');
    if (message.includes('Network Error') || message.includes('timeout')) {
      return 'No se pudo conectar con el servidor.';
    }
  }

  return 'No se pudo conectar con el servidor.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [token, storedUser] = await Promise.all([
          getSecureItem(TOKEN_KEY),
          readStoredUser(),
        ]);

        if (!token || !storedUser) {
          await clearSession();
          if (!cancelled) setUser(null);
          return;
        }

        const meResponse = await authService.getMe();
        if (!meResponse.success || !isDeportistaRole(meResponse.data.rol)) {
          await clearSession();
          if (!cancelled) setUser(null);
          return;
        }

        const restoredUser: AuthUser = {
          ...storedUser,
          id: meResponse.data.id,
          email: meResponse.data.email,
          rol: meResponse.data.rol,
        };

        if (!cancelled) setUser(restoredUser);
      } catch {
        await clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (dni: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email: dni, password });

      if (!response.success || !response.data?.token || !response.data?.user) {
        return { success: false, error: 'DNI o contraseña incorrectos.' };
      }

      const { token, user: userData } = response.data;

      if (!isDeportistaRole(userData.rol)) {
        return { success: false, error: 'Esta app es solo para deportistas del club.' };
      }

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        rol: userData.rol,
        loginId: dni,
        nombre: userData.nombre,
        apellido: userData.apellido,
      };

      await setSecureItem(TOKEN_KEY, token);

      try {
        const perfilResponse = await deportistaService.getMiPerfil();
        if (perfilResponse.success && perfilResponse.data?.id) {
          authUser.deportistaId = perfilResponse.data.id;
        }
      } catch {
        // Perfil opcional en login; no bloquea el acceso.
      }

      await setSecureItem(AUTH_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: mapLoginError(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isBootstrapping,
      loading,
      login,
      logout,
    }),
    [user, isBootstrapping, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
