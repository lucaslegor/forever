"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grupoFamiliarService = exports.GrupoFamiliarService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const beca_service_1 = require("./beca.service");
class GrupoFamiliarService {
    async create(data) {
        // Verificar que todos los deportistas existen y traer disciplina para calcular cuota familiar
        const deportistaIds = data.integrantes.map((i) => i.deportistaId);
        const deportistas = await prisma_1.default.deportista.findMany({
            where: { id: { in: deportistaIds } },
            include: { disciplina: { select: { precioMensual: true } } },
        });
        if (deportistas.length !== deportistaIds.length) {
            throw new errors_1.NotFoundError('Uno o mas deportistas no existen');
        }
        // Cuota familiar = valor cuota (precio disciplina) × 1,5; el dirigente puede actualizarla después
        const principal = data.integrantes.find((i) => i.esPrincipal) || data.integrantes[0];
        const deportistaPrincipal = deportistas.find((d) => d.id === principal.deportistaId);
        const precioMensual = deportistaPrincipal?.disciplina?.precioMensual
            ? Number(deportistaPrincipal.disciplina.precioMensual)
            : 0;
        const cuotaFamiliarAuto = Math.round(precioMensual * 1.5 * 100) / 100;
        // Verificar que ningún deportista esté ya en otro grupo familiar
        const integrantesEnOtroGrupo = await prisma_1.default.grupoFamiliarIntegrante.findMany({
            where: { deportistaId: { in: deportistaIds } },
            include: { grupo: { select: { id: true } } },
        });
        if (integrantesEnOtroGrupo.length > 0) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO);
        }
        // Verificar que no exista un grupo con la misma composición
        const existingGroups = await prisma_1.default.grupoFamiliar.findMany({
            include: {
                integrantes: true,
            },
        });
        for (const group of existingGroups) {
            const existingIds = group.integrantes.map((i) => i.deportistaId).sort();
            const newIds = deportistaIds.sort();
            if (existingIds.length === newIds.length &&
                existingIds.every((id, index) => id === newIds[index])) {
                throw new errors_1.ConflictError(errors_1.ErrorMessages.GRUPO_FAMILIAR_DUPLICATE);
            }
        }
        const grupo = await prisma_1.default.grupoFamiliar.create({
            data: {
                nombre: data.nombre,
                titularDni: data.titularDni,
                cuotaHermano: data.cuotaHermano ?? (cuotaFamiliarAuto > 0 ? cuotaFamiliarAuto : undefined),
                integrantes: {
                    create: data.integrantes.map((i) => ({
                        deportistaId: i.deportistaId,
                        esPrincipal: i.esPrincipal || false,
                    })),
                },
            },
            include: {
                integrantes: {
                    include: {
                        deportista: true,
                    },
                },
            },
        });
        // Quitar beca individual a quienes se agregan al grupo (no pueden tener ambos beneficios)
        for (const i of data.integrantes) {
            try {
                await beca_service_1.becaService.quitarBecaSiBecado(i.deportistaId);
            }
            catch {
                // Ignorar si no estaba becado o otro error
            }
        }
        return grupo;
    }
    async getByDeportistaId(deportistaId) {
        const integrantes = await prisma_1.default.grupoFamiliarIntegrante.findMany({
            where: { deportistaId },
            include: {
                grupo: {
                    include: {
                        integrantes: {
                            include: {
                                deportista: {
                                    include: {
                                        disciplina: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const grupos = integrantes.map((i) => i.grupo);
        return grupos;
    }
    async getById(id) {
        const grupo = await prisma_1.default.grupoFamiliar.findUnique({
            where: { id },
            include: {
                integrantes: {
                    include: {
                        deportista: {
                            include: {
                                disciplina: true,
                            },
                        },
                    },
                },
            },
        });
        if (!grupo) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
        }
        return grupo;
    }
    async getAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [grupos, total] = await Promise.all([
            prisma_1.default.grupoFamiliar.findMany({
                skip,
                take: limit,
                include: {
                    integrantes: {
                        include: {
                            deportista: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.grupoFamiliar.count(),
        ]);
        return {
            data: grupos,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, data) {
        const grupo = await prisma_1.default.grupoFamiliar.findUnique({
            where: { id },
        });
        if (!grupo) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
        }
        await prisma_1.default.$transaction(async (tx) => {
            // Actualizar grupo familiar
            await tx.grupoFamiliar.update({
                where: { id },
                data: {
                    nombre: data.nombre,
                    titularDni: data.titularDni,
                    cuotaHermano: data.cuotaHermano,
                },
            });
            if (data.integrantes) {
                const newDeportistaIds = data.integrantes.map((i) => i.deportistaId);
                // Deportistas que ya están en OTRO grupo (excluir el actual)
                const enOtroGrupo = await tx.grupoFamiliarIntegrante.findMany({
                    where: {
                        deportistaId: { in: newDeportistaIds },
                        grupoId: { not: id },
                    },
                });
                if (enOtroGrupo.length > 0) {
                    throw new errors_1.ConflictError(errors_1.ErrorMessages.GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO);
                }
                // Eliminar integrantes actuales
                await tx.grupoFamiliarIntegrante.deleteMany({
                    where: { grupoId: id },
                });
                // Crear nuevos integrantes
                for (const integrante of data.integrantes) {
                    await tx.grupoFamiliarIntegrante.create({
                        data: {
                            grupoId: id,
                            deportistaId: integrante.deportistaId,
                            esPrincipal: integrante.esPrincipal || false,
                        },
                    });
                }
            }
        });
        // Quitar beca individual a quienes quedan en el grupo (no pueden tener ambos beneficios)
        if (data.integrantes) {
            for (const i of data.integrantes) {
                try {
                    await beca_service_1.becaService.quitarBecaSiBecado(i.deportistaId);
                }
                catch {
                    // Ignorar
                }
            }
        }
        return this.getById(id);
    }
    async delete(id) {
        const grupo = await prisma_1.default.grupoFamiliar.findUnique({
            where: { id },
        });
        if (!grupo) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
        }
        await prisma_1.default.grupoFamiliar.delete({
            where: { id },
        });
        return { message: 'Grupo familiar eliminado correctamente' };
    }
    /**
     * Recalcula cuotaHermano para todos los grupos cuyo titular (esPrincipal) está en la disciplina dada.
     * Se usa cuando se actualiza el precio de una disciplina (misma fórmula: precio × 1,5).
     */
    async actualizarCuotaHermanoPorCambioPrecioDisciplina(disciplinaId, nuevoPrecioMensual) {
        const cuotaFamiliar = Math.round(nuevoPrecioMensual * 1.5 * 100) / 100;
        const integrantesPrincipal = await prisma_1.default.grupoFamiliarIntegrante.findMany({
            where: {
                esPrincipal: true,
                deportista: { disciplinaId },
            },
            select: { grupoId: true },
        });
        const grupoIds = [...new Set(integrantesPrincipal.map((i) => i.grupoId))];
        if (grupoIds.length === 0)
            return;
        await prisma_1.default.grupoFamiliar.updateMany({
            where: { id: { in: grupoIds } },
            data: { cuotaHermano: cuotaFamiliar },
        });
    }
}
exports.GrupoFamiliarService = GrupoFamiliarService;
exports.grupoFamiliarService = new GrupoFamiliarService();
//# sourceMappingURL=grupoFamiliar.service.js.map