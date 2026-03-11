"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = loggingMiddleware;
exports.errorHandler = errorHandler;
const utils_1 = require("../utils");
function loggingMiddleware(req, res, next) {
    (0, utils_1.logRequest)(req.method, req.path);
    next();
}
function errorHandler(err, req, res, next) {
    console.error('❌ 服务器错误:', err.message);
    if (!res.headersSent) {
        res.status(500).json({
            error: {
                message: err.message || '内部服务器错误',
                type: 'server_error'
            }
        });
    }
}
//# sourceMappingURL=common.js.map