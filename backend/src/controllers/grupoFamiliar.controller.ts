import { Response, NextFunction } from 'express';
import { grupoFamiliarService } from '../services/grupoFamiliar.service';
import { deportistaService } from '../services/deportista.service';
import { auditoriaService, ACCIONES } from '../services/auditoria.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { getClientIp, getUserAgent } from '../utils/request';
import { AuthenticatedRequest } from '../types';
import {
  CreateGrupoFamiliarInput,
  UpdateGrupoFamiliarInput,
} from '../validators/grupoFamiliar.validator';

export class GrupoFamiliarController {
  async getMios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await grupoFamiliarService.getByDeportistaId(deportista.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateGrupoFamiliarInput;
      const result = await grupoFamiliarService.create(data);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.GRUPO_FAMILIAR_CREAR,
        entidad: 'grupo_familiar',
        entidadId: result.id,
        detalles: JSON.stringify({ nombre: result.nombre }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendCreated(res, result, 'Grupo familiar creado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await grupoFamiliarService.getAll(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await grupoFamiliarService.getById(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = req.body as UpdateGrupoFamiliarInput;
      const result = await grupoFamiliarService.update(id, data);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.GRUPO_FAMILIAR_ACTUALIZACION,
        entidad: 'grupo_familiar',
        entidadId: id,
        detalles: JSON.stringify({ cambios: Object.keys(data) }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result, 'Grupo familiar actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await grupoFamiliarService.delete(id);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.GRUPO_FAMILIAR_BAJA,
        entidad: 'grupo_familiar',
        entidadId: id,
        detalles: JSON.stringify({ grupoFamiliarId: id }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const grupoFamiliarController = new GrupoFamiliarController();
