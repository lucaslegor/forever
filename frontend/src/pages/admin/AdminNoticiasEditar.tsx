import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, FileText } from 'lucide-react';
import { RichTextEditor } from '../../components/RichTextEditor';
import { noticiaService } from '../../services/noticia.service';
import { useNoticias } from '../../context/NoticiasContext';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminNoticiasCrear.module.css';

export const AdminNoticiasEditar = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { refetch } = useNoticias();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        titulo: '',
        fecha: new Date().toISOString().slice(0, 10),
        resumen: '',
        contenido: '',
    });

    useEffect(() => {
        let cancelled = false;
        const nId = id ? parseInt(id, 10) : NaN;
        if (Number.isNaN(nId)) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const res = await noticiaService.getByIdAdmin(nId);
                if (cancelled) return;
                if (res.success && res.data) {
                    const n = res.data;
                    setForm({
                        titulo: n.titulo ?? '',
                        fecha: (n.fecha ?? '').toString().slice(0, 10),
                        resumen: n.resumen ?? '',
                        contenido: n.contenido ?? '',
                    });
                }
            } catch {
                if (!cancelled) navigate('/admin/noticias');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id, navigate]);

    const contenidoVacio = !form.contenido.trim() || form.contenido.trim() === '<p></p>';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contenidoVacio) return;
        const nId = id ? parseInt(id, 10) : NaN;
        if (Number.isNaN(nId)) return;
        setSaving(true);
        try {
            const res = await noticiaService.update(nId, {
                titulo: form.titulo.trim(),
                fecha: form.fecha,
                resumen: form.resumen.trim(),
                contenido: form.contenido.trim(),
                imagenes: [],
            });
            if (res.success) {
                setSuccess(true);
                await refetch();
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen fullPage />;

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>
                    <FileText size={28} aria-hidden />
                    Editar noticia
                </h1>
                <p className={styles.subtitle}>
                    Modificá título, fecha, resumen y contenido. Guardá los cambios al final.
                </p>
            </header>

            {success && (
                <div className={styles.successBanner}>
                    Noticia actualizada correctamente.
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Datos de la noticia</h2>
                    <div className={styles.field}>
                        <label htmlFor="noticia-titulo">Título *</label>
                        <input
                            id="noticia-titulo"
                            className={styles.input}
                            value={form.titulo}
                            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                            required
                            placeholder="Ej: Inicio de temporada 2026"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="noticia-fecha">Fecha *</label>
                        <input
                            id="noticia-fecha"
                            type="date"
                            className={styles.input}
                            value={form.fecha}
                            onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="noticia-resumen">Resumen *</label>
                        <textarea
                            id="noticia-resumen"
                            className={styles.input}
                            value={form.resumen}
                            onChange={(e) => setForm((f) => ({ ...f, resumen: e.target.value }))}
                            required
                            rows={2}
                            placeholder="Breve descripción para la lista"
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Texto completo (estilo diario)</h2>
                    <div className={styles.field}>
                        <label id="contenido-label">Contenido *</label>
                        <RichTextEditor
                            value={form.contenido}
                            onChange={(html) => setForm((f) => ({ ...f, contenido: html }))}
                            minHeight="240px"
                        />
                        {contenidoVacio && (
                            <p className={styles.fieldError} role="alert">El contenido es obligatorio.</p>
                        )}
                    </div>
                </section>
                <div className={styles.actions}>
                    <button type="submit" className={styles.btnPrimary} disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={() => navigate('/admin/noticias')}>
                        Volver al listado
                    </button>
                </div>
            </form>
        </div>
    );
};
