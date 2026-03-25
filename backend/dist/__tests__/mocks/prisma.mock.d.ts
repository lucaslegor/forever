import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
export type MockPrismaClient = DeepMockProxy<PrismaClient>;
export declare const prismaMock: DeepMockProxy<PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>>;
//# sourceMappingURL=prisma.mock.d.ts.map