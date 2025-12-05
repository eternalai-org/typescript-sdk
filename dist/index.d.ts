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
    private readonly tavily;
    private readonly uncensoredAI;
    constructor(config: EternalAIConfig);
    /**
     * Check if model uses a custom provider prefix and extract the actual model/endpoint name
     * @param model - Model name that may include custom prefix like "nano-banana/", "tavily/", or "uncensored-ai/"
     * @returns Object with provider type and extracted model name
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

/**
 * Tavily service for search endpoint
 * Transforms OpenAI-style requests to Tavily search format
 */
declare class Tavily {
    private readonly config;
    private readonly baseUrl;
    constructor(config: EternalAIConfig);
    /**
     * Perform a search using Tavily endpoint
     * @param request - Chat completion request in OpenAI format
     * @param endpoint - The Tavily endpoint to use (default: search)
     * @returns Chat completion response in OpenAI format
     */
    search(request: ChatCompletionRequest, endpoint?: string): Promise<ChatCompletionResponse>;
    /**
     * Transform Tavily response to OpenAI format
     */
    private transformToOpenAIFormat;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
}

/**
 * Uncensored AI request options (extended from ChatCompletionRequest)
 */
interface UncensoredAIRequestOptions {
    /** Type of generation: 'new' for text-to-image, 'edit' for image-to-image/video */
    type?: 'new' | 'edit';
    /** LoRA configuration for image generation (object format) */
    lora_config?: Record<string, number>;
    /** Image configuration (can be string or object) */
    image_config?: string | Record<string, any>;
    /** Video configuration (can be string or object) */
    video_config?: string | Record<string, any>;
    /** Enable magic prompt for video */
    is_magic_prompt?: boolean;
    /** Video duration in seconds */
    duration?: number;
    /** Enable audio in video */
    audio?: boolean;
}
/**
 * UncensoredAI service for uncensored image/video generation and editing
 *
 * Supported endpoints:
 * - uncensored-image: For image generation (text-to-image, image-to-image)
 * - uncensored-video: For video generation from images
 */
declare class UncensoredAI {
    private readonly config;
    private readonly baseUrl;
    constructor(config: EternalAIConfig);
    /**
     * Generate or edit images/videos using Uncensored AI endpoint
     * @param request - Chat completion request with optional image content and additional options
     * @param endpoint - The endpoint to use: 'uncensored-image' or 'uncensored-video'
     * @returns Chat completion response
     *
     * @example Text-to-Image
     * ```typescript
     * const result = await uncensoredAI.generate({
     *   messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset' }] }],
     *   model: 'uncensored-ai/uncensored-image',
     *   type: 'new',
     *   lora_config: { 'style-lora': 1 }
     * }, 'uncensored-image');
     * ```
     *
     * @example Image-to-Image
     * ```typescript
     * const result = await uncensoredAI.generate({
     *   messages: [{
     *     role: 'user',
     *     content: [
     *       { type: 'text', text: 'Edit this image...' },
     *       { type: 'image_url', image_url: { url: '...', filename: 'image.png' } }
     *     ]
     *   }],
     *   model: 'uncensored-ai/uncensored-image',
     *   type: 'edit',
     *   image_config: { loras: ['skin', 'lightning'] }
     * }, 'uncensored-image');
     * ```
     *
     * @example Video Generation
     * ```typescript
     * const result = await uncensoredAI.generate({
     *   messages: [{
     *     role: 'user',
     *     content: [
     *       { type: 'text', text: 'Animate this...' },
     *       { type: 'image_url', image_url: { url: '...', filename: 'image.jpg' } }
     *     ]
     *   }],
     *   model: 'uncensored-ai/uncensored-video',
     *   type: 'edit',
     *   is_magic_prompt: true,
     *   duration: 5,
     *   audio: true,
     *   video_config: { is_fast_video: false, loras: ['flip', 'nsfw'] }
     * }, 'uncensored-video');
     * ```
     */
    generate(request: ChatCompletionRequest & UncensoredAIRequestOptions, endpoint?: string): Promise<ChatCompletionResponse>;
    /**
     * Transform Uncensored AI response to OpenAI format
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
    readonly tavily: Tavily;
    readonly uncensoredAI: UncensoredAI;
    private readonly config;
    constructor(config: EternalAIConfig);
}

export { Chat, type ChatCompletionChoice, type ChatCompletionChunk, type ChatCompletionDelta, type ChatCompletionMessage, type ChatCompletionNonStreamingChoice, type ChatCompletionNonStreamingRequest, type ChatCompletionRequest, type ChatCompletionRequestBase, type ChatCompletionResponse, type ChatCompletionStreamingRequest, type ChatMessage, EternalAI, type EternalAIConfig, type MessageRole, NanoBanana };
