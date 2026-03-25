"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagoController = exports.PagoController = void 0;
const pago_service_1 = require("../services/pago.service");
const mercadopago_service_1 = require("../services/mercadopago.service");
const deportista_service_1 = require("../services/deportista.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
const env_1 = require("../config/env");
const client_1 = require("@prisma/client");
class PagoController {
    async crear(req, res, next) {
        try {
            console.log('🟡 [Pago Controller] Recibida petición para crear pago');
            console.log('  - Body:', req.body);
            console.log('  - Usuario:', req.user?.email);
            const data = req.body;
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            console.log('  - Deportista ID:', deportista.id);
            console.log('  - Cuota ID:', data.cuotaId);
            const result = await pago_service_1.pagoService.crear(deportista.id, data);
            const message = result.initPoint
                ? 'Preferencia creada. Redirigiendo al checkout.'
                : 'No se pudo generar el link de pago. Revisá la consola del servidor y MERCADOPAGO_ACCESS_TOKEN.';
            (0, response_1.sendCreated)(res, result, message);
        }
        catch (error) {
            console.error('❌ [Pago Controller] Error:', error);
            next(error);
        }
    }
    async webhook(req, res, next) {
        console.log('🔔 [Webhook] Recibida notificación de Mercado Pago');
        console.log('  - Headers:', JSON.stringify(req.headers, null, 2));
        console.log('  - Body:', JSON.stringify(req.body, null, 2));
        console.log('  - Query:', JSON.stringify(req.query, null, 2));
        try {
            // TEMPORALMENTE DESHABILITADO PARA DIAGNOSTICAR
            // if (!validateMercadoPagoWebhookSignature(req)) {
            //   console.error('❌ [Webhook] Firma de webhook inválida');
            //   sendUnauthorized(res, 'Firma de webhook inválida');
            //   return;
            // }
            const { type, data, topic, id } = req.body;
            const { id: queryId } = req.query;
            console.log('  - Type:', type);
            console.log('  - Topic:', topic);
            console.log('  - Data ID:', data?.id);
            console.log('  - Body ID:', id);
            console.log('  - Query ID:', queryId);
            let paymentId = null;
            // Mercado Pago puede enviar webhooks de diferentes formas
            if (type === 'payment' && data?.id) {
                paymentId = String(data.id);
                console.log('  - Detectado como payment type, Payment ID:', paymentId);
            }
            else if (topic === 'merchant_order' && (id || queryId)) {
                // Para merchant_order, necesitamos obtener el payment desde la orden
                const orderId = String(id || queryId);
                console.log('  - Detectado como merchant_order, Order ID:', orderId);
                try {
                    const orderResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
                        headers: {
                            Authorization: `Bearer ${env_1.env.MERCADOPAGO_ACCESS_TOKEN}`,
                        },
                    });
                    const order = await orderResponse.json();
                    console.log('  - Merchant Order obtenida:', JSON.stringify(order, null, 2));
                    if (order.payments && order.payments.length > 0) {
                        paymentId = String(order.payments[0].id);
                        console.log('  - Payment ID desde merchant order:', paymentId);
                    }
                }
                catch (err) {
                    console.error('  - Error obteniendo merchant order:', err);
                }
            }
            if (paymentId) {
                console.log('  - Procesando Payment ID:', paymentId);
                const payment = await (0, mercadopago_service_1.getPaymentById)(paymentId);
                console.log('  - Payment obtenido:', JSON.stringify(payment, null, 2));
                if (payment?.external_reference) {
                    const ref = payment.external_reference;
                    // Módulo de cancha deshabilitado: ignorar pagos con external_reference "reserva-{id}"
                    if (typeof ref === 'string' && ref.startsWith('reserva-')) {
                        console.log('  - Webhook reserva-cancha ignorado (módulo deshabilitado)');
                    }
                    else {
                        const pagoId = parseInt(ref, 10);
                        if (!Number.isNaN(pagoId)) {
                            const status = payment.status === 'approved' ? 'approved' : payment.status === 'rejected' ? 'rejected' : 'pending';
                            console.log('  - Actualizando pago:', pagoId, 'con status:', status);
                            await pago_service_1.pagoService.confirmarPago(pagoId, paymentId, status);
                        }
                    }
                }
            }
            else {
                console.warn('  - No se pudo obtener payment ID del webhook');
            }
            console.log('✅ [Webhook] Procesado correctamente');
            (0, response_1.sendSuccess)(res, { received: true });
        }
        catch (error) {
            console.error('❌ [Webhook] Error:', error);
            next(error);
        }
    }
    /** Endpoint de prueba para verificar que el webhook es accesible */
    async webhookTest(_req, res) {
        console.log('🧪 [Webhook Test] Endpoint de prueba accedido correctamente');
        res.json({
            success: true,
            message: 'Webhook endpoint is accessible!',
            timestamp: new Date().toISOString()
        });
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await pago_service_1.pagoService.getById(id);
            const rol = req.user.rol;
            if (rol === client_1.Rol.ADMIN || rol === client_1.Rol.ADMINISTRATIVO) {
                (0, response_1.sendSuccess)(res, result);
                return;
            }
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            if (result.deportistaId !== deportista.id) {
                (0, response_1.sendForbidden)(res, 'No tiene permisos para acceder a este recurso');
                return;
            }
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMisPagos(req, res, next) {
        try {
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const result = await pago_service_1.pagoService.getByDeportista(deportista.id, page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getByDeportista(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const result = await pago_service_1.pagoService.getByDeportista(deportistaId, page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async confirmar(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { mercadoPagoId, status } = req.body;
            const result = await pago_service_1.pagoService.confirmarPago(id, mercadoPagoId, status);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.PAGO_CONFIRMAR,
                entidad: 'pago',
                entidadId: id,
                detalles: JSON.stringify({ status, mercadoPagoId }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Pago confirmado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Sincroniza un pago con Mercado Pago (útil cuando el webhook no llegó).
     * El deportista envía el payment_id que MP devuelve en la URL de éxito.
     */
    async sync(req, res, next) {
        try {
            const { paymentId } = req.body;
            const payment = await (0, mercadopago_service_1.getPaymentById)(paymentId);
            if (!payment?.external_reference) {
                (0, response_1.sendError)(res, 'Pago no encontrado en Mercado Pago o sin referencia', 404);
                return;
            }
            const pagoId = parseInt(payment.external_reference, 10);
            if (Number.isNaN(pagoId)) {
                (0, response_1.sendError)(res, 'Referencia de pago inválida', 400);
                return;
            }
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            const result = await pago_service_1.pagoService.syncPagoConMercadoPago(pagoId, paymentId, payment.status ?? 'pending', deportista.id);
            (0, response_1.sendSuccess)(res, result, 'Pago sincronizado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PagoController = PagoController;
exports.pagoController = new PagoController();
//# sourceMappingURL=pago.controller.js.map