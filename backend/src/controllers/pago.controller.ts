import { Request, Response, NextFunction } from 'express';
import { pagoService } from '../services/pago.service';
import { reservaCanchaService } from '../services/reservaCancha.service';
import { getPaymentById } from '../services/mercadopago.service';
import { deportistaService } from '../services/deportista.service';
import { sendSuccess, sendCreated, sendUnauthorized, sendForbidden, sendError } from '../utils/response';
import { validateMercadoPagoWebhookSignature } from '../utils/webhookSignature';
import { AuthenticatedRequest } from '../types';
import { CreatePagoInput, SyncPagoInput } from '../validators/pago.validator';
import { Rol } from '@prisma/client';

export class PagoController {
  async crear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreatePagoInput;
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await pagoService.crear(deportista.id, data);
      const message = result.initPoint
        ? 'Preferencia creada. Redirigiendo al checkout.'
        : 'No se pudo generar el link de pago. Revisá la consola del servidor y MERCADOPAGO_ACCESS_TOKEN.';
      sendCreated(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!validateMercadoPagoWebhookSignature(req)) {
        sendUnauthorized(res, 'Firma de webhook inválida');
        return;
      }

      const { type, data } = req.body;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Webhook MP]', type, data?.id ? `payment_id=${data.id}` : '');
      }

      if (type === 'payment' && data?.id) {
        const paymentId = String(data.id);
        const payment = await getPaymentById(paymentId);
        if (payment?.external_reference) {
          const ref = payment.external_reference;
          if (typeof ref === 'string' && ref.startsWith('reserva-')) {
            const reservaId = parseInt(ref.slice(8), 10);
            if (!Number.isNaN(reservaId) && payment.status === 'approved') {
              await reservaCanchaService.updatePagos(reservaId, { senaPagada: true });
            }
          } else {
            const pagoId = parseInt(ref, 10);
            if (!Number.isNaN(pagoId)) {
              const status = payment.status === 'approved' ? 'approved' : payment.status === 'rejected' ? 'rejected' : 'pending';
              await pagoService.confirmarPago(pagoId, paymentId, status);
            }
          }
        }
      }

      sendSuccess(res, { received: true });
    } catch (error) {
      next(error);
    }
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
