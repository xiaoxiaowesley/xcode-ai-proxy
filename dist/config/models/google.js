"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleProvider = void 0;
const base_1 = require("./base");
class GoogleProvider extends base_1.BaseModelProvider {
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
        return {
            'gemini-pro': {
                type: 'api',
                apiUrl: this.config.apiUrl || 'https://generativelanguage.googleapis.com/v1beta',
                apiKey: this.config.apiKey,
                provider: 'google',
                name: 'Gemini Pro',
                model: 'gemini-pro'
            }
        };
    }
}
exports.GoogleProvider = GoogleProvider;
//# sourceMappingURL=google.js.map