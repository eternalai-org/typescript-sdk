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
 * Content part types for multimodal messages
 */
interface TextContentPart {
    type: 'text';
    text: string;
}
interface ImageUrlContentPart {
    type: 'image_url';
    image_url: {
        url: string;
    };
}
type ContentPart = TextContentPart | ImageUrlContentPart;
/**
 * Chat message structure
 */
interface ChatMessage {
    role: MessageRole;
    content: string | ContentPart[];
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
    private readonly flux;
    private readonly glm;
    private readonly mistral;
    private readonly nanoBanana;
    private readonly tavily;
    private readonly uncensoredAI;
    private readonly wan;
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
 * Flux image generation request options
 */
interface FluxRequestOptions {
    /** Image width in pixels (default: 1024) */
    width?: number;
    /** Image height in pixels (default: 1024) */
    height?: number;
    /** Safety tolerance level (0-6, default: 2) */
    safety_tolerance?: number;
}
/**
 * Flux generate response with polling URL
 */
interface FluxGenerateResponse {
    /** Request ID */
    id: string;
    /** URL to poll for results */
    polling_url: string;
    /** Cost of the request */
    cost?: number;
    /** Input megapixels */
    input_mp?: number;
    /** Output megapixels */
    output_mp?: number;
}
/**
 * Flux result from polling
 */
interface FluxResultResponse {
    /** Request ID */
    id: string;
    /** Status: 'Pending', 'Running', 'Ready', 'Failed' */
    status: 'Pending' | 'Running' | 'Ready' | 'Failed' | string;
    /** Result data when status is Ready */
    result?: {
        /** Generation start time */
        start_time?: number;
        /** Original prompt */
        prompt?: string;
        /** Seed used for generation */
        seed?: number;
        /** Generated image URL */
        sample?: string;
    };
    /** Progress information */
    progress?: any;
    /** Additional details */
    details?: any;
    /** Preview image */
    preview?: string | null;
    /** Error message if failed */
    error?: string;
}
/**
 * Options for polling
 */
interface PollingOptions$2 {
    /** Polling interval in milliseconds (default: 3000) */
    interval?: number;
    /** Maximum polling attempts (default: 60) */
    maxAttempts?: number;
    /** Callback for status updates */
    onStatusUpdate?: (status: string, attempt: number) => void;
}
/**
 * Flux service for image generation
 *
 * Supported models:
 * - flux-2-pro: Professional quality image generation
 * - flux-2: Standard image generation
 */
declare class Flux {
    private readonly config;
    private readonly baseUrl;
    constructor(config: EternalAIConfig);
    /**
     * Generate image using Flux endpoint
     * Returns polling_url immediately - use getResult() or pollResult() to poll for completion
     * @param request - Chat completion request with prompt, model, and optional images
     * @returns Generate response with polling_url for polling
     *
     * @example Text-to-Image
     * ```typescript
     * const task = await flux.generate({
     *   messages: [{ role: 'user', content: 'A futuristic city at sunset' }],
     *   model: 'flux/flux-2-pro',
     *   width: 1920,
     *   height: 1080,
     *   safety_tolerance: 2
     * });
     * // Get polling_url and poll manually
     * const result = await flux.getResult(task.polling_url);
     * ```
     *
     * @example Image-to-Image with multiple references
     * ```typescript
     * const task = await flux.generate({
     *   messages: [{
     *     role: 'user',
     *     content: [
     *       { type: 'text', text: 'Transform this image...' },
     *       { type: 'image_url', image_url: { url: 'https://example.com/image1.jpg' } },
     *       { type: 'image_url', image_url: { url: 'https://example.com/image2.jpg' } }
     *     ]
     *   }],
     *   model: 'flux/flux-2-pro'
     * });
     * const result = await flux.pollResult(task.polling_url, {
     *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`)
     * });
     * ```
     */
    generate(request: ChatCompletionRequest & FluxRequestOptions): Promise<FluxGenerateResponse>;
    /**
     * Get result by polling URL
     * @param pollingUrl - The polling URL returned from generate()
     * @returns Result response with status and image URL
     *
     * @example
     * ```typescript
     * const result = await flux.getResult('https://api.eu2.bfl.ai/v1/get_result?id=xxx');
     * if (result.status === 'Ready') {
     *   console.log('Image URL:', result.result?.sample);
     * }
     * ```
     */
    getResult(pollingUrl: string): Promise<FluxResultResponse>;
    /**
     * Poll for result until completion or timeout
     * @param pollingUrl - The polling URL returned from generate()
     * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
     * @returns Final result response
     * @throws Error if polling times out or request fails
     *
     * @example
     * ```typescript
     * const finalResult = await flux.pollResult('https://api.eu2.bfl.ai/v1/get_result?id=xxx', {
     *   interval: 3000,
     *   maxAttempts: 60,
     *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
     * });
     * ```
     */
    pollResult(pollingUrl: string, options?: PollingOptions$2): Promise<FluxResultResponse>;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
    /**
     * Sleep helper for polling
     */
    private sleep;
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
     * Fetch image from URL and convert to base64
     */
    private fetchImageAsBase64;
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
 * Generate response with request_id for polling
 */
interface UncensoredGenerateResponse {
    request_id: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'error';
    message?: string;
}
/**
 * Result response from polling endpoint
 */
interface UncensoredResultResponse {
    request_id: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'error';
    result_url: string;
}
/**
 * Options for polling
 */
interface PollingOptions$1 {
    /** Polling interval in milliseconds (default: 3000) */
    interval?: number;
    /** Maximum polling attempts (default: 60) */
    maxAttempts?: number;
    /** Callback for status updates */
    onStatusUpdate?: (status: string, attempt: number) => void;
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
     * Returns request_id immediately - use getResult() or pollResult() to poll for completion
     * @param request - Chat completion request with model, optional image content and additional options
     * @returns Generate response with request_id for polling
     *
     * @example Text-to-Image
     * ```typescript
     * const task = await uncensoredAI.generate({
     *   messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset' }] }],
     *   model: 'uncensored-ai/uncensored-image',
     *   type: 'new',
     *   lora_config: { 'style-lora': 1 }
     * });
     * // Get request_id and poll manually
     * const result = await uncensoredAI.getResult(task.request_id, 'uncensored-image');
     * ```
     *
     * @example Image-to-Image
     * ```typescript
     * const task = await uncensoredAI.generate({
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
     * });
     * ```
     *
     * @example Video Generation
     * ```typescript
     * const task = await uncensoredAI.generate({
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
     * });
     * // Poll for video result
     * const result = await uncensoredAI.pollResult(task.request_id, 'uncensored-video', {
     *   interval: 5000,
     *   maxAttempts: 120
     * });
     * ```
     */
    generate(request: ChatCompletionRequest & UncensoredAIRequestOptions): Promise<UncensoredGenerateResponse>;
    /**
     * Get result by request_id (polling endpoint)
     * @param requestId - The request ID returned from generate()
     * @param endpoint - The endpoint: 'uncensored-image' or 'uncensored-video'
     * @returns Result response with status and content
     *
     * @example
     * ```typescript
     * const result = await uncensoredAI.getResult('req_123456', 'uncensored-image');
     * if (result.status === 'completed') {
     *   console.log('Image URL:', result.result?.url);
     * }
     * ```
     */
    getResult(requestId: string, endpoint?: string): Promise<UncensoredResultResponse>;
    /**
     * Poll for result until completion or timeout
     * @param requestId - The request ID returned from generate()
     * @param endpoint - The endpoint: 'uncensored-image' or 'uncensored-video'
     * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
     * @returns Final result response
     * @throws Error if polling times out or request fails
     *
     * @example
     * ```typescript
     * const generateResponse = await uncensoredAI.generate({ ... }, 'uncensored-image');
     * const requestId = JSON.parse(generateResponse.choices[0].message.content).request_id;
     *
     * const finalResult = await uncensoredAI.pollResult(requestId, 'uncensored-image', {
     *   interval: 2000,
     *   maxAttempts: 30,
     *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
     * });
     * ```
     */
    pollResult(requestId: string, endpoint?: string, options?: PollingOptions$1): Promise<UncensoredResultResponse>;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
    /**
     * Sleep helper for polling
     */
    private sleep;
}

/**
 * Wan video generation request options
 */
interface WanRequestOptions {
    /** Video resolution (e.g., "480P", "720P", "1080P") */
    resolution?: string;
    /** Enable prompt extension for better results */
    prompt_extend?: boolean;
    /** Video duration in seconds */
    duration?: number;
    /** Enable audio in video */
    audio?: boolean;
}
/**
 * Wan async task response
 */
interface WanTaskResponse {
    output?: {
        task_id: string;
        task_status: string;
    };
    request_id?: string;
}
/**
 * Wan task result response
 */
interface WanResultResponse {
    output?: {
        task_id: string;
        task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
        submit_time?: string;
        scheduled_time?: string;
        end_time?: string;
        orig_prompt?: string;
        actual_prompt?: string;
        video_url?: string;
        task_metrics?: {
            TOTAL: number;
            SUCCEEDED: number;
            FAILED: number;
        };
        results?: Array<{
            url: string;
        }>;
        code?: string;
        message?: string;
    };
    usage?: {
        duration: number;
        video_count: number;
        SR: number;
    };
    request_id?: string;
}
/**
 * Options for polling
 */
interface PollingOptions {
    /** Polling interval in milliseconds (default: 5000) */
    interval?: number;
    /** Maximum polling attempts (default: 120) */
    maxAttempts?: number;
    /** Callback for status updates */
    onStatusUpdate?: (status: string, attempt: number) => void;
}
/**
 * Wan service for video generation from images
 *
 * Supported models:
 * - wan2.5-i2v-preview: Image-to-video generation
 */
declare class Wan {
    private readonly config;
    private readonly baseUrl;
    private readonly tasksBaseUrl;
    constructor(config: EternalAIConfig);
    /**
     * Generate video from image using Wan endpoint
     * Returns task_id immediately - use getResult() to poll for completion
     * @param request - Chat completion request with prompt, image URL, and model
     * @returns Task response with task_id for polling
     *
     * @example
     * ```typescript
     * // Start generation
     * const task = await wan.generate({
     *   messages: [{
     *     role: 'user',
     *     content: [
     *       { type: 'text', text: 'A dynamic graffiti art character...' },
     *       { type: 'image_url', image_url: { url: 'https://...' } }
     *     ]
     *   }],
     *   model: 'wan/wan2.5-i2v-preview',
     *   resolution: '480P'
     * });
     *
     * // Get task_id and poll manually
     * const taskId = task.output?.task_id;
     * const result = await wan.getResult(taskId);
     * ```
     */
    generate(request: ChatCompletionRequest & WanRequestOptions): Promise<WanTaskResponse>;
    /**
     * Get result by task_id (polling endpoint)
     * @param taskId - The task ID returned from generate()
     * @returns Result response with status and video URL
     *
     * @example
     * ```typescript
     * const result = await wan.getResult('task_123456');
     * if (result.output?.task_status === 'SUCCEEDED') {
     *   console.log('Video URL:', result.output.results?.[0]?.url);
     * }
     * ```
     */
    getResult(taskId: string): Promise<WanResultResponse>;
    /**
     * Poll for result until completion or timeout
     * @param taskId - The task ID returned from generate()
     * @param options - Polling options (interval, maxAttempts, onStatusUpdate callback)
     * @returns Final result response
     * @throws Error if polling times out or request fails
     *
     * @example
     * ```typescript
     * const finalResult = await wan.pollResult('task_123456', {
     *   interval: 5000,
     *   maxAttempts: 120,
     *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] Status: ${status}`)
     * });
     * ```
     */
    pollResult(taskId: string, options?: PollingOptions): Promise<WanResultResponse>;
    /**
     * Create abort signal with timeout
     */
    private createAbortSignal;
    /**
     * Sleep helper for polling
     */
    private sleep;
}

declare class EternalAI {
    readonly chat: Chat;
    readonly flux: Flux;
    readonly nanoBanana: NanoBanana;
    readonly tavily: Tavily;
    readonly uncensoredAI: UncensoredAI;
    readonly wan: Wan;
    private readonly config;
    constructor(config: EternalAIConfig);
}

export { Chat, type ChatCompletionChoice, type ChatCompletionChunk, type ChatCompletionDelta, type ChatCompletionMessage, type ChatCompletionNonStreamingChoice, type ChatCompletionNonStreamingRequest, type ChatCompletionRequest, type ChatCompletionRequestBase, type ChatCompletionResponse, type ChatCompletionStreamingRequest, type ChatMessage, EternalAI, type EternalAIConfig, Flux, type MessageRole, NanoBanana, Wan };
