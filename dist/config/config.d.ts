import { AppConfig, ModelConfigs, ApiModelConfig } from '../types';
export declare class ConfigManager {
    private static instance;
    private env;
    private appConfig;
    private modelConfigs;
    private constructor();
    static getInstance(): ConfigManager;
    private validateRequiredEnvVars;
    private initializeAppConfig;
    private initializeModelConfigs;
    getAppConfig(): AppConfig;
    getModelConfigs(): ModelConfigs;
    getModelConfig(modelId: string): ApiModelConfig;
    getSupportedModels(): string[];
    logConfiguration(): void;
}
//# sourceMappingURL=config.d.ts.map