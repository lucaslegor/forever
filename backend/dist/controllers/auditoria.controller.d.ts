import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuditoriaController {
    listar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const auditoriaController: AuditoriaController;
//# sourceMappingURL=auditoria.controller.d.ts.map