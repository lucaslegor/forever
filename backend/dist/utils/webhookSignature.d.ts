/**
 * Valida la firma x-signature de notificaciones Webhook de Mercado Pago.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export declare function validateMercadoPagoWebhookSignature(req: {
    body: {
        data?: {
            id?: string | number;
        };
    };
    headers: Record<string, string | string[] | undefined>;
}): boolean;
//# sourceMappingURL=webhookSignature.d.ts.map