import { Request, Response, NextFunction } from 'express';
import { pagoService } from '../services/pago.service';
import { getPaymentById } from '../services/mercadopago.service';
import { deportistaService } from '../services/deportista.service';
import { sendSuccess, sendCreated, sendUnauthorized } from '../utils/response';
import { validateMercadoPagoWebhookSignature } from '../utils/webhookSignature';
import { AuthenticatedRequest } from '../types';
import { CreatePagoInput } from '../validators/pago.validator';

export class PagoController {
  async crear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreatePagoInput;
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await pagoService.crear(deportista.id, data);
      sendCreated(res, result, 'Preferencia creada. Redirigiendo al checkout.');
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

      if (type === 'payment' && data?.id) {
        const paymentId = String(data.id);
        const payment = await getPaymentById(paymentId);
        if (payment?.external_reference) {
          const pagoId = parseInt(payment.external_reference, 10);
          if (!Number.isNaN(pagoId)) {
            const status = payment.status === 'approved' ? 'approved' : payment.status === 'rejected' ? 'rejected' : 'pending';
            await pagoService.confirmarPago(pagoId, paymentId, status);
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
}

export const pagoController = new PagoController();
