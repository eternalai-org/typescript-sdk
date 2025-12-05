import type {
    EternalAIConfig,
    ChatCompletionRequest,
    ChatCompletionResponse,
} from '../types';

/**
 * Tavily search response
 */
interface TavilySearchResponse {
    query: string;
    answer?: string;
    results?: Array<{
        title: string;
        url: string;
        content: string;
        score: number;
    }>;
    response_time?: number;
}

/**
 * Tavily service for search endpoint
 * Transforms OpenAI-style requests to Tavily search format
 */
export class Tavily {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/tavily';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

    /**
     * Perform a search using Tavily endpoint
     * @param request - Chat completion request in OpenAI format
     * @param endpoint - The Tavily endpoint to use (default: search)
     * @returns Chat completion response in OpenAI format
     */
    async search(
        request: ChatCompletionRequest,
        endpoint: string = 'search'
    ): Promise<ChatCompletionResponse> {
        const url = `${this.baseUrl}/${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
        };

        // Extract query from last user message
        const lastUserMessage = [...request.messages].reverse().find(m => m.role === 'user');
        const query = lastUserMessage?.content || '';

        const body = JSON.stringify({ query });

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tavily request failed with status ${response.status}: ${errorText}`);
        }

        const tavilyResponse = (await response.json()) as TavilySearchResponse;

        // Transform Tavily response to OpenAI format
        return this.transformToOpenAIFormat(tavilyResponse, `tavily/${endpoint}`);
    }

    /**
     * Transform Tavily response to OpenAI format
     */
    private transformToOpenAIFormat(
        tavilyResponse: TavilySearchResponse,
        model: string
    ): ChatCompletionResponse {
        // Build content from Tavily response
        let content = '';

        if (tavilyResponse.answer) {
            content = tavilyResponse.answer;
        }

        // Append search results if available
        if (tavilyResponse.results && tavilyResponse.results.length > 0) {
            if (content) content += '\n\n---\n\n**Sources:**\n';
            for (const result of tavilyResponse.results) {
                content += `\n- [${result.title}](${result.url})\n  ${result.content.substring(0, 200)}...\n`;
            }
        }

        return {
            id: `chatcmpl-tavily-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: content || 'No results found.',
                },
                finish_reason: 'stop',
            }],
        };
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
