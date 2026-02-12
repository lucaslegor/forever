import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Eye, EyeOff } from 'lucide-react';
import type { AdminUser } from '../../types/admin';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminAdmins.module.css';

export const AdminAdmins = () => {
    const { user, isPrincipalAdmin } = useAuth();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ documento: '', contraseña: '', nombre: '' });
    const [saving, setSaving] = useState(false);
    const [showContraseña, setShowContraseña] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await authService.getUsers(1, 100);
            if (res.success && res.data?.data) {
                const users = res.data.data as any[];
                const list: AdminUser[] = users
                    .filter((u) => u.administrativo != null)
                    .map((u) => ({
                        id: u.administrativo.id,
                        cuentaId: u.id,
                        documento: u.administrativo.dni ?? '',
                        nombre: [u.administrativo.nombre, u.administrativo.apellido].filter(Boolean).join(' ') || u.email,
                        activo: u.activo ?? true,
                    }));
                setAdmins(list);
            }
        } catch {
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isPrincipalAdmin) fetchAdmins();
        else setLoading(false);
    }, [isPrincipalAdmin]);

    const openCrear = () => {
        setForm({ documento: '', contraseña: '', nombre: '' });
        setEditingId(null);
        setShowForm(true);
    };

    const openEditar = (a: AdminUser) => {
        setForm({ documento: a.documento, contraseña: '', nombre: a.nombre });
        setEditingId(a.id);
        setShowForm(true);
    };

    const guardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const doc = form.documento.trim();
        const nombreMostrar = form.nombre.trim() || 'Administrador';
        const partes = nombreMostrar.split(/\s+/);
        const nombre = partes[0] || 'Administrador';
        const apellido = partes.slice(1).join(' ') || 'Panel';

        setSaving(true);
        try {
            if (editingId === null) {
                const res = await authService.register({
                    dni: doc,
                    nombre,
                    apellido,
                    email: `${doc}@admin.forever`,
                    password: form.contraseña,
                    rol: 'ADMINISTRATIVO',
                });
                if (!res.success) {
                    alert(res.error || 'Error al crear el administrador');
                    return;
                }
            } else {
                // En Gestión admin no se puede cambiar la contraseña de otros admins (solo en Restablecer contraseña)
                // Solo se actualiza nombre si en el futuro hay endpoint; por ahora solo cerramos el form
            }
            setShowForm(false);
            await fetchAdmins();
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.errors?.password?.[0] || err.message || 'Error al guardar';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const toggleActivo = (id: number) => {
        setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a)));
    };

    if (loading) return <LoadingScreen fullPage />;

    if (!isPrincipalAdmin) {
        return (
            <div className={styles.page}>
                <h2 className={styles.title}>Gestión admin</h2>
                <p className={styles.subtitle}>Solo el administrador principal puede acceder a esta sección.</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión admin</h2>
            <p className={styles.subtitle}>Administrar usuarios con acceso al panel.</p>

            {!showForm ? (
                <button type="button" className={styles.btnPrimary} onClick={openCrear}>
                    <UserPlus size={20} />
                    Crear admin
                </button>
            ) : (
                <form onSubmit={guardar} className={styles.form}>
                    <h3 className={styles.formTitle}>{editingId ? 'Editar admin' : 'Nuevo admin'}</h3>
                    {editingId !== null && (
                        <p className={styles.formHint}>Para cambiar la contraseña de un admin usá la sección Restablecer contraseña.</p>
                    )}
                    <div className={styles.field}>
                        <label>Documento del administrador *</label>
                        <input
                            type="text"
                            placeholder="Ej: DNI o número de documento"
                            value={form.documento}
                            onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                            required
                            readOnly={editingId !== null}
                            className={styles.input}
                        />
                    </div>
                    {editingId === null && (
                        <div className={styles.field}>
                            <label>Contraseña *</label>
                            <div className={styles.inputPasswordWrap}>
                                <input
                                    type={showContraseña ? 'text' : 'password'}
                                    placeholder="Mín. 8 caracteres y una mayúscula"
                                    value={form.contraseña}
                                    onChange={(e) => setForm((f) => ({ ...f, contraseña: e.target.value }))}
                                    required
                                    className={styles.input}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowContraseña((v) => !v)}
                                    aria-label={showContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    tabIndex={-1}
                                >
                                    {showContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className={styles.field}>
                        <label>Nombre (para mostrar)</label>
                        <input
                            type="text"
                            placeholder="Ej: Administrador Principal"
                            value={form.nombre}
                            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnGuardar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                        <button type="button" className={styles.btnCancelar} onClick={() => setShowForm(false)} disabled={saving}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((a) => (
                            <tr key={a.id}>
                                <td>{a.documento}</td>
                                <td>{a.nombre}</td>
                                <td>
                                    <span className={a.activo ? styles.badgeActivo : styles.badgeInactivo}>
                                        {a.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <button type="button" className={styles.btnEdit} onClick={() => openEditar(a)}>
                                        <Pencil size={18} />
                                        Editar
                                    </button>
                                    {a.cuentaId !== undefined && a.cuentaId === user?.id && (
                                        <button
                                            type="button"
                                            className={a.activo ? styles.btnDesactivar : styles.btnToggle}
                                            onClick={() => toggleActivo(a.id)}
                                        >
                                            {a.activo ? 'Desactivar' : 'Activar'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
