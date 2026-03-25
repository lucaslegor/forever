import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class CuotaController {
    asignar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getPredefinidas(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEstadoCuenta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getByDeportista(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMiEstadoCuenta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generarMensuales(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deletePorGeneracion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deletePorMes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    marcarPagadaEfectivo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    cancelarDeuda(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const cuotaController: CuotaController;
//# sourceMappingURL=cuota.controller.d.ts.map