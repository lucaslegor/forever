import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class DisciplinaController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDeportistas(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const disciplinaController: DisciplinaController;
//# sourceMappingURL=disciplina.controller.d.ts.map