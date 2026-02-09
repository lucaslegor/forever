import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, AlertCircle, CheckCircle, CreditCard, Info } from 'lucide-react';
import { Footer } from '../components/Footer';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { cuotaService } from '../services/cuota.service';
import { grupoFamiliarService } from '../services/grupoFamiliar.service';
import { pagoService } from '../services/pago.service';
import styles from './DebtStatus.module.css';

interface Quota {
    id: number;
    nroCuota: number;
    anio: number;
    monto: number;
    fechaVencimiento: string;
    estadoCuota: 'PENDIENTE' | 'VENCIDA' | 'PAGADA';
    disciplina: string;
}

interface DebtStatusData {
    cuotasPendientes: Quota[];
    totalAdeudado: number;
}

export const DebtStatus = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [payingQuotaId, setPayingQuotaId] = useState<number | null>(null);
    const [debtData, setDebtData] = useState<DebtStatusData | null>(null);
    const [esTitular, setEsTitular] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const dni = user?.role === 'deportista' ? user.loginId : null;
            if (dni) {
                try {
                    const resGrupos = await grupoFamiliarService.getMios();
                    if (!cancelled && resGrupos.success && Array.isArray(resGrupos.data)) {
                        const grupos = resGrupos.data as any[];
                        const grupo = grupos.find((g) =>
                            g.integrantes?.some((m: any) => m.deportista?.dni === dni)
                        );
                        const titularDni = grupo?.titularDni ?? (grupo?.integrantes?.[0]?.deportista?.dni);
                        setEsTitular(!grupo || titularDni === dni);
                    }
                } catch {
                    setEsTitular(true);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [user?.loginId, user?.role]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await cuotaService.getMiEstado();
                if (cancelled) return;
                if (res.success && res.data) {
                    const d = res.data as any;
                    const pendientes = (d.cuotasPendientes || []).map((c: any) => ({
                        id: c.id,
                        nroCuota: c.nroCuota,
                        anio: c.anio != null ? c.anio : new Date(c.fechaVencimiento).getFullYear(),
                        monto: Number(c.monto),
                        fechaVencimiento: typeof c.fechaVencimiento === 'string' ? c.fechaVencimiento : new Date(c.fechaVencimiento).toISOString().slice(0, 10),
                        estadoCuota: c.estadoCuota === 'VENCIDA' ? 'VENCIDA' : 'PENDIENTE',
                        disciplina: c.disciplina ?? '—',
                    }));
                    pendientes.sort((a: Quota, b: Quota) => a.anio !== b.anio ? a.anio - b.anio : a.nroCuota - b.nroCuota);
                    setDebtData({
                        cuotasPendientes: pendientes,
                        totalAdeudado: Number(d.totalAdeudado) || 0,
                    });
                }
            } catch {
                if (!cancelled) setDebtData({ cuotasPendientes: [], totalAdeudado: 0 });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handlePayQuota = async (quotaId: number) => {
        setPayingQuotaId(quotaId);
        try {
            const res = await pagoService.crear(quotaId);
            if (res.success && res.data?.initPoint) {
                window.location.href = res.data.initPoint;
                return;
            }
            alert(res.message || 'No se pudo iniciar el pago. Revisá que Mercado Pago esté configurado.');
        } catch (e: any) {
            const msg = e.response?.data?.message || e.message || 'Error al iniciar el pago.';
            alert(msg);
        } finally {
            setPayingQuotaId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getMonthName = (monthNumber: number) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[monthNumber - 1];
    };

    if (loading) {
        return (
            <div className={styles.debtStatusPage}>
                <main className={styles.mainContent}>
                    <LoadingScreen fullPage />
                </main>
                <Footer />
            </div>
        );
    }

    const hasDebt = debtData && debtData.cuotasPendientes.length > 0;

    return (
        <div className={styles.debtStatusPage}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club Social y Deportivo For Ever</span>
                </div>
                <h1 className={styles.title}>Estado de Deuda</h1>
                <div className={styles.headerRight} aria-hidden />
            </header>

            <main className={styles.mainContent}>
                <div className={styles.contentCard}>
                    {/* Status Banner */}
                    <div className={`${styles.statusBanner} ${hasDebt ? styles.statusBannerDebt : styles.statusBannerPaid}`}>
                        <div className={`${styles.statusIcon} ${hasDebt ? styles.statusIconDebt : styles.statusIconPaid}`}>
                            {hasDebt ? <AlertCircle size={56} /> : <CheckCircle size={56} />}
                        </div>
                        <div className={`${styles.statusText} ${hasDebt ? styles.statusTextDebt : styles.statusTextPaid}`}>
                            {hasDebt ? 'DEUDA' : 'AL DÍA'}
                        </div>
                        <p className={styles.statusMessage}>
                            {hasDebt
                                ? `Tenés ${debtData.cuotasPendientes.length} cuota${debtData.cuotasPendientes.length > 1 ? 's' : ''} pendiente${debtData.cuotasPendientes.length > 1 ? 's' : ''} de pago`
                                : '¡Felicitaciones! No tenés cuotas pendientes'}
                        </p>
                    </div>

                    {/* Pending Quotas List */}
                    {hasDebt && (
                        <div className={styles.quotasSection}>
                            <h2 className={styles.sectionTitle}>Cuotas Pendientes</h2>
                            <div className={styles.quotasList}>
                                {debtData.cuotasPendientes.map((quota, index) => {
                                    const puedePagar = esTitular && index === 0;
                                    return (
                                    <div key={quota.id} className={styles.quotaCard}>
                                        <div className={styles.quotaInfo}>
                                            <div className={styles.quotaHeader}>
                                                <span className={styles.quotaNumber}>
                                                    {getMonthName(quota.nroCuota)} {quota.anio}
                                                </span>
                                                <span className={`${styles.quotaStatus} ${quota.estadoCuota === 'VENCIDA' ? styles.quotaStatusOverdue : styles.quotaStatusPending}`}>
                                                    {quota.estadoCuota === 'VENCIDA' ? 'Vencida' : 'Pendiente'}
                                                </span>
                                            </div>
                                            <div className={styles.quotaDetails}>
                                                <div className={styles.quotaDetail}>
                                                    <Calendar size={16} />
                                                    Vence: {formatDate(quota.fechaVencimiento)}
                                                </div>
                                                <div className={styles.quotaDetail}>
                                                    <DollarSign size={16} />
                                                    Disciplina: {quota.disciplina}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.quotaActions}>
                                            <span className={styles.quotaAmount}>{formatCurrency(quota.monto)}</span>
                                            {puedePagar ? (
                                                <button
                                                    type="button"
                                                    className={styles.payButton}
                                                    onClick={() => handlePayQuota(quota.id)}
                                                    disabled={payingQuotaId === quota.id}
                                                >
                                                    <CreditCard size={20} />
                                                    {payingQuotaId === quota.id ? 'Redirigiendo...' : 'Pagar Cuota'}
                                                </button>
                                            ) : esTitular ? (
                                                <span className={styles.payDisabled}>Pagá la cuota anterior primero</span>
                                            ) : (
                                                <span className={styles.payDisabled}>Solo el titular puede pagar</span>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>

                            <div className={styles.totalDebt}>
                                <span className={styles.totalLabel}>Total Adeudado:</span>
                                <span className={styles.totalAmount}>{formatCurrency(debtData.totalAdeudado)}</span>
                            </div>

                            {!esTitular && (
                                <div className={styles.titularNotice}>
                                    <Info size={22} />
                                    <p>
                                        Solo el titular del grupo familiar puede realizar el pago de cuotas. Contactate con el titular o con el club para regularizar.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
