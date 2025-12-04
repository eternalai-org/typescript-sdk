import type {
  EternalAPIConfig,
  ChatCompletionRequest,
  ChatCompletionStreamingRequest,
  ChatCompletionNonStreamingRequest,
  ChatCompletionChunk,
  ChatCompletionResponse,
} from '../types';

/**
 * Chat service for sending messages and receiving responses
 */
export class Chat {
  private readonly config: EternalAPIConfig;
  private readonly baseUrl = 'https://open.eternalai.org/api/v1';

  constructor(config: EternalAPIConfig) {
    this.config = config;
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
      throw new Error(`EternalAPI request failed with status ${response.status}: ${errorText}`);
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
              console.error('Failed to parse streaming chunk:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
