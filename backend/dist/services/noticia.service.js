"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticiaService = exports.NoticiaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
class NoticiaService {
    async create(data) {
        const imagenes = data.imagenes ?? [];
        const noticia = await prisma_1.default.noticia.create({
            data: {
                titulo: data.titulo,
                fecha: new Date(data.fecha),
                resumen: data.resumen,
                contenido: data.contenido,
                autorId: data.autorId ?? undefined,
                ...(imagenes.length > 0 && {
                    imagenes: {
                        create: imagenes.map((url, index) => ({
                            url,
                            orden: index + 1,
                        })),
                    },
                }),
            },
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                autor: { select: { nombre: true, apellido: true } },
            },
        });
        return noticia;
    }
    /** Formatea fecha a YYYY-MM-DD (Prisma puede devolver Date o string según driver/DB) */
    formatFecha(fecha) {
        if (typeof fecha === 'string')
            return fecha.slice(0, 10);
        if (fecha instanceof Date && !Number.isNaN(fecha.getTime()))
            return fecha.toISOString().split('T')[0];
        return '';
    }
    /** Listado público: solo publicadas y no eliminadas */
    async getAll() {
        const noticias = await prisma_1.default.noticia.findMany({
            where: { publicada: true, deletedAt: null },
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                autor: { select: { nombre: true, apellido: true } },
            },
            orderBy: { fecha: 'desc' },
        });
        return noticias.map((n) => ({
            id: n.id,
            titulo: n.titulo,
            fecha: this.formatFecha(n.fecha),
            resumen: n.resumen,
            contenido: n.contenido,
            imagenes: (n.imagenes || []).map((img) => img.url),
            autor: n.autor
                ? `${n.autor.nombre} ${n.autor.apellido}`
                : undefined,
        }));
    }
    /** Detalle público: solo si está publicada y no eliminada */
    async getById(id, onlyPublic = false) {
        const noticia = await prisma_1.default.noticia.findUnique({
            where: { id },
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                autor: { select: { nombre: true, apellido: true } },
            },
        });
        if (!noticia) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        if (onlyPublic && (noticia.deletedAt != null || !noticia.publicada)) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        if (!onlyPublic && noticia.deletedAt != null) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        return {
            id: noticia.id,
            titulo: noticia.titulo,
            fecha: this.formatFecha(noticia.fecha),
            resumen: noticia.resumen,
            contenido: noticia.contenido,
            publicada: noticia.publicada,
            imagenes: (noticia.imagenes || []).map((img) => img.url),
            autor: noticia.autor
                ? `${noticia.autor.nombre} ${noticia.autor.apellido}`
                : undefined,
        };
    }
    /** Listado para admin: todas las no eliminadas (con publicada) */
    async getAllAdmin() {
        const noticias = await prisma_1.default.noticia.findMany({
            where: { deletedAt: null },
            include: {
                imagenes: { orderBy: { orden: 'asc' } },
                autor: { select: { nombre: true, apellido: true } },
            },
            orderBy: { fecha: 'desc' },
        });
        return noticias.map((n) => ({
            id: n.id,
            titulo: n.titulo,
            fecha: this.formatFecha(n.fecha),
            resumen: n.resumen,
            contenido: n.contenido,
            publicada: n.publicada,
            imagenes: (n.imagenes || []).map((img) => img.url),
            autor: n.autor
                ? `${n.autor.nombre} ${n.autor.apellido}`
                : undefined,
        }));
    }
    async update(id, data) {
        const noticia = await prisma_1.default.noticia.findUnique({
            where: { id },
        });
        if (!noticia) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        if (noticia.deletedAt) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        await prisma_1.default.$transaction(async (tx) => {
            // Actualizar noticia
            await tx.noticia.update({
                where: { id },
                data: {
                    titulo: data.titulo,
                    fecha: data.fecha ? new Date(data.fecha) : undefined,
                    resumen: data.resumen,
                    contenido: data.contenido,
                },
            });
            // Si se proporcionan nuevas imágenes, reemplazar todas
            if (data.imagenes) {
                // Eliminar imágenes existentes
                await tx.noticiaImagen.deleteMany({
                    where: { noticiaId: id },
                });
                // Crear nuevas imágenes
                await tx.noticiaImagen.createMany({
                    data: data.imagenes.map((url, index) => ({
                        noticiaId: id,
                        url,
                        orden: index + 1,
                    })),
                });
            }
        });
        return this.getById(id);
    }
    /** Soft delete: marca deletedAt (no se muestra en público ni en listado admin) */
    async delete(id) {
        const noticia = await prisma_1.default.noticia.findUnique({
            where: { id },
        });
        if (!noticia) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        if (noticia.deletedAt) {
            return { message: 'Noticia ya estaba eliminada' };
        }
        await prisma_1.default.noticia.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Noticia eliminada correctamente' };
    }
    async setPublicada(id, publicada) {
        const noticia = await prisma_1.default.noticia.findUnique({
            where: { id },
        });
        if (!noticia) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        if (noticia.deletedAt) {
            throw new errors_1.NotFoundError('Noticia no encontrada');
        }
        await prisma_1.default.noticia.update({
            where: { id },
            data: { publicada },
        });
        return this.getById(id);
    }
}
exports.NoticiaService = NoticiaService;
exports.noticiaService = new NoticiaService();
//# sourceMappingURL=noticia.service.js.map