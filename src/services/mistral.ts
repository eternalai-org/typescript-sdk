import type {
    EternalAIConfig,
    ChatCompletionRequest,
    ChatCompletionChunk,
    ChatCompletionResponse,
} from '../types';

/**
 * Mistral AI service for EternalAI's Mistral API endpoint
 * Uses standard OpenAI-compatible format
 */
export class Mistral {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/mistralai/v1';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

    /**
     * Generate content using Mistral endpoint (non-streaming)
     * @param request - Chat completion request in OpenAI format
     * @param mistralModel - The Mistral model to use (default: devstral-2512)
     * @returns Chat completion response in OpenAI format
     */
    async generateContent(
        request: ChatCompletionRequest,
        mistralModel: string = 'devstral-2512'
    ): Promise<ChatCompletionResponse> {
        const url = `${this.baseUrl}/chat/completions`;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
        };

        const body = {
            ...request,
            model: mistralModel,
            stream: false,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral request failed with status ${response.status}: ${errorText}`);
        }

        return (await response.json()) as ChatCompletionResponse;
    }

    /**
     * Stream content using Mistral endpoint
     * @param request - Chat completion request in OpenAI format
     * @param mistralModel - The Mistral model to use (default: devstral-2512)
     * @returns Async iterable of chat completion chunks
     */
    async *streamContent(
        request: ChatCompletionRequest,
        mistralModel: string = 'devstral-2512'
    ): AsyncIterable<ChatCompletionChunk> {
        const url = `${this.baseUrl}/chat/completions`;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
        };

        const body = {
            ...request,
            model: mistralModel,
            stream: true,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral streaming request failed with status ${response.status}: ${errorText}`);
        }

        if (!response.body) {
            throw new Error('Response body is not readable');
        }

        const reader = response.body.getReader();
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
                        } catch {
                            // Skip invalid JSON chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
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
}
