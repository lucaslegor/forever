import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, CheckCircle, XCircle, Pencil, Trash2, Lock } from 'lucide-react';
import { Footer } from '../components/Footer';
import { LoadingScreen } from '../components/LoadingScreen';
import { deportistaService } from '../services/deportista.service';
import { authService } from '../services/auth.service';
import styles from './ProfileEdit.module.css';

// Opciones fijas
const DISCIPLINAS = ['Futbol', 'Hockey'] as const;
const GENEROS = ['Masculino', 'Femenino'] as const;
const CATEGORIAS_GENERALES = ['Mayores', 'Juveniles', 'Infantiles'] as const;

// Subcategorías Fútbol: según género y categoría general
const SUBCATEGORIAS_FUTBOL: Record<string, string[]> = {
    'Mayores-Masculino': ['Cuarta', 'Reserva', 'Senior', 'Primera'],
    'Mayores-Femenino': ['Cuarta', 'Tercera', '+35', 'Primera'],
    'Juveniles-Masculino': ['Pre-novena', 'Novena', 'Octava', 'Séptima', 'Sexta', 'Quinta'],
    'Infantiles-Masculino': ['6 años', '7 años', '8 años', '9 años', '10 años', '11 años'],
    'Juveniles-Femenino': ['Sub 10', 'Sub 11', 'Sub 12', 'Sub 13', 'Sub 14'],
    'Infantiles-Femenino': ['Sub 10', 'Sub 11', 'Sub 12', 'Sub 13', 'Sub 14'],
};

// Subcategorías Hockey: por categoría general (Infantiles, Juveniles, Mayores)
const SUBCATEGORIAS_HOCKEY: Record<string, string[]> = {
    Infantiles: ['10ma', '9na', '8va'],
    Juveniles: ['Sub 14', 'Sub 17'],
    Mayores: ['Intermedia', 'Primera'],
};

// Hockey femenino: Infantiles, Juveniles, Mayores. Hockey masculino: solo Mayores.
function getCategoriasGeneralesOptions(disciplina: string, genero: string): readonly string[] {
    if (disciplina === 'Hockey' && genero === 'Masculino') {
        return ['Mayores'];
    }
    return CATEGORIAS_GENERALES;
}

function getSubcategoriaOptions(disciplina: string, genero: string, categoriaGeneral: string): string[] {
    if (!disciplina || !categoriaGeneral) return [];
    if (disciplina === 'Hockey') {
        if (genero === 'Masculino') return SUBCATEGORIAS_HOCKEY['Mayores'] ?? [];
        return SUBCATEGORIAS_HOCKEY[categoriaGeneral] ?? [];
    }
    if (disciplina === 'Futbol' && genero) {
        const key = `${categoriaGeneral}-${genero}`;
        return SUBCATEGORIAS_FUTBOL[key] ?? [];
    }
    return [];
}

