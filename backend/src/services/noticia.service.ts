import prisma from '../config/prisma';
import { CreateNoticiaDTO, UpdateNoticiaDTO } from '../types/requests';
import { NotFoundError, ErrorMessages } from '../utils/errors';

export class NoticiaService {
  async create(data: CreateNoticiaDTO) {
    const noticia = await prisma.noticia.create({
      data: {
        titulo: data.titulo,
        fecha: new Date(data.fecha),
        resumen: data.resumen,
        contenido: data.contenido,
        autorId: data.autorId,
        imagenes: {
          create: data.imagenes.map((url, index) => ({
            url,
            orden: index + 1,
          })),
        },
      },
      include: {
        imagenes: { orderBy: { orden: 'asc' } },
        autor: { select: { nombre: true, apellido: true } },
      },
    });

    return noticia;
  }

  /** Formatea fecha a YYYY-MM-DD (Prisma puede devolver Date o string según driver/DB) */
  private formatFecha(fecha: Date | string): string {
    if (typeof fecha === 'string') return fecha.slice(0, 10);
    if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) return fecha.toISOString().split('T')[0];
    return '';
  }

  async getAll() {
    const noticias = await prisma.noticia.findMany({
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

  async getById(id: number) {
    const noticia = await prisma.noticia.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: 'asc' } },
        autor: { select: { nombre: true, apellido: true } },
      },
    });

    if (!noticia) {
      throw new NotFoundError('Noticia no encontrada');
    }

    return {
      id: noticia.id,
      titulo: noticia.titulo,
      fecha: this.formatFecha(noticia.fecha),
      resumen: noticia.resumen,
      contenido: noticia.contenido,
      imagenes: (noticia.imagenes || []).map((img) => img.url),
      autor: noticia.autor
        ? `${noticia.autor.nombre} ${noticia.autor.apellido}`
        : undefined,
    };
  }

  async update(id: number, data: UpdateNoticiaDTO) {
    const noticia = await prisma.noticia.findUnique({
      where: { id },
    });

    if (!noticia) {
      throw new NotFoundError('Noticia no encontrada');
    }

    await prisma.$transaction(async (tx) => {
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

  async delete(id: number) {
    const noticia = await prisma.noticia.findUnique({
      where: { id },
    });

    if (!noticia) {
      throw new NotFoundError('Noticia no encontrada');
    }

    await prisma.noticia.delete({
      where: { id },
    });

    return { message: 'Noticia eliminada correctamente' };
  }
}

export const noticiaService = new NoticiaService();
