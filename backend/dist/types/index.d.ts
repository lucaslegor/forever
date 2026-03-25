import { Request } from 'express';
import { Rol } from '@prisma/client';
export interface JwtPayload {
    id: number;
    email: string;
    rol: Rol;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export * from './requests';
export * from './responses';
//# sourceMappingURL=index.d.ts.map