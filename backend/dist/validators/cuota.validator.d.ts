import { z } from 'zod';
export declare const asignarCuotaSchema: z.ZodObject<{
    deportistaId: z.ZodNumber;
    nroCuota: z.ZodNumber;
    monto: z.ZodNumber;
    fechaEmision: z.ZodString;
    fechaVencimiento: z.ZodString;
    disciplinaId: z.ZodNumber;
}, z.core.$strip>;
export declare const updateCuotaSchema: z.ZodObject<{
    monto: z.ZodOptional<z.ZodNumber>;
    fechaVencimiento: z.ZodOptional<z.ZodString>;
    periodicidad: z.ZodOptional<z.ZodEnum<{
        MENSUAL: "MENSUAL";
        ANUAL: "ANUAL";
    }>>;
}, z.core.$strip>;
export declare const cancelarCuotaSchema: z.ZodObject<{
    motivo: z.ZodString;
}, z.core.$strip>;
export declare const cuotasQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    estado: z.ZodOptional<z.ZodEnum<{
        PAGADA: "PAGADA";
        PENDIENTE: "PENDIENTE";
        VENCIDA: "VENCIDA";
        CANCELADA: "CANCELADA";
    }>>;
    deportistaId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    disciplinaId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
}, z.core.$strip>;
export declare const listCuotasQuerySchema: z.ZodObject<{
    anio: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    mes: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    estado: z.ZodOptional<z.ZodEnum<{
        PAGADA: "PAGADA";
        PENDIENTE: "PENDIENTE";
        VENCIDA: "VENCIDA";
        CANCELADA: "CANCELADA";
    }>>;
    disciplinaId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
}, z.core.$strip>;
export declare const generarCuotasSchema: z.ZodObject<{
    mes: z.ZodNumber;
    anio: z.ZodNumber;
}, z.core.$strip>;
export declare const deletePorGeneracionQuerySchema: z.ZodObject<{
    anio: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    mes: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    disciplinaId: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const deletePorMesQuerySchema: z.ZodObject<{
    anio: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    mes: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export type AsignarCuotaInput = z.infer<typeof asignarCuotaSchema>;
export type UpdateCuotaInput = z.infer<typeof updateCuotaSchema>;
export type CancelarCuotaInput = z.infer<typeof cancelarCuotaSchema>;
export type CuotasQuery = z.infer<typeof cuotasQuerySchema>;
export type ListCuotasQuery = z.infer<typeof listCuotasQuerySchema>;
export type GenerarCuotasInput = z.infer<typeof generarCuotasSchema>;
export type DeletePorGeneracionQuery = z.infer<typeof deletePorGeneracionQuerySchema>;
//# sourceMappingURL=cuota.validator.d.ts.map