import { useState, useEffect } from 'react';
import { KeyRound, User, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deportistaService } from '../../services/deportista.service';
import { authService } from '../../services/auth.service';
import styles from './AdminRestablecerContrasena.module.css';

type TipoCuenta = 'deportista' | 'admin';

export const AdminRestablecerContrasena = () => {
    const { isPrincipalAdmin } = useAuth();
    const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>('deportista');

    useEffect(() => {
        if (!isPrincipalAdmin && tipoCuenta === 'admin') setTipoCuenta('deportista');
    }, [isPrincipalAdmin, tipoCuenta]);
    const [identificador, setIdentificador] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [showNuevaContrasena, setShowNuevaContrasena] = useState(false);
    const [showConfirmarContrasena, setShowConfirmarContrasena] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje(null);
        const dni = identificador.trim();
        if (!dni) {
            setMensaje({ tipo: 'error', texto: 'Ingrese el DNI del usuario.' });
            return;
        }
        if (!nuevaContrasena || nuevaContrasena.length < 6) {
            setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        if (nuevaContrasena !== confirmarContrasena) {
            setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
            return;
        }

        setLoading(true);

        try {
            if (tipoCuenta === 'deportista') {
                const response = await deportistaService.resetPasswordByDni(dni, nuevaContrasena);
                if (response.success) {
                    setMensaje({
                        tipo: 'ok',
                        texto: 'Contraseña del deportista actualizada. Comuníquela al usuario (por teléfono o en persona).',
                    });
                    setIdentificador('');
                    setNuevaContrasena('');
                    setConfirmarContrasena('');
                } else {
                    setMensaje({
                        tipo: 'error',
                        texto: 'Error al restablecer contraseña. Verifique el DNI.',
                    });
                }
            } else {
                const resUsers = await authService.getUsers(1, 500);
                if (!resUsers.success || !resUsers.data?.data) {
                    setMensaje({ tipo: 'error', texto: 'Error al buscar administradores.' });
                    return;
                }
                const users = resUsers.data.data as Array<{ id: number; administrativo?: { id: number; dni: string } }>;
                const adminUser = users.find((u) => u.administrativo?.dni?.trim().toLowerCase() === dni.toLowerCase());
                if (!adminUser?.administrativo) {
                    setMensaje({ tipo: 'error', texto: 'No se encontró un administrador con ese documento. Verifique el DNI.' });
                    return;
                }
                const resReset = await authService.resetAdminPassword(adminUser.administrativo.id, nuevaContrasena);
                if (resReset.success) {
                    setMensaje({
                        tipo: 'ok',
                        texto: 'Contraseña del administrador actualizada. Comuníquela al usuario (por teléfono o en persona).',
                    });
                    setIdentificador('');
                    setNuevaContrasena('');
                    setConfirmarContrasena('');
                } else {
                    setMensaje({
                        tipo: 'error',
                        texto: (resReset as { error?: string }).error || 'Error al restablecer la contraseña.',
                    });
                }
            }
        } catch (error: any) {
            console.error('Error al restablecer contraseña:', error);
            setMensaje({
                tipo: 'error',
                texto: error.response?.data?.message || 'Error al restablecer contraseña.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Restablecer contraseña</h2>
            <p className={styles.subtitle}>
                El usuario se identifica en el club o por teléfono con DNI (deportista) o documento (admin).
                Usted ingresa el DNI del usuario y define la nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label>Tipo de cuenta</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="tipo"
                                value="deportista"
                                checked={tipoCuenta === 'deportista'}
                                onChange={() => {
                                    setTipoCuenta('deportista');
                                    setIdentificador('');
                                    setMensaje(null);
                                }}
                            />
                            <User size={18} />
                            Deportista
                        </label>
                        {isPrincipalAdmin && (
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="admin"
                                    checked={tipoCuenta === 'admin'}
                                    onChange={() => {
                                        setTipoCuenta('admin');
                                        setIdentificador('');
                                        setMensaje(null);
                                    }}
                                />
                                <Shield size={18} />
                                Administrador
                            </label>
                        )}
                    </div>
                </div>

                <div className={styles.field}>
                    <label>DNI del {tipoCuenta === 'deportista' ? 'deportista' : 'administrador'} *</label>
                    <input
                        type="text"
                        placeholder={tipoCuenta === 'deportista' ? 'DNI del deportista' : 'DNI del administrador'}
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label>Nueva contraseña *</label>
                    <div className={styles.inputPasswordWrap}>
                        <input
                            type={showNuevaContrasena ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={nuevaContrasena}
                            onChange={(e) => setNuevaContrasena(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                        />
                        <button type="button" className={styles.passwordToggle} onClick={() => setShowNuevaContrasena((v) => !v)} aria-label={showNuevaContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} tabIndex={-1}>
                            {showNuevaContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label>Confirmar nueva contraseña *</label>
                    <div className={styles.inputPasswordWrap}>
                        <input
                            type={showConfirmarContrasena ? 'text' : 'password'}
                            placeholder="Repetir contraseña"
                            value={confirmarContrasena}
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                        />
                        <button type="button" className={styles.passwordToggle} onClick={() => setShowConfirmarContrasena((v) => !v)} aria-label={showConfirmarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} tabIndex={-1}>
                            {showConfirmarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {mensaje && (
                    <div className={mensaje.tipo === 'ok' ? styles.mensajeOk : styles.mensajeError}>
                        {mensaje.texto}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit" className={styles.btnGuardar} disabled={loading}>
                        <KeyRound size={18} />
                        {loading ? 'Procesando...' : 'Restablecer contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
};
