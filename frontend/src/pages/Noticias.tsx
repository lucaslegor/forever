import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Calendar, ChevronRight } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useNoticias } from '../context/NoticiasContext';
import { getFirstImageFromHtml } from '../utils/sanitize';
import styles from './Noticias.module.css';

export const Noticias = () => {
    const navigate = useNavigate();
    const { noticias, loading, error, refetch } = useNoticias();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club Social y Deportivo For Ever</span>
                </div>
                <h1 className={styles.title}>Noticias</h1>
                <div className={styles.headerRight} aria-hidden />
            </header>

            <main className={styles.mainContent}>
                <div className={styles.contentCard}>
                    <p className={styles.intro}>
                        <Newspaper size={22} />
                        Novedades del club
                    </p>

                    {loading ? (
                        <p className={styles.emptyState}>Cargando noticias…</p>
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <p>{error}</p>
                            <button type="button" onClick={() => refetch()} className={styles.retryButton}>
                                Reintentar
                            </button>
                        </div>
                    ) : noticias.length === 0 ? (
                        <p className={styles.emptyState}>No hay noticias publicadas.</p>
                    ) : (
                        <ul className={styles.noticiasList}>
                            {noticias.map((noticia) => {
                                const thumbSrc = noticia.imagenes?.[0] || getFirstImageFromHtml(noticia.contenido);
                                return (
                                    <li key={noticia.id}>
                                        <Link to={`/noticias/${noticia.id}`} className={styles.noticiaCard}>
                                            {thumbSrc && (
                                                <div className={styles.noticiaThumb}>
                                                    <img src={thumbSrc} alt="" className={styles.noticiaThumbImg} />
                                                </div>
                                            )}
                                            <div className={styles.noticiaCardBody}>
                                                <div className={styles.noticiaHeader}>
                                                    <h2 className={styles.noticiaTitulo}>{noticia.titulo}</h2>
                                                    <span className={styles.noticiaFecha}>
                                                        <Calendar size={18} />
                                                        {formatDate(noticia.fecha)}
                                                    </span>
                                                </div>
                                                <p className={styles.noticiaResumen}>{noticia.resumen}</p>
                                                <span className={styles.verMas}>
                                                    Ver noticia
                                                    <ChevronRight size={18} />
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className={styles.actions}>
                        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
