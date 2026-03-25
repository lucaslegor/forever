import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertModal } from './AlertModal';
import { TurnstileWidget } from './TurnstileWidget';
import styles from './LoginForm.module.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

interface LoginFormData {
    dni: string;
    password: string;
}

/** Número de WhatsApp del club (con código de país, sin +). Ej: 5492211234567 */
const WHATSAPP_NUMBER = '5492215585761';
const WHATSAPP_MSG = 'Hola, olvidé mi contraseña del portal del club. ¿Me pueden ayudar?';

/** Tiempo que el mensaje de error permanece visible (ms) */
const ERROR_DURATION_MS = 6000;

/** Formatea el mensaje de cuenta bloqueada incluyendo hasta cuándo o cuántos minutos */
function formatBlockedMessage(baseMsg: string, bloqueadoHastaIso?: string): string {
    if (!bloqueadoHastaIso) return baseMsg;
    try {
        const hasta = new Date(bloqueadoHastaIso);
        const now = new Date();
        const minutosRestantes = Math.max(0, Math.ceil((hasta.getTime() - now.getTime()) / 60000));
        const hora = hasta.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        if (minutosRestantes <= 0) return baseMsg;
        if (minutosRestantes <= 60) {
            return `${baseMsg} Podés intentar de nuevo en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`;
        }
        return `${baseMsg} Podés intentar de nuevo a las ${hora}.`;
    } catch {
        return baseMsg;
    }
}

const loginSchema = yup.object({
    dni: yup.string().required('El DNI es requerido').trim(),
    password: yup
        .string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [modalCaptchaError, setModalCaptchaError] = useState(false);
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        };
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }
        setLoginError(null);
        setIsLoading(true);

        try {
            const token = TURNSTILE_SITE_KEY ? (captchaToken ?? '') : 'dev-bypass';
            if (TURNSTILE_SITE_KEY && !captchaToken) {
                setModalCaptchaError(true);
                setIsLoading(false);
                return;
            }
            const result = await login(data.dni, data.password, token);

            if (result.success) {
                const isAdminLogin = data.dni.includes('@') && data.dni.includes('admin');
                const redirectPath = isAdminLogin ? '/admin' : '/dashboard';
                navigate(redirectPath);
            } else {
                const baseMsg = (result.error && result.error.trim()) || 'Credenciales incorrectas. Revisá el DNI o email y la contraseña.';
                const errorMsg = formatBlockedMessage(baseMsg, result.bloqueadoHasta);
                if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
                setLoginError(errorMsg);
                errorTimeoutRef.current = setTimeout(() => {
                    setLoginError(null);
                    errorTimeoutRef.current = null;
                }, ERROR_DURATION_MS);
                setIsLoading(false);
            }
        } catch (error: any) {
            const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
            const baseMsg = serverMsg && String(serverMsg).trim() ? String(serverMsg) : 'Credenciales incorrectas. Revisá el DNI o email y la contraseña.';
            const bloqueadoHasta = error?.response?.data?.bloqueadoHasta;
            const errorMsg = formatBlockedMessage(baseMsg, bloqueadoHasta);
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            setLoginError(errorMsg);
            errorTimeoutRef.current = setTimeout(() => {
                setLoginError(null);
                errorTimeoutRef.current = null;
            }, ERROR_DURATION_MS);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginFormContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Inicia sesión</h2>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="dni" className={styles.label}>
                            DNI
                        </label>
                        <div className={styles.inputWrapper}>
                            <CreditCard className={styles.inputIcon} />
                            <input
                                id="dni"
                                type="text"
                                placeholder="Ingrese su DNI"
                                className={`${styles.input} ${errors.dni ? styles.error : ''}`}
                                {...register('dni')}
                                autoComplete="username"
                            />
                        </div>
                        {errors.dni && (
                            <span className={styles.errorMessage}>{errors.dni.message}</span>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Contraseña
                        </label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Ingrese su contraseña"
                                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                <span className={styles.toggleLabel}>
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </span>
                            </button>
                        </div>
                        {errors.password && (
                            <span className={styles.errorMessage}>{errors.password.message}</span>
                        )}
                        <div className={styles.forgotWrap}>
                            <span className={styles.forgotText}>¿Olvidaste tu contraseña?</span>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.forgotLink}
                            >
                                Haz click aquí para contactarte con nosotros
                            </a>
                        </div>
                    </div>
                    {loginError && (
                        <div className={styles.loginError} role="alert" aria-live="assertive">
                            {loginError}
                        </div>
                    )}
                    {TURNSTILE_SITE_KEY && (
                        <div className={styles.turnstileWrap}>
                            <TurnstileWidget
                                siteKey={TURNSTILE_SITE_KEY}
                                onVerify={setCaptchaToken}
                                onExpire={() => setCaptchaToken(null)}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>

                </form>

                <p className={styles.copyright}>
                    CLUB FOR EVER DE LA PLATA © 2026 <br />
                </p>
            </div>

            <AlertModal
                open={modalCaptchaError}
                title="Aviso"
                message="Debes verificar el captcha antes de continuar."
                onAccept={() => setModalCaptchaError(false)}
            />
        </div>
    );
};
