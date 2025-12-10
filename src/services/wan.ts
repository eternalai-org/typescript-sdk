import type {
    EternalAIConfig,
    ChatCompletionRequest,
} from '../types';

/**
 * Wan message content part
 */
interface WanContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
        filename?: string;
    };
}

/**
 * Wan message
 */
interface WanMessage {
    role: string;
    content: string | WanContentPart[];
}

/**
 * Wan video generation request options
 */
export interface WanRequestOptions {
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
 * Wan API request body
 */
interface WanRequest {
    model: string;
    input: {
        prompt: string;
        img_url?: string;
    };
    parameters: {
        resolution: string;
        prompt_extend: boolean;
        duration: number;
        audio: boolean;
    };
}

/**
 * Wan async task response
 */
export interface WanTaskResponse {
    output?: {
        task_id: string;
        task_status: string;
    };
    request_id?: string;
}

/**
 * Wan task result response
 */
export interface WanResultResponse {
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
export interface PollingOptions {
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
export class Wan {
    private readonly config: EternalAIConfig;
    private readonly baseUrl = 'https://open.eternalai.org/wan/api/v1/services/aigc/video-generation';
    private readonly tasksBaseUrl = 'https://open.eternalai.org/wan/api/v1/tasks';

    constructor(config: EternalAIConfig) {
        this.config = config;
    }

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
    async generate(
        request: ChatCompletionRequest & WanRequestOptions
    ): Promise<WanTaskResponse> {
        const url = `${this.baseUrl}/video-synthesis`;

        const headers = {
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable',
            'Authorization': `Bearer ${this.config.apiKey}`,
        };

        // Extract model name (strip 'wan/' prefix if present)
        const model = request.model.startsWith('wan/')
            ? request.model.slice(4)
            : request.model;

        // Extract prompt and image URL from messages
        let prompt = '';
        let imgUrl: string | undefined;

        for (const message of request.messages as WanMessage[]) {
            if (typeof message.content === 'string') {
                prompt = message.content;
            } else if (Array.isArray(message.content)) {
                for (const part of message.content) {
                    if (part.type === 'text') {
                        prompt = part.text || '';
                    } else if (part.type === 'image_url' && part.image_url) {
                        imgUrl = part.image_url.url;
                    }
                }
            }
        }

        // Build request body
        const body: WanRequest = {
            model,
            input: {
                prompt,
                ...(imgUrl && { img_url: imgUrl }),
            },
            parameters: {
                resolution: request.resolution || '480P',
                prompt_extend: request.prompt_extend !== undefined ? request.prompt_extend : true,
                duration: request.duration !== undefined ? request.duration : 10,
                audio: request.audio !== undefined ? request.audio : true,
            },
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Wan request failed with status ${response.status}: ${errorText}`);
        }

        const taskResponse = (await response.json()) as WanTaskResponse;

        if (!taskResponse.output?.task_id) {
            throw new Error('No task_id in generate response');
        }

        // Return task response immediately - user calls getResult() to poll
        return taskResponse;
    }

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
    async getResult(taskId: string): Promise<WanResultResponse> {
        // DashScope uses /api/v1/tasks/{task_id} for checking task status
        const url = `${this.tasksBaseUrl}/${encodeURIComponent(taskId)}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
        };

        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: this.createAbortSignal(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Wan getResult failed with status ${response.status}: ${errorText}`);
        }

        return (await response.json()) as WanResultResponse;
    }

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
    async pollResult(
        taskId: string,
        options: PollingOptions = {}
    ): Promise<WanResultResponse> {
        const {
            interval = 5000,
            maxAttempts = 120,
            onStatusUpdate,
        } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const result = await this.getResult(taskId);

            const status = result.output?.task_status || 'UNKNOWN';

            if (onStatusUpdate) {
                console.log('taskId', taskId);
                onStatusUpdate(status, attempt);
            }

            if (status === 'SUCCEEDED') {
                return result;
            }

            if (status === 'FAILED') {
                const message = result.output?.message || 'Unknown error';
                throw new Error(`Wan video generation failed: ${message}`);
            }

            // Wait before next poll (PENDING or RUNNING)
            if (attempt < maxAttempts) {
                await this.sleep(interval);
            }
        }

        throw new Error(`Wan polling timed out after ${maxAttempts} attempts`);
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
