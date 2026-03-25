import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserPlus, UserMinus, Pencil, Plus, Filter, Users } from 'lucide-react';
import type { Deportista, AdultoResponsable } from '../../types/admin';
import { useOpcionesAdmin } from '../../context/OpcionesAdminContext';
import { useConfirm } from '../../context/ConfirmContext';
import { deportistaService } from '../../services/deportista.service';
import { clasificacionService, getSubcategoriaId } from '../../services/clasificacion.service';
import { LoadingScreen } from '../../components/LoadingScreen';
import styles from './AdminDeportistas.module.css';

const initialAdulto = (): AdultoResponsable => ({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
});

export const AdminDeportistas = () => {
    const { disciplinas, disciplinasNombres, generos, generosNombres, categorias, getCategoriasOptions, getSubcategoriaOptions } = useOpcionesAdmin();
    const confirm = useConfirm();
    const [deportistas, setDeportistas] = useState<Deportista[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const primeraDisciplina = disciplinasNombres[0] ?? 'Futbol';
    const primerGenero = generosNombres[0] ?? 'Masculino';
    
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        fechaNac: '',
        disciplina: primeraDisciplina,
        genero: primerGenero,
        categoria: '',
        subcategoria: '',
        adultoResponsable: initialAdulto(),
        password: '',
        passwordConfirm: '',
    });
    
    const [formError, setFormError] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [verAdultosDeportista, setVerAdultosDeportista] = useState<Deportista | null>(null);
    const [modalAdultosData, setModalAdultosData] = useState<Deportista | null>(null);
    const [filtroSearch, setFiltroSearch] = useState<string>('');
    const [filtroDisciplina, setFiltroDisciplina] = useState<string>('');
    const [filtroGenero, setFiltroGenero] = useState<string>('');
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const disciplinaIdFiltro = useMemo(() => disciplinas.find((d) => d.nombre === filtroDisciplina)?.id, [disciplinas, filtroDisciplina]);
    const generoIdFiltro = useMemo(() => generos.find((g) => g.nombre === filtroGenero)?.id, [generos, filtroGenero]);
    const categoriaIdFiltro = useMemo(() => categorias.find((c) => c.nombre === filtroCategoria)?.id, [categorias, filtroCategoria]);
    const [subcategoriaIdFiltro, setSubcategoriaIdFiltro] = useState<number | undefined>(undefined);

    const categoriasFiltroOptions = useMemo(() => getCategoriasOptions(filtroDisciplina || primeraDisciplina, filtroGenero || primerGenero), [filtroDisciplina, filtroGenero, getCategoriasOptions, primeraDisciplina, primerGenero]);
    const subcategoriasFiltroOptions = useMemo(() => getSubcategoriaOptions(filtroDisciplina, filtroGenero, filtroCategoria), [filtroDisciplina, filtroGenero, filtroCategoria, getSubcategoriaOptions]);

    // Resolver subcategoriaId (para filtro server-side) a partir del nombre elegido
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!filtroSubcategoria) {
                setSubcategoriaIdFiltro(undefined);
                return;
            }
            if (!disciplinaIdFiltro || !categoriaIdFiltro) {
                setSubcategoriaIdFiltro(undefined);
                return;
            }
            try {
                const res = await clasificacionService.getSubcategorias(disciplinaIdFiltro, categoriaIdFiltro, generoIdFiltro);
                const arr = res.success && Array.isArray(res.data) ? res.data : [];
                const found = arr.find((s: any) => s?.nombre === filtroSubcategoria);
                const id = getSubcategoriaId(found);
                if (!cancelled) setSubcategoriaIdFiltro(typeof id === 'number' ? id : undefined);
            } catch {
                if (!cancelled) setSubcategoriaIdFiltro(undefined);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [filtroSubcategoria, disciplinaIdFiltro, categoriaIdFiltro, generoIdFiltro]);

    const fetchDeportistas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await deportistaService.getAll({
                page,
                limit,
                search: filtroSearch.trim() || undefined,
                disciplinaId: disciplinaIdFiltro ?? undefined,
                generoId: generoIdFiltro ?? undefined,
                categoriaId: categoriaIdFiltro ?? undefined,
                subcategoriaId: subcategoriaIdFiltro ?? undefined,
            });
            if (response.success && response.data) {
                const paginated = response.data as { data: any[]; total: number; page: number; limit: number; totalPages: number };
                const list = paginated.data ?? [];
                setTotal(paginated.total ?? 0);
                setTotalPages(paginated.totalPages ?? 0);
                const deportistasMap = list.map((d: any) => {
                    const fechaNac = d.fechaNac
                        ? (typeof d.fechaNac === 'string' ? d.fechaNac.split('T')[0] : new Date(d.fechaNac).toISOString().split('T')[0])
                        : '';
                    return {
                    id: d.id,
                    nombre: d.nombre,
                    apellido: d.apellido,
                    dni: d.dni,
                    fechaNac,
                    disciplina: d.disciplina?.nombre || '',
                    genero: d.genero?.nombre || '',
                    categoria: d.categoria?.nombre || '',
                    subcategoria: d.subcategoria?.nombre || '',
                    adultoResponsable: (d.adultosResponsables?.[0] || d.adultoResponsable) ? {
                        nombre: (d.adultosResponsables?.[0] || d.adultoResponsable)!.nombre,
                        apellido: (d.adultosResponsables?.[0] || d.adultoResponsable)!.apellido,
                        dni: (d.adultosResponsables?.[0] || d.adultoResponsable)!.dni,
                        email: (d.adultosResponsables?.[0] || d.adultoResponsable)!.email,
                        telefono: (d.adultosResponsables?.[0] || d.adultoResponsable)!.telefono,
                    } : null,
                    adultosResponsables: Array.isArray(d.adultosResponsables)
                        ? d.adultosResponsables
                        : d.adultoResponsable
                            ? [d.adultoResponsable]
                            : [],
                    activo: d.cuenta?.activo ?? true,
                };
                });
                setDeportistas(deportistasMap);
            }
        } catch (error) {
            setFormError('Error al cargar deportistas');
        } finally {
            setLoading(false);
        }
    }, [page, limit, filtroSearch, disciplinaIdFiltro, generoIdFiltro, categoriaIdFiltro, subcategoriaIdFiltro]);

    useEffect(() => {
        fetchDeportistas();
    }, [fetchDeportistas]);

    useEffect(() => {
        if (!verAdultosDeportista) {
            setModalAdultosData(null);
            return;
        }
        let cancelled = false;
        deportistaService.getById(verAdultosDeportista.id).then((res) => {
            if (cancelled || !res.success || !res.data) return;
            const d = res.data as any;
            const lista = Array.isArray(d.adultosResponsables) && d.adultosResponsables.length > 0
                ? d.adultosResponsables
                : d.adultoResponsable
                    ? [d.adultoResponsable]
                    : [];
            setModalAdultosData({
                ...verAdultosDeportista,
                adultosResponsables: lista,
                adultoResponsable: d.adultoResponsable ?? (lista[0] || null),
            });
        }).catch(() => {
            if (!cancelled) setModalAdultosData(verAdultosDeportista);
        });
        return () => { cancelled = true; };
    }, [verAdultosDeportista]);

    const categoriasOptions = getCategoriasOptions(form.disciplina, form.genero);
    const subcategoriaOptions = getSubcategoriaOptions(form.disciplina, form.genero, form.categoria);
    const isMenor = form.categoria === 'Juveniles' || form.categoria === 'Infantiles';

    const resetForm = () => {
        setForm({
            nombre: '',
            apellido: '',
            dni: '',
            fechaNac: '',
            disciplina: primeraDisciplina,
            genero: primerGenero,
            categoria: '',
            subcategoria: '',
            adultoResponsable: initialAdulto(),
            password: '',
            passwordConfirm: '',
        });
        setFormError(null);
        setTouched({});
        setEditingId(null);
        setMode('list');
    };

    const setFieldTouched = (field: string) => {
        setTouched((t) => ({ ...t, [field]: true }));
    };

    const openCreate = () => {
        resetForm();
        setMode('create');
    };

    const openEdit = (d: Deportista) => {
        setForm({
            nombre: d.nombre,
            apellido: d.apellido,
            dni: d.dni,
            fechaNac: d.fechaNac || '',
            disciplina: d.disciplina,
            genero: d.genero,
            categoria: d.categoria,
            subcategoria: d.subcategoria,
            adultoResponsable: (d.adultosResponsables?.[0] || d.adultoResponsable) ?? initialAdulto(),
            password: '',
            passwordConfirm: '',
        });
        setEditingId(d.id);
        setMode('edit');
    };

    const handleDarDeBaja = async (id: number) => {
        const ok = await confirm({
            title: 'Dar de baja',
            message: '¿Dar de baja a este deportista?',
            confirmLabel: 'Dar de baja',
            cancelLabel: 'Cancelar',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await deportistaService.delete(id);
            await fetchDeportistas();
        } catch (error) {
            alert('Error al dar de baja al deportista');
        }
    };

    const handleAlta = async (id: number) => {
        try {
            await deportistaService.darDeAlta(id);
            await fetchDeportistas();
            alert('Deportista dado de alta. Ya puede iniciar sesión.');
        } catch (error) {
            alert('Error al dar de alta al deportista');
        }
    };

    const validateForm = (): string | null => {
        const nombre = form.nombre.trim();
        const apellido = form.apellido.trim();
        if (!nombre) return 'El nombre es obligatorio.';
        if (nombre.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
        if (nombre.length > 50) return 'El nombre no puede exceder 50 caracteres.';
        if (!apellido) return 'El apellido es obligatorio.';
        if (apellido.length < 2) return 'El apellido debe tener al menos 2 caracteres.';
        if (apellido.length > 50) return 'El apellido no puede exceder 50 caracteres.';

        const dniDeportistaSolo = form.dni.replace(/\D/g, '');
        if (!dniDeportistaSolo) return 'El DNI del deportista es obligatorio.';
        if (!/^\d{7,8}$/.test(dniDeportistaSolo)) {
            return 'El DNI del deportista debe tener 7 u 8 dígitos (solo números, sin puntos ni espacios).';
        }

        if (mode === 'create') {
            if (!form.fechaNac || !form.fechaNac.trim()) return 'La fecha de nacimiento es obligatoria.';
            const fechaNacNorm = form.fechaNac.trim();
            let fechaDate: Date;
            const matchDDMMYYYY = fechaNacNorm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (matchDDMMYYYY) {
                const [, d, m, y] = matchDDMMYYYY;
                fechaDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
            } else {
                fechaDate = new Date(fechaNacNorm);
            }
            if (Number.isNaN(fechaDate.getTime())) return 'La fecha de nacimiento no es válida.';
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaDate > hoy) return 'La fecha de nacimiento no puede ser futura.';
            const años = Math.floor((hoy.getTime() - fechaDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (años > 120) return 'La fecha de nacimiento no es válida.';
        } else if (mode === 'edit' && form.fechaNac.trim()) {
            const fechaDate = new Date(form.fechaNac.trim());
            if (Number.isNaN(fechaDate.getTime())) return 'La fecha de nacimiento no es válida.';
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaDate > hoy) return 'La fecha de nacimiento no puede ser futura.';
        }

        if (!form.categoria || form.categoria === '') return 'Seleccioná una categoría.';
        if (subcategoriaOptions.length > 0 && !form.subcategoria.trim()) {
            return 'Seleccioná una subcategoría para la disciplina y categoría elegidas.';
        }

        if (mode === 'create') {
            if (!form.password) return 'La contraseña es obligatoria.';
            if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
            if (form.password !== form.passwordConfirm) return 'La contraseña y la confirmación no coinciden.';
        }

        if (isMenor) {
            const a = form.adultoResponsable;
            if (!a.nombre.trim()) return 'El nombre del adulto responsable es obligatorio.';
            if (a.nombre.trim().length < 2) return 'El nombre del adulto responsable debe tener al menos 2 caracteres.';
            if (!a.apellido.trim()) return 'El apellido del adulto responsable es obligatorio.';
            if (a.apellido.trim().length < 2) return 'El apellido del adulto responsable debe tener al menos 2 caracteres.';
            const dniSolo = a.dni.replace(/\D/g, '');
            if (!dniSolo) return 'El DNI del adulto responsable es obligatorio.';
            if (!/^\d{7,8}$/.test(dniSolo)) {
                return 'El DNI del adulto responsable debe tener 7 u 8 dígitos (solo números).';
            }
            if (!a.email.trim()) return 'El email del adulto responsable es obligatorio.';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(a.email.trim())) return 'Ingresá un email válido para el adulto responsable.';
            if (!a.telefono.trim()) return 'El teléfono del adulto responsable es obligatorio.';
        }

        return null;
    };

    const fieldErrors = useMemo((): Record<string, string> => {
        const err: Record<string, string> = {};
        const nombre = form.nombre.trim();
        const apellido = form.apellido.trim();
        if (!nombre) err.nombre = 'El nombre es obligatorio.';
        else if (nombre.length < 2) err.nombre = 'Mínimo 2 caracteres.';
        else if (nombre.length > 50) err.nombre = 'Máximo 50 caracteres.';
        if (!apellido) err.apellido = 'El apellido es obligatorio.';
        else if (apellido.length < 2) err.apellido = 'Mínimo 2 caracteres.';
        else if (apellido.length > 50) err.apellido = 'Máximo 50 caracteres.';

        const dniSolo = form.dni.replace(/\D/g, '');
        if (!dniSolo) err.dni = 'El DNI es obligatorio.';
        else if (!/^\d{7,8}$/.test(dniSolo)) err.dni = '7 u 8 dígitos (solo números).';

        if (mode === 'create') {
            if (!form.fechaNac?.trim()) err.fechaNac = 'La fecha es obligatoria.';
            else {
                const fechaNacNorm = form.fechaNac.trim();
                let fechaDate: Date;
                const matchDDMMYYYY = fechaNacNorm.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (matchDDMMYYYY) {
                    const [, d, m, y] = matchDDMMYYYY;
                    fechaDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
                } else {
                    fechaDate = new Date(fechaNacNorm);
                }
                if (Number.isNaN(fechaDate.getTime())) err.fechaNac = 'Fecha no válida.';
                else {
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    if (fechaDate > hoy) err.fechaNac = 'No puede ser futura.';
                    else if (Math.floor((hoy.getTime() - fechaDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) > 120) err.fechaNac = 'Fecha no válida.';
                }
            }
        } else if (mode === 'edit' && form.fechaNac.trim()) {
            const fechaDate = new Date(form.fechaNac.trim());
            if (Number.isNaN(fechaDate.getTime())) err.fechaNac = 'Fecha no válida.';
            else {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                if (fechaDate > hoy) err.fechaNac = 'No puede ser futura.';
            }
        }

        if (!form.categoria?.trim()) err.categoria = 'Seleccioná una categoría.';
        if (subcategoriaOptions.length > 0 && !form.subcategoria.trim()) err.subcategoria = 'Seleccioná una subcategoría.';

        if (mode === 'create') {
            if (!form.password) err.password = 'La contraseña es obligatoria.';
            else if (form.password.length < 6) err.password = 'Mínimo 6 caracteres.';
            if (form.password !== form.passwordConfirm) err.passwordConfirm = 'No coincide con la contraseña.';
        }

        if (isMenor) {
            const a = form.adultoResponsable;
            if (!a.nombre.trim()) err.adulto_nombre = 'Obligatorio.';
            else if (a.nombre.trim().length < 2) err.adulto_nombre = 'Mínimo 2 caracteres.';
            if (!a.apellido.trim()) err.adulto_apellido = 'Obligatorio.';
            else if (a.apellido.trim().length < 2) err.adulto_apellido = 'Mínimo 2 caracteres.';
            const adni = a.dni.replace(/\D/g, '');
            if (!adni) err.adulto_dni = 'Obligatorio.';
            else if (!/^\d{7,8}$/.test(adni)) err.adulto_dni = '7 u 8 dígitos.';
            if (!a.email.trim()) err.adulto_email = 'Obligatorio.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) err.adulto_email = 'Email no válido.';
            if (!a.telefono.trim()) err.adulto_telefono = 'Obligatorio.';
        }
        return err;
    }, [form, mode, isMenor, subcategoriaOptions.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setTouched({
            nombre: true, apellido: true, dni: true, fechaNac: true, categoria: true, subcategoria: true,
            password: true, passwordConfirm: true,
            adulto_nombre: true, adulto_apellido: true, adulto_dni: true, adulto_email: true, adulto_telefono: true,
        });

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);

        try {
            // Buscar IDs de disciplina, género, categoría
            const disciplinaObj = disciplinas.find(d => d.nombre === form.disciplina);
            const generoObj = generos.find(g => g.nombre === form.genero);
            const categoriaObj = categorias.find(c => c.nombre === form.categoria);

            if (!disciplinaObj) {
                setFormError('Disciplina no encontrada');
                setSaving(false);
                return;
            }
            if (!generoObj) {
                setFormError('Género no encontrado');
                setSaving(false);
                return;
            }
            if (!categoriaObj) {
                setFormError('Categoría no encontrada');
                setSaving(false);
                return;
            }

            const generoId = generoObj.id;
            const categoriaId = categoriaObj.id;

            // Resolver subcategoriaId por nombre (si hay subcategoría elegida)
            let subcategoriaId: number | undefined | null = undefined;
            if (form.subcategoria.trim()) {
                const subRes = await clasificacionService.getSubcategorias(
                    disciplinaObj.id,
                    categoriaId,
                    generoId
                );
                const arr = subRes.success && Array.isArray(subRes.data) ? subRes.data : [];
                const sub = arr.find((s: any) => s.nombre === form.subcategoria);
                if (sub) subcategoriaId = getSubcategoriaId(sub);
            } else if (mode === 'edit') {
                subcategoriaId = null; // Permitir vaciar subcategoría al editar
            }

            if (mode === 'create') {
                const dniDeportista = form.dni.replace(/\D/g, '').trim();
                // Asegurar fecha en YYYY-MM-DD (input type="date" ya lo da; por si acaso normalizar dd/mm/yyyy)
                let fechaNac = form.fechaNac.trim();
                const matchDDMMYYYY = fechaNac.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (matchDDMMYYYY) {
                    const [, d, m, y] = matchDDMMYYYY;
                    fechaNac = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
                const createData = {
                    nombre: form.nombre.trim(),
                    apellido: form.apellido.trim(),
                    dni: dniDeportista,
                    fechaNac,
                   generoId: Number(generoId),
                    categoriaId: Number(categoriaId),
                    ...(subcategoriaId != null && subcategoriaId !== undefined ? { subcategoriaId: Number(subcategoriaId) } : {}),
                    disciplinaId: Number(disciplinaObj.id),
                    email: `${dniDeportista}@temp.com`,
                    password: form.password,
                    adultoResponsable: isMenor ? {
                        nombre: form.adultoResponsable.nombre.trim(),
                        apellido: form.adultoResponsable.apellido.trim(),
                        dni: form.adultoResponsable.dni.replace(/\D/g, '').trim(),
                        email: form.adultoResponsable.email.trim(),
                        telefono: form.adultoResponsable.telefono.trim(),
                    } : undefined,
                };

                const response = await deportistaService.create(createData);
                if (response.success) {
                    await fetchDeportistas();
                    resetForm();
                } else {
                    setFormError('Error al crear deportista');
                }
            } else if (mode === 'edit' && editingId !== null) {
                const updateData = {
                    nombre: form.nombre.trim(),
                    apellido: form.apellido.trim(),
                    fechaNac: form.fechaNac || undefined,
                    generoId,
                    categoriaId,
                    subcategoriaId: subcategoriaId ?? null,
                    disciplinaId: disciplinaObj.id,
                    adultoResponsable: isMenor ? {
                        nombre: form.adultoResponsable.nombre.trim(),
                        apellido: form.adultoResponsable.apellido.trim(),
                        dni: form.adultoResponsable.dni.replace(/\D/g, '').trim(),
                        email: form.adultoResponsable.email.trim(),
                        telefono: form.adultoResponsable.telefono.trim(),
                    } : undefined,
                };

                const response = await deportistaService.update(editingId, updateData);
                if (response.success) {
                    await fetchDeportistas();
                    resetForm();
                } else {
                    setFormError('Error al actualizar deportista');
                }
            }
        } catch (error: any) {
            const data = error.response?.data;
            let message = '';
            if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
                const parts = Object.entries(data.errors).map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`);
                message = parts.length ? parts.join('. ') : (data?.error || data?.message || '');
            } else if (Array.isArray(data?.errors)) {
                message = data.errors.map((e: any) => e.message || e.msg).join('. ');
            }
            if (!message) message = data?.error || data?.message || 'Error al guardar deportista';
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

    const updateAdulto = (field: keyof AdultoResponsable, value: string) => {
        setForm((f) => ({
            ...f,
            adultoResponsable: { ...f.adultoResponsable, [field]: value },
        }));
    };

    if (loading) return <LoadingScreen fullPage />;

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Gestión deportistas</h2>

            {mode === 'list' && (
                <>
                    <div>
                        <button className={styles.btnNew} onClick={openCreate}>
                            <Plus size={20} /> Nuevo deportista
                        </button>
                    </div>

                    <div className={styles.filters}>
                        <p className={styles.filtersLabel}>
                            <Filter size={18} /> Filtros
                        </p>
                        <div className={styles.filtersGrid}>
                            <div>
                                <label>Buscar (nombre, apellido, DNI)</label>
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={filtroSearch}
                                    onChange={(e) => { setFiltroSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                            <div>
                                <label>Disciplina</label>
                                <select value={filtroDisciplina} onChange={(e) => { setFiltroDisciplina(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); setPage(1); }}>
                                    <option value="">Todas</option>
                                    {disciplinasNombres.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Género</label>
                                <select value={filtroGenero} onChange={(e) => { setFiltroGenero(e.target.value); setFiltroCategoria(''); setFiltroSubcategoria(''); setPage(1); }}>
                                    <option value="">Todos</option>
                                    {generosNombres.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Categoría</label>
                                <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setFiltroSubcategoria(''); setPage(1); }}>
                                    <option value="">Todas</option>
                                    {categoriasFiltroOptions.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Subcategoría</label>
                                <select value={filtroSubcategoria} onChange={(e) => { setFiltroSubcategoria(e.target.value); setPage(1); }}>
                                    <option value="">Todas</option>
                                    {subcategoriasFiltroOptions.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>DNI</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Disciplina</th>
                                    <th>Género</th>
                                    <th>Categoría</th>
                                    <th>Subcategoría</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deportistas.map((d) => (
                                    <tr key={d.id}>
                                        <td>{d.dni}</td>
                                        <td>{d.nombre}</td>
                                        <td>{d.apellido}</td>
                                        <td>{d.disciplina}</td>
                                        <td>{d.genero}</td>
                                        <td>{d.categoria}</td>
                                        <td>{d.subcategoria}</td>
                                        <td>
                                            <span className={d.activo ? styles.badgeActivo : styles.badgeInactivo}>
                                                {d.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {(d.categoria === 'Infantiles' || d.categoria === 'Juveniles') && (
                                                    <button
                                                        type="button"
                                                        className={styles.btnVerAdultos}
                                                        onClick={() => setVerAdultosDeportista(d)}
                                                        title="Ver adultos responsables"
                                                    >
                                                        <Users size={16} />
                                                    </button>
                                                )}
                                                <button className={styles.btnEdit} onClick={() => openEdit(d)} title="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                                {d.activo ? (
                                                    <button className={styles.btnDanger} onClick={() => handleDarDeBaja(d.id)} title="Dar de baja">
                                                        <UserMinus size={16} />
                                                    </button>
                                                ) : (
                                                    <button className={styles.btnSuccess} onClick={() => handleAlta(d.id)} title="Dar de alta">
                                                        <UserPlus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {deportistas.length === 0 && !loading && (
                            <p className={styles.emptyState}>No hay deportistas que coincidan con los filtros.</p>
                        )}
                    </div>
                    {total > 0 && (
                        <div className={styles.pagination}>
                            <span>
                                Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}
                            </span>
                            <div className={styles.paginationButtons}>
                                <button type="button" className={styles.btnPagination} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    Anterior
                                </button>
                                <span className={styles.paginationInfo}>Página {page} de {totalPages || 1}</span>
                                <button type="button" className={styles.btnPagination} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}

                    {verAdultosDeportista !== null && (
                        <div className={styles.overlay} onClick={() => { setVerAdultosDeportista(null); setModalAdultosData(null); }} role="dialog" aria-modal="true" aria-label="Adultos responsables">
                            <div className={styles.modalAdultos} onClick={(e) => e.stopPropagation()}>
                                <h3 className={styles.modalAdultosTitle}>
                                    Adultos responsables
                                </h3>
                                <div className={styles.modalAdultosList}>
                                    {(() => {
                                        const data = modalAdultosData ?? verAdultosDeportista;
                                        const lista = (data.adultosResponsables && data.adultosResponsables.length > 0)
                                            ? data.adultosResponsables
                                            : data.adultoResponsable
                                                ? [data.adultoResponsable]
                                                : [];
                                        if (lista.length === 0) {
                                            return <p className={styles.modalAdultosEmpty}>No hay adultos cargados.</p>;
                                        }
                                        return lista.map((ar, idx) => (
                                            <div key={idx} className={styles.modalAdultosCard}>
                                                <p><strong>{ar.nombre} {ar.apellido}</strong></p>
                                                {ar.dni && <p>DNI: {ar.dni}</p>}
                                                {ar.email && <p>Email: {ar.email}</p>}
                                                {ar.telefono && <p>Teléfono: {ar.telefono}</p>}
                                            </div>
                                        ));
                                    })()}
                                </div>
                                <div className={styles.modalAdultosActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => { setVerAdultosDeportista(null); setModalAdultosData(null); }}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {(mode === 'create' || mode === 'edit') && (
                <div className={styles.formContainer}>
                    <h3 className={styles.formTitle}>{mode === 'create' ? 'Nuevo deportista' : 'Editar deportista'}</h3>
                    {formError && <p className={styles.formError}>{formError}</p>}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.fieldWrap}>
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    onBlur={() => setFieldTouched('nombre')}
                                    className={touched.nombre && fieldErrors.nombre ? styles.inputError : ''}
                                    required
                                />
                                {touched.nombre && fieldErrors.nombre && <span className={styles.fieldError}>{fieldErrors.nombre}</span>}
                            </div>
                            <div className={styles.fieldWrap}>
                                <label>Apellido *</label>
                                <input
                                    type="text"
                                    value={form.apellido}
                                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                                    onBlur={() => setFieldTouched('apellido')}
                                    className={touched.apellido && fieldErrors.apellido ? styles.inputError : ''}
                                    required
                                />
                                {touched.apellido && fieldErrors.apellido && <span className={styles.fieldError}>{fieldErrors.apellido}</span>}
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.fieldWrap}>
                                <label>DNI *</label>
                                <input
                                    type="text"
                                    value={form.dni}
                                    onChange={(e) => setForm({ ...form, dni: e.target.value })}
                                    onBlur={() => setFieldTouched('dni')}
                                    className={touched.dni && fieldErrors.dni ? styles.inputError : ''}
                                    required
                                    disabled={mode === 'edit'}
                                />
                                {touched.dni && fieldErrors.dni && <span className={styles.fieldError}>{fieldErrors.dni}</span>}
                            </div>
                            <div className={styles.fieldWrap}>
                                <label>Fecha de Nacimiento *</label>
                                <input
                                    type="date"
                                    value={form.fechaNac}
                                    onChange={(e) => setForm({ ...form, fechaNac: e.target.value })}
                                    onBlur={() => setFieldTouched('fechaNac')}
                                    className={touched.fechaNac && fieldErrors.fechaNac ? styles.inputError : ''}
                                    required
                                />
                                {touched.fechaNac && fieldErrors.fechaNac && <span className={styles.fieldError}>{fieldErrors.fechaNac}</span>}
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.fieldWrap}>
                                <label>Disciplina *</label>
                                <select value={form.disciplina} onChange={(e) => setForm({ ...form, disciplina: e.target.value, categoria: '', subcategoria: '' })} required>
                                    {disciplinasNombres.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.fieldWrap}>
                                <label>Género *</label>
                                <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value, categoria: '', subcategoria: '' })} required>
                                    {generosNombres.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.fieldWrap}>
                                <label>Categoría *</label>
                                <select
                                    value={form.categoria}
                                    onChange={(e) => setForm({ ...form, categoria: e.target.value, subcategoria: '' })}
                                    onBlur={() => setFieldTouched('categoria')}
                                    className={touched.categoria && fieldErrors.categoria ? styles.inputError : ''}
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    {categoriasOptions.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {touched.categoria && fieldErrors.categoria && <span className={styles.fieldError}>{fieldErrors.categoria}</span>}
                            </div>
                            <div className={styles.fieldWrap}>
                                <label>Subcategoría</label>
                                <select
                                    value={form.subcategoria}
                                    onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                                    onBlur={() => setFieldTouched('subcategoria')}
                                    className={touched.subcategoria && fieldErrors.subcategoria ? styles.inputError : ''}
                                >
                                    <option value="">Seleccionar</option>
                                    {subcategoriaOptions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                {touched.subcategoria && fieldErrors.subcategoria && <span className={styles.fieldError}>{fieldErrors.subcategoria}</span>}
                            </div>
                        </div>

                        {mode === 'create' && (
                            <div className={styles.formRow}>
                                <div className={styles.fieldWrap}>
                                    <label>Contraseña *</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onBlur={() => setFieldTouched('password')}
                                        className={touched.password && fieldErrors.password ? styles.inputError : ''}
                                        required
                                    />
                                    {touched.password && fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
                                </div>
                                <div className={styles.fieldWrap}>
                                    <label>Confirmar contraseña *</label>
                                    <input
                                        type="password"
                                        value={form.passwordConfirm}
                                        onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                                        onBlur={() => setFieldTouched('passwordConfirm')}
                                        className={touched.passwordConfirm && fieldErrors.passwordConfirm ? styles.inputError : ''}
                                        required
                                    />
                                    {touched.passwordConfirm && fieldErrors.passwordConfirm && <span className={styles.fieldError}>{fieldErrors.passwordConfirm}</span>}
                                </div>
                            </div>
                        )}

                        {isMenor && (
                            <div className={styles.adultoResponsableSection}>
                                <h4>Adulto Responsable (Obligatorio para Juveniles e Infantiles)</h4>
                                <div className={styles.formRow}>
                                    <div className={styles.fieldWrap}>
                                        <label>Nombre *</label>
                                        <input
                                            type="text"
                                            value={form.adultoResponsable.nombre}
                                            onChange={(e) => updateAdulto('nombre', e.target.value)}
                                            onBlur={() => setFieldTouched('adulto_nombre')}
                                            className={touched.adulto_nombre && fieldErrors.adulto_nombre ? styles.inputError : ''}
                                            required
                                        />
                                        {touched.adulto_nombre && fieldErrors.adulto_nombre && <span className={styles.fieldError}>{fieldErrors.adulto_nombre}</span>}
                                    </div>
                                    <div className={styles.fieldWrap}>
                                        <label>Apellido *</label>
                                        <input
                                            type="text"
                                            value={form.adultoResponsable.apellido}
                                            onChange={(e) => updateAdulto('apellido', e.target.value)}
                                            onBlur={() => setFieldTouched('adulto_apellido')}
                                            className={touched.adulto_apellido && fieldErrors.adulto_apellido ? styles.inputError : ''}
                                            required
                                        />
                                        {touched.adulto_apellido && fieldErrors.adulto_apellido && <span className={styles.fieldError}>{fieldErrors.adulto_apellido}</span>}
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.fieldWrap}>
                                        <label>DNI *</label>
                                        <input
                                            type="text"
                                            value={form.adultoResponsable.dni}
                                            onChange={(e) => updateAdulto('dni', e.target.value)}
                                            onBlur={() => setFieldTouched('adulto_dni')}
                                            placeholder="7 u 8 dígitos, sin puntos ni espacios"
                                            className={touched.adulto_dni && fieldErrors.adulto_dni ? styles.inputError : ''}
                                            required
                                        />
                                        {touched.adulto_dni && fieldErrors.adulto_dni && <span className={styles.fieldError}>{fieldErrors.adulto_dni}</span>}
                                    </div>
                                    <div className={styles.fieldWrap}>
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={form.adultoResponsable.email}
                                            onChange={(e) => updateAdulto('email', e.target.value)}
                                            onBlur={() => setFieldTouched('adulto_email')}
                                            className={touched.adulto_email && fieldErrors.adulto_email ? styles.inputError : ''}
                                            required
                                        />
                                        {touched.adulto_email && fieldErrors.adulto_email && <span className={styles.fieldError}>{fieldErrors.adulto_email}</span>}
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.fieldWrap}>
                                        <label>Teléfono *</label>
                                        <input
                                            type="tel"
                                            value={form.adultoResponsable.telefono}
                                            onChange={(e) => updateAdulto('telefono', e.target.value)}
                                            onBlur={() => setFieldTouched('adulto_telefono')}
                                            className={touched.adulto_telefono && fieldErrors.adulto_telefono ? styles.inputError : ''}
                                            required
                                        />
                                        {touched.adulto_telefono && fieldErrors.adulto_telefono && <span className={styles.fieldError}>{fieldErrors.adulto_telefono}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnCancel} onClick={resetForm} disabled={saving}>
                                Cancelar
                            </button>
                            <button type="submit" className={styles.btnSubmit} disabled={saving}>
                                {saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
