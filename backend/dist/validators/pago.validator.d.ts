import { z } from 'zod';
export declare const createPagoSchema: z.ZodObject<{
    cuotaId: z.ZodNumber;
    medioPago: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const pagosQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    estado: z.ZodOptional<z.ZodEnum<{
        PENDIENTE: "PENDIENTE";
        APROBADO: "APROBADO";
        RECHAZADO: "RECHAZADO";
    }>>;
    deportistaId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const syncPagoSchema: z.ZodObject<{
    paymentId: z.ZodString;
}, z.core.$strip>;
export type CreatePagoInput = z.infer<typeof createPagoSchema>;
export type PagosQuery = z.infer<typeof pagosQuerySchema>;
export type SyncPagoInput = z.infer<typeof syncPagoSchema>;
//# sourceMappingURL=pago.validator.d.ts.map