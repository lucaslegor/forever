"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGrupoFamiliarSchema = exports.createGrupoFamiliarSchema = void 0;
const zod_1 = require("zod");
const integranteSchema = zod_1.z.object({
    deportistaId: zod_1.z
        .number({ message: 'El deportista es requerido' })
        .int()
        .positive('ID de deportista invalido'),
    esPrincipal: zod_1.z.boolean().default(false),
});
// CU13 - Gestionar Grupo Familiar
exports.createGrupoFamiliarSchema = zod_1.z
    .object({
    nombre: zod_1.z.string({ message: 'El nombre es requerido' }).min(1, 'El nombre es requerido'),
    titularDni: zod_1.z
        .string({ message: 'El DNI del titular es requerido' })
        .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 digitos'),
    cuotaHermano: zod_1.z.number().nonnegative().optional(),
    integrantes: zod_1.z
        .array(integranteSchema)
        .min(2, 'El grupo familiar debe tener al menos 2 integrantes'),
})
    .refine((data) => data.integrantes.filter((i) => i.esPrincipal).length === 1, {
    message: 'Debe haber exactamente un integrante principal',
});
exports.updateGrupoFamiliarSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).optional(),
    titularDni: zod_1.z
        .string()
        .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 digitos')
        .optional(),
    cuotaHermano: zod_1.z.number().nonnegative().optional(),
    integrantes: zod_1.z.array(integranteSchema).min(2).optional(),
});
//# sourceMappingURL=grupoFamiliar.validator.js.map