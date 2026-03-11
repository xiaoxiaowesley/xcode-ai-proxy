import { ApiModelConfig } from '../../types';
import { BaseModelProvider, ModelProviderConfig } from './base';

export class QwenProvider extends BaseModelProvider {
  private config: ModelProviderConfig;

  constructor(config: ModelProviderConfig) {
    super();
    this.config = config;
  }

  isAvailable(): boolean {
    return !!(this.config.apiKey && this.config.enabled !== false);
  }

  getProviderName(): string {
    return 'qwen';
  }

  getModels(): Record<string, ApiModelConfig> {
    if (!this.isAvailable()) return {};

    return {
      'qwen-max': {
        type: 'api',
        apiUrl: this.config.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: this.config.apiKey!,
        provider: 'qwen',
        name: 'Qwen Max',
        model: 'qwen-max'
      }
    };
  }
}
