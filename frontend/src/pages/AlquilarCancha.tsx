import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info, CreditCard, MessageCircle } from 'lucide-react';
import { Footer } from '../components/Footer';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { reservaCanchaService, HORAS_TURNO, horaToLabel, MONTO_SENA } from '../services/reservaCancha.service';
import styles from './AlquilarCancha.module.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type MetodoPago = 'mercadopago' | 'transferencia';

export const AlquilarCancha = () => {
    const [fecha, setFecha] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate());
        return d.toISOString().slice(0, 10);
    });
    const [horasOcupadas, setHorasOcupadas] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [slotElegido, setSlotElegido] = useState<number | null>(null);
    const [form, setForm] = useState({ nombreCliente: '', telefono: '', email: '' });
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('mercadopago');
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [resultTransferencia, setResultTransferencia] = useState<{
        whatsappLink: string;
        expiraAt: string;
        minutosParaPagar: number;
        fecha: string;
        hora: number;
    } | null>(null);
    const [countdown, setCountdown] = useState<{ min: number; seg: number } | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [turnstileResetKey, setTurnstileResetKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await reservaCanchaService.getDisponibilidad(fecha);
                if (!cancelled && res.success && res.data) setHorasOcupadas(res.data.horasOcupadas || []);
            } catch {
                if (!cancelled) setHorasOcupadas([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [fecha]);

    useEffect(() => {
        if (!resultTransferencia?.expiraAt) return;
        const tick = () => {
            const end = new Date(resultTransferencia.expiraAt).getTime();
            const now = Date.now();
            if (now >= end) {
                setCountdown({ min: 0, seg: 0 });
                return;
            }
            const diff = Math.floor((end - now) / 1000);
            setCountdown({ min: Math.floor(diff / 60), seg: diff % 60 });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [resultTransferencia?.expiraAt]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (slotElegido === null) return;
        if (!form.nombreCliente.trim() || !form.telefono.trim()) {
            setMensaje({ tipo: 'error', texto: 'Completá nombre y teléfono.' });
            return;
        }
        const metodo = metodoPago ?? 'mercadopago';
        if (metodo === 'mercadopago' && !form.email.trim()) {
            setMensaje({ tipo: 'error', texto: 'Para pagar con Mercado Pago es necesario ingresar tu email.' });
            return;
        }
        const token = TURNSTILE_SITE_KEY ? (captchaToken ?? '') : 'dev-bypass';
        if (TURNSTILE_SITE_KEY && !captchaToken) {
            setMensaje({ tipo: 'error', texto: 'Completá la verificación de seguridad antes de reservar.' });
            return;
        }
        setEnviando(true);
        setMensaje(null);
        try {
            const res = await reservaCanchaService.create({
                fecha,
                hora: slotElegido,
                nombreCliente: form.nombreCliente.trim(),
                telefono: form.telefono.trim(),
                email: form.email.trim() || undefined,
                metodoPago: metodo,
                captchaToken: token,
            });
            if (res.success && res.data) {
                const payload = res.data as {
                    reserva?: unknown;
                    metodoPago?: string;
                    initPoint?: string;
                    whatsappLink?: string;
                    expiraAt?: string | null;
                    minutosParaPagar?: number;
                };
                if (payload.metodoPago === 'transferencia' && payload.whatsappLink && payload.expiraAt) {
                    setResultTransferencia({
                        whatsappLink: payload.whatsappLink,
                        expiraAt: payload.expiraAt,
                        minutosParaPagar: payload.minutosParaPagar ?? 20,
                        fecha,
                        hora: slotElegido,
                    });
                    setSlotElegido(null);
                    setForm({ nombreCliente: '', telefono: '', email: '' });
                    setHorasOcupadas((prev) => [...prev, slotElegido]);
                    setCaptchaToken(null);
                    setTurnstileResetKey((k) => k + 1);
                } else if (payload.initPoint) {
                    window.location.href = payload.initPoint;
                    return;
                } else {
                    setMensaje({
                        tipo: 'ok',
                        texto: `Reserva registrada para el ${fecha} a las ${horaToLabel(slotElegido)}. Debes abonar la seña de $${MONTO_SENA.toLocaleString('es-AR')} para confirmar.`,
                    });
                    setSlotElegido(null);
                    setForm({ nombreCliente: '', telefono: '', email: '' });
                    setHorasOcupadas((prev) => [...prev, slotElegido]);
                    setCaptchaToken(null);
                    setTurnstileResetKey((k) => k + 1);
                }
            } else {
                setMensaje({ tipo: 'error', texto: (res as { error?: string }).error || 'Error al reservar.' });
                setCaptchaToken(null);
                setTurnstileResetKey((k) => k + 1);
            }
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Error al reservar.';
            setMensaje({ tipo: 'error', texto: msg || 'Error al reservar.' });
            setCaptchaToken(null);
            setTurnstileResetKey((k) => k + 1);
        } finally {
            setEnviando(false);
        }
    };

    const now = new Date();
    const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const horaActual = now.getHours();
    const minSegActual = now.getMinutes() > 0 || now.getSeconds() > 0;
    // Turnos 14–23 son del mismo día; 0 y 1 son 00:00 y 01:00 del día siguiente. Una vez empezada la hora, no se puede reservar.
    const slots = HORAS_TURNO.map((h) => {
        const esHoy = fecha === hoy;
        const yaPasado = esHoy && h >= 14 && (h < horaActual || (h === horaActual && minSegActual));
        const ocupado = horasOcupadas.includes(h);
        return {
            hora: h,
            label: horaToLabel(h),
            ocupado,
            noDisponible: ocupado || yaPasado,
        };
    });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link to="/dashboard" className={`${styles.headerLeft} ${styles.headerHomeLink}`}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club Social y Deportivo For Ever</span>
                </Link>
                <h1 className={styles.title}>Alquiler de cancha de césped sintético</h1>
                <div className={styles.headerRight}>
                    <Link to="/" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Volver al inicio
                    </Link>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.card}>
                    {resultTransferencia && (
                        <div className={styles.transferenciaPanel}>
                            <h3 className={styles.transferenciaTitle}>Pagá la seña por WhatsApp</h3>
                            <p className={styles.transferenciaText}>
                                Reserva para el <strong>{resultTransferencia.fecha}</strong> a las <strong>{horaToLabel(resultTransferencia.hora)}</strong>.
                                Monto: <strong>${MONTO_SENA.toLocaleString('es-AR')}</strong>.
                            </p>
                            {countdown && (countdown.min > 0 || countdown.seg > 0) ? (
                                <p className={styles.countdown}>
                                    La reserva se cancelará en <strong>{countdown.min} min {countdown.seg} s</strong> si no abonás la seña.
                                </p>
                            ) : (
                                <p className={styles.countdownExpired}>El tiempo para pagar venció. La reserva fue liberada. Podés elegir otro turno.</p>
                            )}
                            <a
                                href={resultTransferencia.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappBtn}
                            >
                                <MessageCircle size={22} />
                                Abrir WhatsApp para pagar
                            </a>
                            <button type="button" className={styles.btnSecondary} onClick={() => setResultTransferencia(null)}>
                                Hacer otra reserva
                            </button>
                        </div>
                    )}
                    {!resultTransferencia && (
                    <>
                    <p className={styles.intro}>
                        Turnos de lunes a domingo, de 14:00 a 01:00. Elegí la fecha y el horario. Al reservar debés abonar una seña de <strong>${MONTO_SENA.toLocaleString('es-AR')}</strong>; el resto se paga en la cancha (transferencia o efectivo).
                    </p>

                    <div className={styles.infoBox}>
                        <Info size={20} />
                        <span>La seña se abona para confirmar la reserva. Cualquier persona puede alquilar la cancha, no es necesario ser deportista del club.</span>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>Fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            min={hoy}
                            onChange={(e) => setFecha(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {loading ? (
                        <p className={styles.loading}>Cargando horarios...</p>
                    ) : (
                        <>
                            <div className={styles.section}>
                                <label className={styles.label}>Horario (elegí un turno)</label>
                                <div className={styles.slotsGrid}>
                                    {slots.map((s) => (
                                        <button
                                            key={s.hora}
                                            type="button"
                                            className={`${styles.slotBtn} ${s.noDisponible ? styles.slotOcupado : ''} ${slotElegido === s.hora ? styles.slotElegido : ''}`}
                                            onClick={() => !s.noDisponible && setSlotElegido(s.hora)}
                                            disabled={s.noDisponible}
                                        >
                                            {s.label}
                                            {s.ocupado && ' (ocupado)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {slotElegido !== null && (
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <h3 className={styles.formTitle}>Datos para la reserva</h3>
                                    <p className={styles.turnoElegido}>
                                        Turno: <strong>{fecha}</strong> a las <strong>{horaToLabel(slotElegido)}</strong>
                                    </p>
                                    <div className={styles.formRow}>
                                        <div className={styles.field}>
                                            <label>Nombre y apellido *</label>
                                            <input
                                                type="text"
                                                value={form.nombreCliente}
                                                onChange={(e) => setForm({ ...form, nombreCliente: e.target.value })}
                                                placeholder="Tu nombre"
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Teléfono *</label>
                                            <input
                                                type="tel"
                                                value={form.telefono}
                                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                                placeholder="Ej. 221 1234567"
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Email {metodoPago === 'mercadopago' ? '(requerido para pagar con Mercado Pago)' : '(opcional)'}</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="correo@ejemplo.com"
                                            className={styles.input}
                                            required={metodoPago === 'mercadopago'}
                                        />
                                    </div>
                                                    <div className={styles.section}>
                                        <label className={styles.label}>¿Cómo querés pagar la seña?</label>
                                        <div className={styles.metodoPagoGrid}>
                                            <button
                                                type="button"
                                                className={`${styles.metodoPagoBtn} ${metodoPago === 'transferencia' ? styles.metodoPagoElegido : ''}`}
                                                onClick={() => setMetodoPago('transferencia')}
                                            >
                                                <MessageCircle size={24} />
                                                <span className={styles.metodoPagoLabel}>Transferencia vía WhatsApp</span>
                                                <span className={styles.metodoPagoHint}>Tenés 20 minutos para pagar; si no, se cancela la reserva.</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.metodoPagoBtn} ${metodoPago === 'mercadopago' ? styles.metodoPagoElegido : ''}`}
                                                onClick={() => setMetodoPago('mercadopago')}
                                            >
                                                <CreditCard size={24} />
                                                <span className={styles.metodoPagoLabel}>Tarjeta o cuenta Mercado Pago</span>
                                                <span className={styles.metodoPagoHint}>Pago online al instante.</span>
                                            </button>
                                        </div>
                                    </div>
                                    {mensaje && (
                                        <div className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}>
                                            {mensaje.tipo === 'ok' ? <CheckCircle size={20} /> : null}
                                            {mensaje.texto}
                                        </div>
                                    )}
                                    {TURNSTILE_SITE_KEY && (
                                        <div className={styles.turnstileWrap} key={turnstileResetKey}>
                                            <TurnstileWidget
                                                siteKey={TURNSTILE_SITE_KEY}
                                                onVerify={setCaptchaToken}
                                                onExpire={() => setCaptchaToken(null)}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.formActions}>
                                        <button type="button" className={styles.btnSecondary} onClick={() => setSlotElegido(null)} disabled={enviando}>
                                            Cambiar horario
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.btnPrimary}
                                            disabled={enviando || (!!TURNSTILE_SITE_KEY && !captchaToken)}
                                        >
                                            <img src="/logo.png" alt="" className={styles.btnPrimaryLogo} aria-hidden />
                                            {enviando ? 'Enviando...' : 'Reservar turno'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                    </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};
