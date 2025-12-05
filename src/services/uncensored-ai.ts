import type {
    EternalAIConfig,
    ChatCompletionRequest,
} from '../types';

/**
 * Uncensored AI message content part
 */
interface UncensoredContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
        filename?: string;
    };
}

/**
 * Uncensored AI message
 */
interface UncensoredMessage {
    role: string;
    content: string | UncensoredContentPart[];
}

/**
 * Uncensored AI request options (extended from ChatCompletionRequest)
 */
export interface UncensoredAIRequestOptions {
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
 * Uncensored AI request body
 */
interface UncensoredRequest {
    messages: UncensoredMessage[];
    type?: string;
    lora_config?: Record<string, number>;
    image_config?: string;
    video_config?: string;
    is_magic_prompt?: boolean;
    duration?: number;
    audio?: boolean;
}


/**
 * Generate response with request_id for polling
 */
export interface UncensoredGenerateResponse {
    request_id: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'error';
    message?: string;
}

/**
 * Result response from polling endpoint
 */
export interface UncensoredResultResponse {
    request_id: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'error';
    result_url: string;
}

/**
 * Options for polling
 */
export interface PollingOptions {
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
export class UncensoredAI {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/uncensored-ai';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

    /**
     * Generate or edit images/videos using Uncensored AI endpoint
     * Automatically polls for results until completion
     * @param request - Chat completion request with optional image content and additional options
     * @param endpoint - The endpoint to use: 'uncensored-image' or 'uncensored-video'
     * @param pollingOptions - Polling options (optional, has smart defaults)
     * @returns Final result response with generated URL
     * 
     * @example Text-to-Image
     * ```typescript
     * const result = await uncensoredAI.generate({
     *   messages: [{ role: 'user', content: [{ type: 'text', text: 'A beautiful sunset' }] }],
     *   model: 'uncensored-ai/uncensored-image',
     *   type: 'new',
     *   lora_config: { 'style-lora': 1 }
     * }, 'uncensored-image', {
     *   interval: 3000,
     *   maxAttempts: 60,
     *   onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`)
     * });
     * // Result URL: result.result?.url
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
     * }, 'uncensored-video', {
     *   interval: 5000, // Video takes longer
     *   maxAttempts: 120
     * });
     * ```
     */
    async generate(
        request: ChatCompletionRequest & UncensoredAIRequestOptions,
        endpoint: string = 'uncensored-image',
        pollingOptions: PollingOptions = {}
    ): Promise<UncensoredResultResponse> {
        const url = `${this.baseUrl}/${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'x-api-key': this.config.apiKey,
        };

        // Build request body
        const body: UncensoredRequest = {
            messages: request.messages as UncensoredMessage[],
        };

        // Add type based on content (new = text-to-image, edit = image-to-image/video)
        body.type = request.type !== undefined ? request.type : (request.messages as UncensoredMessage[]).find(message => (message.content as UncensoredContentPart[]).find(content => content.type === 'image_url')) ? 'edit' : 'new';

        // Add lora_config if specified (for text-to-image)
        if (request.lora_config) {
            body.lora_config = request.lora_config;
        }

        // Add image_config if specified (for image-to-image)
        if (request.image_config) {
            body.image_config = typeof request.image_config === 'string'
                ? request.image_config
                : JSON.stringify(request.image_config);
        }

        // Add video_config if specified (for video generation)
        if (request.video_config) {
            body.video_config = typeof request.video_config === 'string'
                ? request.video_config
                : JSON.stringify(request.video_config);
        }

        // Add video-specific options
        body.is_magic_prompt = request.is_magic_prompt !== undefined ? request.is_magic_prompt : true;

        // Set default duration to 5 if not provided
        body.duration = request.duration !== undefined ? request.duration : 5;

        // Add audio if specified
        body.audio = request.audio !== undefined ? request.audio : true;


        console.log('body', body);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`UncensoredAI request failed with status ${response.status}: ${errorText}`);
        }

        const uncensoredResponse = (await response.json()) as UncensoredGenerateResponse;

        const requestId: string = uncensoredResponse.request_id;

        if (!requestId) {
            throw new Error('No request_id in generate response');
        }

        // Auto-poll for result with smart defaults
        const finalPollingOptions: PollingOptions = {
            interval: pollingOptions.interval || (endpoint === 'uncensored-video' ? 5000 : 3000),
            maxAttempts: pollingOptions.maxAttempts || (endpoint === 'uncensored-video' ? 120 : 60),
            onStatusUpdate: pollingOptions.onStatusUpdate,
        };

        return this.pollResult(requestId, endpoint, finalPollingOptions);
    }

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
    async getResult(
        requestId: string,
        endpoint: string = 'uncensored-image'
    ): Promise<UncensoredResultResponse> {
        const url = `${this.baseUrl}/result/${endpoint}?request_id=${encodeURIComponent(requestId)}`;

        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'x-api-key': this.config.apiKey,
        };

        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`UncensoredAI getResult failed with status ${response.status}: ${errorText}`);
        }

        return (await response.json()) as UncensoredResultResponse;
    }

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
    async pollResult(
        requestId: string,
        endpoint: string = 'uncensored-image',
        options: PollingOptions = {}
    ): Promise<UncensoredResultResponse> {
        const {
            interval = 3000,
            maxAttempts = 60,
            onStatusUpdate,
        } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const result = await this.getResult(requestId, endpoint);

            if (onStatusUpdate) {
                console.log('requestId', requestId);
                onStatusUpdate(result.status, attempt);
            }

            if (result.status === 'success') {
                return result;
            }

            if (result.status === 'failed') {
                throw new Error(`UncensoredAI request failed: ${result.status}`);
            }

            // Wait before next poll (pending or processing)
            if (attempt < maxAttempts) {
                await this.sleep(interval);
            }
        }

        throw new Error(`UncensoredAI polling timed out after ${maxAttempts} attempts`);
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
     * Sleep helper for polling
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
