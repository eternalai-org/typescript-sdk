/**
 * EternalAI configuration
 */
interface EternalAIConfig {
    apiKey: string;
    timeout?: number;
}
/**
 * Message role types
 */
type MessageRole = 'system' | 'user' | 'assistant';
/**
 * Chat message structure
 */
interface ChatMessage {
    role: MessageRole;
    content: string;
}
/**
 * Base chat completion request
 */
interface ChatCompletionRequestBase {
    messages: ChatMessage[];
    model: string;
}
/**
 * Chat completion request with image config
 */
interface ImageConfigOptions {
    aspect_ratio?: string;
}
/**
 * Chat completion request with image config
 */
interface ChatCompletionRequestImageConfig {
    image_config?: ImageConfigOptions;
}
/**
 * Chat completion request with optional stream
 */
interface ChatCompletionRequest extends ChatCompletionRequestBase, ChatCompletionRequestImageConfig {
    stream?: boolean;
}
/**
 * Streaming chat completion request
 */
interface ChatCompletionStreamingRequest extends ChatCompletionRequestBase, ChatCompletionRequestImageConfig {
    stream: true;
}
/**
 * Non-streaming chat completion request
 */
interface ChatCompletionNonStreamingRequest extends ChatCompletionRequestBase, ChatCompletionRequestImageConfig {
    stream?: false;
}
/**
 * Delta content in streaming response
 */
interface ChatCompletionDelta {
    role?: MessageRole;
    content?: string;
}
/**
 * Choice in streaming response
 */
interface ChatCompletionChoice {
    index: number;
    delta: ChatCompletionDelta;
    finish_reason?: string | null;
}
/**
 * Chat completion chunk for streaming
 */
interface ChatCompletionChunk {
    id: string;
    object: 'chat.completion.chunk';
    created: number;
    model: string;
    choices: ChatCompletionChoice[];
}
/**
 * Non-streaming chat completion response
 */
interface ChatCompletionMessage {
    role: MessageRole;
    content: string;
}
/**
 * Non-streaming choice
 */
interface ChatCompletionNonStreamingChoice {
    index: number;
    message: ChatCompletionMessage;
    finish_reason: string | null;
}
/**
 * Non-streaming chat completion response
 */
interface ChatCompletionResponse {
    id: string;
    object: 'chat.completion';
    created: number;
    model: string;
    choices: ChatCompletionNonStreamingChoice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Chat service for sending messages and receiving responses
 */
declare class Chat {
    private readonly config;
    private readonly baseUrl;
    private readonly nanoBanana;
    constructor(config: EternalAIConfig);
    /**
     * Check if model uses nano-banana prefix and extract the actual model name
     * @param model - Model name that may include "nano-banana/" prefix
     * @returns Object with isNanoBanana flag and extracted model name
     */
    private parseModelName;
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
    send(request: ChatCompletionRequest): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletionResponse>;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
    /**
     * Handle streaming response using Server-Sent Events
     */
    private handleStreamingResponse;
}

/**
 * NanoBanana service for custom endpoint models
 * Transforms OpenAI-style requests to Google Gemini format
 */
declare class NanoBanana {
    private readonly config;
    private readonly baseUrl;
    constructor(config: EternalAIConfig);
    /**
     * Generate content using nano-banana endpoint
     * @param request - Chat completion request in OpenAI format
     * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
     * @returns Chat completion response in OpenAI format
     */
    generateContent(request: ChatCompletionRequest, geminiModel?: string): Promise<ChatCompletionResponse>;
    /**
     * Generate image content using nano-banana endpoint
     * @param prompt - Text prompt for image generation
     * @param geminiModel - The Gemini model to use (default: gemini-2.5-flash-image)
     * @returns Base64 encoded image data or null if no image in response
     */
    generateImage(prompt: string, geminiModel?: string): Promise<{
        mimeType: string;
        data: string;
    } | null>;
    /**
     * Stream content using nano-banana endpoint
     * @param request - Chat completion request in OpenAI format
     * @param geminiModel - The Gemini model to use
     * @returns Async iterable of chat completion chunks
     */
    streamContent(request: ChatCompletionRequest, geminiModel?: string): AsyncIterable<ChatCompletionChunk>;
    /**
     * Transform OpenAI format request to Gemini format
     */
    private transformToGeminiFormat;
    /**
     * Transform Gemini response to OpenAI format
     */
    private transformToOpenAIFormat;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
}

declare class EternalAI {
    readonly chat: Chat;
    readonly nanoBanana: NanoBanana;
    private readonly config;
    constructor(config: EternalAIConfig);
}

export { Chat, type ChatCompletionChoice, type ChatCompletionChunk, type ChatCompletionDelta, type ChatCompletionMessage, type ChatCompletionNonStreamingChoice, type ChatCompletionNonStreamingRequest, type ChatCompletionRequest, type ChatCompletionRequestBase, type ChatCompletionResponse, type ChatCompletionStreamingRequest, type ChatMessage, EternalAI, type EternalAIConfig, type MessageRole, NanoBanana };
