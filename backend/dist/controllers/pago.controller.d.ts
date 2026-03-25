import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class PagoController {
    crear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    webhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** Endpoint de prueba para verificar que el webhook es accesible */
    webhookTest(_req: Request, res: Response): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMisPagos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getByDeportista(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    confirmar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Sincroniza un pago con Mercado Pago (útil cuando el webhook no llegó).
     * El deportista envía el payment_id que MP devuelve en la URL de éxito.
     */
    sync(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const pagoController: PagoController;
//# sourceMappingURL=pago.controller.d.ts.map