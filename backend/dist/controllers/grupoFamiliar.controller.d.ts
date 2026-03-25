import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class GrupoFamiliarController {
    getMios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const grupoFamiliarController: GrupoFamiliarController;
//# sourceMappingURL=grupoFamiliar.controller.d.ts.map