import type {
    EternalAIConfig,
    ChatCompletionRequest,
} from '../types';

/**
 * Flux message content part
 */
interface FluxContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
        filename?: string;
    };
}

/**
 * Flux message
 */
interface FluxMessage {
    role: string;
    content: string | FluxContentPart[];
}

/**
 * Flux image generation request options
 */
export interface FluxRequestOptions {
    /** Image width in pixels (default: 1024) */
    width?: number;
    /** Image height in pixels (default: 1024) */
    height?: number;
    /** Safety tolerance level (0-6, default: 2) */
    safety_tolerance?: number;
}

/**
 * Flux API request body
 */
interface FluxRequest {
    prompt: string;
    width: number;
    height: number;
    safety_tolerance: number;
    /** First input image URL for image-to-image generation */
    input_image?: string;
    /** Second input image URL for reference */
    input_image_2?: string;
}

/**
 * Flux generate response with polling URL
 */
export interface FluxGenerateResponse {
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
export interface FluxResultResponse {
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
export interface PollingOptions {
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
export class Flux {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/flux/v1';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

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
    async generate(
        request: ChatCompletionRequest & FluxRequestOptions
    ): Promise<FluxGenerateResponse> {
        // Extract model name (strip 'flux/' prefix if present)
        const model = request.model.startsWith('flux/')
            ? request.model.slice('flux/'.length)
            : request.model;

        const url = `${this.baseUrl}/${model}`;

        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'x-key': this.config.apiKey,
        };

        // Extract prompt and images from messages
        let prompt = '';
        const imageUrls: string[] = [];

        for (const message of request.messages as FluxMessage[]) {
            if (typeof message.content === 'string') {
                prompt = message.content;
            } else if (Array.isArray(message.content)) {
                for (const part of message.content) {
                    if (part.type === 'text') {
                        prompt = part.text || '';
                    } else if (part.type === 'image_url' && part.image_url) {
                        imageUrls.push(part.image_url.url);
                    }
                }
            }
        }

        // Build request body
        const body: FluxRequest = {
            prompt,
            width: request.width ?? 1024,
            height: request.height ?? 1024,
            safety_tolerance: request.safety_tolerance ?? 2,
        };

        // Add input images if provided (max 2 images supported)
        if (imageUrls.length > 0) {
            body.input_image = imageUrls[0];
        }
        if (imageUrls.length > 1) {
            body.input_image_2 = imageUrls[1];
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flux request failed with status ${response.status}: ${errorText}`);
        }

        const generateResponse = (await response.json()) as FluxGenerateResponse;

        if (!generateResponse.polling_url) {
            throw new Error('No polling_url in generate response');
        }

        // Return immediately - user calls getResult() or pollResult() to poll
        return generateResponse;
    }

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
    async getResult(pollingUrl: string): Promise<FluxResultResponse> {
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'x-key': this.config.apiKey,
        };

        const response = await fetch(pollingUrl, {
            method: 'GET',
            headers,
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Flux getResult failed with status ${response.status}: ${errorText}`);
        }

        return (await response.json()) as FluxResultResponse;
    }

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
    async pollResult(
        pollingUrl: string,
        options: PollingOptions = {}
    ): Promise<FluxResultResponse> {
        const {
            interval = 3000,
            maxAttempts = 60,
            onStatusUpdate,
        } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const result = await this.getResult(pollingUrl);

            if (onStatusUpdate) {
                console.log('pollingUrl', pollingUrl);
                onStatusUpdate(result.status, attempt);
            }

            if (result.status === 'Ready') {
                return result;
            }

            if (result.status === 'Failed') {
                const message = result.error || 'Unknown error';
                throw new Error(`Flux image generation failed: ${message}`);
            }

            // Wait before next poll (Pending or Running)
            if (attempt < maxAttempts) {
                await this.sleep(interval);
            }
        }

        throw new Error(`Flux polling timed out after ${maxAttempts} attempts`);
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

