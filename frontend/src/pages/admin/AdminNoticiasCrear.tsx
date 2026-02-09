import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ImagePlus, FileText } from 'lucide-react';
import { useNoticias } from '../../context/NoticiasContext';
import { RichTextEditor } from '../../components/RichTextEditor';
import styles from './AdminNoticiasCrear.module.css';

export const AdminNoticiasCrear = () => {
    const navigate = useNavigate();
    const { addNoticia } = useNoticias();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        titulo: '',
        fecha: new Date().toISOString().slice(0, 10),
        resumen: '',
        contenido: '',
        imagenes: [] as string[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        const newUrls: string[] = [];
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        let pending = imageFiles.length;
        if (pending === 0) {
            e.target.value = '';
            return;
        }
        imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') newUrls.push(reader.result);
                pending -= 1;
                if (pending === 0) {
                    setForm((f) => ({ ...f, imagenes: [...f.imagenes, ...newUrls] }));
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const quitarImagen = (index: number) => {
        setForm((f) => ({ ...f, imagenes: f.imagenes.filter((_, i) => i !== index) }));
    };

    const contenidoVacio = !form.contenido.trim() || form.contenido.trim() === '<p></p>';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (contenidoVacio) return;
        addNoticia({
            titulo: form.titulo.trim(),
            fecha: form.fecha,
            resumen: form.resumen.trim(),
            contenido: form.contenido.trim(),
            imagenes: form.imagenes.length ? form.imagenes : ['/club-background.PNG'],
        });
        setSuccess(true);
        setForm({ titulo: '', fecha: new Date().toISOString().slice(0, 10), resumen: '', contenido: '', imagenes: [] });
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>
                    <FileText size={28} aria-hidden />
                    Crear noticia
                </h1>
                <p className={styles.subtitle}>
                    Redactá la noticia como en un diario: título, resumen y texto con fotos en el contenido.
                </p>
            </header>

            {success && (
                <div className={styles.successBanner}>
                    Noticia creada correctamente. Los deportistas la verán en la sección Noticias.
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
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Galería de imágenes</h2>
                <div className={styles.imagenesSection}>
                    <label>Imágenes</label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.inputFile}
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        className={styles.btnCargarImagen}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus size={20} />
                        Cargar imágenes
                    </button>
                    {form.imagenes.length === 0 ? (
                        <p className={styles.imagenesVacio}>Aún no hay imágenes. Usá el botón para agregar una o más.</p>
                    ) : (
                        <div className={styles.imagenesLista}>
                            {form.imagenes.map((url, index) => (
                                <div key={index} className={styles.imagenItem}>
                                    <img src={url} alt="" className={styles.imagenThumb} />
                                    <button
                                        type="button"
                                        className={styles.imagenQuitar}
                                        onClick={() => quitarImagen(index)}
                                        aria-label="Quitar imagen"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </section>
                <div className={styles.actions}>
                    <button type="submit" className={styles.btnPrimary}>
                        <Save size={20} />
                        Crear noticia
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={() => navigate('/admin')}>
                        Volver al panel
                    </button>
                </div>
            </form>
        </div>
    );
};
