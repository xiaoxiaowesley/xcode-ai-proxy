"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHandler = void 0;
const config_1 = require("../config");
class BaseHandler {
    constructor() {
        this.config = config_1.ConfigManager.getInstance();
    }
    validateRequest(req) {
        const { model, messages } = req.body;
        if (!model) {
            throw new Error('缺少必需参数: model');
        }
        if (!messages || !Array.isArray(messages)) {
            throw new Error('缺少必需参数: messages 或格式无效');
        }
        return req.body;
    }
    sendError(res, status, message, type = 'request_error') {
        if (!res.headersSent) {
            const errorResponse = {
                error: {
                    message,
                    type
                }
            };
            res.status(status).json(errorResponse);
        }
    }
    logModelRequest(model, isStream = false) {
        console.log('🎯 请求模型:', model);
        console.log('🔍 是否流式:', isStream);
    }
}
exports.BaseHandler = BaseHandler;
//# sourceMappingURL=base.js.map