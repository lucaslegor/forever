"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.becaService = exports.BecaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const errors_2 = require("../utils/errors");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const FACTOR_BECA = 0.7;
/** Monto de cuota para un deportista becado: cuotaBeca si está definida, sino precio × 0.7 */
function montoBeca(precioMensual, cuotaBeca) {
    if (cuotaBeca != null && !Number.isNaN(cuotaBeca)) {
        return Math.round(cuotaBeca * 100) / 100;
    }
    return Math.round(precioMensual * FACTOR_BECA * 100) / 100;
}
class BecaService {
    /** Listar todos los deportistas becados */
    async getAll(page = 1, limit = 500) {
        const skip = (page - 1) * limit;
        const [list, total] = await Promise.all([
            prisma_1.default.deportista.findMany({
                where: { becado: true },
                skip,
                take: limit,
                include: {
                    disciplina: { select: { id: true, nombre: true, precioMensual: true } },
                    genero: { select: { nombre: true } },
                    categoria: { select: { nombre: true } },
                    subcategoria: { select: { nombre: true } },
                },
                orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
            }),
            prisma_1.default.deportista.count({ where: { becado: true } }),
        ]);
        return {
            data: list.map((d) => ({
                id: d.id,
                nombre: d.nombre,
                apellido: d.apellido,
                dni: d.dni,
                disciplina: d.disciplina?.nombre ?? '',
                precioMensual: d.disciplina ? Number(d.disciplina.precioMensual) : 0,
                cuotaBeca: d.cuotaBeca != null ? Number(d.cuotaBeca) : null,
                montoEfectivo: d.disciplina
                    ? montoBeca(Number(d.disciplina.precioMensual), d.cuotaBeca != null ? Number(d.cuotaBeca) : null)
                    : 0,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    /** Dar beca a un deportista. Opcional: cuotaBeca (monto fijo para casos excepcionales). No se puede becar a quien ya está en un grupo familiar. */
    async becar(deportistaId, cuotaBeca) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: { select: { precioMensual: true } } },
        });
        if (!deportista)
            throw new errors_1.NotFoundError(errors_2.ErrorMessages.DEPORTISTA_NOT_FOUND);
        if (deportista.becado)
            throw new errors_1.ConflictError('El deportista ya tiene beca.');
        const enGrupoFamiliar = await prisma_1.default.grupoFamiliarIntegrante.findFirst({
            where: { deportistaId },
        });
        if (enGrupoFamiliar)
            throw new errors_1.ConflictError('El deportista pertenece a un grupo familiar y no puede tener beca individual (ya tiene beneficio por grupo familiar).');
        const precio = Number(deportista.disciplina?.precioMensual ?? 0);
        const monto = montoBeca(precio, cuotaBeca);
        await prisma_1.default.$transaction(async (tx) => {
            await tx.deportista.update({
                where: { id: deportistaId },
                data: {
                    becado: true,
                    ...(cuotaBeca != null && !Number.isNaN(cuotaBeca) ? { cuotaBeca: new client_2.Prisma.Decimal(cuotaBeca) } : {}),
                },
            });
            const pendientes = await tx.cuota.findMany({
                where: {
                    deportistaId,
                    estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                },
            });
            for (const c of pendientes) {
                await tx.cuota.update({
                    where: { id: c.id },
                    data: { monto: new client_2.Prisma.Decimal(monto) },
                });
            }
        });
        return this.getByDeportistaId(deportistaId);
    }
    /** Quitar beca solo si está becado (usado al agregar a grupo familiar). No lanza si no tiene beca. */
    async quitarBecaSiBecado(deportistaId) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: { select: { precioMensual: true } } },
        });
        if (!deportista || !deportista.becado)
            return;
        const precioNormal = Number(deportista.disciplina?.precioMensual ?? 0);
        await prisma_1.default.$transaction(async (tx) => {
            await tx.deportista.update({
                where: { id: deportistaId },
                data: { becado: false, cuotaBeca: null },
            });
            const pendientes = await tx.cuota.findMany({
                where: { deportistaId, estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] } },
            });
            for (const c of pendientes) {
                await tx.cuota.update({
                    where: { id: c.id },
                    data: { monto: new client_2.Prisma.Decimal(precioNormal) },
                });
            }
        });
    }
    /** Quitar beca a un deportista. Las cuotas pendientes pasan al precio normal de la disciplina. */
    async quitarBeca(deportistaId) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: { select: { precioMensual: true } } },
        });
        if (!deportista)
            throw new errors_1.NotFoundError(errors_2.ErrorMessages.DEPORTISTA_NOT_FOUND);
        if (!deportista.becado)
            throw new errors_1.ConflictError('El deportista no tiene beca.');
        const precioNormal = Number(deportista.disciplina?.precioMensual ?? 0);
        await prisma_1.default.$transaction(async (tx) => {
            await tx.deportista.update({
                where: { id: deportistaId },
                data: { becado: false, cuotaBeca: null },
            });
            const pendientes = await tx.cuota.findMany({
                where: {
                    deportistaId,
                    estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                },
            });
            for (const c of pendientes) {
                await tx.cuota.update({
                    where: { id: c.id },
                    data: { monto: new client_2.Prisma.Decimal(precioNormal) },
                });
            }
        });
        return { ok: true, message: 'Beca quitada correctamente.' };
    }
    /** Actualizar el monto de cuota beca (casos excepcionales). Actualiza cuotas pendientes a ese monto. */
    async updateCuotaBeca(deportistaId, monto) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: { select: { precioMensual: true } } },
        });
        if (!deportista)
            throw new errors_1.NotFoundError(errors_2.ErrorMessages.DEPORTISTA_NOT_FOUND);
        if (!deportista.becado)
            throw new errors_1.ConflictError('El deportista no tiene beca. Primero debe becarlo.');
        const valor = Math.round(Math.max(0, monto) * 100) / 100;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.deportista.update({
                where: { id: deportistaId },
                data: { cuotaBeca: new client_2.Prisma.Decimal(valor) },
            });
            const pendientes = await tx.cuota.findMany({
                where: {
                    deportistaId,
                    estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                },
            });
            for (const c of pendientes) {
                await tx.cuota.update({
                    where: { id: c.id },
                    data: { monto: new client_2.Prisma.Decimal(valor) },
                });
            }
        });
        return this.getByDeportistaId(deportistaId);
    }
    async getByDeportistaId(deportistaId) {
        const d = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: { select: { nombre: true, precioMensual: true } } },
        });
        if (!d)
            throw new errors_1.NotFoundError(errors_2.ErrorMessages.DEPORTISTA_NOT_FOUND);
        return {
            id: d.id,
            nombre: d.nombre,
            apellido: d.apellido,
            dni: d.dni,
            becado: d.becado,
            cuotaBeca: d.cuotaBeca != null ? Number(d.cuotaBeca) : null,
            disciplina: d.disciplina?.nombre ?? '',
            precioMensual: d.disciplina ? Number(d.disciplina.precioMensual) : 0,
            montoEfectivo: d.becado && d.disciplina
                ? montoBeca(Number(d.disciplina.precioMensual), d.cuotaBeca != null ? Number(d.cuotaBeca) : null)
                : 0,
        };
    }
}
exports.BecaService = BecaService;
exports.becaService = new BecaService();
//# sourceMappingURL=beca.service.js.map