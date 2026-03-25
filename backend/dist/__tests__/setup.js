"use strict";
// Setup de tests
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
//# sourceMappingURL=setup.js.map