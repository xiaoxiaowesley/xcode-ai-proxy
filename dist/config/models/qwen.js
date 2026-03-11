"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenProvider = void 0;
const base_1 = require("./base");
class QwenProvider extends base_1.BaseModelProvider {
    constructor(config) {
        super();
        this.config = config;
    }
    isAvailable() {
        return !!(this.config.apiKey && this.config.enabled !== false);
    }
    getProviderName() {
        return 'qwen';
    }
    getModels() {
        if (!this.isAvailable())
            return {};
        const model = this.config.model || 'qwen-max';
        return {
            [model]: {
                type: 'api',
                apiUrl: this.config.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                apiKey: this.config.apiKey,
                provider: 'qwen',
                name: 'Qwen Max',
                model
            }
        };
    }
}
exports.QwenProvider = QwenProvider;
//# sourceMappingURL=qwen.js.map