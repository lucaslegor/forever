import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MenuCard } from '../components/MenuCard';
import { Footer } from '../components/Footer';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.imageHeader}>
                <button className={styles.logoutButton} onClick={handleLogout} title="Cerrar sesión">
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                </button>
            </div>

            <div className={styles.dashboardContent}>
                <div className={styles.menuCardWrapper}>
                    <MenuCard />
                </div>
                <section className={styles.sponsorsStrip} aria-label="Sponsors">
                    <h3 className={styles.sponsorsStripTitle}>Sponsoreado por</h3>
                    <div className={styles.sponsorsTrackWrap}>
                        <div className={styles.sponsorsTrack}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className={styles.sponsorsSet} aria-hidden={i > 1}>
                                    <a href="tel:+5491112345678" className={styles.sponsorCard} target="_blank" rel="noopener noreferrer">
                                        <div className={styles.sponsorLogoLD}>LD</div>
                                        <div className={styles.sponsorName}>Lautaro Domato Nutricionista</div>
                                        <div className={styles.sponsorTagline}>Especializado en nutrición deportiva</div>
                                        <div className={styles.sponsorPhone}>11 1234-5678</div>
                                    </a>
                                    <a href="tel:+5491155678901" className={styles.sponsorCard} target="_blank" rel="noopener noreferrer">
                                        <div className={styles.sponsorLogoM}>M</div>
                                        <div className={styles.sponsorName}>MAPS ASESORES</div>
                                        <div className={styles.sponsorTagline}>Tu organización de seguros de confianza</div>
                                        <div className={styles.sponsorPhone}>11 5567-8901</div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className={styles.footer}>
                <Footer />
            </div>
        </div>
    );
};
