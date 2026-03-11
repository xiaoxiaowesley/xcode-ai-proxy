"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const handlers_1 = require("./handlers");
const middlewares_1 = require("./middlewares");
const utils_1 = require("./utils");
class XcodeAiProxyServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.config = config_1.ConfigManager.getInstance();
        this.proxyHandler = new handlers_1.ProxyHandler();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(middlewares_1.loggingMiddleware);
    }
    setupRoutes() {
        this.app.get('/health', this.proxyHandler.handleHealth.bind(this.proxyHandler));
        this.app.get('/v1/models', this.proxyHandler.handleModels.bind(this.proxyHandler));
        this.app.post('/v1/chat/completions', this.proxyHandler.handle.bind(this.proxyHandler));
        this.app.post('/api/v1/chat/completions', this.proxyHandler.handle.bind(this.proxyHandler));
        this.app.post('/v1/messages', this.proxyHandler.handle.bind(this.proxyHandler));
    }
    setupErrorHandling() {
        this.app.use(middlewares_1.errorHandler);
    }
    start() {
        const appConfig = this.config.getAppConfig();
        this.app.listen(appConfig.port, appConfig.host, () => {
            this.logStartupInfo(appConfig);
        });
    }
    logStartupInfo(appConfig) {
        console.log('🚀 Xcode AI 代理服务已启动');
        const serverUrls = (0, utils_1.getServerUrls)(appConfig.host, appConfig.port);
        console.log('📡 服务访问地址:');
        serverUrls.forEach((url, index) => {
            const label = index === 0 ? '本机访问' : index === 1 ? '局域网访问' : '其他网卡';
            console.log(`   ${label}: ${url}`);
        });
        console.log(`🎯 支持的模型:`);
        const modelConfigs = this.config.getModelConfigs();
        Object.entries(modelConfigs).forEach(([modelId, config]) => {
            console.log(`   - ${modelId} (${config.name || config.type})`);
        });
        console.log(`⚙️ 重试配置:`);
        console.log(`   最大重试次数: ${appConfig.maxRetries}`);
        console.log(`   重试延迟: ${appConfig.retryDelay}ms (递增)`);
        console.log(`   请求超时: ${appConfig.requestTimeout}ms`);
        console.log(`📋 配置 Xcode:`);
        console.log(`   ANTHROPIC_BASE_URL: ${serverUrls[1] || serverUrls[0]}`);
        console.log(`   ANTHROPIC_AUTH_TOKEN: any-string-works`);
        console.log('🔧 功能: API/CLI 统一代理，流式响应，动态配置，智能重试');
        this.config.logConfiguration();
    }
}
const server = new XcodeAiProxyServer();
server.start();
//# sourceMappingURL=server.js.map