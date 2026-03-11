"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
dotenv_1.default.config();
class ConfigManager {
    constructor() {
        this.env = process.env;
        this.env.QWEN_API_KEY = 'sk-02a3aff837904cfeb790b3c9b773f7a0';
        this.env.QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
        this.validateRequiredEnvVars();
        this.initializeAppConfig();
        this.initializeModelConfigs();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    validateRequiredEnvVars() {
        const requiredEnvVars = {
            ZHIPU_API_KEY: 'GLM-4.5 模型',
            KIMI_API_KEY: 'Kimi 模型',
            GEMINI_API_KEY: 'Gemini 模型',
            QWEN_API_KEY: 'Qwen 模型'
        };
        const allApiKeys = [
            'ZHIPU_API_KEY', 'KIMI_API_KEY', 'GEMINI_API_KEY', 'QWEN_API_KEY'
        ];
        const hasApiKey = allApiKeys.some(envVar => this.env[envVar]);
        if (!hasApiKey) {
            console.error('❌ 至少需要配置一个API密钥');
            console.error('支持的环境变量: ZHIPU_API_KEY, KIMI_API_KEY, GEMINI_API_KEY, QWEN_API_KEY');
            process.exit(1);
        }
    }
    initializeAppConfig() {
        this.appConfig = {
            port: parseInt(this.env.PORT || '3000'),
            host: this.env.HOST || '0.0.0.0',
            maxRetries: parseInt(this.env.MAX_RETRIES || '3'),
            retryDelay: parseInt(this.env.RETRY_DELAY || '1000'),
            requestTimeout: parseInt(this.env.REQUEST_TIMEOUT || '60000'),
            customSystemPrompt: this.env.CUSTOM_SYSTEM_PROMPT
        };
        if (this.appConfig.customSystemPrompt) {
            console.log('📝 已配置自定义系统提示');
        }
    }
    initializeModelConfigs() {
        this.modelConfigs = {};
        const zhipuProvider = new models_1.ZhipuProvider({
            apiKey: this.env.ZHIPU_API_KEY,
            apiUrl: this.env.ZHIPU_API_URL,
            model: this.env.ZHIPU_API_MODEL
        });
        Object.assign(this.modelConfigs, zhipuProvider.getModels());
        const kimiProvider = new models_1.KimiProvider({
            apiKey: this.env.KIMI_API_KEY,
            apiUrl: this.env.KIMI_API_URL,
            model: this.env.KIMI_API_MODEL
        });
        Object.assign(this.modelConfigs, kimiProvider.getModels());
        const geminiProvider = new models_1.GeminiProvider({
            apiKey: this.env.GEMINI_API_KEY,
            apiUrl: this.env.GEMINI_API_URL,
            model: this.env.GEMINI_API_MODEL
        });
        Object.assign(this.modelConfigs, geminiProvider.getModels());
        const qwenProvider = new models_1.QwenProvider({
            apiKey: this.env.QWEN_API_KEY,
            apiUrl: this.env.QWEN_API_URL,
            model: this.env.QWEN_API_MODEL
        });
        Object.assign(this.modelConfigs, qwenProvider.getModels());
    }
    getAppConfig() {
        return this.appConfig;
    }
    getModelConfigs() {
        return this.modelConfigs;
    }
    getModelConfig(modelId) {
        return this.modelConfigs[modelId];
    }
    getSupportedModels() {
        return Object.keys(this.modelConfigs);
    }
    logConfiguration() {
        console.log('📋 已加载模型配置:');
        Object.entries(this.modelConfigs).forEach(([modelId, config]) => {
            console.log(`   - ${modelId} (${config.name})`);
        });
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map