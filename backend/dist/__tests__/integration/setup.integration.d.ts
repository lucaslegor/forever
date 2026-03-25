import { PrismaClient } from '@prisma/client';
export declare const prismaTest: PrismaClient<{
    log: "error"[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function cleanDatabase(): Promise<void>;
export declare const testData: {
    disciplina: {
        nombre: string;
        precioMensual: number;
    };
    admin: {
        email: string;
        password: string;
        nombre: string;
        apellido: string;
        dni: string;
    };
    deportista: {
        email: string;
        password: string;
        nombre: string;
        apellido: string;
        dni: string;
        fechaNac: Date;
    };
};
export declare function seedTestData(): Promise<{
    genero: {
        id: number;
        nombre: string;
    };
    categoria: {
        id: number;
        nombre: string;
    };
    disciplina: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        precioMensual: import("@prisma/client/runtime/library").Decimal;
        activa: boolean;
    };
}>;
export declare function connectDatabase(): Promise<void>;
export declare function disconnectDatabase(): Promise<void>;
//# sourceMappingURL=setup.integration.d.ts.map