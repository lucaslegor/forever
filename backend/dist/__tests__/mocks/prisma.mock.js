"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
exports.prismaMock = (0, jest_mock_extended_1.mockDeep)();
jest.mock('../../config/prisma', () => ({
    __esModule: true,
    default: exports.prismaMock,
    prisma: exports.prismaMock,
}));
//# sourceMappingURL=prisma.mock.js.map