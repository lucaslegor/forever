import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Users, DollarSign, UserCircle, Shield, Trophy, FileText, Home, KeyRound, User, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Footer } from '../../components/Footer';
import styles from './AdminLayout.module.css';

const menuItems = [
    { to: '/admin', label: 'Inicio', icon: Home },
    { to: '/admin/perfil', label: 'Mi perfil', icon: User },
    { to: '/admin/deportistas', label: 'Gestión deportistas', icon: Users },
    { to: '/admin/cuotas', label: 'Gestión cuotas', icon: DollarSign },
    { to: '/admin/grupos-familiares', label: 'Gestión grupo familiar', icon: UserCircle },
    { to: '/admin/admins', label: 'Gestión admin', icon: Shield },
    { to: '/admin/restablecer-contrasena', label: 'Restablecer contraseña', icon: KeyRound },
    { to: '/admin/disciplinas', label: 'Gestión disciplinas', icon: Trophy },
    { to: '/admin/cancha', label: 'Alquiler cancha', icon: CalendarDays },
    { to: '/admin/noticias/crear', label: 'Crear noticias', icon: FileText },
];

export const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout, user, isPrincipalAdmin } = useAuth();

    const visibleMenuItems = menuItems.filter((item) => {
        if (item.to === '/admin/admins') return isPrincipalAdmin;
        return true;
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={styles.adminPage}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club For Ever – Panel Admin</span>
                </div>
                <h1 className={styles.title}>Administración</h1>
                <div className={styles.headerRight}>
                    <span className={styles.userEmail}>{user?.loginId}</span>
                    <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={20} />
                        Salir
                    </button>
                </div>
            </header>

            <div className={styles.body}>
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        {visibleMenuItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/admin'}
                                className={({ isActive }) =>
                                    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                                }
                            >
                                <Icon size={20} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <main className={styles.main}>
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
};
