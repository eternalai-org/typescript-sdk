// Export main SDK client
export { EternalAI } from './client';

// Export types
export type {
  MessageRole,
  ChatMessage,
  EternalAIConfig,
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

// Export nano-banana service (for custom endpoints)
export { NanoBanana } from './services/nano-banana';
