"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const base_1 = require("./base");
class GeminiProvider extends base_1.BaseModelProvider {
    constructor(config) {
        super();
        this.config = config;
    }
    isAvailable() {
        return !!(this.config.apiKey && this.config.enabled !== false);
    }
    getProviderName() {
        return 'google';
    }
    getModels() {
        if (!this.isAvailable())
            return {};
        const model = this.config.model || 'gemini-2.5-pro';
        return {
            [model]: {
                type: 'api',
                apiUrl: this.config.apiUrl || 'https://generativelanguage.googleapis.com/v1beta/openai',
                apiKey: this.config.apiKey,
                provider: 'google',
                name: 'Gemini 2.5 Pro',
                model
            }
        };
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.js.map