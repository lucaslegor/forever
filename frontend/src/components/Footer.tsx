import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

const INSTAGRAM_URL = 'https://instagram.com';
const FACEBOOK_URL = 'https://facebook.com';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.logo} />
                    <span className={styles.clubName}>Club Social y Deportivo For Ever</span>
                </div>

                <div className={styles.footerGrid}>
                    <div className={styles.footerBlock}>
                        <h3 className={styles.blockTitle}>Redes</h3>
                        <div className={styles.socialLinks}>
                            <a href={"https://www.instagram.com/cscdforever/"} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                                <Instagram size={20} />
                                <span>Instagram</span>
                            </a>
                            <a href={"https://www.facebook.com/CSCDForEver?locale=es_LA"} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                                <Facebook size={20} />
                                <span>Facebook</span>
                            </a>
                        </div>
                    </div>

                    <div className={styles.footerBlock}>
                        <h3 className={styles.blockTitle}>Dirección</h3>
                        <div className={styles.addressList}>
                            <div className={styles.addressItem}>
                                <span className={styles.addressLabel}>Sede Social:</span>
                                <a
                                    href="https://maps.google.com/?q=Av.+73+520+La+Plata"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerLink}
                                >
                                    <MapPin size={16} />
                                    <span> Calle 116 e/ 62 y 63, La Plata</span>
                                </a>
                            </div>
                            <div className={styles.addressItem}>
                                <span className={styles.addressLabel}>Predio Entrenamiento y Localía:</span>
                                <a
                                    href="https://maps.google.com/?q=Calle+485+25+La+Plata"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerLink}
                                >
                                    <MapPin size={16} />
                                    <span>Calle 485 esq. 25, La Plata</span>
                                </a>
                            </div>
                            <div className={styles.addressItem}>
                                <span className={styles.addressLabel}>Predio Oficial del Club:</span>
                                <a
                                    href="https://maps.google.com/?q=Calle+483+La+Plata"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerLink}
                                >
                                    <MapPin size={16} />
                                    <span>Calle 483, La Plata</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerBlock}>
                        <h3 className={styles.blockTitle}>Contacto</h3>
                        <div className={styles.contactLinks}>
                            <a href="mailto:contacto@clubforever.com" className={styles.footerLink}>
                                <Mail size={18} />
                                <span>contacto@clubforever.com</span>
                            </a>
                            <a href="tel:+542214211475" className={styles.footerLink}>
                                <Phone size={18} />
                                <span>(221) 426-6684</span>
                                <br />
                                <Phone size={18} />
                                <span>(221) 558-5761</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.copyright}>
                    © {new Date().getFullYear()} Club For Ever de La Plata. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};
