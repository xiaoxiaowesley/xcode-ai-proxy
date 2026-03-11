"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZhipuProvider = void 0;
const base_1 = require("./base");
class ZhipuProvider extends base_1.BaseModelProvider {
    constructor(config) {
        super();
        this.config = config;
    }
    isAvailable() {
        return !!(this.config.apiKey && this.config.enabled !== false);
    }
    getProviderName() {
        return 'zhipu';
    }
    getModels() {
        if (!this.isAvailable())
            return {};
        const model = this.config.model || 'glm-4-0520';
        return {
            [model]: {
                type: 'api',
                apiUrl: this.config.apiUrl || 'https://open.bigmodel.cn/api/paas/v4',
                apiKey: this.config.apiKey,
                provider: 'zhipu',
                name: 'GLM-4.5',
                model
            }
        };
    }
}
exports.ZhipuProvider = ZhipuProvider;
//# sourceMappingURL=zhipu.js.map