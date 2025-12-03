/**
 * EternalAPI configuration
 */
export interface EternalAPIConfig {
  apiKey: string;
  timeout?: number;
}

/**
 * Message role types
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Base chat completion request
 */
export interface ChatCompletionRequestBase {
  messages: ChatMessage[];
  model: string;
}

/**
 * Chat completion request with optional stream
 */
export interface ChatCompletionRequest extends ChatCompletionRequestBase {
  stream?: boolean;
}

/**
 * Streaming chat completion request
 */
export interface ChatCompletionStreamingRequest extends ChatCompletionRequestBase {
  stream: true;
}

/**
 * Non-streaming chat completion request
 */
export interface ChatCompletionNonStreamingRequest extends ChatCompletionRequestBase {
  stream?: false;
}

/**
 * Delta content in streaming response
 */
export interface ChatCompletionDelta {
  role?: MessageRole;
  content?: string;
}

/**
 * Choice in streaming response
 */
export interface ChatCompletionChoice {
  index: number;
  delta: ChatCompletionDelta;
  finish_reason?: string | null;
}

/**
 * Chat completion chunk for streaming
 */
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
}

/**
 * Non-streaming chat completion response
 */
export interface ChatCompletionMessage {
  role: MessageRole;
  content: string;
}

/**
 * Non-streaming choice
 */
export interface ChatCompletionNonStreamingChoice {
  index: number;
  message: ChatCompletionMessage;
  finish_reason: string | null;
}

/**
 * Non-streaming chat completion response
 */
export interface ChatCompletionResponse {
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
