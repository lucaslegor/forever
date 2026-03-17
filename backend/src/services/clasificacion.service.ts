import prisma from '../config/prisma';
import { ConflictError, ErrorMessages } from '../utils/errors';

export class ClasificacionService {
  async getGeneros() {
    return prisma.genero.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getCategorias() {
    return prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createCategoria(nombre: string) {
    const n = nombre.trim();
    if (!n) throw new Error('El nombre de la categoría es requerido');
    const existente = await prisma.categoria.findFirst({
      where: { nombre: { equals: n, mode: 'insensitive' } },
    });
    if (existente) throw new ConflictError('Ya existe una categoría con ese nombre');
    return prisma.categoria.create({
      data: { nombre: n },
    });
  }

  async deleteCategoria(id: number) {
    const count = await prisma.deportista.count({
      where: { categoriaId: id },
    });
    if (count > 0) {
      throw new ConflictError(ErrorMessages.CATEGORIA_TIENE_DEPORTISTAS);
    }
    return prisma.categoria.delete({
      where: { id },
    });
  }

  async getSubcategorias(
    disciplinaId?: number,
    categoriaId?: number,
    generoId?: number
  ) {
    const where: any = {};
    if (disciplinaId) where.disciplinaId = disciplinaId;
    if (categoriaId) where.categoriaId = categoriaId;
    if (generoId !== undefined) {
      // Permitir null para subcategorías sin género específico (ej: Hockey)
      where.generoId = generoId === 0 ? null : generoId;
    }

    return prisma.subcategoria.findMany({
      where,
      include: {
        disciplina: { select: { id: true, nombre: true } },
        categoria: { select: { id: true, nombre: true } },
        genero: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getOpcionesCompletas() {
    const [generos, categorias, disciplinas] = await Promise.all([
      this.getGeneros(),
      this.getCategorias(),
      prisma.disciplina.findMany({
        where: { activa: true },
        select: { id: true, nombre: true, precioMensual: true },
      }),
    ]);

    // Obtener todas las subcategorías agrupadas por disciplina|categoria|genero
    const subcategorias = await prisma.subcategoria.findMany({
      include: {
        disciplina: true,
        categoria: true,
        genero: true,
      },
    });

    // Agrupar subcategorías por clave con id para poder borrar desde el frontend
    const subcategoriasPorKey: Record<string, Array<{ id: number; nombre: string }>> = {};
    subcategorias.forEach((sub) => {
      const keyTriple = `${sub.disciplina.nombre}|${sub.categoria.nombre}|${sub.genero?.nombre || ''}`;
      const keyDoble = `${sub.disciplina.nombre}|${sub.categoria.nombre}`;
      const item = { id: sub.id, nombre: sub.nombre };
      if (sub.genero) {
        if (!subcategoriasPorKey[keyTriple]) subcategoriasPorKey[keyTriple] = [];
        subcategoriasPorKey[keyTriple].push(item);
      } else {
        if (!subcategoriasPorKey[keyDoble]) subcategoriasPorKey[keyDoble] = [];
        subcategoriasPorKey[keyDoble].push(item);
      }
    });

    // Regla de excepción Hockey Masculino solo Mayores
    const categoriasExcepcion: Record<string, string[]> = {
      'Hockey|Masculino': ['Mayores'],
    };

    return {
      generos: generos.map((g) => ({ id: g.id, nombre: g.nombre })),
      categorias: categorias.map((c) => ({ id: c.id, nombre: c.nombre })),
      disciplinas,
      subcategoriasPorKey,
      categoriasExcepcion,
    };
  }

  async createSubcategoria(data: {
    nombre: string;
    disciplinaNombre: string;
    categoriaNombre: string;
    generoNombre?: string;
  }) {
    // Buscar IDs por nombre
    const [disciplina, categoria, genero] = await Promise.all([
      prisma.disciplina.findFirst({ where: { nombre: data.disciplinaNombre } }),
      prisma.categoria.findFirst({ where: { nombre: data.categoriaNombre } }),
      data.generoNombre
        ? prisma.genero.findFirst({ where: { nombre: data.generoNombre } })
        : Promise.resolve(null),
    ]);

    if (!disciplina) throw new Error('Disciplina no encontrada');
    if (!categoria) throw new Error('Categoría no encontrada');

    return prisma.subcategoria.create({
      data: {
        nombre: data.nombre,
        disciplinaId: disciplina.id,
        categoriaId: categoria.id,
        generoId: genero?.id || null,
      },
      include: {
        disciplina: true,
        categoria: true,
        genero: true,
      },
    });
  }

  async deleteSubcategoria(id: number) {
    const count = await prisma.deportista.count({
      where: { subcategoriaId: id },
    });
    if (count > 0) {
      throw new ConflictError(ErrorMessages.SUBCATEGORIA_TIENE_DEPORTISTAS);
    }
    return prisma.subcategoria.delete({
      where: { id },
    });
  }
}

export const clasificacionService = new ClasificacionService();
