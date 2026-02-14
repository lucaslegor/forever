import { Response, NextFunction } from 'express';
import { disciplinaService } from '../services/disciplina.service';
import { auditoriaService, ACCIONES } from '../services/auditoria.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { getClientIp, getUserAgent } from '../utils/request';
import { AuthenticatedRequest } from '../types';
import { CreateDisciplinaInput, UpdateDisciplinaInput } from '../validators/disciplina.validator';

export class DisciplinaController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateDisciplinaInput;
      const result = await disciplinaService.create(data);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.DISCIPLINA_ALTA,
        entidad: 'disciplina',
        entidadId: result.id,
        detalles: JSON.stringify({ nombre: result.nombre }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendCreated(res, result, 'Disciplina creada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await disciplinaService.getAll(includeInactive);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await disciplinaService.getById(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = req.body as UpdateDisciplinaInput;
      const result = await disciplinaService.update(id, data);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.DISCIPLINA_ACTUALIZACION,
        entidad: 'disciplina',
        entidadId: id,
        detalles: JSON.stringify({ cambios: Object.keys(data) }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result, 'Disciplina actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async getDeportistas(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await disciplinaService.getDeportistas(id, page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const disciplinaController = new DisciplinaController();
