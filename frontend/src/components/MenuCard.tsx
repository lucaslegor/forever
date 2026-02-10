import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useNoticias } from '../context/NoticiasContext';
import styles from './MenuCard.module.css';

const NOTICIAS_PATH = '/noticias';
const DIAS_NOTICIA_NUEVA = 7;

interface MenuItem {
    label: string;
    path: string;
}

const menuItems: MenuItem[] = [
    { label: 'Mi Perfil', path: '/perfil' },
    { label: 'Pagar Cuota', path: '/estado-deuda' },
    { label: 'Historial de Pagos', path: '/historial-pagos' },
    { label: 'Grupo Familiar', path: '/grupo-familiar' },
    { label: 'Noticias', path: NOTICIAS_PATH },
];

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
    const { noticias } = useNoticias();
    const hayNoticiasNuevas = noticias.some((n) => isNoticiaReciente(n.fecha));

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className={styles.menuCard}>
            <div className={styles.menuHeader}>
                <h2 className={styles.menuTitle}>DEPORTISTAS</h2>
                <p className={styles.menuSubtitle}>Sistema de Gestión</p>
            </div>

            <nav className={styles.menuList}>
                {menuItems.map((item) => (
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
                ))}
            </nav>
        </div>
    );
};
