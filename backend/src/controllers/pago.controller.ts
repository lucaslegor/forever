import { Request, Response, NextFunction } from 'express';
import { pagoService } from '../services/pago.service';
import { reservaCanchaService } from '../services/reservaCancha.service';
import { getPaymentById } from '../services/mercadopago.service';
import { deportistaService } from '../services/deportista.service';
import { auditoriaService, ACCIONES } from '../services/auditoria.service';
import { sendSuccess, sendCreated, sendUnauthorized, sendForbidden, sendError } from '../utils/response';
import { getClientIp, getUserAgent } from '../utils/request';
import { validateMercadoPagoWebhookSignature } from '../utils/webhookSignature';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';
import { CreatePagoInput, SyncPagoInput } from '../validators/pago.validator';
import { Rol } from '@prisma/client';

export class PagoController {
  async crear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🟡 [Pago Controller] Recibida petición para crear pago');
      console.log('  - Body:', req.body);
      console.log('  - Usuario:', req.user?.email);

      const data = req.body as CreatePagoInput;
      const deportista = await deportistaService.getByUserId(req.user!.id);

      console.log('  - Deportista ID:', deportista.id);
      console.log('  - Cuota ID:', data.cuotaId);

      const result = await pagoService.crear(deportista.id, data);
      const message = result.initPoint
        ? 'Preferencia creada. Redirigiendo al checkout.'
        : 'No se pudo generar el link de pago. Revisá la consola del servidor y MERCADOPAGO_ACCESS_TOKEN.';
      sendCreated(res, result, message);
    } catch (error) {
      console.error('❌ [Pago Controller] Error:', error);
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { type, data, topic, id } = req.body as { type?: string; data?: { id: string }; topic?: string; id?: string };
      const { id: queryId } = req.query as { id?: string };

      console.log('  - Type:', type);
      console.log('  - Topic:', topic);
      console.log('  - Data ID:', data?.id);
      console.log('  - Body ID:', id);
      console.log('  - Query ID:', queryId);

      let paymentId: string | null = null;

      // Mercado Pago puede enviar webhooks de diferentes formas
      if (type === 'payment' && data?.id) {
        paymentId = String(data.id);
        console.log('  - Detectado como payment type, Payment ID:', paymentId);
      } else if (topic === 'merchant_order' && (id || queryId)) {
        // Para merchant_order, necesitamos obtener el payment desde la orden
        const orderId = String(id || queryId);
        console.log('  - Detectado como merchant_order, Order ID:', orderId);

        try {
          const orderResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
            headers: {
              Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
          });

          const order = await orderResponse.json() as { payments?: Array<{ id: number }> };
          console.log('  - Merchant Order obtenida:', JSON.stringify(order, null, 2));

          if (order.payments && order.payments.length > 0) {
            paymentId = String(order.payments[0].id);
            console.log('  - Payment ID desde merchant order:', paymentId);
          }
        } catch (err) {
          console.error('  - Error obteniendo merchant order:', err);
        }
      }

      if (paymentId) {
        console.log('  - Procesando Payment ID:', paymentId);

        const payment = await getPaymentById(paymentId);
        console.log('  - Payment obtenido:', JSON.stringify(payment, null, 2));

        if (payment?.external_reference) {
          const ref = payment.external_reference;
          if (typeof ref === 'string' && ref.startsWith('reserva-')) {
            const reservaId = parseInt(ref.slice(8), 10);
            if (!Number.isNaN(reservaId) && payment.status === 'approved') {
              console.log('  - Actualizando reserva:', reservaId);
              await reservaCanchaService.updatePagos(reservaId, { senaPagada: true });
            }
          } else {
            const pagoId = parseInt(ref, 10);
            if (!Number.isNaN(pagoId)) {
              const status = payment.status === 'approved' ? 'approved' : payment.status === 'rejected' ? 'rejected' : 'pending';
              console.log('  - Actualizando pago:', pagoId, 'con status:', status);
              await pagoService.confirmarPago(pagoId, paymentId, status);
            }
          }
        }
      } else {
        console.warn('  - No se pudo obtener payment ID del webhook');
      }

      console.log('✅ [Webhook] Procesado correctamente');
      sendSuccess(res, { received: true });
    } catch (error) {
      console.error('❌ [Webhook] Error:', error);
      next(error);
    }
  }

  /** Endpoint de prueba para verificar que el webhook es accesible */
  async webhookTest(req: Request, res: Response): Promise<void> {
    console.log('🧪 [Webhook Test] Endpoint de prueba accedido correctamente');
    res.json({
      success: true,
      message: 'Webhook endpoint is accessible!',
      timestamp: new Date().toISOString()
    });
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await pagoService.getById(id);
      const rol = req.user!.rol;
      if (rol === Rol.ADMIN || rol === Rol.ADMINISTRATIVO) {
        sendSuccess(res, result);
        return;
      }
      const deportista = await deportistaService.getByUserId(req.user!.id);
      if (result.deportistaId !== deportista.id) {
        sendForbidden(res, 'No tiene permisos para acceder a este recurso');
        return;
      }
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMisPagos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await pagoService.getByDeportista(deportista.id, page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getByDeportista(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await pagoService.getByDeportista(deportistaId, page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async confirmar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { mercadoPagoId, status } = req.body;
      const result = await pagoService.confirmarPago(id, mercadoPagoId, status);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.PAGO_CONFIRMAR,
        entidad: 'pago',
        entidadId: id,
        detalles: JSON.stringify({ status, mercadoPagoId }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result, 'Pago confirmado correctamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sincroniza un pago con Mercado Pago (útil cuando el webhook no llegó).
   * El deportista envía el payment_id que MP devuelve en la URL de éxito.
   */
  async sync(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.body as SyncPagoInput;
      const payment = await getPaymentById(paymentId);
      if (!payment?.external_reference) {
        sendError(res, 'Pago no encontrado en Mercado Pago o sin referencia', 404);
        return;
      }
      const pagoId = parseInt(payment.external_reference, 10);
      if (Number.isNaN(pagoId)) {
        sendError(res, 'Referencia de pago inválida', 400);
        return;
      }
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await pagoService.syncPagoConMercadoPago(pagoId, paymentId, payment.status ?? 'pending', deportista.id);
      sendSuccess(res, result, 'Pago sincronizado correctamente');
    } catch (error) {
      next(error);
    }
  }
}

export const pagoController = new PagoController();
