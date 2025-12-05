import type {
  EternalAIConfig,
  ChatCompletionRequest,
  ChatCompletionStreamingRequest,
  ChatCompletionNonStreamingRequest,
  ChatCompletionChunk,
  ChatCompletionResponse,
} from '../types';
import { NanoBanana } from './nano-banana';
import { Tavily } from './tavily';
import { UncensoredAI } from './uncensored-ai';
import { Wan } from './wan';

const NANO_BANANA_PREFIX = 'nano-banana/';
const TAVILY_PREFIX = 'tavily/';
const UNCENSORED_AI_PREFIX = 'uncensored-ai/';
const WAN_PREFIX = 'wan/';

type CustomProvider = 'nano-banana' | 'tavily' | 'uncensored-ai' | 'wan' | null;

/**
 * Chat service for sending messages and receiving responses
 */
export class Chat {
  private readonly config: EternalAIConfig;
  private readonly baseUrl = 'https://open.eternalai.org/api/v1';
  private readonly nanoBanana: NanoBanana;
  private readonly tavily: Tavily;
  private readonly uncensoredAI: UncensoredAI;
  private readonly wan: Wan;

  constructor(config: EternalAIConfig) {
    this.config = config;
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
      // generate() automatically polls and returns UncensoredResultResponse
      const result = await this.uncensoredAI.generate(request, modelName);

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
      // generate() automatically polls and returns WanResultResponse
      const result = await this.wan.generate(request, modelName);

      // Transform WanResultResponse to ChatCompletionResponse
      const videoUrl = result.output?.results?.[0]?.url || '';

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
    const url = `${this.baseUrl}/chat/completions`;
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
