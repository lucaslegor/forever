import { useLocation } from 'react-router-dom';
import { Seo } from './Seo';

const DEFAULT_DESCRIPTION = 'For Ever Club - Club deportivo: noticias, estado de cuenta, alquiler de cancha y gestión para deportistas y familias.';

/** Mapa path -> { title, description }. Coincidencia por prefijo (primera que matchee). */
const ROUTE_SEO: Record<string, { title: string; description: string; noIndex?: boolean }> = {
  '/': {
    title: 'For Ever',
    description: 'For Ever Club - Club deportivo: noticias, estado de cuenta, alquiler de cancha y gestión para deportistas y familias.',
  },
  '/dashboard': {
    title: 'Inicio',
    description: 'Panel de inicio - For Ever Club. Acceso a noticias, estado de cuenta y servicios.',
  },
  '/perfil': {
    title: 'Mi perfil',
    description: 'Editar perfil y datos de contacto - For Ever Club.',
  },
  '/estado-deuda': {
    title: 'Estado de cuenta',
    description: 'Consultar estado de cuenta y cuotas - For Ever Club.',
  },
  '/historial-pagos': {
    title: 'Historial de pagos',
    description: 'Historial de pagos realizados - For Ever Club.',
  },
  '/grupo-familiar': {
    title: 'Grupo familiar',
    description: 'Gestionar grupo familiar - For Ever Club.',
  },
  '/noticias': {
    title: 'Noticias',
    description: 'Últimas noticias del club - For Ever Club.',
  },
  '/alquilar-cancha': {
    title: 'Alquilar cancha',
    description: 'Reservar y alquilar la cancha - For Ever Club.',
  },
  '/admin': {
    title: 'Panel de administración',
    description: 'Administración del club - For Ever Club.',
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
    return { title: 'Noticia', description: 'Noticia - For Ever Club.' };
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
