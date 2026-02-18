import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardStats, DeudorRow } from '../../services/dashboard.service';
import { exportReportesPDF, exportDeudoresPDF } from '../../utils/exportReportes';
import { useOpcionesAdmin } from '../../context/OpcionesAdminContext';
import styles from './AdminReportes.module.css';

const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const now = new Date();
const ANIO_ACTUAL = now.getFullYear();
const ANIO_MINIMO = 2026;
const ANIOS_OPCIONES = Array.from(
  { length: Math.max(1, ANIO_ACTUAL - ANIO_MINIMO + 1) },
  (_, i) => ANIO_MINIMO + i
);

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

export const AdminReportes = () => {
  const { disciplinas, generos, categorias, subcategoriasPorKey, getCategoriasOptions } = useOpcionesAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deudores, setDeudores] = useState<DeudorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeudores, setLoadingDeudores] = useState(true);
  const [anio, setAnio] = useState<number | ''>(Math.max(ANIO_ACTUAL, ANIO_MINIMO));
  const [mes, setMes] = useState<number | ''>('');
  const [filtroDisciplinaId, setFiltroDisciplinaId] = useState<number | ''>('');
  const [filtroGeneroId, setFiltroGeneroId] = useState<number | ''>('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState<number | ''>('');
  const [filtroSubcategoriaId, setFiltroSubcategoriaId] = useState<number | ''>('');
  const [filtroAnioDeudores, setFiltroAnioDeudores] = useState<number | ''>('');
  const [filtroMesDeudores, setFiltroMesDeudores] = useState<number | ''>('');

  const filtroDisciplinaNombre = useMemo(
    () => (filtroDisciplinaId === '' ? '' : disciplinas.find((d) => d.id === filtroDisciplinaId)?.nombre ?? ''),
    [filtroDisciplinaId, disciplinas]
  );
  const filtroGeneroNombre = useMemo(
    () => (filtroGeneroId === '' ? '' : generos.find((g) => g.id === filtroGeneroId)?.nombre ?? ''),
    [filtroGeneroId, generos]
  );
  const filtroCategoriaNombre = useMemo(
    () => (filtroCategoriaId === '' ? '' : categorias.find((c) => c.id === filtroCategoriaId)?.nombre ?? ''),
    [filtroCategoriaId, categorias]
  );
  const subcategoriaOpciones = useMemo(() => {
    if (!filtroDisciplinaNombre || !filtroCategoriaNombre || !filtroGeneroNombre) return [];
    const keyTriple = `${filtroDisciplinaNombre}|${filtroCategoriaNombre}|${filtroGeneroNombre}`;
    const keyDoble = `${filtroDisciplinaNombre}|${filtroCategoriaNombre}`;
    const arr = subcategoriasPorKey[keyTriple] ?? subcategoriasPorKey[keyDoble] ?? [];
    return Array.isArray(arr) ? arr.filter((s): s is { id: number; nombre: string } => typeof s === 'object' && s != null && 'id' in s) : [];
  }, [filtroDisciplinaNombre, filtroCategoriaNombre, filtroGeneroNombre, subcategoriasPorKey]);

  const categoriasOpciones = useMemo(
    () => getCategoriasOptions(filtroDisciplinaNombre, filtroGeneroNombre),
    [getCategoriasOptions, filtroDisciplinaNombre, filtroGeneroNombre]
  );

  const recaudacionFiltrada = useMemo(() => {
    let arr = stats?.recaudacionPorClasificacion ?? [];
    if (filtroDisciplinaId !== '') arr = arr.filter((r) => r.disciplinaId === filtroDisciplinaId);
    if (filtroGeneroId !== '') arr = arr.filter((r) => r.generoId === filtroGeneroId);
    if (filtroCategoriaId !== '') arr = arr.filter((r) => r.categoriaId === filtroCategoriaId);
    if (filtroSubcategoriaId !== '') arr = arr.filter((r) => (r.subcategoriaId ?? null) === filtroSubcategoriaId);
    return arr;
  }, [stats?.recaudacionPorClasificacion, filtroDisciplinaId, filtroGeneroId, filtroCategoriaId, filtroSubcategoriaId]);

  // Si hay al menos un filtro seleccionado → una sola card con el total (ej. "Total recaudado por Fútbol").
  // Si todos están en Todas → agrupar por todas las dimensiones (varias cards).
  const recaudacionAgrupada = useMemo(() => {
    const arr = recaudacionFiltrada;
    const hayAlgunFiltro =
      filtroDisciplinaId !== '' ||
      filtroGeneroId !== '' ||
      filtroCategoriaId !== '' ||
      filtroSubcategoriaId !== '';

    if (hayAlgunFiltro && arr.length > 0) {
      const totalRecaudado = arr.reduce((s, r) => s + Number(r.totalRecaudado), 0);
      const cantidadPagos = arr.reduce((s, r) => s + r.cantidadPagos, 0);
      const labelParts: string[] = [];
      if (filtroDisciplinaNombre) labelParts.push(filtroDisciplinaNombre);
      if (filtroGeneroNombre) labelParts.push(filtroGeneroNombre);
      if (filtroCategoriaNombre) labelParts.push(filtroCategoriaNombre);
      if (filtroSubcategoriaId !== '') {
        const sub = subcategoriaOpciones.find((s) => s.id === filtroSubcategoriaId);
        if (sub) labelParts.push(sub.nombre);
      }
      const label = labelParts.length > 0 ? labelParts.join(' · ') : 'Total';
      return [{ label, totalRecaudado, cantidadPagos }];
    }

    if (arr.length === 0) return [];

    const groupByDisciplina = filtroDisciplinaId === '';
    const groupByGenero = filtroGeneroId === '';
    const groupByCategoria = filtroCategoriaId === '';
    const groupBySubcategoria = filtroSubcategoriaId === '';

    const map = new Map<
      string,
      { totalRecaudado: number; cantidadPagos: number; label: string }
    >();
    for (const r of arr) {
      const keyParts: string[] = [];
      if (groupByDisciplina) keyParts.push(`d${r.disciplinaId}`);
      if (groupByGenero) keyParts.push(`g${r.generoId}`);
      if (groupByCategoria) keyParts.push(`c${r.categoriaId}`);
      if (groupBySubcategoria) keyParts.push(`s${r.subcategoriaId ?? 'n'}`);
      const key = keyParts.join('|');
      const total = Number(r.totalRecaudado);
      const cant = r.cantidadPagos;
      const prev = map.get(key);
      if (prev) {
        prev.totalRecaudado += total;
        prev.cantidadPagos += cant;
      } else {
        const labels: string[] = [];
        if (groupByDisciplina) labels.push(r.disciplinaNombre);
        if (groupByGenero) labels.push(r.generoNombre);
        if (groupByCategoria) labels.push(r.categoriaNombre);
        if (groupBySubcategoria) labels.push(r.subcategoriaNombre ?? '—');
        const label =
          labels.length > 0
            ? labels.join(' · ')
            : `${r.disciplinaNombre} · ${r.generoNombre} · ${r.categoriaNombre} · ${r.subcategoriaNombre ?? '—'}`;
        map.set(key, { totalRecaudado: total, cantidadPagos: cant, label });
      }
    }
    return Array.from(map.values());
  }, [
    recaudacionFiltrada,
    filtroDisciplinaId,
    filtroGeneroId,
    filtroCategoriaId,
    filtroSubcategoriaId,
    filtroDisciplinaNombre,
    filtroGeneroNombre,
    filtroCategoriaNombre,
    subcategoriaOpciones,
  ]);

  const cargarStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats(
        anio === '' ? undefined : Number(anio),
        mes === '' ? undefined : Number(mes)
      );
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [anio, mes]);

  const cargarDeudores = useCallback(async () => {
    setLoadingDeudores(true);
    try {
      const filters: {
        disciplinaId?: number;
        generoId?: number;
        categoriaId?: number;
        subcategoriaId?: number;
        anio?: number;
        mes?: number;
      } = {};
      if (filtroDisciplinaId !== '') filters.disciplinaId = filtroDisciplinaId;
      if (filtroGeneroId !== '') filters.generoId = filtroGeneroId;
      if (filtroCategoriaId !== '') filters.categoriaId = filtroCategoriaId;
      if (filtroSubcategoriaId !== '') filters.subcategoriaId = filtroSubcategoriaId;
      if (filtroAnioDeudores !== '') filters.anio = filtroAnioDeudores;
      if (filtroMesDeudores !== '') filters.mes = filtroMesDeudores;
      const data = await dashboardService.getDeudores(Object.keys(filters).length > 0 ? filters : undefined);
      setDeudores(data);
    } catch {
      setDeudores([]);
    } finally {
      setLoadingDeudores(false);
    }
  }, [filtroDisciplinaId, filtroGeneroId, filtroCategoriaId, filtroSubcategoriaId, filtroAnioDeudores, filtroMesDeudores]);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  useEffect(() => {
    cargarDeudores();
  }, [cargarDeudores]);

  const handleFiltroDisciplinaChange = (v: number | '') => {
    setFiltroDisciplinaId(v);
    setFiltroCategoriaId('');
    setFiltroSubcategoriaId('');
  };
  const handleFiltroGeneroChange = (v: number | '') => {
    setFiltroGeneroId(v);
    setFiltroCategoriaId('');
    setFiltroSubcategoriaId('');
  };
  const handleFiltroCategoriaChange = (v: number | '') => {
    setFiltroCategoriaId(v);
    setFiltroSubcategoriaId('');
  };

  const handleExportReportesPDF = () => {
    if (stats) exportReportesPDF(stats, anio === '' ? undefined : Number(anio), mes === '' ? undefined : Number(mes));
  };
  const handleExportDeudoresPDF = () => exportDeudoresPDF(deudores);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Reportes y estadísticas</h2>
      <p className={styles.subtitle}>
        Recaudación por disciplina/género/categoría/subcategoría, deportistas por disciplina, cuotas pendientes/vencidas, pagos por medio y listado de deudores.
      </p>

      {/* Filtro período */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Período (recaudación)</h3>
        <div className={styles.filtersRow}>
          <label className={styles.filterLabel}>
            Año
            <select value={anio} onChange={(e) => setAnio(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">Todos</option>
              {ANIOS_OPCIONES.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Mes
            <select value={mes} onChange={(e) => setMes(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">Todos</option>
              {MESES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.btnExport} onClick={cargarStats}>
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando estadísticas...</p>
      ) : stats ? (
        <>
          {/* Resumen numérico */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Resumen</h3>
            <div className={styles.cardsRow}>
              <div className={styles.cardStat}>
                <div className={styles.cardStatValue}>{formatMoney(stats.totalRecaudado)}</div>
                <div className={styles.cardStatLabel}>Total recaudado</div>
              </div>
              <div className={styles.cardStat}>
                <div className={styles.cardStatValue}>{stats.cuotasPendientesVencidas.pendientes}</div>
                <div className={styles.cardStatLabel}>Cuotas pendientes</div>
                <div className={styles.cardStatSub}>{formatMoney(stats.cuotasPendientesVencidas.montoPendientes)} por cobrar</div>
              </div>
              <div className={styles.cardStat}>
                <div className={styles.cardStatValue}>{stats.cuotasPendientesVencidas.vencidas}</div>
                <div className={styles.cardStatLabel}>Cuotas vencidas</div>
                <div className={styles.cardStatSub}>{formatMoney(stats.cuotasPendientesVencidas.montoVencidas)} por cobrar</div>
              </div>
            </div>
            <div className={styles.filtersRow}>
              <button type="button" className={`${styles.btnExport} ${styles.btnExportSecondary}`} onClick={handleExportReportesPDF}>
                <FileText size={18} /> Exportar reportes PDF
              </button>
            </div>
          </div>

          {/* Recaudación por clasificación */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Recaudación por disciplina, género, categoría y subcategoría</h3>
            <div className={styles.filtersRow}>
              <label className={styles.filterLabel}>
                Disciplina
                <select
                  value={filtroDisciplinaId}
                  onChange={(e) => handleFiltroDisciplinaChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Todas</option>
                  {disciplinas.filter((d) => d.activo).map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </label>
              <label className={styles.filterLabel}>
                Género
                <select
                  value={filtroGeneroId}
                  onChange={(e) => handleFiltroGeneroChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Todos</option>
                  {generos.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </label>
              <label className={styles.filterLabel}>
                Categoría
                <select
                  value={filtroCategoriaId}
                  onChange={(e) => handleFiltroCategoriaChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Todas</option>
                  {categorias
                    .filter((c) => categoriasOpciones.includes(c.nombre))
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
              </label>
              <label className={styles.filterLabel}>
                Subcategoría
                <select
                  value={filtroSubcategoriaId}
                  onChange={(e) => setFiltroSubcategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Todas</option>
                  {subcategoriaOpciones.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.cardsRow}>
              {recaudacionAgrupada.length === 0 ? (
                <p className={`${styles.empty} ${styles.cardsRowEmpty}`}>Sin datos para el período o filtros seleccionados.</p>
              ) : (
                recaudacionAgrupada.map((r, i) => (
                  <div key={`${r.label}-${i}`} className={styles.cardStat}>
                    <div className={styles.cardRecaudacionLabel}>{r.label}</div>
                    <div className={styles.cardStatValue}>{formatMoney(r.totalRecaudado)}</div>
                    <div className={styles.cardStatLabel}>Cant. pagos: {r.cantidadPagos}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Deportistas por disciplina */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Deportistas por disciplina</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.deportistasPorDisciplina.map((d) => (
                    <tr key={d.disciplinaId}>
                      <td>{d.disciplinaNombre}</td>
                      <td>{d.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagos por medio */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Pagos por medio (aprobados)</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medio</th>
                    <th>Cantidad</th>
                    <th>Monto total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pagosPorMedio.map((p) => (
                    <tr key={p.medio}>
                      <td>{p.medio}</td>
                      <td>{p.cantidad}</td>
                      <td>{formatMoney(p.montoTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* Listado de deudores */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Listado de deudores</h3>
        <p className={styles.subtitle}>
        Deportistas con cuotas pendientes o vencidas. Los que figuran en &quot;Grupo familiar&quot; comparten cuota con otros integrantes; al sumar montos no contar dos veces el mismo grupo.
      </p>
        <div className={styles.filtersRow}>
          <label className={styles.filterLabel}>
            Disciplina
            <select
              value={filtroDisciplinaId}
              onChange={(e) => handleFiltroDisciplinaChange(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todas</option>
              {disciplinas.filter((d) => d.activo).map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Género
            <select
              value={filtroGeneroId}
              onChange={(e) => handleFiltroGeneroChange(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todos</option>
              {generos.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Categoría
            <select
              value={filtroCategoriaId}
              onChange={(e) => handleFiltroCategoriaChange(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todas</option>
              {categorias
                .filter((c) => categoriasOpciones.includes(c.nombre))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Subcategoría
            <select
              value={filtroSubcategoriaId}
              onChange={(e) => setFiltroSubcategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todas</option>
              {subcategoriaOpciones.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Año (cuota)
            <select
              value={filtroAnioDeudores}
              onChange={(e) => setFiltroAnioDeudores(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todos</option>
              {ANIOS_OPCIONES.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Mes (cuota)
            <select
              value={filtroMesDeudores}
              onChange={(e) => setFiltroMesDeudores(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Todos</option>
              {MESES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.filtersRow}>
          <button type="button" className={`${styles.btnExport} ${styles.btnExportSecondary}`} onClick={handleExportDeudoresPDF}>
            <FileText size={18} /> Exportar deudores PDF
          </button>
        </div>
        {loadingDeudores ? (
          <p className={styles.loading}>Cargando deudores...</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Disciplina</th>
                  <th>Categoría</th>
                  <th>Grupo familiar</th>
                  <th>Cuotas impagas</th>
                  <th>Monto adeudado</th>
                </tr>
              </thead>
              <tbody>
                {deudores.length === 0 ? (
                  <tr><td colSpan={8} className={styles.empty}>No hay deudores.</td></tr>
                ) : (
                  deudores.map((d) => (
                    <tr key={d.deportistaId}>
                      <td>{d.apellido}</td>
                      <td>{d.nombre}</td>
                      <td>{d.dni}</td>
                      <td>{d.disciplinaNombre}</td>
                      <td>{d.categoriaNombre}</td>
                      <td>{d.grupoFamiliarNombre ?? '—'}</td>
                      <td>{d.cuotasImpagas.map((c) => `Cuota ${c.nroCuota}/${c.anio}`).join(', ')}</td>
                      <td>{formatMoney(d.montoTotalAdeudado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
