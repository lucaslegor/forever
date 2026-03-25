import { z } from 'zod';
export declare const disponibilidadQuerySchema: z.ZodObject<{
    fecha: z.ZodString;
}, z.core.$strip>;
export declare const createReservaSchema: z.ZodObject<{
    fecha: z.ZodString;
    hora: z.ZodNumber;
    nombreCliente: z.ZodString;
    telefono: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notas: z.ZodOptional<z.ZodString>;
    metodoPago: z.ZodOptional<z.ZodEnum<{
        transferencia: "transferencia";
        mercadopago: "mercadopago";
    }>>;
    captchaToken: z.ZodString;
}, z.core.$strip>;
export declare const listReservasQuerySchema: z.ZodObject<{
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePagosReservaSchema: z.ZodObject<{
    senaPagada: z.ZodOptional<z.ZodBoolean>;
    restoPagado: z.ZodOptional<z.ZodBoolean>;
    montoTotal: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateReservaSchema: z.ZodObject<{
    notas: z.ZodOptional<z.ZodString>;
    montoTotal: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export type CreateReservaInput = z.infer<typeof createReservaSchema>;
export type UpdatePagosReservaInput = z.infer<typeof updatePagosReservaSchema>;
export type UpdateReservaInput = z.infer<typeof updateReservaSchema>;
//# sourceMappingURL=reservaCancha.validator.d.ts.map