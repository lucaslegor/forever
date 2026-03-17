import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import type { Disciplina } from '../../types/admin';
import { useOpcionesAdmin } from '../../context/OpcionesAdminContext';
import { useConfirm } from '../../context/ConfirmContext';
import { AlertModal } from '../../components/AlertModal';
import { clasificacionService } from '../../services/clasificacion.service';
import { disciplinaService } from '../../services/disciplina.service';
import styles from './AdminDisciplinas.module.css';

export const AdminDisciplinas = () => {
    const {
        disciplinas,
        setDisciplinas,
        generosNombres,
        categorias,
        categoriasNombres,
        subcategoriasPorKey,
        setSubcategoriasPorKey,
        disciplinasNombres,
        refetch,
    } = useOpcionesAdmin();
    const [borrandoSubcatId, setBorrandoSubcatId] = useState<number | null>(null);
    const confirm = useConfirm();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ nombre: '', valorMensual: 10000 });

    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [nuevaSubcat, setNuevaSubcat] = useState({ disciplina: '', categoria: '', genero: '', nombre: '' });

    const openCrear = () => {
        setForm({ nombre: '', valorMensual: 10000 });
        setEditingId(null);
        setShowForm(true);
    };

    const openEditar = (d: Disciplina) => {
        setForm({ nombre: d.nombre, valorMensual: d.valorMensual });
        setEditingId(d.id);
        setShowForm(true);
    };

    const [guardando, setGuardando] = useState(false);
    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            if (editingId !== null) {
                await disciplinaService.update(editingId, {
                    nombre: form.nombre.trim(),
                    precioMensual: form.valorMensual,
                });
            } else {
                await disciplinaService.create({
                    nombre: form.nombre.trim(),
                    precioMensual: form.valorMensual,
                });
            }
            await refetch();
            setShowForm(false);
        } catch (err: any) {
            setAdvertenciaModal({ message: err.response?.data?.message || 'Error al guardar la disciplina' });
        } finally {
            setGuardando(false);
        }
    };

    const borrar = async (id: number) => {
        const ok = await confirm({
            title: 'Dar de baja disciplina',
            message: '¿Dar de baja esta disciplina?',
            confirmLabel: 'Dar de baja',
            cancelLabel: 'Cancelar',
            variant: 'danger',
        });
        if (ok) setDisciplinas((prev) => prev.map((d) => (d.id === id ? { ...d, activo: false } : d)));
    };

    const reactivar = (id: number) => {
        setDisciplinas((prev) => prev.map((d) => (d.id === id ? { ...d, activo: true } : d)));
    };

    const [guardandoCategoria, setGuardandoCategoria] = useState(false);
    const [borrandoCategoriaId, setBorrandoCategoriaId] = useState<number | null>(null);
    const [advertenciaModal, setAdvertenciaModal] = useState<{ title?: string; message: string } | null>(null);

    const agregarCategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = nuevaCategoria.trim();
        if (!v) return;
        if (categorias.some((c) => c.nombre.toLowerCase() === v.toLowerCase())) {
            setAdvertenciaModal({ message: 'Ya existe una categoría con ese nombre.' });
            return;
        }
        setGuardandoCategoria(true);
        try {
            await clasificacionService.createCategoria(v);
            setNuevaCategoria('');
            await refetch();
        } catch (err: any) {
            setAdvertenciaModal({ message: err.response?.data?.error || err.response?.data?.message || err.message || 'Error al crear la categoría' });
        } finally {
            setGuardandoCategoria(false);
        }
    };

    const quitarCategoria = async (id: number) => {
        if (borrandoCategoriaId !== null) return;
        setBorrandoCategoriaId(id);
        try {
            await clasificacionService.deleteCategoria(id);
            await refetch();
        } catch (err: any) {
            setAdvertenciaModal({ message: err.response?.data?.error || err.response?.data?.message || err.message || 'Error al eliminar la categoría' });
        } finally {
            setBorrandoCategoriaId(null);
        }
    };

    const agregarSubcategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        const { disciplina, categoria, genero, nombre } = nuevaSubcat;
        const n = nombre.trim();
        if (!n || !disciplina || !categoria || !genero) return;
        
        try {
            await clasificacionService.createSubcategoria({
                nombre: n,
                disciplinaNombre: disciplina,
                categoriaNombre: categoria,
                generoNombre: genero,
            });
            
            // Refrescar opciones desde el backend
            await refetch();
            
            setNuevaSubcat({ disciplina: '', categoria: '', genero: '', nombre: '' });
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Error al crear la subcategoría';
            setAdvertenciaModal({ message: msg });
        }
    };

    const quitarSubcategoria = async (key: string, item: { id: number; nombre: string }) => {
        if (borrandoSubcatId !== null) return;
        setBorrandoSubcatId(item.id);
        try {
            await clasificacionService.deleteSubcategoria(item.id);
            await refetch();
        } catch (err: any) {
            setAdvertenciaModal({ message: err.response?.data?.error || err.response?.data?.message || err.message || 'Error al borrar la subcategoría' });
        } finally {
            setBorrandoSubcatId(null);
        }
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión disciplinas</h2>
            <p className={styles.subtitle}>ABM de disciplinas, géneros, categorías y subcategorías. Actualizar el valor de cada disciplina.</p>

            {/* Disciplinas */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Disciplinas</h3>
                <p className={styles.sectionHint}>Agregar o editar disciplinas y su valor mensual.</p>
                {!showForm ? (
                    <button type="button" className={styles.btnPrimary} onClick={openCrear}>
                        <Plus size={20} />
                        Crear disciplina
                    </button>
                ) : (
                    <form onSubmit={guardar} className={styles.form}>
                        <h3 className={styles.formTitle}>{editingId ? 'Editar disciplina' : 'Nueva disciplina'}</h3>
                        <div className={styles.field}>
                            <label>Nombre *</label>
                            <input
                                className={styles.input}
                                value={form.nombre}
                                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                placeholder="Ej: Futbol, Hockey, Voley"
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Valor mensual (ARS) *</label>
                            <input
                                type="number"
                                min={0}
                                className={styles.input}
                                value={form.valorMensual}
                                onChange={(e) => setForm((f) => ({ ...f, valorMensual: Number(e.target.value) || 0 }))}
                                required
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
                            {guardando ? 'Guardando…' : 'Guardar'}
                        </button>
                            <button type="button" className={styles.btnCancelar} onClick={() => setShowForm(false)}>Cancelar</button>
                        </div>
                    </form>
                )}
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Valor mensual</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disciplinas.map((d) => (
                                <tr key={d.id}>
                                    <td>{d.nombre}</td>
                                    <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(d.valorMensual)}</td>
                                    <td>
                                        <span className={d.activo ? styles.badgeActivo : styles.badgeBaja}>
                                            {d.activo ? 'Activa' : 'De baja'}
                                        </span>
                                    </td>
                                    <td>
                                        <button type="button" className={styles.btnEdit} onClick={() => openEditar(d)}>
                                            <Pencil size={18} />
                                            Editar
                                        </button>
                                        {d.activo ? (
                                            <button type="button" className={styles.btnBaja} onClick={() => borrar(d.id)}>
                                                Dar de baja
                                            </button>
                                        ) : (
                                            <button type="button" className={styles.btnAlta} onClick={() => reactivar(d.id)}>
                                                Reactivar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Géneros (fijos: Masculino, Femenino; no se agregan ni quitan desde la app) */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Géneros</h3>
                <p className={styles.sectionHint}>Géneros disponibles para clasificación (Masculino, Femenino).</p>
                <div className={styles.listInline}>
                    {generosNombres.map((g) => (
                        <span key={g} className={styles.tag}>{g}</span>
                    ))}
                </div>
            </section>

            {/* Categorías */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Categorías</h3>
                <p className={styles.sectionHint}>Categorías generales (Mayores, Juveniles, Infantiles, etc.). Agregar otras si es necesario.</p>
                <div className={styles.listInline}>
                    {categorias.map((cat) => (
                        <span key={cat.id} className={styles.tag}>
                            {cat.nombre}
                            <button
                                type="button"
                                onClick={() => quitarCategoria(cat.id)}
                                aria-label={`Quitar ${cat.nombre}`}
                                disabled={borrandoCategoriaId === cat.id}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <form onSubmit={agregarCategoria} className={styles.addRow}>
                    <div className={styles.field}>
                        <label>Nueva categoría</label>
                        <input
                            className={styles.input}
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                            placeholder="Ej: Mayores, Juveniles"
                        />
                    </div>
                    <button type="submit" className={styles.btnGuardar} disabled={guardandoCategoria}>
                        {guardandoCategoria ? 'Agregando...' : 'Agregar'}
                    </button>
                </form>
            </section>

            {/* Subcategorías */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Subcategorías</h3>
                <p className={styles.sectionHint}>Subcategorías por disciplina, categoría y género. Seleccionar disciplina, categoría y género, luego agregar el nombre.</p>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Disciplina | Categoría | Género</th>
                                <th>Subcategorías</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(subcategoriasPorKey).map(([key, vals]) => (
                                <tr key={key}>
                                    <td>{key.replace(/\|/g, ' · ')}</td>
                                    <td>
                                        <div className={styles.listInline}>
                                            {vals.map((v) => (
                                                <span key={v.id} className={styles.tag}>
                                                    {v.nombre}
                                                    <button
                                                        type="button"
                                                        onClick={() => quitarSubcategoria(key, v)}
                                                        aria-label={`Quitar ${v.nombre}`}
                                                        disabled={borrandoSubcatId === v.id}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <form onSubmit={agregarSubcategoria} className={styles.form}>
                    <div className={styles.addRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                            <div className={styles.field}>
                                <label>Disciplina</label>
                                <select
                                    className={styles.input}
                                    value={nuevaSubcat.disciplina}
                                    onChange={(e) => setNuevaSubcat((s) => ({ ...s, disciplina: e.target.value }))}
                                >
                                    <option value="">Seleccionar</option>
                                    {disciplinasNombres.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Categoría</label>
                                <select
                                    className={styles.input}
                                    value={nuevaSubcat.categoria}
                                    onChange={(e) => setNuevaSubcat((s) => ({ ...s, categoria: e.target.value }))}
                                >
                                    <option value="">Seleccionar</option>
                                    {categoriasNombres.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Género</label>
                                <select
                                    className={styles.input}
                                    value={nuevaSubcat.genero}
                                    onChange={(e) => setNuevaSubcat((s) => ({ ...s, genero: e.target.value }))}
                                >
                                    <option value="">Seleccionar</option>
                                    {generosNombres.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Nombre subcategoría</label>
                                <input
                                    className={styles.input}
                                    value={nuevaSubcat.nombre}
                                    onChange={(e) => setNuevaSubcat((s) => ({ ...s, nombre: e.target.value }))}
                                    placeholder="Ej: Primera, Octava"
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.btnGuardar}>Agregar subcategoría</button>
                    </div>
                </form>
            </section>

            <AlertModal
                open={!!advertenciaModal}
                title={advertenciaModal?.title ?? 'Aviso'}
                message={advertenciaModal?.message ?? ''}
                onAccept={() => setAdvertenciaModal(null)}
            />
        </div>
    );
};
