import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Noticia } from '../types/noticia';
import { noticiaService } from '../services/noticia.service';

interface NoticiasContextValue {
  noticias: Noticia[];
  loading: boolean;
  error: string | null;
  addNoticia: (n: Omit<Noticia, 'id'>) => Promise<boolean>;
  getNoticiaById: (id: number) => Noticia | undefined;
  refetch: () => Promise<void>;
}

const NoticiasContext = createContext<NoticiasContextValue | null>(null);

export function NoticiasProvider({ children }: { children: ReactNode }) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await noticiaService.getAll();
      if (response.success && response.data) {
        setNoticias(response.data);
      }
    } catch (err) {
      setError('No se pudieron cargar las noticias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const addNoticia = useCallback(async (n: Omit<Noticia, 'id'>): Promise<boolean> => {
    try {
      const response = await noticiaService.create({
        titulo: n.titulo,
        fecha: n.fecha,
        resumen: n.resumen,
        contenido: n.contenido,
        imagenes: n.imagenes,
      });
      
      if (response.success) {
        await fetchNoticias();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [fetchNoticias]);

  const getNoticiaById = useCallback(
    (id: number) => noticias.find((n) => n.id === id),
    [noticias]
  );

  const value: NoticiasContextValue = {
    noticias,
    loading,
    error,
    addNoticia,
    getNoticiaById,
    refetch: fetchNoticias,
  };

  return <NoticiasContext.Provider value={value}>{children}</NoticiasContext.Provider>;
}

export function useNoticias() {
  const ctx = useContext(NoticiasContext);
  if (!ctx) throw new Error('useNoticias must be used within NoticiasProvider');
  return ctx;
}
