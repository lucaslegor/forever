import { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle, CalendarPlus, Trash2, List, ChevronDown, ChevronUp } from 'lucide-react';
import type { CuotaAdmin } from '../../types/admin';
import { useOpcionesAdmin } from '../../context/OpcionesAdminContext';
import { cuotaService } from '../../services/cuota.service';
import styles from './AdminCuotas.module.css';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const now = new Date();
const MES_ACTUAL = now.getMonth() + 1;
const ANIO_ACTUAL = now.getFullYear();
const ANIO_MINIMO = 2026;
const ANIOS_OPCIONES = Array.from(
  { length: (ANIO_ACTUAL + 1) - ANIO_MINIMO + 1 },
  (_, i) => ANIO_MINIMO + i
);

export const AdminCuotas = () => {
    const { disciplinas, disciplinasNombres, generosNombres, getCategoriasOptions, getSubcategoriaOptions } = useOpcionesAdmin();
    const [cuotas, setCuotas] = useState<CuotaAdmin[]>([]);
    const [loadingGestion, setLoadingGestion] = useState(false);
    const [mesGenerar, setMesGenerar] = useState(MES_ACTUAL);
    const [anioGenerar, setAnioGenerar] = useState(Math.max(ANIO_ACTUAL, ANIO_MINIMO));
    const [generando, setGenerando] = useState(false);
    const [mensajeGenerar, setMensajeGenerar] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [anioListado, setAnioListado] = useState(Math.max(ANIO_ACTUAL, ANIO_MINIMO));
    const [mesListado, setMesListado] = useState<number | ''>(MES_ACTUAL);
    const [listadoGeneradas, setListadoGeneradas] = useState<any[]>([]);
    const [loadingListado, setLoadingListado] = useState(false);
    const [borrandoGeneracion, setBorrandoGeneracion] = useState<string | null>(null);
    const [mostrarListadoGeneradas, setMostrarListadoGeneradas] = useState(true);
    const [filtroAnio, setFiltroAnio] = useState(Math.max(ANIO_ACTUAL, ANIO_MINIMO));
    const [filtroMes, setFiltroMes] = useState<number | ''>(MES_ACTUAL);
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [filtroEfectivo, setFiltroEfectivo] = useState<boolean | 'todos'>('todos');
    const [filtroDisciplina, setFiltroDisciplina] = useState('');
    const [filtroGenero, setFiltroGenero] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const disciplinaId = useMemo(() => disciplinas.find((d) => d.nombre === filtroDisciplina)?.id, [disciplinas, filtroDisciplina]);
    const generarSeleccionValida = anioGenerar === ANIO_ACTUAL && mesGenerar === MES_ACTUAL;

    const cargarListadoGeneradas = useCallback(async () => {
        setLoadingListado(true);
        try {
            const res = await cuotaService.getAll({
                anio: anioListado,
                mes: mesListado === '' ? undefined : Number(mesListado),
                limit: 1000,
            });
            if (res.success && res.data?.data) setListadoGeneradas(res.data.data as any[]);
            else setListadoGeneradas([]);
        } catch {
            setListadoGeneradas([]);
        } finally {
            setLoadingListado(false);
        }
    }, [anioListado, mesListado]);

    const cargarCuotasGestion = useCallback(async () => {
        setLoadingGestion(true);
        try {
            const res = await cuotaService.getAll({
                anio: filtroAnio,
                mes: filtroMes === '' ? undefined : filtroMes,
                disciplinaId: disciplinaId ?? undefined,
                estado: filtroEstado || undefined,
                page,
                limit,
            });
            if (res.success && res.data) {
                const paginated = res.data as { data: any[]; total: number; page: number; limit: number; totalPages: number };
                const raw = paginated.data ?? [];
                setTotal(paginated.total ?? 0);
                setTotalPages(paginated.totalPages ?? 0);
                setCuotas(raw.map((c) => ({
                    id: c.id,
                    deportistaId: c.deportistaId ?? 0,
                    deportistaNombre: c.deportistaNombre ?? '',
                    disciplina: c.disciplina ?? '',
                    genero: c.genero ?? '',
                    categoria: c.categoria ?? '',
                    subcategoria: c.subcategoria ?? '',
                    mes: c.mes,
                    anio: c.anio,
                    monto: c.monto,
                    formaPago: (c.formaPago === 'efectivo' || c.formaPago === 'sistema' ? c.formaPago : '') as 'efectivo' | 'sistema' | '',
                    estadoCuota: c.estadoCuota === 'PAGADA' ? 'PAGADA' : 'PENDIENTE',
                    fechaPago: c.fechaPago,
                })));
            } else setCuotas([]);
        } catch {
            setCuotas([]);
        } finally {
            setLoadingGestion(false);
        }
    }, [filtroAnio, filtroMes, disciplinaId, filtroEstado, page, limit]);

    useEffect(() => {
        cargarCuotasGestion();
    }, [cargarCuotasGestion]);

    useEffect(() => {
        cargarListadoGeneradas();
    }, []);

    const marcarComoPagada = async (id: number) => {
        try {
            const res = await cuotaService.marcarPagadaEfectivo(id);
            if (res.success) await cargarCuotasGestion();
        } catch {
            // error silencioso o toast
        }
    };

    /** Agrupar por mes y disciplina: una fila por (año, mes, disciplina). */
    const listadoAgrupado = useMemo(() => {
        const map = new Map<string, { anio: number; mes: number; disciplinaId: number; disciplina: string }>();
        for (const c of listadoGeneradas) {
            if (c.disciplinaId == null) continue;
            const key = `${c.anio}-${c.mes}-${c.disciplinaId}`;
            if (!map.has(key)) {
                map.set(key, {
                    anio: c.anio,
                    mes: c.mes,
                    disciplinaId: c.disciplinaId,
                    disciplina: c.disciplina ?? '',
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => a.mes - b.mes || a.disciplina.localeCompare(b.disciplina));
    }, [listadoGeneradas]);

    const borrarGeneracion = async (anio: number, mes: number, disciplinaId: number) => {
        const key = `${anio}-${mes}-${disciplinaId}`;
        setBorrandoGeneracion(key);
        try {
            const res = await cuotaService.deletePorGeneracion(anio, mes, disciplinaId);
            if (res.success) await cargarListadoGeneradas();
        } finally {
            setBorrandoGeneracion(null);
        }
    };

    const generarCuotasMensuales = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensajeGenerar(null);
        setGenerando(true);
        try {
            const res = await cuotaService.generarMensual(mesGenerar, anioGenerar);
            if (res.success && res.data) {
                const d = res.data as { cuotasGeneradas?: number; cuotasOmitidas?: number; mensaje?: string };
                setMensajeGenerar({
                    tipo: 'ok',
                    texto: d.mensaje || `Generadas: ${d.cuotasGeneradas ?? 0}, omitidas (ya existían): ${d.cuotasOmitidas ?? 0}.`,
                });
                setAnioListado(anioGenerar);
                setMesListado(mesGenerar);
                await cargarListadoGeneradas();
            } else {
                setMensajeGenerar({ tipo: 'error', texto: (res as any).error || 'Error al generar cuotas.' });
            }
        } catch (err: any) {
            setMensajeGenerar({
                tipo: 'error',
                texto: err.response?.data?.error || err.message || 'Error al generar cuotas.',
            });
        } finally {
            setGenerando(false);
        }
    };

    const opcionesCategoria = useMemo(() => getCategoriasOptions(filtroDisciplina, filtroGenero), [filtroDisciplina, filtroGenero, getCategoriasOptions]);
    const opcionesSubcategoria = useMemo(() => getSubcategoriaOptions(filtroDisciplina, filtroGenero, filtroCategoria), [filtroDisciplina, filtroGenero, filtroCategoria, getSubcategoriaOptions]);

    const listadoPorFiltros = useMemo(() => {
        let list = cuotas;
        if (filtroDisciplina) list = list.filter((c) => c.disciplina === filtroDisciplina);
        if (filtroGenero) list = list.filter((c) => c.genero === filtroGenero);
        if (filtroCategoria) list = list.filter((c) => c.categoria === filtroCategoria);
        if (filtroSubcategoria) list = list.filter((c) => c.subcategoria === filtroSubcategoria);
        return list;
    }, [cuotas, filtroDisciplina, filtroGenero, filtroCategoria, filtroSubcategoria]);

    const listado = filtroEfectivo === 'todos'
        ? listadoPorFiltros
        : filtroEfectivo
            ? listadoPorFiltros.filter((c) => c.formaPago === 'efectivo')
            : listadoPorFiltros.filter((c) => c.formaPago === 'sistema');

    const pendientesEfectivo = listado.filter((c) => c.formaPago === 'efectivo' && c.estadoCuota === 'PENDIENTE');

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión cuotas</h2>
            <p className={styles.subtitle}>Modificar las cuotas pagadas en efectivo a pagadas.</p>

            <section className={styles.sectionGenerar}>
                <h3 className={styles.sectionGenerarTitle}>Generar cuotas mensuales</h3>
                <p className={styles.sectionGenerarHint}>Genera las cuotas del mes para todos los deportistas (útil para probar sin esperar al cron).</p>
                <form onSubmit={generarCuotasMensuales} className={styles.formGenerar}>
                    <label className={styles.labelGenerar}>
                        <span>Mes</span>
                        <select
                            value={mesGenerar}
                            onChange={(e) => setMesGenerar(Number(e.target.value))}
                            className={styles.selectGenerar}
                            disabled={generando}
                        >
                            {MESES.map((nombre, i) => (
                                <option
                                    key={nombre}
                                    value={i + 1}
                                    disabled={anioGenerar !== ANIO_ACTUAL || (i + 1) !== MES_ACTUAL}
                                >
                                    {nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.labelGenerar}>
                        <span>Año</span>
                        <select
                            value={anioGenerar}
                            onChange={(e) => setAnioGenerar(Number(e.target.value))}
                            className={styles.selectGenerar}
                            disabled={generando}
                        >
                            {ANIOS_OPCIONES.map((a) => (
                                <option key={a} value={a} disabled={a !== ANIO_ACTUAL}>{a}</option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="submit"
                        className={styles.btnGenerar}
                        disabled={generando || !generarSeleccionValida}
                        title={!generarSeleccionValida ? 'Solo se pueden generar cuotas del mes en curso' : undefined}
                    >
                        <CalendarPlus size={18} />
                        {generando ? 'Generando…' : 'Generar cuotas mensuales'}
                    </button>
                </form>
                {!generarSeleccionValida && (
                    <p className={styles.sectionGenerarHint} style={{ marginTop: '0.5rem', color: '#c62828' }}>
                        Solo se pueden generar cuotas del mes en curso.
                    </p>
                )}
                {mensajeGenerar && (
                    <p className={mensajeGenerar.tipo === 'ok' ? styles.msgOk : styles.msgError}>
                        {mensajeGenerar.texto}
                    </p>
                )}
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: mostrarListadoGeneradas ? '0.5rem' : 0 }}>
                        <h4 className={styles.sectionGenerarTitle} style={{ fontSize: '1rem', margin: 0 }}>
                            <List size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            Listado de cuotas generadas
                        </h4>
                        <button
                            type="button"
                            className={styles.btnGenerar}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => setMostrarListadoGeneradas((v) => !v)}
                        >
                            {mostrarListadoGeneradas ? <><ChevronUp size={16} /> Ocultar listado</> : <><ChevronDown size={16} /> Mostrar listado</>}
                        </button>
                    </div>
                    {mostrarListadoGeneradas && (
                    <>
                    <div className={styles.formGenerar} style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label className={styles.labelGenerar}>
                            <span>Año</span>
                            <select value={anioListado} onChange={(e) => setAnioListado(Number(e.target.value))} className={styles.selectGenerar}>
                                {ANIOS_OPCIONES.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.labelGenerar}>
                            <span>Mes</span>
                            <select value={mesListado} onChange={(e) => setMesListado(e.target.value === '' ? '' : Number(e.target.value))} className={styles.selectGenerar}>
                                <option value="">Todos</option>
                                {MESES.map((nombre, i) => (
                                    <option key={nombre} value={i + 1}>{nombre}</option>
                                ))}
                            </select>
                        </label>
                        <button type="button" className={styles.btnGenerar} onClick={cargarListadoGeneradas} disabled={loadingListado}>
                            {loadingListado ? 'Cargando…' : 'Actualizar listado'}
                        </button>
                    </div>
                    {loadingListado ? (
                        <p className={styles.loading}>Cargando listado…</p>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Cuota generada</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listadoAgrupado.length === 0 ? (
                                        <tr><td colSpan={2} className={styles.empty}>Sin cuotas para este período.</td></tr>
                                    ) : (
                                        listadoAgrupado.map((g) => {
                                            const key = `${g.anio}-${g.mes}-${g.disciplinaId}`;
                                            const borrando = borrandoGeneracion === key;
                                            const label = `Cuota ${MESES[g.mes - 1]} ${g.disciplina}`;
                                            return (
                                                <tr key={key}>
                                                    <td><strong>{label}</strong></td>
                                                    <td className={styles.cellActions}>
                                                        <button
                                                            type="button"
                                                            className={styles.btnBorrar}
                                                            onClick={() => borrarGeneracion(g.anio, g.mes, g.disciplinaId)}
                                                            disabled={borrando}
                                                            title="Borrar generación de este mes y disciplina"
                                                        >
                                                            <Trash2 size={16} />
                                                            {borrando ? '…' : 'Borrar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </>
                    )}
                </div>
            </section>

            <section className={styles.sectionGenerar} style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3 className={styles.sectionGenerarTitle}>Gestión de cuotas de deportistas</h3>
                <p className={styles.sectionGenerarHint}>Filtrar por año y mes, ver quién pagó y marcar como pagada en efectivo (pago en sede o error de sistema).</p>

                <div className={styles.filtersRow}>
                    <div className={styles.filters}>
                        <label>
                            <span className={styles.filterLabel}>Año</span>
                            <select value={filtroAnio} onChange={(e) => { setFiltroAnio(Number(e.target.value)); setPage(1); }}>
                                {ANIOS_OPCIONES.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={styles.filterLabel}>Mes</span>
                            <select value={filtroMes} onChange={(e) => { setFiltroMes(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}>
                                <option value="">Todos</option>
                                {MESES.map((nombre, i) => (
                                    <option key={nombre} value={i + 1}>{nombre}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={styles.filterLabel}>Disciplina</span>
                            <select value={filtroDisciplina} onChange={(e) => { setFiltroDisciplina(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); setPage(1); }}>
                                <option value="">Todas</option>
                                {disciplinasNombres.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className={styles.filterLabel}>Estado</span>
                            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}>
                                <option value="">Todos</option>
                                <option value="PAGADA">Pagada</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="VENCIDA">Vencida</option>
                            </select>
                        </label>
                    <label>
                        <span className={styles.filterLabel}>Género</span>
                        <select value={filtroGenero} onChange={(e) => { setFiltroGenero(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); }}>
                            <option value="">Todos</option>
                            {generosNombres.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className={styles.filterLabel}>Categoría</span>
                        <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setFiltroSubcategoria(''); }}>
                            <option value="">Todas</option>
                            {opcionesCategoria.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </label>
                    <label>
                        <span className={styles.filterLabel}>Subcategoría</span>
                        <select value={filtroSubcategoria} onChange={(e) => setFiltroSubcategoria(e.target.value)}>
                            <option value="">Todas</option>
                            {opcionesSubcategoria.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </label>
                </div>
                <div className={styles.filters}>
                    <label>
                        <input
                            type="radio"
                            checked={filtroEfectivo === 'todos'}
                            onChange={() => setFiltroEfectivo('todos')}
                        />
                        Todas
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={filtroEfectivo === true}
                            onChange={() => setFiltroEfectivo(true)}
                        />
                        Solo efectivo
                    </label>
                </div>
                </div>

                {loadingGestion ? (
                <p className={styles.loading}>Cargando cuotas…</p>
            ) : (
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Deportista</th>
                            <th>Cuota (mes / año)</th>
                            <th>Monto</th>
                            <th>Forma de pago</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listado.length === 0 && !loadingGestion ? (
                            <tr><td colSpan={6} className={styles.empty}>No hay cuotas para los filtros seleccionados.</td></tr>
                        ) : (
                        listado.map((c) => (
                            <tr key={c.id}>
                                <td>{c.deportistaNombre}</td>
                                <td>{MESES[c.mes - 1]} {c.anio}</td>
                                <td>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(c.monto)}</td>
                                <td>{c.formaPago === 'efectivo' ? 'Efectivo' : c.formaPago === 'sistema' ? 'Sistema' : '—'}</td>
                                <td>
                                    <span className={c.estadoCuota === 'PAGADA' ? styles.badgePagada : styles.badgePendiente}>
                                        {c.estadoCuota === 'PAGADA' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className={styles.cellActions}>
                                    {c.estadoCuota === 'PENDIENTE' && (
                                        <button
                                            type="button"
                                            className={styles.btnPagar}
                                            onClick={() => void marcarComoPagada(c.id)}
                                            title="Pago en efectivo en sede o corrección por error de sistema"
                                        >
                                            <CheckCircle size={18} />
                                            Marcar pagada
                                        </button>
                                    )}
                                    {c.estadoCuota === 'PAGADA' && c.fechaPago && (
                                        <span className={styles.fechaPago}>Pagado: {new Date(c.fechaPago).toLocaleDateString('es-AR')}</span>
                                    )}
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
            )}
                {total > 0 && !loadingGestion && (
                    <div className={styles.pagination}>
                        <span>Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}</span>
                        <div className={styles.paginationButtons}>
                            <button type="button" className={styles.btnPagination} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                            <span className={styles.paginationInfo}>Página {page} de {totalPages || 1}</span>
                            <button type="button" className={styles.btnPagination} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
                        </div>
                    </div>
                )}
                {!loadingGestion && pendientesEfectivo.length === 0 && listado.length > 0 && filtroEfectivo === true && (
                    <p className={styles.empty}>No hay cuotas en efectivo pendientes.</p>
                )}
            </section>
        </div>
    );
};
