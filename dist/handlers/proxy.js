"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyHandler = void 0;
const base_1 = require("./base");
const api_1 = require("./api");
class ProxyHandler extends base_1.BaseHandler {
    constructor() {
        super(...arguments);
        this.apiHandler = new api_1.ApiHandler();
    }
    async handle(req, res) {
        try {
            const requestBody = this.validateRequest(req);
            const model = requestBody.model;
            const modelConfig = this.config.getModelConfig(model);
            if (!modelConfig) {
                const supportedModels = this.config.getSupportedModels();
                this.sendError(res, 400, `不支持的模型: ${model}。支持的模型: ${supportedModels.join(', ')}`, 'invalid_request_error');
                return;
            }
            if (modelConfig.type === 'api') {
                await this.apiHandler.handle(req, res);
            }
            else {
                this.sendError(res, 500, `未知的模型类型: ${modelConfig.type}`, 'internal_error');
            }
        }
        catch (error) {
            console.error('❌ 代理请求失败:', error.message);
            this.sendError(res, 500, error.message, 'proxy_error');
        }
    }
    handleModels(req, res) {
        console.log('📋 返回模型列表');
        const modelConfigs = this.config.getModelConfigs();
        const modelList = Object.entries(modelConfigs).map(([modelId, config]) => ({
            id: modelId,
            object: 'model',
            created: 1677610602,
            owned_by: config.provider,
            name: config.name || modelId
        }));
        const response = {
            object: 'list',
            data: modelList
        };
        res.json(response);
    }
    handleHealth(req, res) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            models: this.config.getSupportedModels().length
        });
    }
}
exports.ProxyHandler = ProxyHandler;
//# sourceMappingURL=proxy.js.map