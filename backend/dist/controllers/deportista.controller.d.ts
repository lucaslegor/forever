import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class DeportistaController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    darDeAlta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getConPagosPendientes(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getHistorial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMiPerfil(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateMiPerfil(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    resetPasswordByDni(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const deportistaController: DeportistaController;
//# sourceMappingURL=deportista.controller.d.ts.map