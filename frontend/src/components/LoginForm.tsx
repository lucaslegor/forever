import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginForm.module.css';

interface LoginFormData {
    dni: string;
    password: string;
}

/** Número de WhatsApp del club (con código de país, sin +). Ej: 5492211234567 */
const WHATSAPP_NUMBER = '5492211234567';
const WHATSAPP_MSG = 'Hola, olvidé mi contraseña del portal del club. ¿Me pueden ayudar?';

/** Tiempo que el mensaje de error permanece visible (ms) */
const ERROR_DURATION_MS = 6000;

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
            const result = await login(data.dni, data.password);

            if (result.success) {
                const isAdminLogin = data.dni.includes('@') && data.dni.includes('admin');
                const redirectPath = isAdminLogin ? '/admin' : '/dashboard';
                navigate(redirectPath);
            } else {
                const errorMsg = (result.error && result.error.trim()) || 'Credenciales incorrectas. Revisá el DNI o email y la contraseña.';
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
            const errorMsg = serverMsg && String(serverMsg).trim() ? String(serverMsg) : 'Credenciales incorrectas. Revisá el DNI o email y la contraseña.';
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
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>

                    <Link to="/alquilar-cancha" className={styles.canchaLink}>
                        <Calendar size={20} />
                        Alquilar cancha de césped sintético
                    </Link>
                </form>

                <p className={styles.copyright}>
                    CLUB FOR EVER DE LA PLATA © 2026 <br />
                </p>
            </div>
        </div>
    );
};
