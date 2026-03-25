import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(_req: Request, res: Response, next: NextFunction): Promise<void>;
    me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map