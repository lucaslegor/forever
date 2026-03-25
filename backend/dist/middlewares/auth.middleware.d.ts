import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
/** Email del admin principal (único que puede crear otros admins y gestionar administradores) */
export declare const PRINCIPAL_ADMIN_EMAIL: string;
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdministrativo: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/** Solo el admin principal (admin@foreverclub.com) puede crear admins, listar usuarios y restablecer contraseñas de admins */
export declare const requirePrincipalAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireDeportista: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireSelfOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map