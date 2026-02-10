import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useNoticias } from '../context/NoticiasContext';
import { sanitizeHtml, wrapImageGalleries } from '../utils/sanitize';
import styles from './NoticiaDetalle.module.css';

export const NoticiaDetalle = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getNoticiaById } = useNoticias();
    const noticia = id ? getNoticiaById(Number(id)) : undefined;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    if (!noticia) {
        return (
            <div className={styles.page}>
                <main className={styles.mainContent}>
                    <div className={styles.contentCard}>
                        <p className={styles.emptyState}>Noticia no encontrada.</p>
                        <button type="button" className={styles.backButton} onClick={() => navigate('/noticias')}>
                            <ArrowLeft size={20} />
                            Volver a Noticias
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

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
                <article className={styles.contentCard}>
                    <header className={styles.noticiaHeader}>
                        <h2 className={styles.noticiaTitulo}>{noticia.titulo}</h2>
                        <time className={styles.noticiaFecha} dateTime={noticia.fecha}>
                            <Calendar size={20} />
                            {formatDate(noticia.fecha)}
                        </time>
                    </header>

                    <p className={styles.resumen}>{noticia.resumen}</p>

                    <div className={styles.contenido}>
                        {/<[a-z][\s\S]*>/i.test(noticia.contenido) ? (
                            <div dangerouslySetInnerHTML={{ __html: wrapImageGalleries(sanitizeHtml(noticia.contenido)) }} />
                        ) : (
                            noticia.contenido
                                .split(/\n\n+/)
                                .map((parrafo, i) =>
                                    parrafo.trim() ? <p key={i}>{parrafo}</p> : null
                                )
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
};
