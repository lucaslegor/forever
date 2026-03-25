"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deportistaService = exports.DeportistaService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const cuota_service_1 = require("./cuota.service");
class DeportistaService {
    async create(data) {
        // Verificar DNI único primero (es el identificador principal del deportista en el formulario)
        const existingDni = await prisma_1.default.deportista.findUnique({
            where: { dni: data.dni },
        });
        if (existingDni) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.DEPORTISTA_DNI_EXISTS);
        }
        // Verificar email único
        const existingEmail = await prisma_1.default.cuentaUsuario.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.EMAIL_EXISTS);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // Soft-remove fecha de nacimiento: el campo sigue siendo NOT NULL en Prisma/DB.
        // Usamos un placeholder fijo para no depender del frontend.
        const FECHA_NAC_PLACEHOLDER = new Date('2000-01-01T00:00:00.000Z');
        const deportista = await prisma_1.default.$transaction(async (tx) => {
            // Crear cuenta
            const cuenta = await tx.cuentaUsuario.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    rol: client_1.Rol.DEPORTISTA,
                },
            });
            const createData = {
                nombre: data.nombre,
                apellido: data.apellido,
                dni: data.dni,
                fechaNac: FECHA_NAC_PLACEHOLDER,
                genero: { connect: { id: Number(data.generoId) } },
                categoria: { connect: { id: Number(data.categoriaId) } },
                disciplina: { connect: { id: Number(data.disciplinaId) } },
                cuenta: { connect: { id: cuenta.id } },
            };
            if (data.subcategoriaId != null && Number(data.subcategoriaId) > 0) {
                createData.subcategoria = { connect: { id: Number(data.subcategoriaId) } };
            }
            const nuevoDeportista = await tx.deportista.create({ data: createData });
            // Si es menor (Juveniles/Infantiles), crear adulto(s) responsable(s)
            if (data.adultoResponsable) {
                await tx.adultoResponsable.create({
                    data: {
                        deportistaId: nuevoDeportista.id,
                        nombre: data.adultoResponsable.nombre,
                        apellido: data.adultoResponsable.apellido,
                        dni: data.adultoResponsable.dni,
                        email: data.adultoResponsable.email,
                        telefono: data.adultoResponsable.telefono,
                    },
                });
            }
            return nuevoDeportista;
        });
        // Si ya existe generación del mes actual, asignar automáticamente la cuota al nuevo deportista
        try {
            await cuota_service_1.cuotaService.asignarCuotaDelMesActual(deportista.id);
        }
        catch (_err) {
            // No fallar la creación del deportista si falla la asignación de cuota
        }
        return this.getById(deportista.id);
    }
    async getById(id) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id },
            include: {
                disciplina: true,
                genero: true,
                categoria: true,
                subcategoria: true,
                cuenta: {
                    select: {
                        id: true,
                        email: true,
                        rol: true,
                        activo: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        const adultos = await prisma_1.default.adultoResponsable.findMany({
            where: { deportistaId: id },
        });
        return { ...deportista, adultosResponsables: adultos };
    }
    async getAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(10000, Math.max(1, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {};
        if (query.disciplinaId != null) {
            where.disciplinaId = Number(query.disciplinaId);
        }
        if (query.generoId != null) {
            where.generoId = Number(query.generoId);
        }
        if (query.categoriaId != null) {
            where.categoriaId = Number(query.categoriaId);
        }
        if (query.subcategoriaId != null) {
            where.subcategoriaId = Number(query.subcategoriaId);
        }
        if (query.search) {
            where.OR = [
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { apellido: { contains: query.search, mode: 'insensitive' } },
                { dni: { contains: query.search } },
            ];
        }
        const [deportistasRaw, total] = await Promise.all([
            prisma_1.default.deportista.findMany({
                where,
                skip,
                take: limit,
                include: {
                    disciplina: true,
                    genero: true,
                    categoria: true,
                    subcategoria: true,
                    cuenta: {
                        select: { email: true, activo: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.deportista.count({ where }),
        ]);
        const deportistas = await Promise.all(deportistasRaw.map(async (d) => {
            const adultos = await prisma_1.default.adultoResponsable.findMany({
                where: { deportistaId: d.id },
            });
            return { ...d, adultosResponsables: adultos };
        }));
        return {
            data: deportistas,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, data) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.deportista.update({
                where: { id },
                data: {
                    nombre: data.nombre,
                    apellido: data.apellido,
                    generoId: data.generoId,
                    categoriaId: data.categoriaId,
                    subcategoriaId: data.subcategoriaId,
                    disciplinaId: data.disciplinaId,
                },
            });
            // Sincronizar adultos responsables: lista nueva reemplaza a los existentes
            const nuevosAdultos = data.adultosResponsables ?? (data.adultoResponsable ? [data.adultoResponsable] : undefined);
            if (nuevosAdultos !== undefined && nuevosAdultos.length >= 0) {
                await tx.adultoResponsable.deleteMany({ where: { deportistaId: id } });
                for (const ar of nuevosAdultos) {
                    if (ar.nombre && ar.apellido && ar.dni && ar.email && ar.telefono) {
                        await tx.adultoResponsable.create({
                            data: {
                                deportistaId: id,
                                nombre: ar.nombre,
                                apellido: ar.apellido,
                                dni: ar.dni,
                                email: ar.email,
                                telefono: ar.telefono,
                            },
                        });
                    }
                }
            }
        });
        return this.getById(id);
    }
    async delete(id) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id },
            include: { cuenta: true },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        await prisma_1.default.cuentaUsuario.update({
            where: { id: deportista.cuentaId },
            data: { activo: false },
        });
        return { message: 'Deportista dado de baja. No podrá iniciar sesión hasta que se le dé de alta.' };
    }
    async darDeAlta(id) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        await prisma_1.default.cuentaUsuario.update({
            where: { id: deportista.cuentaId },
            data: { activo: true },
        });
        return this.getById(id);
    }
    async getConPagosPendientes() {
        const deportistas = await prisma_1.default.deportista.findMany({
            where: {
                cuotas: {
                    some: {
                        estadoCuota: {
                            in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA],
                        },
                    },
                },
            },
            include: {
                cuotas: {
                    where: {
                        estadoCuota: {
                            in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA],
                        },
                    },
                    orderBy: { fechaVencimiento: 'asc' },
                },
            },
        });
        return deportistas.map((d) => ({
            id: d.id,
            nombre: d.nombre,
            apellido: d.apellido,
            dni: d.dni,
            cantidadCuotasPendientes: d.cuotas.length,
            montoTotalAdeudado: d.cuotas.reduce((sum, c) => sum + Number(c.monto), 0),
            vencimientoProximo: d.cuotas[0]?.fechaVencimiento || null,
        }));
    }
    async getHistorial(deportistaId) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        const pagos = await prisma_1.default.pago.findMany({
            where: { deportistaId },
            include: {
                cuota: {
                    include: { disciplina: true },
                },
            },
            orderBy: { fechaPago: 'desc' },
        });
        return {
            pagos: pagos.map((p) => ({
                id: p.id,
                fecha: p.fechaPago,
                monto: p.monto,
                medioPago: p.medioPago,
                estado: p.estadoPago,
                cuota: {
                    nroCuota: p.cuota.nroCuota,
                    anio: p.cuota.anio,
                    disciplina: p.cuota.disciplina.nombre,
                },
            })),
        };
    }
    /** Solo el ID del deportista; para endpoints que no necesitan el perfil completo (ej. estado de cuenta). */
    async getDeportistaIdByUserId(userId) {
        const d = await prisma_1.default.deportista.findUnique({
            where: { cuentaId: userId },
            select: { id: true },
        });
        return d?.id ?? null;
    }
    async getByUserId(userId) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { cuentaId: userId },
            include: {
                disciplina: true,
                genero: true,
                categoria: true,
                subcategoria: true,
                adultosResponsables: true,
            },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        return deportista;
    }
    /**
     * Sincronizar la lista de adultos responsables del deportista logueado.
     * Reemplaza todos los existentes por la lista enviada (puede ser vacía).
     */
    async updateMiPerfilAdultos(userId, data) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { cuentaId: userId },
            select: { id: true },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.adultoResponsable.deleteMany({ where: { deportistaId: deportista.id } });
            for (const ar of data.adultosResponsables) {
                await tx.adultoResponsable.create({
                    data: {
                        deportistaId: deportista.id,
                        nombre: ar.nombre,
                        apellido: ar.apellido,
                        dni: ar.dni,
                        email: ar.email,
                        telefono: ar.telefono,
                    },
                });
            }
        });
        return this.getById(deportista.id);
    }
    async resetPassword(id, newPassword) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id },
            include: { cuenta: true },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.cuentaUsuario.update({
            where: { id: deportista.cuentaId },
            data: { password: hashedPassword },
        });
        return { message: 'Contraseña restablecida correctamente', deportistaId: id };
    }
    async resetPasswordByDni(dni, newPassword) {
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { dni },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.cuentaUsuario.update({
            where: { id: deportista.cuentaId },
            data: { password: hashedPassword },
        });
        return { message: 'Contraseña restablecida correctamente', deportistaId: deportista.id };
    }
}
exports.DeportistaService = DeportistaService;
exports.deportistaService = new DeportistaService();
//# sourceMappingURL=deportista.service.js.map