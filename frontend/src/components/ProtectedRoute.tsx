import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas que requieren sesión (deportista o admin).
 * Si no hay usuario logueado, redirige a / para evitar "flash" de contenido antes del 401.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return <>{children}</>;
}
