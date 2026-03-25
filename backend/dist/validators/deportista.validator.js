"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMiPerfilSchema = exports.deportistasQuerySchema = exports.updateDeportistaSchema = exports.createDeportistaSchema = void 0;
const zod_1 = require("zod");
const adultoResponsableSchema = zod_1.z.object({
    nombre: zod_1.z.string({ message: 'El nombre del adulto responsable es requerido' }).min(2).max(50),
    apellido: zod_1.z.string({ message: 'El apellido del adulto responsable es requerido' }).min(2).max(50),
    dni: zod_1.z
        .string({ message: 'El DNI del adulto responsable es requerido' })
        .transform((s) => s.replace(/\D/g, ''))
        .refine((s) => /^\d{7,8}$/.test(s), { message: 'El DNI del adulto responsable debe tener 7 u 8 dígitos' }),
    email: zod_1.z.string({ message: 'El email del adulto responsable es requerido' }).email(),
    telefono: zod_1.z.string({ message: 'El teléfono del adulto responsable es requerido' }).min(1),
});
exports.createDeportistaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string({ message: 'El nombre es requerido' })
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    apellido: zod_1.z
        .string({ message: 'El apellido es requerido' })
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede exceder 50 caracteres'),
    dni: zod_1.z
        .string({ message: 'El DNI es requerido' })
        .transform((s) => s.replace(/\D/g, ''))
        .refine((s) => /^\d{7,8}$/.test(s), { message: 'El DNI debe tener 7 u 8 digitos' }),
    generoId: zod_1.z.coerce.number({ message: 'El género es requerido' }).int().positive(),
    categoriaId: zod_1.z.coerce.number({ message: 'La categoría es requerida' }).int().positive(),
    subcategoriaId: zod_1.z.coerce.number().int().positive().optional(),
    disciplinaId: zod_1.z
        .coerce
        .number({ message: 'La disciplina es requerida' })
        .int()
        .positive('ID de disciplina invalido'),
    email: zod_1.z.string({ message: 'El email es requerido' }).email('Formato de email incorrecto'),
    password: zod_1.z
        .string({ message: 'La contrasena es requerida' })
        .min(6, 'La contrasena debe tener al menos 6 caracteres'),
    adultoResponsable: adultoResponsableSchema.optional(),
});
exports.updateDeportistaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).max(50).optional(),
    apellido: zod_1.z.string().min(2).max(50).optional(),
    generoId: zod_1.z.number().int().positive().optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    subcategoriaId: zod_1.z.number().int().positive().nullable().optional(),
    disciplinaId: zod_1.z.number().int().positive().optional(),
    adultoResponsable: adultoResponsableSchema.partial().optional(),
    adultosResponsables: zod_1.z.array(adultoResponsableSchema.partial()).optional(),
});
// Acepta string, number o array (query params a veces vienen como array); devuelve number o undefined
const optionalPosIntQuery = zod_1.z.preprocess((v) => {
    if (v === '' || v === undefined || v === null)
        return undefined;
    if (Array.isArray(v))
        v = v[0];
    if (typeof v === 'number')
        return Number.isInteger(v) && v > 0 ? v : undefined;
    if (typeof v === 'string')
        return v.trim() === '' ? undefined : v.trim();
    return undefined;
}, zod_1.z.union([
    zod_1.z.string().regex(/^\d+$/).transform(Number),
    zod_1.z.number().int().positive(),
]).optional());
exports.deportistasQuerySchema = zod_1.z.object({
    page: optionalPosIntQuery,
    limit: optionalPosIntQuery,
    disciplinaId: optionalPosIntQuery,
    generoId: optionalPosIntQuery,
    categoriaId: optionalPosIntQuery,
    subcategoriaId: optionalPosIntQuery,
    search: zod_1.z.preprocess((v) => (v === '' || v === undefined ? undefined : v), zod_1.z.string().optional()),
});
/** Lista de adultos responsables; el deportista sincroniza la suya (PUT mi-perfil) */
exports.updateMiPerfilSchema = zod_1.z.object({
    adultosResponsables: zod_1.z.array(adultoResponsableSchema),
});
//# sourceMappingURL=deportista.validator.js.map