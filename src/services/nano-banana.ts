import type {
    EternalAIConfig,
    ChatCompletionRequest,
    ChatCompletionChunk,
    ChatCompletionResponse,
} from '../types';
import { uploadImageToStorage } from '../utils/image';

/**
 * Response from Gemini-style API
 */
interface GeminiPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string; // base64 encoded
    };
}

interface GeminiCandidate {
    content: {
        parts: GeminiPart[];
        role: string;
    };
    finishReason: string;
}

interface GeminiResponse {
    candidates: GeminiCandidate[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

/**
 * NanoBanana service for custom endpoint models
 * Transforms OpenAI-style requests to Google Gemini format
 */
export class NanoBanana {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/nano-banana/v1beta/models';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

    /**
     * Generate content using nano-banana endpoint
     * @param request - Chat completion request in OpenAI format
     * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
     * @returns Chat completion response in OpenAI format
     */
    async generateContent(
        request: ChatCompletionRequest,
        geminiModel: string = 'gemini-2.5-flash-image'
    ): Promise<ChatCompletionResponse> {
        const url = `${this.baseUrl}/${geminiModel}:generateContent`;

        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey,
        };

        // Transform OpenAI format to Gemini format
        const geminiBody = await this.transformToGeminiFormat(request);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(geminiBody),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NanoBanana request failed with status ${response.status}: ${errorText}`);
        }

        const geminiResponse = (await response.json()) as GeminiResponse;

        // Transform Gemini response back to OpenAI format
        return await this.transformToOpenAIFormat(geminiResponse, geminiModel);
    }

    /**
     * Generate image content using nano-banana endpoint
     * @param prompt - Text prompt for image generation
     * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
     * @returns Base64 encoded image data or null if no image in response
     */
    async generateImage(
        prompt: string,
        geminiModel: string = 'gemini-2.5-flash-image'
    ): Promise<{ mimeType: string; data: string } | null> {
        const url = `${this.baseUrl}/${geminiModel}:generateContent`;

        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey,
        };

        const geminiBody = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(geminiBody),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NanoBanana request failed with status ${response.status}: ${errorText}`);
        }

        const geminiResponse = (await response.json()) as GeminiResponse;

        // Extract image from response
        for (const candidate of geminiResponse.candidates || []) {
            for (const part of candidate.content?.parts || []) {
                if (part.inlineData) {
                    return {
                        mimeType: part.inlineData.mimeType,
                        data: part.inlineData.data,
                    };
                }
            }
        }

        return null;
    }

    /**
     * Stream content using nano-banana endpoint
     * @param request - Chat completion request in OpenAI format
     * @param geminiModel - The Gemini model to use
     * @returns Async iterable of chat completion chunks
     */
    async *streamContent(
        request: ChatCompletionRequest,
        geminiModel: string = 'gemini-2.5-flash-image'
    ): AsyncIterable<ChatCompletionChunk> {
        const url = `${this.baseUrl}/${geminiModel}:generateContent?alt=sse`;

        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey,
        };

        // Transform OpenAI format to Gemini format
        const geminiBody = await this.transformToGeminiFormat(request);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(geminiBody),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NanoBanana streaming request failed with status ${response.status}: ${errorText}`);
        }

        if (!response.body) {
            throw new Error('Response body is not readable');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const chunkId = `chatcmpl-${Date.now()}`;
        let streamChunkCount = 0;

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
                            const geminiChunk = JSON.parse(data) as GeminiResponse;
                            streamChunkCount++;

                            // Check all parts for text and image data
                            let content = '';
                            const parts = geminiChunk.candidates?.[0]?.content?.parts || [];

                            for (const part of parts) {
                                if (part.text) {
                                    content += part.text;
                                } else if (part.inlineData) {
                                    // Upload image and add URL to content
                                    const imageUrl = await uploadImageToStorage(
                                        part.inlineData.data,
                                        part.inlineData.mimeType
                                    );
                                    content += imageUrl;
                                }
                            }

                            const finishReason = geminiChunk.candidates?.[0]?.finishReason;

                            const chunk: ChatCompletionChunk = {
                                id: chunkId,
                                object: 'chat.completion.chunk',
                                created: Math.floor(Date.now() / 1000),
                                model: geminiModel,
                                choices: [{
                                    index: 0,
                                    delta: { content },
                                    finish_reason: finishReason === 'STOP' ? 'stop' : null,
                                }],
                            };

                            yield chunk;
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Transform OpenAI format request to Gemini format
     */
    private async transformToGeminiFormat(request: ChatCompletionRequest): Promise<object> {
        const contents: { role: string; parts: any[] }[] = [];

        for (const message of request.messages) {
            // Map OpenAI roles to Gemini roles
            let role = 'user';
            if (message.role === 'assistant') {
                role = 'model';
            } else if (message.role === 'system') {
                // Gemini doesn't have system role, prepend to first user message
                // For now, treat as user
                role = 'user';
            }

            const parts: any[] = [];

            // Handle content as string or array
            if (typeof message.content === 'string') {
                parts.push({ text: message.content });
            } else if (Array.isArray(message.content)) {
                // Handle multimodal content (text + images)
                for (const part of message.content) {
                    if (part.type === 'text') {
                        parts.push({ text: part.text });
                    } else if (part.type === 'image_url') {
                        // Convert image URL to base64 inline_data
                        const imageUrl = part.image_url.url;
                        const { mimeType, data } = await this.fetchImageAsBase64(imageUrl);
                        parts.push({
                            inline_data: {
                                mime_type: mimeType,
                                data: data,
                            }
                        });
                    }
                }
            }

            contents.push({
                role,
                parts,
            });
        }

        return { contents };
    }

    /**
     * Fetch image from URL and convert to base64
     */
    private async fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string }> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${url}: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // Get mime type from response headers or default to image/jpeg
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        return { mimeType, data: base64 };
    }

    private async transformToOpenAIFormat(
        geminiResponse: GeminiResponse,
        model: string
    ): Promise<ChatCompletionResponse> {
        const candidate = geminiResponse.candidates?.[0];

        // Check if response contains image data
        let content = '';
        for (const part of candidate?.content?.parts || []) {
            if (part.text) {
                content += part.text;
            } else if (part.inlineData) {
                // Upload base64 image to EternalAI storage and get URL
                const imageUrl = await uploadImageToStorage(
                    part.inlineData.data,
                    part.inlineData.mimeType
                );
                content += imageUrl;
            }
        }

        return {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content,
                },
                finish_reason: candidate?.finishReason === 'STOP' ? 'stop' : null,
            }],
            usage: geminiResponse.usageMetadata ? {
                prompt_tokens: geminiResponse.usageMetadata.promptTokenCount,
                completion_tokens: geminiResponse.usageMetadata.candidatesTokenCount,
                total_tokens: geminiResponse.usageMetadata.totalTokenCount,
            } : undefined,
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
