import { Response, NextFunction } from 'express';
import { cuotaService } from '../services/cuota.service';
import { deportistaService } from '../services/deportista.service';
import { pagoService } from '../services/pago.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { AsignarCuotaInput, UpdateCuotaInput, CuotasQuery, GenerarCuotasInput, AdminGenerarInput, UpdateEstadoCuotaInput } from '../validators/cuota.validator';
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
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await cuotaService.getEstadoCuenta(deportista.id);
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

  async getCuotasSocio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await cuotaService.getCuotasSocio(deportista.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCuotasAdministrativo(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await cuotaService.getCuotasAdministrativo();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateEstadoCuota(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotaId = parseInt(req.params.id as string, 10);
      const { estado } = req.body as UpdateEstadoCuotaInput;
      const estadoDb = estado === 'Aprobada' || estado === 'PAGADA' ? 'PAGADA' : 'PENDIENTE';
      const result = await cuotaService.updateEstadoCuota(cuotaId, estadoDb as 'PAGADA' | 'PENDIENTE');
      sendSuccess(res, result, 'Estado actualizado');
    } catch (error) {
      next(error);
    }
  }

  async adminGenerar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as AdminGenerarInput;
      const result = await cuotaService.generarCuotasAdmin({
        actividadId: data.actividadId,
        mes: data.mes,
        montoBase: data.montoBase,
        preview: data.preview,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async subirComprobante(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotaId = parseInt(req.params.cuotaId as string, 10);
      const file = req.file as Express.Multer.File | undefined;
      if (!file?.filename) {
        res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
        return;
      }
      const linkComprobante = `/uploads/cuentas/${file.filename}`;
      const deportista = await deportistaService.getByUserId(req.user!.id);
      const result = await pagoService.asociarComprobante(deportista.id, cuotaId, linkComprobante);
      sendSuccess(res, result, 'Comprobante subido correctamente');
    } catch (error) {
      next(error);
    }
  }
}

export const cuotaController = new CuotaController();
