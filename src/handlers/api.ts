import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import https from 'https';
import { BaseHandler } from './base';
import { ApiModelConfig, ChatCompletionRequest } from '../types';
import { withRetry } from '../utils';

export class ApiHandler extends BaseHandler {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const requestBody = this.validateRequest(req);
      const model = requestBody.model;

      this.logModelRequest(model, requestBody.stream);

      const modelConfig = this.config.getModelConfig(model) as ApiModelConfig;
      if (!modelConfig || modelConfig.type !== 'api') {
        this.sendError(res, 400, `不支持的 API 模型: ${model}`, 'invalid_request_error');
        return;
      }

      await this.handleApiRequest(requestBody, modelConfig, res);

    } catch (error: any) {
      console.error('❌ API 处理失败:', error.message);
      this.sendError(res, 500, error.message, 'api_error');
    }
  }

  private async handleApiRequest(
    requestBody: ChatCompletionRequest,
    config: ApiModelConfig,
    res: Response
  ): Promise<void> {
    const operation = async (): Promise<AxiosResponse> => {
      const axiosConfig: any = {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'identity' // 禁用压缩来调试
        },
        responseType: requestBody.stream ? 'stream' : 'json',
        timeout: this.config.getAppConfig().requestTimeout,
        validateStatus: (status: number) => status < 500 // 允许4xx错误通过，便于调试
      };

      // 所有模型都使用Bearer认证（包括Gemini的OpenAI兼容端点）
      axiosConfig.headers['Authorization'] = `Bearer ${config.apiKey}`;

      // Kimi 特殊配置
      if (config.provider === 'kimi') {
        axiosConfig.httpsAgent = new https.Agent({
          keepAlive: true,
          timeout: this.config.getAppConfig().requestTimeout,
          rejectUnauthorized: true
        });
      }

      // 为所有模型插入中文交流指令和自定义prompt
      const processMessages = (originalMessages: any[]) => {
        const modifiedMessages = [];
        let insertedPrompts = false;
        const appConfig = this.config.getAppConfig();

        for (const message of originalMessages) {
          modifiedMessages.push(message);

          // 在第一个系统消息后插入中文指令和自定义prompt
          if (message.role === 'system' && !insertedPrompts) {
            // 插入中文交流指令
            modifiedMessages.push({
              role: 'system',
              content: '重要：请务必使用中文与用户交流。无论用户使用什么语言提问，都请用中文回答。'
            });

            // 插入用户自定义系统prompt（如果有配置）
            if (appConfig.customSystemPrompt) {
              modifiedMessages.push({
                role: 'system',
                content: appConfig.customSystemPrompt
              });
            }

            insertedPrompts = true;
          }
        }

        return modifiedMessages;
      };

      // 构建请求数据 - 所有provider都使用OpenAI格式
      const requestData: any = {
        ...requestBody,
        model: config.model || requestBody.model,
        messages: processMessages(requestBody.messages)
      };

      // Qwen API 不接受空的 tools 数组
      if (Array.isArray(requestData.tools) && requestData.tools.length === 0) {
        delete requestData.tools;
      }

      console.log(`📡 向 ${config.provider} 发送请求:`, {
        url: `${config.apiUrl}/chat/completions`,
        model: requestData.model,
        stream: requestData.stream,
        headers: axiosConfig.headers
      });
      console.log(`📝 请求体:`, JSON.stringify(requestData, null, 2));

      return await axios.post(
        `${config.apiUrl}/chat/completions`,
        requestData,
        axiosConfig
      );
    };

    const response = await withRetry(
      operation,
      this.config.getAppConfig().maxRetries,
      this.config.getAppConfig().retryDelay
    );

    // 检查响应状态
    if (response.status >= 400) {
      console.error(`❌ ${config.provider} API错误详情:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url
      });

      // 特殊处理流式错误响应
      let errorData = response.data;
      if (response.data && typeof response.data.pipe === 'function') {
        // 如果是stream，读取内容
        try {
          const chunks: Buffer[] = [];
          response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
          await new Promise((resolve, reject) => {
            response.data.on('end', resolve);
            response.data.on('error', reject);
          });
          const errorText = Buffer.concat(chunks).toString();
          console.error(`❌ ${config.provider} 错误响应内容:`, errorText);
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
        } catch (streamError) {
          console.error(`❌ 读取错误流失败:`, streamError);
          errorData = { message: '无法读取错误详情' };
        }
      } else {
        console.error(`❌ ${config.provider} 错误响应数据:`, errorData);
      }

      // 继续抛出错误（避免循环引用）
      const error = new Error(`${config.provider} API请求失败: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).url = response.config?.url;
      (error as any).data = errorData;
      throw error;
    }

    console.log(`✅ ${config.provider} API响应状态:`, response.status);

    // 设置响应头
    const responseHeaders = {
      'content-type': response.headers['content-type'] || 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-headers': '*'
    };

    if (requestBody.stream) {
      console.log(`🔄 透传${config.provider}流式响应`);
      // 设置流式响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      response.data.pipe(res);
    } else {
      console.log(`📦 返回${config.provider}非流式响应`);

      // 设置响应头
      Object.entries(responseHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // 直接返回响应数据，因为都是OpenAI兼容格式
      res.json(response.data);
    }
  }
}