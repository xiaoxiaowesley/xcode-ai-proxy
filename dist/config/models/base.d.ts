import { ApiModelConfig } from '../../types';
export declare abstract class BaseModelProvider {
    abstract getModels(): Record<string, ApiModelConfig>;
    abstract isAvailable(): boolean;
    abstract getProviderName(): string;
}
export interface ModelProviderConfig {
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    enabled?: boolean;
}
//# sourceMappingURL=base.d.ts.map