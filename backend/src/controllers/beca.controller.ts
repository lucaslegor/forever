import { Response, NextFunction } from 'express';
import { becaService } from '../services/beca.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class BecaController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 500;
      const result = await becaService.getAll(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async becar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const body = (req.body || {}) as { cuotaBeca?: number };
      const cuotaBeca = body.cuotaBeca != null ? Number(body.cuotaBeca) : undefined;
      const result = await becaService.becar(deportistaId, cuotaBeca);
      sendCreated(res, result, 'Beca asignada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async quitarBeca(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const result = await becaService.quitarBeca(deportistaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateCuotaBeca(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const body = req.body as { monto: number };
      const monto = Number(body.monto);
      if (Number.isNaN(monto) || monto < 0) {
        res.status(400).json({ error: 'Monto inválido' });
        return;
      }
      const result = await becaService.updateCuotaBeca(deportistaId, monto);
      sendSuccess(res, result, 'Cuota beca actualizada');
    } catch (error) {
      next(error);
    }
  }

  async getByDeportistaId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const result = await becaService.getByDeportistaId(deportistaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const becaController = new BecaController();
