import { ApiModelConfig } from '../../types';
import { BaseModelProvider, ModelProviderConfig } from './base';
export declare class GoogleProvider extends BaseModelProvider {
    private config;
    constructor(config: ModelProviderConfig);
    isAvailable(): boolean;
    getProviderName(): string;
    getModels(): Record<string, ApiModelConfig>;
}
//# sourceMappingURL=google.d.ts.map