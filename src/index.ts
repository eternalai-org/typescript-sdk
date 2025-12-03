// Export main SDK client
export { EternalAPI } from './client';

// Export types
export type {
  EternalAPIConfig,
  MessageRole,
  ChatMessage,
  ChatCompletionRequestBase,
  ChatCompletionRequest,
  ChatCompletionStreamingRequest,
  ChatCompletionNonStreamingRequest,
  ChatCompletionDelta,
  ChatCompletionChoice,
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionNonStreamingChoice,
  ChatCompletionResponse,
} from './types';

// Export chat service (if direct access needed)
export { Chat } from './services/chat';
