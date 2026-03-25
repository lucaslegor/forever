"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clasificacionService = exports.ClasificacionService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
class ClasificacionService {
    async getGeneros() {
        return prisma_1.default.genero.findMany({
            orderBy: { nombre: 'asc' },
        });
    }
    async getCategorias() {
        return prisma_1.default.categoria.findMany({
            orderBy: { nombre: 'asc' },
        });
    }
    async createCategoria(nombre) {
        const n = nombre.trim();
        if (!n)
            throw new Error('El nombre de la categoría es requerido');
        const existente = await prisma_1.default.categoria.findFirst({
            where: { nombre: { equals: n, mode: 'insensitive' } },
        });
        if (existente)
            throw new errors_1.ConflictError('Ya existe una categoría con ese nombre');
        return prisma_1.default.categoria.create({
            data: { nombre: n },
        });
    }
    async deleteCategoria(id) {
        const count = await prisma_1.default.deportista.count({
            where: { categoriaId: id },
        });
        if (count > 0) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.CATEGORIA_TIENE_DEPORTISTAS);
        }
        return prisma_1.default.categoria.delete({
            where: { id },
        });
    }
    async getSubcategorias(disciplinaId, categoriaId, generoId) {
        const where = {};
        if (disciplinaId)
            where.disciplinaId = disciplinaId;
        if (categoriaId)
            where.categoriaId = categoriaId;
        if (generoId !== undefined) {
            // Permitir null para subcategorías sin género específico (ej: Hockey)
            where.generoId = generoId === 0 ? null : generoId;
        }
        return prisma_1.default.subcategoria.findMany({
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
            prisma_1.default.disciplina.findMany({
                where: { activa: true },
                select: { id: true, nombre: true, precioMensual: true },
            }),
        ]);
        // Obtener todas las subcategorías agrupadas por disciplina|categoria|genero
        const subcategorias = await prisma_1.default.subcategoria.findMany({
            include: {
                disciplina: true,
                categoria: true,
                genero: true,
            },
        });
        // Agrupar subcategorías por clave con id para poder borrar desde el frontend
        const subcategoriasPorKey = {};
        subcategorias.forEach((sub) => {
            const keyTriple = `${sub.disciplina.nombre}|${sub.categoria.nombre}|${sub.genero?.nombre || ''}`;
            const keyDoble = `${sub.disciplina.nombre}|${sub.categoria.nombre}`;
            const item = { id: sub.id, nombre: sub.nombre };
            if (sub.genero) {
                if (!subcategoriasPorKey[keyTriple])
                    subcategoriasPorKey[keyTriple] = [];
                subcategoriasPorKey[keyTriple].push(item);
            }
            else {
                if (!subcategoriasPorKey[keyDoble])
                    subcategoriasPorKey[keyDoble] = [];
                subcategoriasPorKey[keyDoble].push(item);
            }
        });
        // Regla de excepción Hockey Masculino solo Mayores
        const categoriasExcepcion = {
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
    async createSubcategoria(data) {
        // Buscar IDs por nombre
        const [disciplina, categoria, genero] = await Promise.all([
            prisma_1.default.disciplina.findFirst({ where: { nombre: data.disciplinaNombre } }),
            prisma_1.default.categoria.findFirst({ where: { nombre: data.categoriaNombre } }),
            data.generoNombre
                ? prisma_1.default.genero.findFirst({ where: { nombre: data.generoNombre } })
                : Promise.resolve(null),
        ]);
        if (!disciplina)
            throw new Error('Disciplina no encontrada');
        if (!categoria)
            throw new Error('Categoría no encontrada');
        return prisma_1.default.subcategoria.create({
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
    async deleteSubcategoria(id) {
        const count = await prisma_1.default.deportista.count({
            where: { subcategoriaId: id },
        });
        if (count > 0) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.SUBCATEGORIA_TIENE_DEPORTISTAS);
        }
        return prisma_1.default.subcategoria.delete({
            where: { id },
        });
    }
}
exports.ClasificacionService = ClasificacionService;
exports.clasificacionService = new ClasificacionService();
//# sourceMappingURL=clasificacion.service.js.map