// Schema base + validación condicional
const profileSchema = yup.object({
    nombre: yup.string().required('El nombre es requerido'),
    apellido: yup.string().required('El apellido es requerido'),
    dni: yup.string().required('El DNI es requerido'),
    fechaNac: yup.string().required('La fecha de nacimiento es requerida'),
    disciplina: yup.string().oneOf([...DISCIPLINAS]).required('Seleccioná una disciplina'),
    genero: yup.string().oneOf([...GENEROS]).required('Seleccioná un género'),
    categoriaGeneral: yup.string().when(['disciplina', 'genero'], {
        is: (disciplina: string, g: string) => disciplina === 'Hockey' && g === 'Masculino',
        then: (s) => s.oneOf(['Mayores']).required('Seleccioná una categoría'),
        otherwise: (s) => s.oneOf([...CATEGORIAS_GENERALES]).required('Seleccioná una categoría'),
    }),
    subcategoria: yup.string().when(['disciplina', 'genero', 'categoriaGeneral'], {
        is: (disciplina: string, genero: string, categoriaGeneral: string) =>
            Boolean(disciplina && categoriaGeneral && getSubcategoriaOptions(disciplina, genero || '', categoriaGeneral).length > 0),
        then: (schema) => schema.required('Seleccioná una subcategoría'),
        otherwise: (schema) => schema.optional(),
    }),
    email: yup.string().optional().email('Ingresá un email válido'),
    adultoNombre: yup.string().when('categoriaGeneral', {
        is: (val: string) => val === 'Juveniles' || val === 'Infantiles',
        then: (schema) => schema.required('El nombre del adulto es requerido'),
        otherwise: (schema) => schema.optional(),
    }),
    adultoApellido: yup.string().when('categoriaGeneral', {
        is: (val: string) => val === 'Juveniles' || val === 'Infantiles',
        then: (schema) => schema.required('El apellido del adulto es requerido'),
        otherwise: (schema) => schema.optional(),
    }),
    adultoDni: yup.string().when('categoriaGeneral', {
        is: (val: string) => val === 'Juveniles' || val === 'Infantiles',
        then: (schema) => schema.required('El DNI del adulto es requerido'),
        otherwise: (schema) => schema.optional(),
    }),
    adultoEmail: yup.string().when('categoriaGeneral', {
        is: (val: string) => val === 'Juveniles' || val === 'Infantiles',
        then: (schema) => schema.required('El email del adulto es requerido').email('Email inválido'),
        otherwise: (schema) => schema.optional().email('Email inválido'),
    }),
    adultoTelefono: yup.string().when('categoriaGeneral', {
        is: (val: string) => val === 'Juveniles' || val === 'Infantiles',
        then: (schema) => schema.required('El teléfono del adulto es requerido'),
        otherwise: (schema) => schema.optional(),
    }),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

// Tipo del formulario permite '' en selectores en cascada hasta que se envíe
type ProfileFormValues = Omit<ProfileFormData, 'disciplina' | 'genero' | 'categoriaGeneral' | 'subcategoria'> & {
    disciplina: ProfileFormData['disciplina'] | '';
    genero: ProfileFormData['genero'] | '';
    categoriaGeneral: ProfileFormData['categoriaGeneral'] | '';
    subcategoria: string;
};

const defaultValues: Partial<ProfileFormValues> = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNac: '',
    disciplina: '',
    genero: '',
    categoriaGeneral: '',
    subcategoria: '',
    email: '',
    adultoNombre: '',
    adultoApellido: '',
    adultoDni: '',
    adultoEmail: '',
    adultoTelefono: '',
};

type AdultoModo = 'ver' | 'agregar' | 'editar';

export type AdultoResponsable = {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string;
};

export const ProfileEdit = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [adultoModo, setAdultoModo] = useState<AdultoModo>('agregar');
    const [adultosList, setAdultosList] = useState<AdultoResponsable[]>([]);
    const [adultoEditIndex, setAdultoEditIndex] = useState<number | null>(null);
    const [showModalContraseña, setShowModalContraseña] = useState(false);
    const [contraseñaForm, setContraseñaForm] = useState({
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarContraseña: '',
    });
    const [contraseñaError, setContraseñaError] = useState<string | null>(null);
    const [contraseñaLoading, setContraseñaLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        defaultValues,
        resolver: yupResolver(profileSchema) as any,
    });

    // Carga del perfil desde el backend
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await deportistaService.getMiPerfil();
                if (response.success && response.data) {
                    const data = response.data;
                    reset({
                        nombre: data.nombre,
                        apellido: data.apellido,
                        dni: data.dni,
                        fechaNac: data.fechaNac?.split('T')[0] || '',
                        disciplina: data.disciplina?.nombre || '',
                        genero: data.genero?.nombre || '',
                        categoriaGeneral: data.categoria?.nombre || '',
                        subcategoria: data.subcategoria?.nombre || '',
                        email: data.cuenta?.email || '',
                        adultoNombre: (data.adultosResponsables?.[0] || data.adultoResponsable)?.nombre || '',
                        adultoApellido: (data.adultosResponsables?.[0] || data.adultoResponsable)?.apellido || '',
                        adultoDni: (data.adultosResponsables?.[0] || data.adultoResponsable)?.dni || '',
                        adultoEmail: (data.adultosResponsables?.[0] || data.adultoResponsable)?.email || '',
                        adultoTelefono: (data.adultosResponsables?.[0] || data.adultoResponsable)?.telefono || '',
                    });

                    const categoria = data.categoria?.nombre || '';
                    const esMayores = categoria === 'Mayores';
                    const adultos = Array.isArray(data.adultosResponsables) && data.adultosResponsables.length > 0
                        ? data.adultosResponsables
                        : data.adultoResponsable
                            ? [data.adultoResponsable]
                            : [];

                    if (!esMayores && adultos.length > 0) {
                        setAdultosList(adultos.map((a: any) => ({
                            nombre: a.nombre,
                            apellido: a.apellido,
                            dni: a.dni,
                            email: a.email,
                            telefono: a.telefono,
                        })));
                        setAdultoModo('ver');
                    } else {
                        setAdultosList([]);
                        setAdultoModo('agregar');
                    }
                }
                setProfileLoaded(true);
            } catch (error) {
                console.error('Error cargando perfil:', error);
                setProfileLoaded(true);
            }
        };
        loadProfile();
    }, [reset]);

    const disciplina = watch('disciplina');
    const genero = watch('genero');
    const categoriaGeneral = watch('categoriaGeneral');

    const categoriasGeneralesOptions = getCategoriasGeneralesOptions(disciplina || '', genero || '');
    const subcategoriaOptions = getSubcategoriaOptions(disciplina || '', genero || '', categoriaGeneral || '');
    const isMayores = categoriaGeneral === 'Mayores';
    const isMenor = categoriaGeneral === 'Juveniles' || categoriaGeneral === 'Infantiles';

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            const nuevo: AdultoResponsable = {
                nombre: data.adultoNombre ?? '',
                apellido: data.adultoApellido ?? '',
                dni: data.adultoDni ?? '',
                email: data.adultoEmail ?? '',
                telefono: data.adultoTelefono ?? '',
            };
            const newList =
                adultoModo === 'agregar'
                    ? [...adultosList, nuevo]
                    : adultoModo === 'editar' && adultoEditIndex !== null
                        ? adultosList.map((a, i) => (i === adultoEditIndex ? nuevo : a))
                        : adultosList;

            setAdultosList(newList);
            if (adultoModo === 'agregar') {
                setValue('adultoNombre', '');
                setValue('adultoApellido', '');
                setValue('adultoDni', '');
                setValue('adultoEmail', '');
                setValue('adultoTelefono', '');
            } else if (adultoEditIndex !== null) {
                setAdultoEditIndex(null);
            }

            const res = await deportistaService.updateMiPerfil({
                adultosResponsables: newList,
            });
            if (res.success) {
                setNotification({
                    type: 'success',
                    message: adultoModo === 'agregar' ? 'Adulto responsable agregado y guardado' : 'Datos del adulto responsable actualizados',
                });
            } else {
                setNotification({ type: 'error', message: (res as { error?: string }).error || 'Error al guardar' });
            }
            await new Promise((r) => setTimeout(r, 400));
            setAdultoModo('ver');
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            const msg = error?.response?.data?.error || error?.message || 'Error al guardar los datos';
            setNotification({ type: 'error', message: msg });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleAgregarAdulto = () => {
        setValue('adultoNombre', '');
        setValue('adultoApellido', '');
        setValue('adultoDni', '');
        setValue('adultoEmail', '');
        setValue('adultoTelefono', '');
        setAdultoEditIndex(null);
        setAdultoModo('agregar');
    };

    const handleEditarAdulto = (index: number) => {
        const a = adultosList[index];
        setValue('adultoNombre', a.nombre);
        setValue('adultoApellido', a.apellido);
        setValue('adultoDni', a.dni);
        setValue('adultoEmail', a.email);
        setValue('adultoTelefono', a.telefono);
        setAdultoEditIndex(index);
        setAdultoModo('editar');
    };

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
                setContraseñaError((res as { error?: string }).error || res.message || 'Error al actualizar la contraseña.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || 'Error al actualizar la contraseña.';
            setContraseñaError(msg);
        } finally {
            setContraseñaLoading(false);
        }
    };

    const handleEliminarAdulto = async (index: number) => {
        const newList = adultosList.filter((_, i) => i !== index);
        if (newList.length < 1) return; // Al menos uno
        setAdultosList(newList);
        try {
            const res = await deportistaService.updateMiPerfil({ adultosResponsables: newList });
            if (res.success) {
                setNotification({ type: 'success', message: 'Adulto responsable eliminado' });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Error al eliminar' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (!profileLoaded) {
        return (
            <div className={styles.profilePage}>
                <main className={styles.mainContent}>
                    <div className={styles.formCard}>
                        <LoadingScreen message="Cargando perfil" fullPage={false} />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club Social y Deportivo For Ever</span>
                </div>
                <h1 className={styles.title}>Perfil</h1>
                <div className={styles.headerRight} aria-hidden />
            </header>

            <main className={styles.mainContent}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formCard}>
                        {/* 1. Datos personales (solo lectura) */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Datos personales</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="nombre" className={styles.label}>Nombre</label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        className={styles.input}
                                        {...register('nombre')}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="apellido" className={styles.label}>Apellido</label>
                                    <input
                                        id="apellido"
                                        type="text"
                                        className={styles.input}
                                        {...register('apellido')}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="dni" className={styles.label}>DNI</label>
                                    <input
                                        id="dni"
                                        type="text"
                                        className={styles.input}
                                        {...register('dni')}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fechaNac" className={styles.label}>Fecha de nacimiento</label>
                                    <input
                                        id="fechaNac"
                                        type="date"
                                        className={styles.input}
                                        {...register('fechaNac')}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Clasificación deportiva (solo lectura) */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Clasificación deportiva</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="disciplina" className={styles.label}>Disciplina</label>
                                    <select
                                        id="disciplina"
                                        className={styles.input}
                                        {...register('disciplina')}
                                        disabled
                                    >
                                        <option value="">Seleccionar disciplina</option>
                                        {DISCIPLINAS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="genero" className={styles.label}>Género</label>
                                    <select
                                        id="genero"
                                        className={styles.input}
                                        {...register('genero')}
                                        disabled
                                    >
                                        <option value="">Seleccionar género</option>
                                        {GENEROS.map((g) => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="categoriaGeneral" className={styles.label}>Categoría general</label>
                                    <select
                                        id="categoriaGeneral"
                                        className={styles.input}
                                        {...register('categoriaGeneral')}
                                        disabled
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categoriasGeneralesOptions.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                {subcategoriaOptions.length > 0 && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="subcategoria" className={styles.label}>Subcategoría</label>
                                        <select
                                            id="subcategoria"
                                            className={styles.input}
                                            {...register('subcategoria')}
                                            disabled
                                        >
                                            <option value="">Seleccionar subcategoría</option>
                                            {subcategoriaOptions.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Datos del adulto responsable (Juveniles/Infantiles) */}
                        {isMenor && (
                            <div className={`${styles.section} ${styles.sectionFull}`} id="adulto-responsable">
                                <h2 className={styles.sectionTitle}>Datos del adulto responsable</h2>
                                <p className={styles.adultoIntro}>Debe haber al menos un adulto responsable cargado por el administrador. Aparece abajo y podés editarlo o agregar más.</p>

                                {adultoModo === 'ver' ? (
                                    <>
                                        {adultosList.length > 0 ? (
                                            <ul className={styles.adultosList}>
                                                {adultosList.map((a, index) => (
                                                    <li key={`${a.dni}-${index}`} className={styles.adultoListItem}>
                                                        <div className={styles.adultoFrozen}>
                                                            <div className={styles.formGrid}>
                                                                <div className={styles.formGroup}>
                                                                    <span className={styles.frozenLabel}>Nombre</span>
                                                                    <span className={styles.frozenValue}>{a.nombre || '—'}</span>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <span className={styles.frozenLabel}>Apellido</span>
                                                                    <span className={styles.frozenValue}>{a.apellido || '—'}</span>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <span className={styles.frozenLabel}>DNI</span>
                                                                    <span className={styles.frozenValue}>{a.dni || '—'}</span>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <span className={styles.frozenLabel}>Email</span>
                                                                    <span className={styles.frozenValue}>{a.email || '—'}</span>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <span className={styles.frozenLabel}>Teléfono</span>
                                                                    <span className={styles.frozenValue}>{a.telefono || '—'}</span>
                                                                </div>
                                                            </div>
                                                            <div className={styles.adultoActions}>
                                                                <button
                                                                    type="button"
                                                                    className={styles.editarAdultoButton}
                                                                    onClick={() => handleEditarAdulto(index)}
                                                                >
                                                                    <Pencil size={18} />
                                                                    Editar
                                                                </button>
                                                                {adultosList.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className={styles.eliminarAdultoButton}
                                                                        onClick={() => handleEliminarAdulto(index)}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={styles.adultoNotice}>No hay adultos responsables cargados. Agregá uno debajo.</p>
                                        )}
                                        <div className={styles.addAdultoRow}>
                                            <button
                                                type="button"
                                                className={styles.addAdultoButton}
                                                onClick={handleAgregarAdulto}
                                            >
                                                Agregar adulto responsable
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className={styles.adultoNotice}>
                                            {adultoModo === 'agregar' ? 'Completá los datos del adulto responsable.' : 'Modificá los datos y guardá los cambios.'}
                                        </p>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="adultoNombre" className={styles.label}>Nombre del adulto *</label>
                                                <input
                                                    id="adultoNombre"
                                                    type="text"
                                                    className={`${styles.input} ${errors.adultoNombre ? styles.error : ''}`}
                                                    {...register('adultoNombre')}
                                                    placeholder="Nombre"
                                                />
                                                {errors.adultoNombre && (
                                                    <span className={styles.errorMessage}>{errors.adultoNombre.message}</span>
                                                )}
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="adultoApellido" className={styles.label}>Apellido del adulto *</label>
                                                <input
                                                    id="adultoApellido"
                                                    type="text"
                                                    className={`${styles.input} ${errors.adultoApellido ? styles.error : ''}`}
                                                    {...register('adultoApellido')}
                                                    placeholder="Apellido"
                                                />
                                                {errors.adultoApellido && (
                                                    <span className={styles.errorMessage}>{errors.adultoApellido.message}</span>
                                                )}
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="adultoDni" className={styles.label}>DNI del adulto *</label>
                                                <input
                                                    id="adultoDni"
                                                    type="text"
                                                    className={`${styles.input} ${errors.adultoDni ? styles.error : ''}`}
                                                    {...register('adultoDni')}
                                                    placeholder="DNI"
                                                />
                                                {errors.adultoDni && (
                                                    <span className={styles.errorMessage}>{errors.adultoDni.message}</span>
                                                )}
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="adultoEmail" className={styles.label}>Email del adulto *</label>
                                                <input
                                                    id="adultoEmail"
                                                    type="email"
                                                    className={`${styles.input} ${errors.adultoEmail ? styles.error : ''}`}
                                                    {...register('adultoEmail')}
                                                    placeholder="correo@ejemplo.com"
                                                />
                                                {errors.adultoEmail && (
                                                    <span className={styles.errorMessage}>{errors.adultoEmail.message}</span>
                                                )}
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="adultoTelefono" className={styles.label}>Teléfono del adulto *</label>
                                                <input
                                                    id="adultoTelefono"
                                                    type="text"
                                                    className={`${styles.input} ${errors.adultoTelefono ? styles.error : ''}`}
                                                    {...register('adultoTelefono')}
                                                    placeholder="Ej. 221-1234567"
                                                />
                                                {errors.adultoTelefono && (
                                                    <span className={styles.errorMessage}>{errors.adultoTelefono.message}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.addAdultoRow}>
                                            <button
                                                type="submit"
                                                className={styles.addAdultoButton}
                                                disabled={isSubmitting}
                                            >
                                                <Save size={18} />
                                                {adultoModo === 'agregar' ? 'Agregar adulto responsable' : 'Guardar cambios'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={`${styles.button} ${styles.buttonSecondary}`}
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft size={20} />
                                Volver
                            </button>
                            <button
                                type="button"
                                className={`${styles.button} ${styles.buttonSecondary}`}
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
                </form>
            </main>

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
                                <input
                                    id="contraseñaActual"
                                    type="password"
                                    className={styles.input}
                                    value={contraseñaForm.contraseñaActual}
                                    onChange={(e) => setContraseñaForm((f) => ({ ...f, contraseñaActual: e.target.value }))}
                                    placeholder="Ingresá tu contraseña actual para confirmar"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="nuevaContraseña" className={styles.label}>Nueva contraseña *</label>
                                <input
                                    id="nuevaContraseña"
                                    type="password"
                                    className={styles.input}
                                    value={contraseñaForm.nuevaContraseña}
                                    onChange={(e) => setContraseñaForm((f) => ({ ...f, nuevaContraseña: e.target.value }))}
                                    placeholder="Mínimo 6 caracteres"
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="confirmarContraseña" className={styles.label}>Confirmar nueva contraseña *</label>
                                <input
                                    id="confirmarContraseña"
                                    type="password"
                                    className={styles.input}
                                    value={contraseñaForm.confirmarContraseña}
                                    onChange={(e) => setContraseñaForm((f) => ({ ...f, confirmarContraseña: e.target.value }))}
                                    placeholder="Repetí la nueva contraseña"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            {contraseñaError && (
                                <p className={styles.contraseñaError}>{contraseñaError}</p>
                            )}
                            <div className={styles.modalActions}>
                                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={contraseñaLoading}>
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

            <Footer />
        </div>
    );
};
