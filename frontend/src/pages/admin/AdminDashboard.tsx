import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, UserCircle, Shield, Trophy, FileText, CalendarDays } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const cards = [
    { to: '/admin/deportistas', label: 'Gestión deportistas', icon: Users, desc: 'Crear y dar de baja deportistas' },
    { to: '/admin/cuotas', label: 'Gestión cuotas', icon: DollarSign, desc: 'Marcar cuotas en efectivo como pagadas' },
    { to: '/admin/grupos-familiares', label: 'Gestión grupo familiar', icon: UserCircle, desc: 'Crear, modificar y borrar grupos' },
    { to: '/admin/admins', label: 'Gestión admin', icon: Shield, desc: 'Administrar usuarios admin' },
    { to: '/admin/disciplinas', label: 'Gestión disciplinas', icon: Trophy, desc: 'ABM y valor por disciplina' },
    { to: '/admin/cancha', label: 'Alquiler cancha', icon: CalendarDays, desc: 'Turnos, seña y pago en cancha' },
    { to: '/admin/noticias/crear', label: 'Crear noticias', icon: FileText, desc: 'Publicar noticias del club' },
];

export const AdminDashboard = () => {
    const navigate = useNavigate();

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
