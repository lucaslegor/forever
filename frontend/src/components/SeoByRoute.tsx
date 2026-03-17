import { useLocation } from 'react-router-dom';
import { Seo } from './Seo';

const DEFAULT_DESCRIPTION =
  'Sistema de pagos online, cuotas y alquiler de cancha del Club Social Cultural y Deportivo For Ever, La Plata.';

/** Mapa path -> { title, description }. Coincidencia por prefijo (primera que matchee). */
const ROUTE_SEO: Record<string, { title: string; description: string; noIndex?: boolean }> = {
  '/': {
    title: 'Iniciar sesión | Club Social Cultural y Deportivo For Ever La Plata',
    description:
      'Accedé al sistema de pagos online, cuotas y alquiler de cancha del Club Social Cultural y Deportivo For Ever, La Plata.',
  },
  '/dashboard': {
    title: 'Inicio | Sistema de pagos For Ever',
    description: 'Panel de inicio del sistema de pagos y gestión de socios del Club For Ever.',
    noIndex: true,
  },
  '/perfil': {
    title: 'Mi perfil | Club For Ever',
    description:
      'Editar datos personales y de contacto en el sistema del Club Social Cultural y Deportivo For Ever.',
    noIndex: true,
  },
  '/estado-deuda': {
    title: 'Estado de cuenta | Sistema de pagos For Ever',
    description: 'Consultar estado de cuenta, cuotas pendientes y pagadas del Club For Ever.',
    noIndex: true,
  },
  '/historial-pagos': {
    title: 'Historial de pagos | Sistema de pagos For Ever',
    description: 'Ver el historial de pagos de cuotas y servicios del Club For Ever.',
    noIndex: true,
  },
  '/grupo-familiar': {
    title: 'Grupo familiar | Club For Ever',
    description:
      'Gestionar grupo familiar, cuotas y beneficios en el Club Social Cultural y Deportivo For Ever.',
    noIndex: true,
  },
  '/noticias': {
    title: 'Noticias del Club For Ever La Plata',
    description:
      'Últimas noticias, novedades deportivas y comunicados oficiales del Club Social Cultural y Deportivo For Ever, La Plata.',
  },
  '/alquilar-cancha': {
    title: 'Alquiler de cancha de césped sintético | Club For Ever La Plata',
    description:
      'Reservá online la cancha de césped sintético del Club Social Cultural y Deportivo For Ever en La Plata. Turnos, horarios y formas de pago.',
  },
  '/admin': {
    title: 'Panel de administración | Sistema de gestión Club For Ever',
    description: 'Panel de administración del sistema de gestión del Club Social Cultural y Deportivo For Ever.',
    noIndex: true,
  },
};

function getSeoForPath(pathname: string): { title: string; description: string; noIndex?: boolean } {
  const normalized = pathname.replace(/\/$/, '') || '/';
  // Rutas admin: todo bajo /admin sin indexar
  if (normalized.startsWith('/admin')) {
    return ROUTE_SEO['/admin'] ?? { title: 'Admin', description: DEFAULT_DESCRIPTION, noIndex: true };
  }
  // Coincidencia exacta primero
  if (ROUTE_SEO[normalized]) return ROUTE_SEO[normalized];
  // Noticia detalle
  if (/^\/noticias\/\d+$/.test(normalized)) {
    return {
      title: 'Noticia | Club For Ever',
      description: 'Noticia del Club Social Cultural y Deportivo For Ever, La Plata.',
    };
  }
  // Pagos (success/failure/pending)
  if (normalized.startsWith('/pagos/')) {
    return { title: 'Resultado del pago', description: 'Estado del pago - For Ever Club.', noIndex: true };
  }
  // Por defecto
  return ROUTE_SEO['/'] ?? { title: 'For Ever', description: DEFAULT_DESCRIPTION };
}

/**
 * Colocar dentro de Router; actualiza title y meta según la ruta actual.
 */
export function SeoByRoute() {
  const { pathname } = useLocation();
  const { title, description, noIndex } = getSeoForPath(pathname);
  return (
    <Seo
      title={title}
      description={description}
      path={pathname}
      noIndex={noIndex}
    />
  );
}
