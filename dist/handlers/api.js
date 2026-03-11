"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const base_1 = require("./base");
const utils_1 = require("../utils");
class ApiHandler extends base_1.BaseHandler {
    async handle(req, res) {
        try {
            const requestBody = this.validateRequest(req);
            const model = requestBody.model;
            this.logModelRequest(model, requestBody.stream);
            const modelConfig = this.config.getModelConfig(model);
            if (!modelConfig || modelConfig.type !== 'api') {
                this.sendError(res, 400, `不支持的 API 模型: ${model}`, 'invalid_request_error');
                return;
            }
            await this.handleApiRequest(requestBody, modelConfig, res);
        }
        catch (error) {
            console.error('❌ API 处理失败:', error.message);
            this.sendError(res, 500, error.message, 'api_error');
        }
    }
    async handleApiRequest(requestBody, config, res) {
        const operation = async () => {
            const axiosConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'identity'
                },
                responseType: requestBody.stream ? 'stream' : 'json',
                timeout: this.config.getAppConfig().requestTimeout,
                validateStatus: (status) => status < 500
            };
            axiosConfig.headers['Authorization'] = `Bearer ${config.apiKey}`;
            if (config.provider === 'kimi') {
                axiosConfig.httpsAgent = new https_1.default.Agent({
                    keepAlive: true,
                    timeout: this.config.getAppConfig().requestTimeout,
                    rejectUnauthorized: true
                });
            }
            const processMessages = (originalMessages) => {
                const modifiedMessages = [];
                let insertedPrompts = false;
                const appConfig = this.config.getAppConfig();
                for (const message of originalMessages) {
                    modifiedMessages.push(message);
                    if (message.role === 'system' && !insertedPrompts) {
                        modifiedMessages.push({
                            role: 'system',
                            content: '重要：请务必使用中文与用户交流。无论用户使用什么语言提问，都请用中文回答。'
                        });
                        if (appConfig.customSystemPrompt) {
                            modifiedMessages.push({
                                role: 'system',
                                content: appConfig.customSystemPrompt
                            });
                        }
                        insertedPrompts = true;
                    }
                }
                return modifiedMessages;
            };
            const requestData = {
                ...requestBody,
                model: config.model || requestBody.model,
                messages: processMessages(requestBody.messages)
            };
            if (Array.isArray(requestData.tools) && requestData.tools.length === 0) {
                delete requestData.tools;
            }
            console.log(`📡 向 ${config.provider} 发送请求:`, {
                url: `${config.apiUrl}/chat/completions`,
                model: requestData.model,
                stream: requestData.stream,
                headers: axiosConfig.headers
            });
            console.log(`📝 请求体:`, JSON.stringify(requestData, null, 2));
            return await axios_1.default.post(`${config.apiUrl}/chat/completions`, requestData, axiosConfig);
        };
        const response = await (0, utils_1.withRetry)(operation, this.config.getAppConfig().maxRetries, this.config.getAppConfig().retryDelay);
        if (response.status >= 400) {
            console.error(`❌ ${config.provider} API错误详情:`, {
                status: response.status,
                statusText: response.statusText,
                url: response.config?.url
            });
            let errorData = response.data;
            if (response.data && typeof response.data.pipe === 'function') {
                try {
                    const chunks = [];
                    response.data.on('data', (chunk) => chunks.push(chunk));
                    await new Promise((resolve, reject) => {
                        response.data.on('end', resolve);
                        response.data.on('error', reject);
                    });
                    const errorText = Buffer.concat(chunks).toString();
                    console.error(`❌ ${config.provider} 错误响应内容:`, errorText);
                    try {
                        errorData = JSON.parse(errorText);
                    }
                    catch {
                        errorData = { message: errorText };
                    }
                }
                catch (streamError) {
                    console.error(`❌ 读取错误流失败:`, streamError);
                    errorData = { message: '无法读取错误详情' };
                }
            }
            else {
                console.error(`❌ ${config.provider} 错误响应数据:`, errorData);
            }
            const error = new Error(`${config.provider} API请求失败: ${response.status} ${response.statusText}`);
            error.status = response.status;
            error.statusText = response.statusText;
            error.url = response.config?.url;
            error.data = errorData;
            throw error;
        }
        console.log(`✅ ${config.provider} API响应状态:`, response.status);
        const responseHeaders = {
            'content-type': response.headers['content-type'] || 'application/json',
            'access-control-allow-origin': '*',
            'access-control-allow-methods': '*',
            'access-control-allow-headers': '*'
        };
        if (requestBody.stream) {
            console.log(`🔄 透传${config.provider}流式响应`);
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            response.data.pipe(res);
        }
        else {
            console.log(`📦 返回${config.provider}非流式响应`);
            Object.entries(responseHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            res.json(response.data);
        }
    }
}
exports.ApiHandler = ApiHandler;
//# sourceMappingURL=api.js.map