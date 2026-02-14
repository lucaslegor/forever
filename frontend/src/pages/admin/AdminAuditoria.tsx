import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auditoriaService } from '../../services/auditoria.service';
import type { AuditoriaLogRow, AuditoriaFilters } from '../../services/auditoria.service';
import styles from './AdminReportes.module.css';

const ACCIONES_LABEL: Record<string, string> = {
  DEPORTISTA_ALTA: 'Alta deportista',
  DEPORTISTA_BAJA: 'Baja deportista',
  DEPORTISTA_ACTUALIZACION: 'Actualización deportista',
  PAGO_CONFIRMAR: 'Confirmar pago',
  CUOTA_MARCAR_PAGADA: 'Cuota marcada pagada',
  DISCIPLINA_ALTA: 'Alta disciplina',
  DISCIPLINA_ACTUALIZACION: 'Actualización disciplina',
  ADMIN_DESACTIVAR: 'Admin desactivado',
  ADMIN_ACTIVAR: 'Admin activado',
  ADMIN_RESET_PASSWORD: 'Restablecer contraseña admin',
  GRUPO_FAMILIAR_CREAR: 'Crear grupo familiar',
  GRUPO_FAMILIAR_ACTUALIZACION: 'Actualización grupo familiar',
  GRUPO_FAMILIAR_BAJA: 'Baja grupo familiar',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export const AdminAuditoria = () => {
  const { isPrincipalAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditoriaLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroEntidad, setFiltroEntidad] = useState<string>('');
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [filtroDesde, setFiltroDesde] = useState<string>('');
  const [filtroHasta, setFiltroHasta] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: AuditoriaFilters = { page, limit: 30 };
      if (filtroEntidad) filters.entidad = filtroEntidad;
      if (filtroAccion) filters.accion = filtroAccion;
      if (filtroDesde) filters.desde = filtroDesde;
      if (filtroHasta) filters.hasta = filtroHasta;
      const res = await auditoriaService.getLogs(filters);
      setLogs(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setLogs([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, filtroEntidad, filtroAccion, filtroDesde, filtroHasta]);

  useEffect(() => {
    if (isPrincipalAdmin) load();
  }, [load, isPrincipalAdmin]);

  if (!isPrincipalAdmin) {
    return (
      <div className={styles.page}>
        <h2 className={styles.title}>Auditoría</h2>
        <p className={styles.subtitle}>Solo el administrador principal puede acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Auditoría</h2>
      <p className={styles.subtitle}>
        Registro de acciones realizadas en el sistema (altas, bajas, confirmación de pagos, cambios de disciplina, etc.) para soporte y seguridad.
      </p>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Log de acciones</h3>
        <div className={styles.filtersRow}>
          <label className={styles.filterLabel}>
            Entidad
            <select value={filtroEntidad} onChange={(e) => setFiltroEntidad(e.target.value)}>
              <option value="">Todas</option>
              <option value="deportista">Deportista</option>
              <option value="pago">Pago</option>
              <option value="cuota">Cuota</option>
              <option value="disciplina">Disciplina</option>
              <option value="administrativo">Administrativo</option>
              <option value="grupo_familiar">Grupo familiar</option>
            </select>
          </label>
          <label className={styles.filterLabel}>
            Acción
            <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(ACCIONES_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            Desde
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className={styles.inputDate}
            />
          </label>
          <label className={styles.filterLabel}>
            Hasta
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              className={styles.inputDate}
            />
          </label>
        </div>

        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : (
          <>
            <p className={styles.meta}>
              Total: {total} registros {totalPages > 1 && `· Página ${page} de ${totalPages}`}
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acción</th>
                    <th>Entidad</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        No hay registros para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id}>
                        <td>{formatDate(l.createdAt)}</td>
                        <td>{l.email ?? '—'}</td>
                        <td>{l.rol ?? '—'}</td>
                        <td>{ACCIONES_LABEL[l.accion] ?? l.accion}</td>
                        <td>{l.entidad}</td>
                        <td>{l.entidadId ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className={styles.filtersRow} style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className={styles.btnExport}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  className={styles.btnExport}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
