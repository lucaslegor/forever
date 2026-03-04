import { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, DollarSign, Trash2 } from 'lucide-react';
import type { Deportista } from '../../types/admin';
import type { BecadoItem } from '../../services/beca.service';
import { useOpcionesAdmin } from '../../context/OpcionesAdminContext';
import { useConfirm } from '../../context/ConfirmContext';
import { becaService } from '../../services/beca.service';
import { deportistaService } from '../../services/deportista.service';
import { grupoFamiliarService } from '../../services/grupoFamiliar.service';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminBecas.module.css';

export const AdminBecas = () => {
    const [becados, setBecados] = useState<BecadoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deportistas, setDeportistas] = useState<(Deportista & { becado?: boolean })[]>([]);
    const [idsEnGrupoFamiliar, setIdsEnGrupoFamiliar] = useState<Set<number>>(new Set());
    const [filtroDisciplina, setFiltroDisciplina] = useState('');
    const [filtroGenero, setFiltroGenero] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [modalCuota, setModalCuota] = useState<{ deportistaId: number; nombre: string; valorActual: number } | null>(null);
    const [inputCuota, setInputCuota] = useState('');
    const { disciplinasNombres, generosNombres, getCategoriasOptions, getSubcategoriaOptions } = useOpcionesAdmin();
    const confirm = useConfirm();

    const fetchBecados = useCallback(async () => {
        setLoading(true);
        try {
            const res = await becaService.getAll(1, 500);
            const raw = res?.data?.data ?? res?.data ?? [];
            setBecados(Array.isArray(raw) ? raw : []);
        } catch {
            setBecados([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBecados();
    }, [fetchBecados]);

    const mapDeportistaFromApi = (d: any) => ({
        id: d.id,
        nombre: d.nombre,
        apellido: d.apellido,
        dni: d.dni,
        disciplina: d.disciplina?.nombre ?? '',
        genero: d.genero?.nombre ?? '',
        categoria: d.categoria?.nombre ?? '',
        subcategoria: d.subcategoria?.nombre ?? '',
        adultoResponsable: (d.adultosResponsables?.[0] || d.adultoResponsable) ? { nombre: (d.adultosResponsables?.[0] || d.adultoResponsable).nombre, apellido: (d.adultosResponsables?.[0] || d.adultoResponsable).apellido, dni: (d.adultosResponsables?.[0] || d.adultoResponsable).dni, email: (d.adultosResponsables?.[0] || d.adultoResponsable).email, telefono: (d.adultosResponsables?.[0] || d.adultoResponsable).telefono } : null,
        activo: d.cuenta?.activo ?? true,
        becado: d.becado ?? false,
    });

    const fetchDeportistas = useCallback(async () => {
        try {
            const res = await deportistaService.getAll({ limit: 10000 });
            const raw = Array.isArray(res.data) ? res.data : (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).data) ? (res.data as any).data : []);
            setDeportistas(raw.map(mapDeportistaFromApi));
        } catch {
            setDeportistas([]);
        }
    }, []);

    useEffect(() => {
        fetchDeportistas();
    }, [fetchDeportistas]);

    const fetchGruposFamiliares = useCallback(async () => {
        try {
            const res = await grupoFamiliarService.getAll(1, 500);
            const raw = res?.data?.data ?? res?.data ?? [];
            const list = Array.isArray(raw) ? raw : [];
            const ids = new Set<number>();
            list.forEach((g: any) => {
                (g.integrantes || []).forEach((i: any) => {
                    const id = i.deportistaId ?? i.deportista?.id;
                    if (id != null) ids.add(Number(id));
                });
            });
            setIdsEnGrupoFamiliar(ids);
        } catch {
            setIdsEnGrupoFamiliar(new Set());
        }
    }, []);

    useEffect(() => {
        fetchGruposFamiliares();
    }, [fetchGruposFamiliares]);

    const opcionesCategoria = useMemo(() => getCategoriasOptions(filtroDisciplina, filtroGenero), [filtroDisciplina, filtroGenero, getCategoriasOptions]);
    const opcionesSubcategoria = useMemo(() => getSubcategoriaOptions(filtroDisciplina, filtroGenero, filtroCategoria), [filtroDisciplina, filtroGenero, filtroCategoria, getSubcategoriaOptions]);

    const deportistasFiltrados = useMemo(() => {
        let list = deportistas.filter((d) => d.activo);
        if (filtroDisciplina) list = list.filter((d) => d.disciplina === filtroDisciplina);
        if (filtroGenero) list = list.filter((d) => d.genero === filtroGenero);
        if (filtroCategoria) list = list.filter((d) => d.categoria === filtroCategoria);
        if (filtroSubcategoria) list = list.filter((d) => d.subcategoria === filtroSubcategoria);
        const q = busqueda.trim().toLowerCase();
        if (q) list = list.filter((d) => d.nombre.toLowerCase().includes(q) || d.apellido.toLowerCase().includes(q) || d.dni.includes(q));
        return list;
    }, [deportistas, filtroDisciplina, filtroGenero, filtroCategoria, filtroSubcategoria, busqueda]);

    const becar = async (d: Deportista & { becado?: boolean }) => {
        if (d.becado || idsEnGrupoFamiliar.has(d.id)) return;
        try {
            await becaService.becar(d.id);
            await fetchBecados();
            await fetchDeportistas();
        } catch (err: any) {
            const msg = err.response?.data?.error ?? err.message ?? 'Error al becar';
            alert(msg);
        }
    };

    const quitarBeca = async (b: BecadoItem) => {
        const ok = await confirm({
            title: 'Quitar beca',
            message: `¿Quitar la beca a ${b.nombre} ${b.apellido}? La cuota volverá al valor normal de la disciplina.`,
            confirmLabel: 'Quitar beca',
            cancelLabel: 'Cancelar',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await becaService.quitarBeca(b.id);
            await fetchBecados();
            await fetchDeportistas();
        } catch (err: any) {
            const msg = err.response?.data?.error ?? err.message ?? 'Error al quitar beca';
            alert(msg);
        }
    };

    const abrirModalCuota = (b: BecadoItem) => {
        setModalCuota({ deportistaId: b.id, nombre: `${b.nombre} ${b.apellido}`, valorActual: b.montoEfectivo });
        setInputCuota(String(b.montoEfectivo));
    };

    const guardarCuota = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalCuota === null) return;
        const valor = Number(inputCuota.replace(',', '.'));
        if (Number.isNaN(valor) || valor < 0) {
            setModalCuota(null);
            return;
        }
        try {
            await becaService.updateCuotaBeca(modalCuota.deportistaId, valor);
            setModalCuota(null);
            await fetchBecados();
        } catch (err: any) {
            const msg = err.response?.data?.error ?? err.message ?? 'Error al actualizar cuota';
            alert(msg);
        }
    };

    const formatMoney = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

    if (loading && becados.length === 0) return <LoadingScreen fullPage />;

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión de becas</h2>
            <p className={styles.subtitle}>
                Becar deportistas de forma individual. La cuota pasa a ser el 70% del valor de la disciplina; podés actualizar el monto en casos excepcionales.
            </p>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Buscar deportista y becar</h3>
                <div className={styles.filtersRow}>
                    <label className={styles.filterItem}>
                        <span className={styles.filterLabel}>Disciplina</span>
                        <select value={filtroDisciplina} onChange={(e) => { setFiltroDisciplina(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); }} className={styles.select}>
                            <option value="">Todas</option>
                            {disciplinasNombres.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </label>
                    <label className={styles.filterItem}>
                        <span className={styles.filterLabel}>Género</span>
                        <select value={filtroGenero} onChange={(e) => { setFiltroGenero(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); }} className={styles.select}>
                            <option value="">Todos</option>
                            {generosNombres.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </label>
                    <label className={styles.filterItem}>
                        <span className={styles.filterLabel}>Categoría</span>
                        <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setFiltroSubcategoria(''); }} className={styles.select}>
                            <option value="">Todas</option>
                            {opcionesCategoria.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                    <label className={styles.filterItem}>
                        <span className={styles.filterLabel}>Subcategoría</span>
                        <select value={filtroSubcategoria} onChange={(e) => setFiltroSubcategoria(e.target.value)} className={styles.select}>
                            <option value="">Todas</option>
                            {opcionesSubcategoria.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                </div>
                <div className={styles.field}>
                    <label>Buscar por nombre o DNI</label>
                    <input
                        type="text"
                        placeholder="Nombre, apellido o DNI..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.listaDeportistas}>
                    <strong>Deportistas (click en Becar para asignar beca)</strong>
                    <ul className={styles.lista}>
                        {deportistasFiltrados.map((d) => {
                            const enGrupo = idsEnGrupoFamiliar.has(d.id);
                            const noSePuedeBecar = d.becado || enGrupo;
                            return (
                            <li key={d.id} className={styles.listaItem}>
                                <span>{d.nombre} {d.apellido} — DNI {d.dni} — {d.disciplina}, {d.subcategoria}, {d.genero}</span>
                                <button
                                    type="button"
                                    className={styles.btnBecar}
                                    onClick={() => becar(d)}
                                    disabled={noSePuedeBecar}
                                    title={d.becado ? 'Ya tiene beca' : enGrupo ? 'Pertenece a un grupo familiar (no puede tener beca individual)' : 'Asignar beca (70% de la cuota)'}
                                >
                                    <Award size={16} />
                                    {d.becado ? 'Becado' : enGrupo ? 'En grupo familiar' : 'Becar'}
                                </button>
                            </li>
                        ); })}
                    </ul>
                    {deportistasFiltrados.length === 0 && <p className={styles.emptyList}>No hay deportistas que coincidan con los filtros.</p>}
                </div>
            </section>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Deportistas becados</h3>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>DNI</th>
                                <th>Disciplina</th>
                                <th>Cuota</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {becados.length === 0 ? (
                                <tr><td colSpan={5} className={styles.emptyCell}>No hay becados. Usá el buscador de arriba para becar a un deportista.</td></tr>
                            ) : (
                                becados.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.nombre} {b.apellido}</td>
                                        <td>{b.dni}</td>
                                        <td>{b.disciplina}</td>
                                        <td>{formatMoney(b.montoEfectivo)}</td>
                                        <td>
                                            <button type="button" className={styles.btnCuota} onClick={() => abrirModalCuota(b)}>
                                                <DollarSign size={18} />
                                                Actualizar cuota
                                            </button>
                                            <button type="button" className={styles.btnQuitar} onClick={() => quitarBeca(b)}>
                                                <Trash2 size={18} />
                                                Quitar beca
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {modalCuota !== null && (
                <div className={styles.overlay} onClick={() => setModalCuota(null)}>
                    <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
                        <h3>Actualizar cuota beca — {modalCuota.nombre}</h3>
                        <p className={styles.modalHint}>Casos excepcionales: podés fijar un monto distinto al 70% del valor de la disciplina.</p>
                        <form onSubmit={guardarCuota}>
                            <div className={styles.field}>
                                <label>Monto (ARS)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={inputCuota}
                                    onChange={(e) => setInputCuota(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.btnGuardar}>Guardar</button>
                                <button type="button" className={styles.btnCancelar} onClick={() => setModalCuota(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
