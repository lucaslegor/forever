import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer';
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

export const PagosResult = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const variant: Variant = pathname.includes('/failure') ? 'failure' : pathname.includes('/pending') ? 'pending' : 'success';
  const { title, message, icon: Icon, className } = config[variant];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={`${styles.card} ${className}`}>
          <Icon size={64} className={styles.icon} aria-hidden />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
          <button type="button" className={styles.backButton} onClick={() => navigate('/estado-deuda')}>
            <ArrowLeft size={20} />
            Volver al estado de deuda
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
