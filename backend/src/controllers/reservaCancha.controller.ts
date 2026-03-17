import { Request, Response, NextFunction } from 'express';
import { reservaCanchaService } from '../services/reservaCancha.service';
import { captchaService } from '../services/captcha.service';
import { sendSuccess, sendCreated } from '../utils/response';

export class ReservaCanchaController {
  private getParamId(param: unknown): number {
    const raw = Array.isArray(param) ? param[0] : param;
    const id = parseInt(String(raw), 10);
    return id;
  }

  async getDisponibilidad(req: Request, res: Response, next: NextFunction) {
    try {
      const fecha = req.query.fecha as string;
      if (!fecha) {
        res.status(400).json({ success: false, error: 'Parámetro fecha es requerido (YYYY-MM-DD)' });
        return;
      }
      const ocupados = await reservaCanchaService.getOcupadosPorFecha(fecha);
      sendSuccess(res, { horasOcupadas: ocupados });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as {
        fecha: string;
        hora: number;
        nombreCliente: string;
        telefono: string;
        email?: string;
        notas?: string;
        metodoPago?: 'mercadopago' | 'transferencia';
        captchaToken: string;
      };
      const valid = await captchaService.verifyTurnstile(body.captchaToken);
      if (!valid) {
        res.status(400).json({
          success: false,
          error: 'La verificación de seguridad falló. Intentá de nuevo.',
        });
        return;
      }
      const { captchaToken: _t, ...data } = body;
      const result = await reservaCanchaService.create(data);
      const message =
        result.metodoPago === 'transferencia'
          ? 'Reserva registrada. Tenés 20 minutos para abonar la seña por transferencia vía WhatsApp.'
          : result.initPoint
            ? 'Reserva registrada. Redirigiendo a Mercado Pago para abonar la seña.'
            : 'Reserva registrada. Debe abonar la seña de $5000 para confirmar.';
      sendCreated(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const fechaDesde = req.query.fechaDesde as string | undefined;
      const fechaHasta = req.query.fechaHasta as string | undefined;
      const data = await reservaCanchaService.list(fechaDesde, fechaHasta);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updatePagos(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
      const body = req.body as { senaPagada?: boolean; restoPagado?: boolean; montoTotal?: number };
      const data = await reservaCanchaService.updatePagos(id, body);
      sendSuccess(res, data, 'Pagos actualizados');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
      const body = req.body as { notas?: string; montoTotal?: number };
      const data = await reservaCanchaService.update(id, body);
      sendSuccess(res, data, 'Reserva actualizada');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
      await reservaCanchaService.delete(id);
      sendSuccess(res, { ok: true }, 'Reserva cancelada');
    } catch (error) {
      next(error);
    }
  }
}

export const reservaCanchaController = new ReservaCanchaController();
