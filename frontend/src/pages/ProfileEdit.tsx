import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, CheckCircle, XCircle, Pencil, Trash2, Lock } from 'lucide-react';
import { Footer } from '../components/Footer';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { deportistaService } from '../services/deportista.service';
import { authService } from '../services/auth.service';
import { disciplinaService } from '../services/disciplina.service';
import { clasificacionService } from '../services/clasificacion.service';
import styles from './ProfileEdit.module.css';

/** Género fijo: solo Masculino y Femenino (no se agregan desde la app). */
const GENEROS = ['Masculino', 'Femenino'] as const;

// Schema base + validación condicional
const profileSchema = yup.object({
    nombre: yup.string().required('El nombre es requerido'),
    apellido: yup.string().required('El apellido es requerido'),
    dni: yup.string().required('El DNI es requerido'),
    fechaNac: yup.string().required('La fecha de nacimiento es requerida'),
    disciplina: yup.string().required('Seleccioná una disciplina'),
    genero: yup.string().oneOf([...GENEROS]).required('Seleccioná un género'),
    categoriaGeneral: yup.string().required('Seleccioná una categoría'),
    subcategoria: yup.string().optional(),
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
    const [disciplinasNombres, setDisciplinasNombres] = useState<string[]>([]);
    const [categoriasNombres, setCategoriasNombres] = useState<string[]>([]);
    const [categoriasExcepcion, setCategoriasExcepcion] = useState<Record<string, string[]>>({});
    const [subcategoriasPorKey, setSubcategoriasPorKey] = useState<Record<string, string[]>>({});
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

    const { user } = useAuth();

    // Carga disciplinas (para el selector de perfil) y perfil (solo deportistas)
    useEffect(() => {
        const load = async () => {
            if (user?.role !== 'deportista') {
                setProfileLoaded(true);
                return;
            }
            try {
                const [perfilRes, disciplinasRes, opcionesRes] = await Promise.all([
                    deportistaService.getMiPerfil(),
                    disciplinaService.getAll(false),
                    clasificacionService.getOpcionesCompletas(),
                ]);
                let nombres: string[] = [];
                if (disciplinasRes.success && Array.isArray(disciplinasRes.data)) {
                    nombres = (disciplinasRes.data as { nombre: string }[]).map((d) => d.nombre);
                }
                let categoriasList: string[] = [];
                let excepcion: Record<string, string[]> = {};
                let subcatPorKey: Record<string, string[]> = {};
                if (opcionesRes.success && opcionesRes.data) {
                    const opc = opcionesRes.data as {
                        categorias?: Array<{ nombre: string }>;
                        categoriasExcepcion?: Record<string, string[]>;
                        subcategoriasPorKey?: Record<string, string[]>;
                    };
                    categoriasList = (opc.categorias ?? []).map((c) => c.nombre);
                    excepcion = opc.categoriasExcepcion ?? {};
                    subcatPorKey = opc.subcategoriasPorKey ?? {};
                }
                if (perfilRes.success && perfilRes.data) {
                    const data = perfilRes.data as unknown as {
                        nombre: string;
                        apellido: string;
                        dni: string;
                        fechaNac?: string;
                        disciplina?: { nombre: string };
                        genero?: { nombre: string };
                        categoria?: { nombre: string };
                        subcategoria?: { nombre: string };
                        cuenta?: { email?: string };
                        adultosResponsables?: Array<{ nombre: string; apellido: string; dni: string; email?: string; telefono?: string }>;
                        adultoResponsable?: { nombre: string; apellido: string; dni: string; email?: string; telefono?: string };
                    };
                    const disciplinaNombre = data.disciplina?.nombre || '';
                    const categoriaNombre = data.categoria?.nombre || '';
                    const subcategoriaNombre = data.subcategoria?.nombre || '';
                    if (disciplinaNombre && !nombres.includes(disciplinaNombre)) {
                        nombres = [...nombres, disciplinaNombre].sort();
                    }
                    if (categoriaNombre && !categoriasList.includes(categoriaNombre)) {
                        categoriasList = [...categoriasList, categoriaNombre].sort();
                    }
                    if (subcategoriaNombre && disciplinaNombre && categoriaNombre) {
                        const keyTriple = `${disciplinaNombre}|${categoriaNombre}|${data.genero?.nombre || ''}`;
                        const keyDoble = `${disciplinaNombre}|${categoriaNombre}`;
                        if (!subcatPorKey[keyTriple]?.includes(subcategoriaNombre) && !subcatPorKey[keyDoble]?.includes(subcategoriaNombre)) {
                            subcatPorKey = { ...subcatPorKey, [keyTriple]: [...(subcatPorKey[keyTriple] ?? []), subcategoriaNombre] };
                        }
                    }
                    const genero = data.genero?.nombre || '';
                    const categoriaGeneral = data.categoria?.nombre || '';
                    reset({
                        nombre: data.nombre,
                        apellido: data.apellido,
                        dni: data.dni,
                        fechaNac: data.fechaNac?.split('T')[0] || '',
                        disciplina: disciplinaNombre,
                        genero: (genero === 'Masculino' || genero === 'Femenino' ? genero : '') as ProfileFormValues['genero'],
                        categoriaGeneral: categoriaGeneral as ProfileFormValues['categoriaGeneral'],
                        subcategoria: subcategoriaNombre,
                        email: data.cuenta?.email || '',
                        adultoNombre: (data.adultosResponsables?.[0] || data.adultoResponsable)?.nombre || '',
                        adultoApellido: (data.adultosResponsables?.[0] || data.adultoResponsable)?.apellido || '',
                        adultoDni: (data.adultosResponsables?.[0] || data.adultoResponsable)?.dni || '',
                        adultoEmail: (data.adultosResponsables?.[0] || data.adultoResponsable)?.email || '',
                        adultoTelefono: (data.adultosResponsables?.[0] || data.adultoResponsable)?.telefono || '',
                    });
                    const esMayores = categoriaGeneral === 'Mayores';
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
                setDisciplinasNombres(nombres);
                setCategoriasNombres(categoriasList);
                setCategoriasExcepcion(excepcion);
                setSubcategoriasPorKey(subcatPorKey);
                setProfileLoaded(true);
            } catch (error) {
                console.error('Error cargando perfil:', error);
                setProfileLoaded(true);
            }
        };
        load();
    }, [reset, user?.role]);

    const disciplina = watch('disciplina');
    const genero = watch('genero');
    const categoriaGeneral = watch('categoriaGeneral');

    const categoriasGeneralesOptions = useMemo(() => {
        const key = `${disciplina || ''}|${genero || ''}`;
        if (categoriasExcepcion[key]?.length) return categoriasExcepcion[key];
        return categoriasNombres;
    }, [disciplina, genero, categoriasExcepcion, categoriasNombres]);

    const subcategoriaOptions = useMemo(() => {
        const keyTriple = `${disciplina || ''}|${categoriaGeneral || ''}|${genero || ''}`;
        const keyDoble = `${disciplina || ''}|${categoriaGeneral || ''}`;
        if (subcategoriasPorKey[keyTriple]?.length) return subcategoriasPorKey[keyTriple];
        if (subcategoriasPorKey[keyDoble]?.length) return subcategoriasPorKey[keyDoble];
        return [];
    }, [disciplina, genero, categoriaGeneral, subcategoriasPorKey]);

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

    if (user?.role !== 'deportista') {
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
                    <div className={styles.formCard}>
                        <p className={styles.adminNotice}>
                            Esta página es para que los deportistas editen su perfil. Como administrador podés gestionar perfiles desde el panel de administración.
                        </p>
                        <div className={styles.actions}>
                            <button type="button" className={styles.buttonSecondary} onClick={() => navigate('/dashboard')}>
                                <ArrowLeft size={18} /> Volver al inicio
                            </button>
                        </div>
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
                                        {disciplinasNombres.map((d) => (
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
                                    placeholder="Mín. 6 caracteres, una mayúscula y un número"
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
