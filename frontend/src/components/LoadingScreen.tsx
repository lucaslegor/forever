import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
    /** Mensaje debajo del logo (default: "Cargando") */
    message?: string;
    /** Si es true, ocupa toda la pantalla centrada; si no, solo el contenido */
    fullPage?: boolean;
}

export const LoadingScreen = ({ message = 'Cargando', fullPage = true }: LoadingScreenProps) => {
    return (
        <div className={fullPage ? styles.wrapperFull : styles.wrapperInline}>
            <div className={styles.card}>
                <img src="/forever.png" alt="Club For Ever" className={styles.logo} />
                <p className={styles.text} aria-live="polite">
                    {message}<span className={styles.dots} aria-hidden><span>.</span><span>.</span><span>.</span></span>
                </p>
            </div>
        </div>
    );
};
