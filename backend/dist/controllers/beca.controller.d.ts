import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class BecaController {
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    becar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    quitarBeca(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCuotaBeca(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getByDeportistaId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const becaController: BecaController;
//# sourceMappingURL=beca.controller.d.ts.map