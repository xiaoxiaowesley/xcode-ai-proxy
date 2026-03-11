import dotenv from 'dotenv';
import { AppConfig, ModelConfigs, EnvConfig, ApiModelConfig } from '../types';
import { ZhipuProvider, KimiProvider, GeminiProvider, QwenProvider } from './models';

dotenv.config();

export class ConfigManager {
  private static instance: ConfigManager;
  private env: EnvConfig;
  private appConfig!: AppConfig;
  private modelConfigs!: ModelConfigs;

  private constructor() {
    this.env = process.env as EnvConfig;
    this.env.QWEN_API_KEY = 'sk-02a3aff837904cfeb790b3c9b773f7a0'
    this.env.QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    this.validateRequiredEnvVars();
    this.initializeAppConfig();
    this.initializeModelConfigs();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private validateRequiredEnvVars(): void {
    const requiredEnvVars = {
      ZHIPU_API_KEY: 'GLM-4.5 模型',
      KIMI_API_KEY: 'Kimi 模型',
      GEMINI_API_KEY: 'Gemini 模型',
      QWEN_API_KEY: 'Qwen 模型'
    };

    // 检查至少有一个API密钥
    const allApiKeys = [
      'ZHIPU_API_KEY', 'KIMI_API_KEY', 'GEMINI_API_KEY', 'QWEN_API_KEY'
    ];

    const hasApiKey = allApiKeys.some(envVar =>
      this.env[envVar as keyof EnvConfig]
    );

    if (!hasApiKey) {
      console.error('❌ 至少需要配置一个API密钥');
      console.error('支持的环境变量: ZHIPU_API_KEY, KIMI_API_KEY, GEMINI_API_KEY, QWEN_API_KEY');
      process.exit(1);
    }
  }

  private initializeAppConfig(): void {
    this.appConfig = {
      port: parseInt(this.env.PORT || '3000'),
      host: this.env.HOST || '0.0.0.0',
      maxRetries: parseInt(this.env.MAX_RETRIES || '3'),
      retryDelay: parseInt(this.env.RETRY_DELAY || '1000'),
      requestTimeout: parseInt(this.env.REQUEST_TIMEOUT || '60000'),
      customSystemPrompt: this.env.CUSTOM_SYSTEM_PROMPT
    };

    // 如果配置了自定义提示，记录日志
    if (this.appConfig.customSystemPrompt) {
      console.log('📝 已配置自定义系统提示');
    }
  }

  private initializeModelConfigs(): void {
    this.modelConfigs = {};

    // 智谱AI GLM-4.5
    const zhipuProvider = new ZhipuProvider({
      apiKey: this.env.ZHIPU_API_KEY,
      apiUrl: this.env.ZHIPU_API_URL
    });
    Object.assign(this.modelConfigs, zhipuProvider.getModels());

    // Kimi
    const kimiProvider = new KimiProvider({
      apiKey: this.env.KIMI_API_KEY,
      apiUrl: this.env.KIMI_API_URL
    });
    Object.assign(this.modelConfigs, kimiProvider.getModels());

    // Gemini
    const geminiProvider = new GeminiProvider({
      apiKey: this.env.GEMINI_API_KEY,
      apiUrl: this.env.GEMINI_API_URL
    });
    Object.assign(this.modelConfigs, geminiProvider.getModels());

    // Qwen
    const qwenProvider = new QwenProvider({
      apiKey: this.env.QWEN_API_KEY,
      apiUrl: this.env.QWEN_API_URL
    });
    Object.assign(this.modelConfigs, qwenProvider.getModels());
  }

  public getAppConfig(): AppConfig {
    return this.appConfig;
  }

  public getModelConfigs(): ModelConfigs {
    return this.modelConfigs;
  }

  public getModelConfig(modelId: string) {
    return this.modelConfigs[modelId];
  }

  public getSupportedModels(): string[] {
    return Object.keys(this.modelConfigs);
  }

  public logConfiguration(): void {
    console.log('📋 已加载模型配置:');
    Object.entries(this.modelConfigs).forEach(([modelId, config]) => {
      console.log(`   - ${modelId} (${config.name})`);
    });
  }
}