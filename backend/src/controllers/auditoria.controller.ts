import { Response, NextFunction } from 'express';
import { auditoriaService } from '../services/auditoria.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuditoriaController {
  async listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page != null ? parseInt(String(req.query.page), 10) : undefined;
      const limit = req.query.limit != null ? parseInt(String(req.query.limit), 10) : undefined;
      const cuentaId = req.query.cuentaId != null ? parseInt(String(req.query.cuentaId), 10) : undefined;
      const entidad = typeof req.query.entidad === 'string' ? req.query.entidad : undefined;
      const accion = typeof req.query.accion === 'string' ? req.query.accion : undefined;
      const desde = typeof req.query.desde === 'string' ? new Date(req.query.desde) : undefined;
      const hasta = typeof req.query.hasta === 'string' ? new Date(req.query.hasta) : undefined;

      const result = await auditoriaService.listar({
        page,
        limit,
        cuentaId: Number.isNaN(cuentaId as number) ? undefined : (cuentaId as number),
        entidad,
        accion,
        desde: desde && !Number.isNaN(desde.getTime()) ? desde : undefined,
        hasta: hasta && !Number.isNaN(hasta.getTime()) ? hasta : undefined,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const auditoriaController = new AuditoriaController();
