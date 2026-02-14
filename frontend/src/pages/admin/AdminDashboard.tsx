import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, UserCircle, Shield, Trophy, FileText, CalendarDays, Award, BarChart3, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminDashboard.module.css';

const allCards = [
    { to: '/admin/deportistas', label: 'Gestión deportistas', icon: Users, desc: 'Crear y dar de baja deportistas' },
    { to: '/admin/cuotas', label: 'Gestión cuotas', icon: DollarSign, desc: 'Marcar cuotas en efectivo como pagadas' },
    { to: '/admin/grupos-familiares', label: 'Gestión grupo familiar', icon: UserCircle, desc: 'Crear, modificar y borrar grupos' },
    { to: '/admin/becas', label: 'Gestión de becas', icon: Award, desc: 'Becar deportistas (cuota 70%) y actualizar montos' },
    { to: '/admin/admins', label: 'Gestión admin', icon: Shield, desc: 'Administrar usuarios admin', principalAdminOnly: true },
    { to: '/admin/disciplinas', label: 'Gestión disciplinas', icon: Trophy, desc: 'ABM y valor por disciplina' },
    { to: '/admin/cancha', label: 'Alquiler cancha', icon: CalendarDays, desc: 'Turnos, seña y pago en cancha' },
    { to: '/admin/noticias', label: 'Gestión noticias', icon: FileText, desc: 'Listar, editar, publicar/despublicar y borrar noticias' },
    { to: '/admin/reportes', label: 'Reportes', icon: BarChart3, desc: 'Recaudación por disciplina/género/categoría, deudores, exportar Excel/PDF' },
    { to: '/admin/auditoria', label: 'Auditoría', icon: ClipboardList, desc: 'Log de acciones (altas, bajas, pagos, cambios) para soporte y seguridad', principalAdminOnly: true },
];

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isPrincipalAdmin } = useAuth();
    const cards = allCards.filter((c) => !(c as { principalAdminOnly?: boolean }).principalAdminOnly || isPrincipalAdmin);

    return (
        <div className={styles.dashboard}>
            <h2 className={styles.pageTitle}>Panel de administración</h2>
            <p className={styles.intro}>Seleccioná una sección para gestionar.</p>
            <div className={styles.grid}>
                {cards.map(({ to, label, icon: Icon, desc }) => (
                    <button
                        key={to}
                        type="button"
                        className={styles.card}
                        onClick={() => navigate(to)}
                    >
                        <div className={styles.cardIcon}>
                            <Icon size={32} />
                        </div>
                        <h3 className={styles.cardTitle}>{label}</h3>
                        <p className={styles.cardDesc}>{desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
