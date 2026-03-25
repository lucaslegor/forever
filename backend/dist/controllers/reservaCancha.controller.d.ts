import { Request, Response, NextFunction } from 'express';
export declare class ReservaCanchaController {
    private getParamId;
    getDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePagos(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const reservaCanchaController: ReservaCanchaController;
//# sourceMappingURL=reservaCancha.controller.d.ts.map