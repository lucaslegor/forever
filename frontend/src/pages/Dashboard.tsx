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
                                    <a
                                        href="https://wa.me/5492214280686"
                                        className={styles.sponsorCard}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src="/laucha-removebg-preview.png"
                                            alt="Lautaro Domato Nutricionista"
                                            className={styles.sponsorLogoImage}
                                        />
                                        <div className={styles.sponsorName}>Lautaro Domato Nutricionista</div>
                                        <div className={styles.sponsorTagline}>
                                            Curso de Nutrición Deportiva (FC Barcelona, Barca Innovation Hub) 2018
                                            <br />
                                            Certificación ISAK II
                                        </div>
                                        <div className={styles.sponsorPhone}>221 428-0686</div>
                                    </a>
                                    <a
                                        href="https://www.instagram.com/mapsasesoresarg/"
                                        className={styles.sponsorCard}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src="/maps.jpg"
                                            alt="MAPS ASESORES"
                                            className={styles.sponsorLogoImage}
                                        />
                                        <div className={styles.sponsorName}>MAPS ASESORES</div>
                                        <div className={styles.sponsorTagline}>
                                            Organización de seguros, <br /> coberturas integrales con asesoramiento personalizado.
                                        </div>
                                        <div className={styles.sponsorPhone}>@mapsasesoresarg</div>
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
