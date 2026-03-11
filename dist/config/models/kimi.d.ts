import { ApiModelConfig } from '../../types';
import { BaseModelProvider, ModelProviderConfig } from './base';
export declare class KimiProvider extends BaseModelProvider {
    private config;
    constructor(config: ModelProviderConfig);
    isAvailable(): boolean;
    getProviderName(): string;
    getModels(): Record<string, ApiModelConfig>;
}
//# sourceMappingURL=kimi.d.ts.map