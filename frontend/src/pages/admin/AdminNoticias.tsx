import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Noticia } from '../../types/noticia';
import { noticiaService } from '../../services/noticia.service';
import { useConfirm } from '../../context/ConfirmContext';
import { useNoticias } from '../../context/NoticiasContext';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminNoticias.module.css';

export const AdminNoticias = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { refetch } = useNoticias();
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await noticiaService.getAllAdmin();
            const list = res?.data ?? [];
            setNoticias(Array.isArray(list) ? list : []);
        } catch {
            setNoticias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const handlePublicar = async (n: Noticia) => {
        const nuevaPublicada = !n.publicada;
        try {
            await noticiaService.setPublicada(n.id, nuevaPublicada);
            await fetchList();
            await refetch();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al actualizar');
        }
    };

    const handleBorrar = async (n: Noticia) => {
        const ok = await confirm({
            title: 'Borrar noticia',
            message: `¿Eliminar "${n.titulo}"? No se mostrará en el listado público (se puede mantener en base de datos).`,
            confirmLabel: 'Borrar',
            cancelLabel: 'Cancelar',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await noticiaService.delete(n.id);
            await fetchList();
            await refetch();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al eliminar');
        }
    };

    const formatFecha = (fecha: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha + 'T12:00:00');
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) return <LoadingScreen fullPage />;

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión de noticias</h2>
            <p className={styles.subtitle}>Listado, edición, publicar/despublicar y borrado de noticias.</p>

            <button type="button" className={styles.btnPrimary} onClick={() => navigate('/admin/noticias/crear')}>
                <Plus size={20} />
                Crear noticia
            </button>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticias.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={styles.emptyCell}>
                                    No hay noticias. Creá una desde el botón de arriba.
                                </td>
                            </tr>
                        ) : (
                            noticias.map((n) => (
                                <tr key={n.id}>
                                    <td className={styles.cellTitulo}>{n.titulo}</td>
                                    <td>{formatFecha(n.fecha)}</td>
                                    <td>
                                        <span className={n.publicada ? styles.badgePublicada : styles.badgeNoPublicada}>
                                            {n.publicada ? 'Publicada' : 'No publicada'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.btnEdit}
                                            onClick={() => navigate(`/admin/noticias/editar/${n.id}`)}
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.btnToggle}
                                            onClick={() => handlePublicar(n)}
                                            title={n.publicada ? 'Despublicar' : 'Publicar'}
                                        >
                                            {n.publicada ? <EyeOff size={18} /> : <Eye size={18} />}
                                            {n.publicada ? 'Despublicar' : 'Publicar'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.btnDelete}
                                            onClick={() => handleBorrar(n)}
                                            title="Borrar (no se muestra en público)"
                                        >
                                            <Trash2 size={18} />
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
