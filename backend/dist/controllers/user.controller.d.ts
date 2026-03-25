import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class UserController {
    getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    assignRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    resetAdminPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    setAdminActivo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map