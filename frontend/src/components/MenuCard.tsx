import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNoticias } from '../context/NoticiasContext';
import styles from './MenuCard.module.css';

const NOTICIAS_PATH = '/noticias';
const DIAS_NOTICIA_NUEVA = 7;

const LAPF_FIXTURE_URL = 'https://lapf.com.ar/fixture/';
const LIGA_PLATENSE_HOCKEY_URL = 'https://www.instagram.com/ligaplatensedehockey/?hl=es';

interface MenuItem {
    label: string;
    path: string;
    /** Si está definido, se abre en nueva pestaña en lugar de navegar dentro de la app */
    externalUrl?: string;
}

const menuItemsBase: MenuItem[] = [
    { label: 'Mi Perfil', path: '/perfil' },
    { label: 'Pagar Cuota', path: '/estado-deuda' },
    { label: 'Historial de Pagos', path: '/historial-pagos' },
    { label: 'Grupo Familiar', path: '/grupo-familiar' },
    { label: 'Noticias', path: NOTICIAS_PATH },
];

function disciplinaNormalizada(nombre: string | undefined): string {
    return (nombre ?? '').trim().toLowerCase().normalize('NFD').replace(/\u0300/g, '');
}

function getMenuItemFixture(disciplinaNombre: string | undefined): MenuItem | null {
    const d = disciplinaNormalizada(disciplinaNombre);
    if (d === 'futbol') return { label: 'Fixture y tablas LAPF', path: '/fixture-lapf', externalUrl: LAPF_FIXTURE_URL };
    if (d === 'hockey') return { label: 'Liga Platense de Hockey', path: '/fixture-hockey', externalUrl: LIGA_PLATENSE_HOCKEY_URL };
    return null;
}

function isNoticiaReciente(fecha: string): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const haceNDias = new Date(hoy);
    haceNDias.setDate(haceNDias.getDate() - DIAS_NOTICIA_NUEVA);
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f >= haceNDias && f <= hoy;
}

export const MenuCard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { noticias } = useNoticias();
    const hayNoticiasNuevas = noticias.some((n) => isNoticiaReciente(n.fecha));
    const saludo = user?.nombre?.trim() ? `Hola, ${user.nombre}` : 'Hola';

    const menuItems = useMemo(() => {
        const items = [...menuItemsBase];
        if (user?.role === 'deportista') {
            const fixtureItem = getMenuItemFixture(user.disciplinaNombre);
            if (fixtureItem) items.push(fixtureItem);
        }
        return items;
    }, [user?.role, user?.disciplinaNombre]);

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className={styles.menuCard}>
            <div className={styles.menuHeader}>
                <h2 className={styles.menuTitle}>
                    {saludo}
                    <span className={styles.waveEmoji} role="img" aria-label="Saludo">👋</span>
                </h2>
                <p className={styles.menuSubtitle}>Autogestion</p>
            </div>

            <nav className={styles.menuList}>
                {menuItems.map((item) =>
                    item.externalUrl ? (
                        <a
                            key={item.path}
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.menuItem}
                        >
                            <span className={styles.menuItemLabel}>{item.label}</span>
                            <ChevronRight className={styles.menuItemIcon} size={20} />
                        </a>
                    ) : (
                        <button
                            key={item.path}
                            className={styles.menuItem}
                            onClick={() => handleMenuClick(item.path)}
                        >
                            <span className={styles.menuItemLabel}>
                                {item.label}
                                {item.path === NOTICIAS_PATH && hayNoticiasNuevas && (
                                    <span className={styles.newBadge} title="Hay noticias nuevas" aria-hidden />
                                )}
                            </span>
                            <ChevronRight className={styles.menuItemIcon} size={20} />
                        </button>
                    )
                )}
            </nav>
        </div>
    );
};
