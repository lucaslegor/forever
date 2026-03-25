export interface CrearPreferenciaParams {
    pagoId: number;
    title: string;
    unitPrice: number;
    /** Email del pagador. Mercado Pago lo exige para tickets Rapipago/PagoFácil. Si no se pasa, MP puede pedirlo en checkout. */
    payerEmail?: string;
}
export interface CrearPreferenciaResult {
    initPoint: string;
    sandboxInitPoint?: string;
    preferenceId: string;
}
export declare function crearPreferenciaPago(params: CrearPreferenciaParams): Promise<CrearPreferenciaResult>;
/** Preferencia para pagar la seña de una reserva de cancha (external_reference = "reserva-{id}") */
export interface CrearPreferenciaReservaSenaParams {
    reservaId: number;
    title: string;
    unitPrice: number;
    /** Email del pagador; si se envía, Mercado Pago puede pre-llenar el checkout y habilitar el botón Pagar. */
    payerEmail?: string | null;
}
export declare function crearPreferenciaReservaSena(params: CrearPreferenciaReservaSenaParams): Promise<CrearPreferenciaResult>;
export declare function getPaymentById(paymentId: string): Promise<{
    external_reference?: string;
    status?: string;
} | null>;
//# sourceMappingURL=mercadopago.service.d.ts.map