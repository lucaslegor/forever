import { Response, NextFunction } from 'express';
import { cuotaService } from '../services/cuota.service';
import { deportistaService } from '../services/deportista.service';
import { auditoriaService, ACCIONES } from '../services/auditoria.service';
import { sendSuccess, sendCreated, sendForbidden } from '../utils/response';
import { getClientIp, getUserAgent } from '../utils/request';
import { AuthenticatedRequest } from '../types';
import { AsignarCuotaInput, UpdateCuotaInput, CancelarCuotaInput, CuotasQuery, ListCuotasQuery, GenerarCuotasInput } from '../validators/cuota.validator';
import { Rol } from '@prisma/client';

export class CuotaController {
  async asignar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as AsignarCuotaInput;
      const result = await cuotaService.asignar(data);
      sendCreated(res, result, 'Cuota asignada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await cuotaService.getById(id);
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

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = req.body as UpdateCuotaInput;
      const result = await cuotaService.update(id, data);
      sendSuccess(res, result, 'Cuota actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async getPredefinidas(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const disciplinaId = req.query.disciplinaId
        ? parseInt(req.query.disciplinaId as string, 10)
        : undefined;
      const result = await cuotaService.getPredefinidas(disciplinaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEstadoCuenta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let deportistaId: number;

      if (req.user!.rol === Rol.DEPORTISTA) {
        const deportista = await deportistaService.getByUserId(req.user!.id);
        deportistaId = deportista.id;
      } else {
        deportistaId = parseInt(req.params.deportistaId as string, 10);
      }

      const result = await cuotaService.getEstadoCuenta(deportistaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getByDeportista(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = parseInt(req.params.deportistaId as string, 10);
      const query = req.query as unknown as CuotasQuery;
      const result = await cuotaService.getByDeportista(deportistaId, query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMiEstadoCuenta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportistaId = await deportistaService.getDeportistaIdByUserId(req.user!.id);
      if (deportistaId == null) {
        res.status(404).json({ success: false, error: 'Deportista no encontrado' });
        return;
      }
      const result = await cuotaService.getEstadoCuenta(deportistaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async generarMensuales(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as GenerarCuotasInput;
      const result = await cuotaService.generarCuotasMensuales(data.mes, data.anio);
      sendCreated(res, result, 'Cuotas generadas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListCuotasQuery;
      const result = await cuotaService.getAll(query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await cuotaService.delete(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deletePorGeneracion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as { anio: number; mes: number; disciplinaId: number };
      const result = await cuotaService.deletePorGeneracion(query.anio, query.mes, query.disciplinaId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deletePorMes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as { anio: number; mes: number };
      const result = await cuotaService.deletePorMes(query.anio, query.mes);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async marcarPagadaEfectivo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await cuotaService.marcarPagadaEfectivo(id);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.CUOTA_MARCAR_PAGADA,
        entidad: 'cuota',
        entidadId: id,
        detalles: JSON.stringify({ cuotaId: id }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result, 'Cuota marcada como pagada en efectivo');
    } catch (error) {
      next(error);
    }
  }

  async cancelarDeuda(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const data = req.body as CancelarCuotaInput;
      const result = await cuotaService.cancelarDeuda(id, data.motivo, req.user!.id);
      await auditoriaService.registrar({
        cuentaId: req.user?.id ?? null,
        accion: ACCIONES.CUOTA_CANCELAR_DEUDA,
        entidad: 'cuota',
        entidadId: id,
        detalles: JSON.stringify({ cuotaId: id, motivo: data.motivo }),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });
      sendSuccess(res, result, 'Deuda cancelada');
    } catch (error) {
      next(error);
    }
  }
}

export const cuotaController = new CuotaController();
