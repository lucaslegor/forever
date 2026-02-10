import { Response, NextFunction } from 'express';
import { deportistaService } from '../services/deportista.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import {
  CreateDeportistaInput,
  UpdateDeportistaInput,
  UpdateMiPerfilInput,
  DeportistasQuery,
} from '../validators/deportista.validator';
import { Rol } from '@prisma/client';

export class DeportistaController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateDeportistaInput;
      const result = await deportistaService.create(data);
      sendCreated(res, result, 'Deportista creado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as DeportistasQuery;
      const result = await deportistaService.getAll(query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await deportistaService.getById(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = req.body as UpdateDeportistaInput;
      const result = await deportistaService.update(id, data);
      sendSuccess(res, result, 'Deportista actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await deportistaService.delete(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getConPagosPendientes(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await deportistaService.getConPagosPendientes();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getHistorial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let deportistaId: number;

      if (req.user!.rol === Rol.DEPORTISTA) {
        const deportista = await deportistaService.getByUserId(req.user!.id);
        deportistaId = deportista.id;
      } else {
        deportistaId = parseInt(req.params.id as string, 10);
      }

      const result = await deportistaService.getHistorial(deportistaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMiPerfil(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportista = await deportistaService.getByUserId(req.user!.id);
      sendSuccess(res, deportista);
    } catch (error) {
      next(error);
    }
  }

  async updateMiPerfil(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as UpdateMiPerfilInput;
      const result = await deportistaService.updateMiPerfilAdultos(req.user!.id, data);
      sendSuccess(res, result, 'Adultos responsables guardados correctamente');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { newPassword } = req.body;
      const result = await deportistaService.resetPassword(id, newPassword);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async resetPasswordByDni(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, newPassword } = req.body;
      const result = await deportistaService.resetPasswordByDni(dni, newPassword);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const deportistaController = new DeportistaController();
