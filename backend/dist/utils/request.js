"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
exports.getUserAgent = getUserAgent;
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip ?? null;
}
function getUserAgent(req) {
    const ua = req.headers['user-agent'];
    return typeof ua === 'string' ? ua : null;
}
//# sourceMappingURL=request.js.map