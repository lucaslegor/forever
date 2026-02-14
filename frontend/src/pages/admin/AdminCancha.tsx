import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Check, DollarSign, Trash2, X } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import { reservaCanchaService, type ReservaCancha, getEstadoReserva, HORAS_TURNO, horaToLabel, MONTO_SENA } from '../../services/reservaCancha.service';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminCancha.module.css';

const today = () => new Date().toISOString().slice(0, 10);

export const AdminCancha = () => {
    const confirm = useConfirm();
    const [reservas, setReservas] = useState<ReservaCancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaDesde, setFechaDesde] = useState(today());
    const [fechaHasta, setFechaHasta] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().slice(0, 10);
    });
    const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [showNueva, setShowNueva] = useState(false);
    const [formNueva, setFormNueva] = useState({
        fecha: today(),
        hora: 14,
        nombreCliente: '',
        telefono: '',
        email: '',
    });
    const [enviando, setEnviando] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reservaCanchaService.list(fechaDesde, fechaHasta);
            const list = res?.data != null && Array.isArray(res.data) ? res.data : (res as any)?.data?.data;
            setReservas(Array.isArray(list) ? list : []);
        } catch {
            setReservas([]);
        } finally {
            setLoading(false);
        }
    }, [fechaDesde, fechaHasta]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const marcarSena = async (id: number) => {
        setUpdatingId(id);
        try {
            const res = await reservaCanchaService.updatePagos(id, { senaPagada: true });
            if (res.success) {
                setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, senaPagada: true } : r)));
                setMensaje({ tipo: 'ok', texto: 'Seña marcada como pagada.' });
                setTimeout(() => setMensaje(null), 3000);
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar.' });
        } finally {
            setUpdatingId(null);
        }
    };

    const marcarResto = async (id: number) => {
        setUpdatingId(id);
        try {
            const res = await reservaCanchaService.updatePagos(id, { restoPagado: true });
            if (res.success) {
                setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, restoPagado: true } : r)));
                setMensaje({ tipo: 'ok', texto: 'Resto marcado como pagado.' });
                setTimeout(() => setMensaje(null), 3000);
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar.' });
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelarReserva = async (r: ReservaCancha) => {
        const ok = await confirm({
            title: 'Cancelar reserva',
            message: `¿Cancelar la reserva del ${r.fecha} ${horaToLabel(r.hora)} (${r.nombreCliente})?`,
            confirmLabel: 'Cancelar reserva',
            cancelLabel: 'No',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            const res = await reservaCanchaService.delete(r.id);
            if (res.success) {
                setReservas((prev) => prev.map((item) => (item.id === r.id ? { ...item, canceladaAt: new Date().toISOString() } : item)));
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al cancelar.' });
        }
    };

    const submitNueva = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formNueva.nombreCliente.trim() || !formNueva.telefono.trim()) {
            setMensaje({ tipo: 'error', texto: 'Nombre y teléfono son obligatorios.' });
            return;
        }
        setEnviando(true);
        setMensaje(null);
        try {
            const res = await reservaCanchaService.create({
                fecha: formNueva.fecha,
                hora: formNueva.hora,
                nombreCliente: formNueva.nombreCliente.trim(),
                telefono: formNueva.telefono.trim(),
                email: formNueva.email.trim() || undefined,
            });
            if (res.success) {
                setMensaje({ tipo: 'ok', texto: 'Reserva creada.' });
                setShowNueva(false);
                setFormNueva({ fecha: today(), hora: 14, nombreCliente: '', telefono: '', email: '' });
                await cargar();
            } else {
                setMensaje({ tipo: 'error', texto: (res as { error?: string }).error || 'Error al crear.' });
            }
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Error al crear la reserva.';
            setMensaje({ tipo: 'error', texto: msg || 'Error al crear.' });
        } finally {
            setEnviando(false);
        }
    };

    if (loading) return <LoadingScreen fullPage />;

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Alquiler cancha césped sintético</h2>
            <p className={styles.subtitle}>
                Turnos de 14:00 a 01:00, lunes a domingo. Seña ${MONTO_SENA.toLocaleString('es-AR')}. La reserva queda efectiva al pagar la seña con Mercado Pago (desde la web) o cuando el admin marca la seña como pagada. Marcar el resto cuando se abone en cancha.
            </p>

            {mensaje && (
                <div className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}>
                    {mensaje.texto}
                </div>
            )}

            <div className={styles.filters}>
                <div className={styles.filterRow}>
                    <label>Desde</label>
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.filterRow}>
                    <label>Hasta</label>
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <button type="button" className={styles.btnNueva} onClick={() => setShowNueva(true)}>
                    <Plus size={20} />
                    Nueva reserva
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>Seña</th>
                            <th>Estado</th>
                            <th>Seña pagada</th>
                            <th>Resto pagado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.empty}>No hay reservas en el período seleccionado.</td>
                            </tr>
                        ) : (
                            reservas.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.fecha}</td>
                                    <td>{horaToLabel(r.hora)}</td>
                                    <td>{r.nombreCliente}</td>
                                    <td>{r.telefono}</td>
                                    <td>${(r.montoSena ?? MONTO_SENA).toLocaleString('es-AR')}</td>
                                    <td>
                                        <span className={`${styles.badgeEstado} ${styles[getEstadoReserva(r).toLowerCase()]}`}>
                                            {getEstadoReserva(r)}
                                        </span>
                                    </td>
                                    <td>
                                        {r.canceladaAt ? (
                                            '—'
                                        ) : r.senaPagada ? (
                                            <span className={styles.badgeOk}>Sí</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className={styles.btnPago}
                                                onClick={() => marcarSena(r.id)}
                                                disabled={updatingId === r.id}
                                            >
                                                <Check size={16} />
                                                Marcar
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {r.canceladaAt ? (
                                            '—'
                                        ) : r.restoPagado ? (
                                            <span className={styles.badgeOk}>Sí</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className={styles.btnPago}
                                                onClick={() => marcarResto(r.id)}
                                                disabled={updatingId === r.id}
                                            >
                                                <Check size={16} />
                                                Marcar
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        {!r.canceladaAt && !r.restoPagado && (
                                            <button
                                                type="button"
                                                className={styles.btnCancelarReserva}
                                                onClick={() => cancelarReserva(r)}
                                                title="Cancelar reserva"
                                            >
                                                <Trash2 size={16} />
                                                Cancelar reserva
                                            </button>
                                        )}
                                        {!r.canceladaAt && r.restoPagado && (
                                            <span className={styles.noCancelable} title="No se puede cancelar: el resto ya está pagado">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showNueva && (
                <div className={styles.overlay} onClick={() => setShowNueva(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Nueva reserva</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setShowNueva(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={submitNueva} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.field}>
                                    <label>Fecha *</label>
                                    <input
                                        type="date"
                                        value={formNueva.fecha}
                                        min={today()}
                                        onChange={(e) => setFormNueva({ ...formNueva, fecha: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Hora *</label>
                                    <select
                                        value={formNueva.hora}
                                        onChange={(e) => setFormNueva({ ...formNueva, hora: Number(e.target.value) })}
                                        className={styles.input}
                                    >
                                        {HORAS_TURNO.map((h) => (
                                            <option key={h} value={h}>{horaToLabel(h)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Nombre y apellido *</label>
                                <input
                                    type="text"
                                    value={formNueva.nombreCliente}
                                    onChange={(e) => setFormNueva({ ...formNueva, nombreCliente: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Teléfono *</label>
                                <input
                                    type="tel"
                                    value={formNueva.telefono}
                                    onChange={(e) => setFormNueva({ ...formNueva, telefono: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Email (opcional)</label>
                                <input
                                    type="email"
                                    value={formNueva.email}
                                    onChange={(e) => setFormNueva({ ...formNueva, email: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowNueva(false)} disabled={enviando}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSubmit} disabled={enviando}>
                                    {enviando ? 'Guardando...' : 'Crear reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
