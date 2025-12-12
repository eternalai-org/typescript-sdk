import type {
  EternalAIConfig,
  ChatCompletionRequest,
  ChatCompletionStreamingRequest,
  ChatCompletionNonStreamingRequest,
  ChatCompletionChunk,
  ChatCompletionResponse,
} from '../types';
import { Flux } from './flux';
import { Glm } from './glm';
import { Mistral } from './mistral';
import { NanoBanana } from './nano-banana';
import { Tavily } from './tavily';
import { UncensoredAI } from './uncensored-ai';
import { Wan } from './wan';

const FLUX_PREFIX = 'flux/';
const GLM_PREFIX = 'glm/';
const MISTRAL_PREFIX = 'mistralai/';
const NANO_BANANA_PREFIX = 'nano-banana/';
const TAVILY_PREFIX = 'tavily/';
const UNCENSORED_AI_PREFIX = 'uncensored-ai/';
const WAN_PREFIX = 'wan/';

type CustomProvider = 'flux' | 'glm' | 'mistralai' | 'nano-banana' | 'tavily' | 'uncensored-ai' | 'wan' | null;

/**
 * Chat service for sending messages and receiving responses
 */
export class Chat {
  private readonly config: EternalAIConfig;
  private readonly baseUrl = 'https://open.eternalai.org/api/v1';
  private readonly flux: Flux;
  private readonly glm: Glm;
  private readonly mistral: Mistral;
  private readonly nanoBanana: NanoBanana;
  private readonly tavily: Tavily;
  private readonly uncensoredAI: UncensoredAI;
  private readonly wan: Wan;

  constructor(config: EternalAIConfig) {
    this.config = config;
    this.flux = new Flux(config);
    this.glm = new Glm(config);
    this.mistral = new Mistral(config);
    this.nanoBanana = new NanoBanana(config);
    this.tavily = new Tavily(config);
    this.uncensoredAI = new UncensoredAI(config);
    this.wan = new Wan(config);
  }

  /**
   * Check if model uses a custom provider prefix and extract the actual model/endpoint name
   * @param model - Model name that may include custom prefix like "nano-banana/", "tavily/", or "uncensored-ai/"
   * @returns Object with provider type and extracted model name
   */
  private parseModelName(model: string): { provider: CustomProvider; modelName: string } {
    if (model.startsWith(FLUX_PREFIX)) {
      return {
        provider: 'flux',
        modelName: model.slice(FLUX_PREFIX.length),
      };
    }
    if (model.startsWith(GLM_PREFIX)) {
      return {
        provider: 'glm',
        modelName: model.slice(GLM_PREFIX.length),
      };
    }
    if (model.startsWith(MISTRAL_PREFIX)) {
      return {
        provider: 'mistralai',
        modelName: model.slice(MISTRAL_PREFIX.length),
      };
    }
    if (model.startsWith(NANO_BANANA_PREFIX)) {
      return {
        provider: 'nano-banana',
        modelName: model.slice(NANO_BANANA_PREFIX.length),
      };
    }
    if (model.startsWith(TAVILY_PREFIX)) {
      return {
        provider: 'tavily',
        modelName: model.slice(TAVILY_PREFIX.length),
      };
    }
    if (model.startsWith(UNCENSORED_AI_PREFIX)) {
      return {
        provider: 'uncensored-ai',
        modelName: model.slice(UNCENSORED_AI_PREFIX.length),
      };
    }
    if (model.startsWith(WAN_PREFIX)) {
      return {
        provider: 'wan',
        modelName: model.slice(WAN_PREFIX.length),
      };
    }
    return { provider: null, modelName: model };
  }

  /**
   * Send a streaming chat completion request
   * @param request - Chat completion request with stream: true, and optional image_config for image generation models
   * @returns Async iterable of chat completion chunks
   */
  send(request: ChatCompletionStreamingRequest): Promise<AsyncIterable<ChatCompletionChunk>>;

  /**
   * Send a non-streaming chat completion request
   * @param request - Chat completion request with stream: false or undefined, and optional image_config for image generation models
   * @returns Chat completion response
   */
  send(request: ChatCompletionNonStreamingRequest): Promise<ChatCompletionResponse>;

  /**
   * Send a chat completion request
   * @param request - Chat completion request with messages, model, stream option, and optional image_config for image generation models
   * @returns Async iterable of chat completion chunks (if streaming) or single response
   */
  send(
    request: ChatCompletionRequest
  ): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletionResponse>;

