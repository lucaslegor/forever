import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import type { Disciplina } from '../types/admin';
import { clasificacionService } from '../services/clasificacion.service';

/** Categorías por disciplina|genero (excepción). Ej: "Hockey|Masculino" -> ['Mayores'] */
type CategoriasExcepcion = Record<string, string[]>;
/** Subcategorías por key: "Disciplina|Categoria|Genero" o "Disciplina|Categoria"; cada valor tiene id (para borrar) y nombre */
type SubcategoriasPorKey = Record<string, Array<{ id: number; nombre: string }>>;

type OpcionesAdminState = {
  disciplinas: Disciplina[];
  generos: Array<{ id: number; nombre: string }>;
  categorias: Array<{ id: number; nombre: string }>;
  categoriasExcepcion: CategoriasExcepcion;
  subcategoriasPorKey: SubcategoriasPorKey;
  loading: boolean;
};

type OpcionesAdminContextValue = OpcionesAdminState & {
  setDisciplinas: React.Dispatch<React.SetStateAction<Disciplina[]>>;
  setGeneros: React.Dispatch<React.SetStateAction<Array<{ id: number; nombre: string }>>>;
  setCategorias: React.Dispatch<React.SetStateAction<Array<{ id: number; nombre: string }>>>;
  setCategoriasExcepcion: React.Dispatch<React.SetStateAction<CategoriasExcepcion>>;
  setSubcategoriasPorKey: React.Dispatch<React.SetStateAction<SubcategoriasPorKey>>;
  /** Nombres de disciplinas activas (para dropdowns) */
  disciplinasNombres: string[];
  /** Nombres de géneros (para dropdowns) */
  generosNombres: string[];
  /** Nombres de categorías (para dropdowns) */
  categoriasNombres: string[];
  getCategoriasOptions: (disciplina: string, genero: string) => string[];
  getSubcategoriaOptions: (disciplina: string, genero: string, categoria: string) => string[];
  refetch: () => Promise<void>;
};

const OpcionesAdminContext = createContext<OpcionesAdminContextValue | null>(null);

export const OpcionesAdminProvider = ({ children }: { children: ReactNode }) => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [generos, setGeneros] = useState<Array<{ id: number; nombre: string }>>([]);
  const [categorias, setCategorias] = useState<Array<{ id: number; nombre: string }>>([]);
  const [categoriasExcepcion, setCategoriasExcepcion] = useState<CategoriasExcepcion>({});
  const [subcategoriasPorKey, setSubcategoriasPorKey] = useState<SubcategoriasPorKey>({});
  const [loading, setLoading] = useState(true);

  const fetchOpciones = async () => {
    setLoading(true);
    try {
      const response = await clasificacionService.getOpcionesCompletas();
      if (response.success && response.data) {
        const data = response.data;
        
        // Mapear disciplinas al formato esperado (backend usa precioMensual, puede venir como Decimal/string)
        const disciplinasMap: Disciplina[] = data.disciplinas.map(d => ({
          id: d.id,
          nombre: d.nombre,
          valorMensual: Number(d.precioMensual) || 0,
          activo: true,
        }));

        setGeneros(data.generos);
        setCategorias(data.categorias);
        setDisciplinas(disciplinasMap);
        setCategoriasExcepcion(data.categoriasExcepcion);
        setSubcategoriasPorKey(data.subcategoriasPorKey);
      }
    } catch (error) {
      // Valores por defecto en caso de error
      setGeneros([
        { id: 1, nombre: 'Masculino' },
        { id: 2, nombre: 'Femenino' },
      ]);
      setCategorias([
        { id: 1, nombre: 'Mayores' },
        { id: 2, nombre: 'Juveniles' },
        { id: 3, nombre: 'Infantiles' },
      ]);
      setCategoriasExcepcion({ 'Hockey|Masculino': ['Mayores'] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpciones();
  }, []);

  const disciplinasNombres = useMemo(
    () => disciplinas.filter((d) => d.activo).map((d) => d.nombre),
    [disciplinas]
  );

  const generosNombres = useMemo(
    () => generos.map((g) => g.nombre),
    [generos]
  );

  const categoriasNombres = useMemo(
    () => categorias.map((c) => c.nombre),
    [categorias]
  );

  const getCategoriasOptions = useMemo(
    () => (disciplina: string, genero: string) => {
      const key = `${disciplina}|${genero}`;
      if (categoriasExcepcion[key]) return categoriasExcepcion[key];
      return categoriasNombres;
    },
    [categoriasExcepcion, categoriasNombres]
  );

  const getSubcategoriaOptions = useMemo(
    () => (disciplina: string, genero: string, categoria: string): string[] => {
      const keyTriple = `${disciplina}|${categoria}|${genero}`;
      const keyDoble = `${disciplina}|${categoria}`;
      const arr = subcategoriasPorKey[keyTriple] ?? subcategoriasPorKey[keyDoble] ?? [];
      return arr.map((s) => (typeof s === 'string' ? s : s.nombre));
    },
    [subcategoriasPorKey]
  );

  const value: OpcionesAdminContextValue = useMemo(
    () => ({
      disciplinas,
      generos,
      categorias,
      categoriasExcepcion,
      subcategoriasPorKey,
      loading,
      setDisciplinas,
      setGeneros,
      setCategorias,
      setCategoriasExcepcion,
      setSubcategoriasPorKey,
      disciplinasNombres,
      generosNombres,
      categoriasNombres,
      getCategoriasOptions,
      getSubcategoriaOptions,
      refetch: fetchOpciones,
    }),
    [
      disciplinas,
      generos,
      categorias,
      categoriasExcepcion,
      subcategoriasPorKey,
      loading,
      disciplinasNombres,
      generosNombres,
      categoriasNombres,
      getCategoriasOptions,
      getSubcategoriaOptions,
    ]
  );

  return <OpcionesAdminContext.Provider value={value}>{children}</OpcionesAdminContext.Provider>;
};

export const useOpcionesAdmin = () => {
  const ctx = useContext(OpcionesAdminContext);
  if (!ctx) throw new Error('useOpcionesAdmin must be used within OpcionesAdminProvider');
  return ctx;
};
