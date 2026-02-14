import { useState, useEffect } from 'react';
import { Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { authService } from '../../services/auth.service';
import styles from './AdminPerfil.module.css';

type ProfileData = {
  id: number;
  email: string;
  rol: string;
  administrativo?: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
  };
};

export const AdminPerfil = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showModalContraseña, setShowModalContraseña] = useState(false);
  const [contraseñaForm, setContraseñaForm] = useState({
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: '',
  });
  const [contraseñaError, setContraseñaError] = useState<string | null>(null);
  const [contraseñaLoading, setContraseñaLoading] = useState(false);
  const [showContraseñaActual, setShowContraseñaActual] = useState(false);
  const [showNuevaContraseña, setShowNuevaContraseña] = useState(false);
  const [showConfirmarContraseña, setShowConfirmarContraseña] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setProfile(response.data as ProfileData);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleCambiarContraseña = async (e: React.FormEvent) => {
    e.preventDefault();
    setContraseñaError(null);
    if (!contraseñaForm.contraseñaActual.trim()) {
      setContraseñaError('Ingresá tu contraseña actual.');
      return;
    }
    if (contraseñaForm.nuevaContraseña.length < 6) {
      setContraseñaError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(contraseñaForm.nuevaContraseña) || !/[0-9]/.test(contraseñaForm.nuevaContraseña)) {
      setContraseñaError('La nueva contraseña debe tener al menos una mayúscula y un número.');
      return;
    }
    if (contraseñaForm.nuevaContraseña !== contraseñaForm.confirmarContraseña) {
      setContraseñaError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    setContraseñaLoading(true);
    try {
      const res = await authService.updateProfile({
        currentPassword: contraseñaForm.contraseñaActual,
        password: contraseñaForm.nuevaContraseña,
      });
      if (res.success) {
        setShowModalContraseña(false);
        setContraseñaForm({ contraseñaActual: '', nuevaContraseña: '', confirmarContraseña: '' });
        setNotification({ type: 'success', message: 'Contraseña actualizada correctamente.' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setContraseñaError((res as { error?: string }).error || (res as { message?: string }).message || 'Error al actualizar la contraseña.');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string }; status?: number } }).response?.data?.error
        : err instanceof Error ? err.message : 'Error al actualizar la contraseña.';
      setContraseñaError(msg || 'Error al actualizar la contraseña.');
    } finally {
      setContraseñaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrap}>
        <LoadingScreen message="Cargando perfil" fullPage={false} />
      </div>
    );
  }

  const admin = profile?.administrativo;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.pageTitle}>Mi perfil</h2>
      <p className={styles.intro}>Datos de tu cuenta de administración. Podés cambiar tu contraseña desde aquí.</p>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Datos personales</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <span className={styles.label}>Nombre</span>
            <span className={styles.value}>{admin?.nombre ?? '—'}</span>
          </div>
          <div className={styles.formGroup}>
            <span className={styles.label}>Apellido</span>
            <span className={styles.value}>{admin?.apellido ?? '—'}</span>
          </div>
          <div className={styles.formGroup}>
            <span className={styles.label}>DNI</span>
            <span className={styles.value}>{admin?.dni ?? '—'}</span>
          </div>
          <div className={styles.formGroup}>
            <span className={styles.label}>Email (usuario)</span>
            <span className={styles.value}>{profile?.email ?? '—'}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => {
              setShowModalContraseña(true);
              setContraseñaForm({ contraseñaActual: '', nuevaContraseña: '', confirmarContraseña: '' });
              setContraseñaError(null);
            }}
          >
            <Lock size={20} />
            Cambiar contraseña
          </button>
        </div>
      </div>

      {notification && (
        <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {notification.message}
        </div>
      )}

      {showModalContraseña && (
        <div className={styles.modalOverlay} onClick={() => setShowModalContraseña(false)}>
          <div className={styles.modalContraseña} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Cambiar contraseña</h3>
            <form onSubmit={handleCambiarContraseña}>
              <div className={styles.formGroup}>
                <label htmlFor="contraseñaActual" className={styles.label}>Contraseña actual *</label>
                <div className={styles.inputPasswordWrap}>
                  <input
                    id="contraseñaActual"
                    type={showContraseñaActual ? 'text' : 'password'}
                    className={styles.input}
                    value={contraseñaForm.contraseñaActual}
                    onChange={(e) => setContraseñaForm((f) => ({ ...f, contraseñaActual: e.target.value }))}
                    placeholder="Ingresá tu contraseña actual para confirmar"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className={styles.passwordToggle} onClick={() => setShowContraseñaActual((v) => !v)} aria-label={showContraseñaActual ? 'Ocultar contraseña' : 'Mostrar contraseña'} tabIndex={-1}>
                    {showContraseñaActual ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="nuevaContraseña" className={styles.label}>Nueva contraseña *</label>
                <div className={styles.inputPasswordWrap}>
                  <input
                    id="nuevaContraseña"
                    type={showNuevaContraseña ? 'text' : 'password'}
                    className={styles.input}
                    value={contraseñaForm.nuevaContraseña}
                    onChange={(e) => setContraseñaForm((f) => ({ ...f, nuevaContraseña: e.target.value }))}
                    placeholder="Mín. 6 caracteres, una mayúscula y un número"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <button type="button" className={styles.passwordToggle} onClick={() => setShowNuevaContraseña((v) => !v)} aria-label={showNuevaContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'} tabIndex={-1}>
                    {showNuevaContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmarContraseña" className={styles.label}>Confirmar nueva contraseña *</label>
                <div className={styles.inputPasswordWrap}>
                  <input
                    id="confirmarContraseña"
                    type={showConfirmarContraseña ? 'text' : 'password'}
                    className={styles.input}
                    value={contraseñaForm.confirmarContraseña}
                    onChange={(e) => setContraseñaForm((f) => ({ ...f, confirmarContraseña: e.target.value }))}
                    placeholder="Repetí la nueva contraseña"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className={styles.passwordToggle} onClick={() => setShowConfirmarContraseña((v) => !v)} aria-label={showConfirmarContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'} tabIndex={-1}>
                    {showConfirmarContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {contraseñaError && (
                <p className={styles.contraseñaError}>{contraseñaError}</p>
              )}
              <div className={styles.modalActions}>
                <button type="submit" className={styles.buttonPrimary} disabled={contraseñaLoading}>
                  {contraseñaLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className={styles.buttonCancelar}
                  onClick={() => setShowModalContraseña(false)}
                  disabled={contraseñaLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