  /**
   * Implementation of send method
   */
  async send(
    request: ChatCompletionRequest
  ): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletionResponse> {
    // Check if model uses custom provider prefix
    const { provider, modelName } = this.parseModelName(request.model);

    // Route to custom providers
    if (provider === 'flux') {
      // Flux doesn't support streaming, always use non-streaming
      // generate() returns polling_url, then pollResult() gets the image
      const task = await this.flux.generate(request as any);
      const pollingUrl = task.polling_url;

      if (!pollingUrl) {
        throw new Error('No polling_url returned from Flux generate');
      }

      // Poll for result with status updates
      const result = await this.flux.pollResult(pollingUrl, {
        interval: 3000,
        maxAttempts: 60,
        onStatusUpdate: (status: string) => {
          console.log('Flux status update:', status);
        },
      });

      // Transform FluxResultResponse to ChatCompletionResponse
      const imageUrl = result.result?.sample || '';

      return {
        id: result.id || `chatcmpl-flux-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: imageUrl,
          },
          finish_reason: 'stop',
        }],
      };
    }

    if (provider === 'glm') {
      if (request.stream) {
        return this.glm.streamContent(request, modelName);
      } else {
        return this.glm.generateContent(request, modelName);
      }
    }

    if (provider === 'mistralai') {
      if (request.stream) {
        return this.mistral.streamContent(request, modelName);
      } else {
        return this.mistral.generateContent(request, modelName);
      }
    }

    if (provider === 'nano-banana') {
      if (request.stream) {
        return this.nanoBanana.streamContent(request, modelName);
      } else {
        return this.nanoBanana.generateContent(request, modelName);
      }
    }

    if (provider === 'tavily') {
      // Tavily doesn't support streaming, always use non-streaming
      return this.tavily.search(request, modelName);
    }

    if (provider === 'uncensored-ai') {
      // UncensoredAI doesn't support streaming, always use non-streaming
      // generate() returns request_id, then pollResult() gets the result
      const task = await this.uncensoredAI.generate(request);
      const requestId = task.request_id;

      if (!requestId) {
        throw new Error('No request_id returned from UncensoredAI generate');
      }

      // Determine endpoint for polling
      const endpoint = modelName; // 'uncensored-image' or 'uncensored-video'
      const isVideo = endpoint === 'uncensored-video';

      // Poll for result with appropriate intervals
      const result = await this.uncensoredAI.pollResult(requestId, endpoint, {
        interval: isVideo ? 5000 : 3000,
        maxAttempts: isVideo ? 120 : 60,
        onStatusUpdate: (status: string) => {
          console.log('UncensoredAI status update:', status);
        },
      });

      // Transform UncensoredResultResponse to ChatCompletionResponse
      const resultUrl = result.result_url;

      return {
        id: result.request_id || `chatcmpl-uncensored-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: resultUrl,
          },
          finish_reason: 'stop',
        }],
      };
    }

    if (provider === 'wan') {
      // Wan doesn't support streaming, always use non-streaming
      // generate() returns task_id, then pollResult() gets the video
      const task = await this.wan.generate(request);
      const taskId = task.output?.task_id;

      if (!taskId) {
        throw new Error('No task_id returned from Wan generate');
      }

      // Poll for result with status updates
      const result = await this.wan.pollResult(taskId, {
        onStatusUpdate: (status: string) => {
          console.log('Wan status update:', status);
        },
      });

      // video_url is directly in output, or fallback to results[0].url for backward compatibility
      const videoUrl = result.output?.video_url || result.output?.results?.[0]?.url || '';

      return {
        id: result.request_id || `chatcmpl-wan-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: videoUrl,
          },
          finish_reason: 'stop',
        }],
      };
    }

    // Standard EternalAI API request
    const url = `${this.baseUrl}/chat/completions?from=ts-sdk`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    const body = JSON.stringify(request);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: this.createAbortSignal(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EternalAI request failed with status ${response.status}: ${errorText}`);
    }

    if (request.stream) {
      // Check if body is readable before returning async iterable
      if (!response.body) {
        throw new Error('Response body is not readable');
      }
      return this.handleStreamingResponse(response);
    } else {
      return (await response.json()) as ChatCompletionResponse;
    }
  }

  /**
   * Create abort signal with timeout
   */
  private createAbortSignal(): AbortSignal | undefined {
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      return controller.signal;
    }
    return undefined;
  }

  /**
   * Handle streaming response using Server-Sent Events
   */
  private async *handleStreamingResponse(response: Response): AsyncIterable<ChatCompletionChunk> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '' || trimmedLine === 'data: [DONE]') {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            try {
              const chunk = JSON.parse(data) as ChatCompletionChunk;
              yield chunk;
            } catch (error) {
              // Silently skip invalid JSON chunks to maintain stream continuity
              // In production, invalid chunks are typically malformed SSE data
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
