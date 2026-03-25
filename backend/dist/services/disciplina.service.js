"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplinaService = exports.DisciplinaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const cuota_service_1 = require("./cuota.service");
const grupoFamiliar_service_1 = require("./grupoFamiliar.service");
class DisciplinaService {
    async create(data) {
        const existing = await prisma_1.default.disciplina.findUnique({
            where: { nombre: data.nombre },
        });
        if (existing) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.DISCIPLINA_NAME_EXISTS);
        }
        const disciplina = await prisma_1.default.disciplina.create({
            data: {
                nombre: data.nombre,
                precioMensual: data.precioMensual,
                activa: true,
            },
        });
        // Verificación read-after-write: detecta problemas con pooler (ej. Supabase sin pgbouncer=true)
        const persisted = await prisma_1.default.disciplina.findUnique({
            where: { id: disciplina.id },
        });
        if (!persisted) {
            throw new Error('La disciplina no se persistió en la base de datos. Si usás Supabase, agregá ?pgbouncer=true a DATABASE_URL o usá la conexión directa (puerto 5432).');
        }
        return disciplina;
    }
    async getById(id) {
        const disciplina = await prisma_1.default.disciplina.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { deportistas: true },
                },
            },
        });
        if (!disciplina) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DISCIPLINA_NOT_FOUND);
        }
        return disciplina;
    }
    async getAll(includeInactive = false) {
        const where = includeInactive ? {} : { activa: true };
        const disciplinas = await prisma_1.default.disciplina.findMany({
            where,
            include: {
                _count: {
                    select: { deportistas: true },
                },
            },
            orderBy: { nombre: 'asc' },
        });
        return disciplinas;
    }
    async update(id, data) {
        const disciplina = await prisma_1.default.disciplina.findUnique({
            where: { id },
        });
        if (!disciplina) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DISCIPLINA_NOT_FOUND);
        }
        if (data.nombre && data.nombre !== disciplina.nombre) {
            const existing = await prisma_1.default.disciplina.findUnique({
                where: { nombre: data.nombre },
            });
            if (existing) {
                throw new errors_1.ConflictError(errors_1.ErrorMessages.DISCIPLINA_NAME_EXISTS);
            }
        }
        const updated = await prisma_1.default.disciplina.update({
            where: { id },
            data: {
                nombre: data.nombre,
                precioMensual: data.precioMensual,
                activa: data.activa,
            },
        });
        // Si se actualizó el valor mensual: primero actualizar cuota familiar de grupos (para que las cuotas pendientes tomen el nuevo valor), luego solo cuotas NO pagadas
        if (data.precioMensual !== undefined) {
            const nuevoPrecio = Number(updated.precioMensual);
            await grupoFamiliar_service_1.grupoFamiliarService.actualizarCuotaHermanoPorCambioPrecioDisciplina(id, nuevoPrecio);
            await cuota_service_1.cuotaService.actualizarMontosPorCambioPrecioDisciplina(id, nuevoPrecio);
        }
        return updated;
    }
    async getDeportistas(id, page = 1, limit = 10) {
        const disciplina = await prisma_1.default.disciplina.findUnique({
            where: { id },
        });
        if (!disciplina) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DISCIPLINA_NOT_FOUND);
        }
        const skip = (page - 1) * limit;
        const [deportistas, total] = await Promise.all([
            prisma_1.default.deportista.findMany({
                where: { disciplinaId: id },
                skip,
                take: limit,
                include: {
                    cuenta: {
                        select: { email: true },
                    },
                },
                orderBy: { apellido: 'asc' },
            }),
            prisma_1.default.deportista.count({ where: { disciplinaId: id } }),
        ]);
        return {
            data: deportistas,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.DisciplinaService = DisciplinaService;
exports.disciplinaService = new DisciplinaService();
//# sourceMappingURL=disciplina.service.js.map