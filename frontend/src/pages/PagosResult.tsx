import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';
import { pagoService } from '../services/pago.service';
import styles from './PagosResult.module.css';

type Variant = 'success' | 'failure' | 'pending';

const config: Record<Variant, { title: string; message: string; icon: typeof CheckCircle; className: string }> = {
  success: {
    title: 'Pago aprobado',
    message: 'Tu cuota fue acreditada correctamente. En unos instantes se actualizará tu estado de deuda.',
    icon: CheckCircle,
    className: styles.resultSuccess,
  },
  failure: {
    title: 'Pago no realizado',
    message: 'El pago fue rechazado o no se completó. Podés intentar de nuevo desde Estado de deuda.',
    icon: XCircle,
    className: styles.resultFailure,
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Tu pago está en proceso. Te notificaremos cuando se acredite.',
    icon: Clock,
    className: styles.resultPending,
  },
};

const configReserva: Record<Variant, { title: string; message: string; icon: typeof CheckCircle; className: string }> = {
  success: {
    title: 'Seña acreditada',
    message: 'Tu seña del alquiler de cancha fue registrada. La reserva quedó confirmada.',
    icon: CheckCircle,
    className: styles.resultSuccess,
  },
  failure: {
    title: 'Pago no realizado',
    message: 'El pago de la seña fue rechazado o no se completó. Podés volver a intentar desde la página de alquiler de cancha.',
    icon: XCircle,
    className: styles.resultFailure,
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Tu seña está en proceso. Te notificaremos cuando se acredite y la reserva quedará confirmada.',
    icon: Clock,
    className: styles.resultPending,
  },
};

export const PagosResult = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const isReserva = params.get('origen') === 'reserva';
  const variant: Variant = pathname.includes('/failure') ? 'failure' : pathname.includes('/pending') ? 'pending' : 'success';
  const { title, message, icon: Icon, className } = isReserva ? configReserva[variant] : config[variant];
  const syncDone = useRef(false);
  const [hadPaymentIdInUrl, setHadPaymentIdInUrl] = useState(false);
  const [manualPaymentId, setManualPaymentId] = useState('');
  const [syncMessage, setSyncMessage] = useState<'idle' | 'ok' | 'error'>('idle');

  // Al volver de Mercado Pago con pago aprobado, sincronizar por si el webhook no llegó (solo cuotas; reserva se confirma por webhook)
  useEffect(() => {
    if (variant !== 'success' || syncDone.current || isReserva) return;
    const paymentId = params.get('payment_id') || params.get('collection_id');
    if (!paymentId) return;
    setHadPaymentIdInUrl(true);
    syncDone.current = true;
    pagoService
      .sync(paymentId)
      .then(() => setSyncMessage('ok'))
      .catch(() => setSyncMessage('error'));
  }, [variant, search, isReserva]);

  const handleManualSync = () => {
    const id = manualPaymentId.trim();
    if (!id) return;
    setSyncMessage('idle');
    pagoService
      .sync(id)
      .then(() => {
        setSyncMessage('ok');
        setManualPaymentId('');
      })
      .catch(() => setSyncMessage('error'));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={`${styles.card} ${className}`}>
          <Icon size={64} className={styles.icon} aria-hidden />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
          {variant === 'success' && !isReserva && hadPaymentIdInUrl && syncMessage === 'ok' && (
            <p className={styles.syncOk}>Tu pago se registró correctamente. Ya podés ver tu estado de deuda actualizado.</p>
          )}
          {variant === 'success' && !isReserva && (syncMessage === 'error' || !hadPaymentIdInUrl) && (
            <div className={styles.syncSection}>
              <p className={styles.syncHint}>
                {syncMessage === 'error' ? 'No se pudo sincronizar con la URL. Ingresá el ID del pago (Mercado Pago → Actividad) y sincronizá.' : 'Si tu estado de deuda no se actualizó, ingresá el ID del pago (Mercado Pago → Actividad) y sincronizá.'}
              </p>
              <div className={styles.syncRow}>
                <input
                  type="text"
                  placeholder="ID del pago (ej. 123456789)"
                  value={manualPaymentId}
                  onChange={(e) => setManualPaymentId(e.target.value)}
                  className={styles.syncInput}
                />
                <button type="button" className={styles.syncButton} onClick={handleManualSync} disabled={!manualPaymentId.trim()}>
                  Sincronizar
                </button>
              </div>
              {syncMessage === 'ok' && <p className={styles.syncOk}>Listo. Actualizá la página de estado de deuda.</p>}
              {syncMessage === 'error' && <p className={styles.syncError}>No se pudo sincronizar. Revisá el ID del pago.</p>}
            </div>
          )}
          <button type="button" className={styles.backButton} onClick={() => navigate(isReserva ? '/alquilar-cancha' : '/estado-deuda')}>
            <ArrowLeft size={20} />
            {isReserva ? 'Volver a alquiler de cancha' : 'Volver al estado de deuda'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
