import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Chat } from '../src/services/chat';
import type {
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionChunk,
} from '../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Chat Service', () => {
    let chat: Chat;

    beforeEach(() => {
        chat = new Chat({ apiKey: 'test-api-key' });
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Non-Streaming Requests', () => {
        it('should send non-streaming chat completion request successfully', async () => {
            const mockResponse: ChatCompletionResponse = {
                id: 'chatcmpl-123',
                object: 'chat.completion',
                created: Date.now(),
                model: 'gpt-4o-mini',
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: 'Hello! How can I help you today?',
                        },
                        finish_reason: 'stop',
                    },
                ],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30,
                },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const request: ChatCompletionRequest = {
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
                stream: false,
            };

            const result = await chat.send(request);
            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://open.eternalai.org/api/v1/chat/completions?from=ts-sdk',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-api-key',
                    },
                    body: JSON.stringify(request),
                    signal: undefined,
                })
            );
        });
    });

    describe('Streaming Requests', () => {
        it('should handle streaming chat completion request', async () => {
            const mockChunks: ChatCompletionChunk[] = [
                {
                    id: 'chatcmpl-123',
                    object: 'chat.completion.chunk',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            delta: { role: 'assistant', content: 'Hello' },
                            finish_reason: null,
                        },
                    ],
                },
                {
                    id: 'chatcmpl-123',
                    object: 'chat.completion.chunk',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            delta: { content: ' world' },
                            finish_reason: null,
                        },
                    ],
                },
                {
                    id: 'chatcmpl-123',
                    object: 'chat.completion.chunk',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            delta: { content: '!' },
                            finish_reason: 'stop',
                        },
                    ],
                },
            ];

            const mockStream = new ReadableStream({
                start(controller) {
                    mockChunks.forEach((chunk) => {
                        const data = `data: ${JSON.stringify(chunk)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                    });
                    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                    controller.close();
                },
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: mockStream,
            });

            const request: ChatCompletionRequest = {
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
                stream: true,
            };

            const result = await chat.send(request);
            const chunks: ChatCompletionChunk[] = [];

            for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
                chunks.push(chunk);
            }

            expect(chunks).toHaveLength(3);
            expect(chunks[0].choices[0].delta.content).toBe('Hello');
            expect(chunks[1].choices[0].delta.content).toBe(' world');
            expect(chunks[2].choices[0].delta.content).toBe('!');
        });

        it('should handle empty lines in streaming response', async () => {
            const mockStream = new ReadableStream({
                start(controller) {
                    const data = `data: ${JSON.stringify({
                        id: 'chatcmpl-123',
                        object: 'chat.completion.chunk',
                        created: Date.now(),
                        model: 'gpt-4o-mini',
                        choices: [
                            { index: 0, delta: { content: 'test' }, finish_reason: null },
                        ],
                    })}\n\n\n\ndata: [DONE]\n\n`;
                    controller.enqueue(new TextEncoder().encode(data));
                    controller.close();
                },
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: mockStream,
            });

            const result = await chat.send({
                messages: [{ role: 'user', content: 'test' }],
                model: 'gpt-4o-mini',
                stream: true,
            });

            const chunks: ChatCompletionChunk[] = [];
            for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
                chunks.push(chunk);
            }

            expect(chunks).toHaveLength(1);
        });

        it('should skip invalid JSON chunks in streaming response', async () => {
            const mockStream = new ReadableStream({
                start(controller) {
                    const validChunk = {
                        id: 'chatcmpl-123',
                        object: 'chat.completion.chunk',
                        created: Date.now(),
                        model: 'gpt-4o-mini',
                        choices: [
                            { index: 0, delta: { content: 'valid' }, finish_reason: null },
                        ],
                    };
                    const data = `data: ${JSON.stringify(validChunk)}\ndata: {invalid json}\ndata: [DONE]\n\n`;
                    controller.enqueue(new TextEncoder().encode(data));
                    controller.close();
                },
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({
                    'content-type': 'text/event-stream',
                }),
                body: mockStream,
            });

            const result = await chat.send({
                messages: [{ role: 'user', content: 'test' }],
                model: 'gpt-4o-mini',
                stream: true,
            });

            const chunks: ChatCompletionChunk[] = [];
            for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
                chunks.push(chunk);
            }

            // Should only receive valid chunks, invalid ones are silently skipped
            expect(chunks).toHaveLength(1);
            expect(chunks[0].choices[0].delta.content).toBe('valid');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when API returns non-OK status', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized',
            });

            await expect(
                chat.send({
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'gpt-4o-mini',
                })
            ).rejects.toThrow('EternalAI request failed with status 401: Unauthorized');
        });

        it('should throw error when API returns 500 status', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error',
            });

            await expect(
                chat.send({
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'gpt-4o-mini',
                })
            ).rejects.toThrow('EternalAI request failed with status 500: Internal Server Error');
        });

        it('should throw error when response body is not readable for streaming', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: null,
            });

            await expect(
                chat.send({
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'gpt-4o-mini',
                    stream: true,
                })
            ).rejects.toThrow('Response body is not readable');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                chat.send({
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'gpt-4o-mini',
                })
            ).rejects.toThrow('Network error');
        });
    });

    describe('Timeout Handling', () => {
        it('should create abort signal when timeout is configured', async () => {
            const chatWithTimeout = new Chat({ apiKey: 'test-api-key', timeout: 5000 });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Response' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            await chatWithTimeout.send({
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: expect.any(AbortSignal),
                })
            );
        });

        it('should not create abort signal when timeout is not configured', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Response' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            await chat.send({
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: undefined,
                })
            );
        });
    });

    describe('Request Headers', () => {
        it('should include correct authorization header', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Response' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            await chat.send({
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-api-key',
                    }),
                })
            );
        });

        it('should include correct content-type header', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Response' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            await chat.send({
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });
    });

    describe('Image Config', () => {
        it('should include image_config in non-streaming request body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'image-gen-model',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Image generated' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            const request = {
                messages: [{ role: 'user', content: 'Generate an image' }],
                model: 'image-gen-model',
                stream: false,
                image_config: {
                    aspect_ratio: '16:9',
                },
            };

            await chat.send(request);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(request),
                })
            );
        });

        it('should include image_config in streaming request body', async () => {
            const mockStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(
                        new TextEncoder().encode(
                            `data: ${JSON.stringify({
                                id: 'chatcmpl-123',
                                object: 'chat.completion.chunk',
                                created: Date.now(),
                                model: 'image-gen-model',
                                choices: [
                                    { index: 0, delta: { content: 'Generating' }, finish_reason: null },
                                ],
                            })}\n\ndata: [DONE]\n\n`
                        )
                    );
                    controller.close();
                },
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: mockStream,
            });

            const request = {
                messages: [{ role: 'user', content: 'Generate an image' }],
                model: 'image-gen-model',
                stream: true,
                image_config: {
                    aspect_ratio: '1:1',
                },
            };

            const result = await chat.send(request);
            const chunks: ChatCompletionChunk[] = [];
            for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
                chunks.push(chunk);
            }

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(request),
                })
            );
            expect(chunks.length).toBeGreaterThan(0);
        });

        it('should work without image_config (optional)', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: 'Response' },
                            finish_reason: 'stop',
                        },
                    ],
                }),
            });

            const request = {
                messages: [{ role: 'user', content: 'Hello' }],
                model: 'gpt-4o-mini',
                stream: false,
            };

            await chat.send(request);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(request),
                })
            );
        });
    });
});

