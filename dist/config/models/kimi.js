"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KimiProvider = void 0;
const base_1 = require("./base");
class KimiProvider extends base_1.BaseModelProvider {
    constructor(config) {
        super();
        this.config = config;
    }
    isAvailable() {
        return !!(this.config.apiKey && this.config.enabled !== false);
    }
    getProviderName() {
        return 'kimi';
    }
    getModels() {
        if (!this.isAvailable())
            return {};
        const model = this.config.model || 'moonshot-v1-8k';
        return {
            [model]: {
                type: 'api',
                apiUrl: this.config.apiUrl || 'https://api.moonshot.cn/v1',
                apiKey: this.config.apiKey,
                provider: 'kimi',
                name: 'Kimi K2',
                model
            }
        };
    }
}
exports.KimiProvider = KimiProvider;
//# sourceMappingURL=kimi.js.map