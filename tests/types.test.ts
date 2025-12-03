import { describe, it, expect } from 'vitest';
import type {
  EternalAPIConfig,
  MessageRole,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionDelta,
  ChatCompletionChoice,
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionNonStreamingChoice,
  ChatCompletionResponse,
} from '../src/types';

describe('Type Definitions', () => {
  describe('EternalAPIConfig', () => {
    it('should accept valid config with apiKey', () => {
      const config: EternalAPIConfig = {
        apiKey: 'test-key',
      };
      expect(config.apiKey).toBe('test-key');
    });

    it('should accept optional timeout', () => {
      const config: EternalAPIConfig = {
        apiKey: 'test-key',
        timeout: 30000,
      };
      expect(config.timeout).toBe(30000);
    });
  });

  describe('MessageRole', () => {
    it('should accept valid role types', () => {
      const systemRole: MessageRole = 'system';
      const userRole: MessageRole = 'user';
      const assistantRole: MessageRole = 'assistant';

      expect(systemRole).toBe('system');
      expect(userRole).toBe('user');
      expect(assistantRole).toBe('assistant');
    });
  });

  describe('ChatMessage', () => {
    it('should create valid chat message', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello, world!',
      };
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, world!');
    });

    it('should support all message roles', () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi! How can I help you?' },
      ];
      expect(messages).toHaveLength(3);
    });
  });

  describe('ChatCompletionRequest', () => {
    it('should create valid request with required fields', () => {
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
      };
      expect(request.messages).toHaveLength(1);
      expect(request.model).toBe('gpt-4o-mini');
    });

    it('should accept optional stream parameter', () => {
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o-mini',
        stream: true,
      };
      expect(request.stream).toBe(true);
    });
  });

  describe('ChatCompletionDelta', () => {
    it('should create delta with content', () => {
      const delta: ChatCompletionDelta = {
        content: 'Hello',
      };
      expect(delta.content).toBe('Hello');
    });

    it('should create delta with role', () => {
      const delta: ChatCompletionDelta = {
        role: 'assistant',
        content: 'Hello',
      };
      expect(delta.role).toBe('assistant');
      expect(delta.content).toBe('Hello');
    });

    it('should allow empty delta', () => {
      const delta: ChatCompletionDelta = {};
      expect(delta.content).toBeUndefined();
      expect(delta.role).toBeUndefined();
    });
  });

  describe('ChatCompletionChoice', () => {
    it('should create valid streaming choice', () => {
      const choice: ChatCompletionChoice = {
        index: 0,
        delta: { content: 'Hello' },
        finish_reason: null,
      };
      expect(choice.index).toBe(0);
      expect(choice.delta.content).toBe('Hello');
      expect(choice.finish_reason).toBeNull();
    });

    it('should support finish_reason', () => {
      const choice: ChatCompletionChoice = {
        index: 0,
        delta: { content: '' },
        finish_reason: 'stop',
      };
      expect(choice.finish_reason).toBe('stop');
    });
  });

  describe('ChatCompletionChunk', () => {
    it('should create valid chunk', () => {
      const chunk: ChatCompletionChunk = {
        id: 'chatcmpl-123',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            delta: { content: 'Hello' },
            finish_reason: null,
          },
        ],
      };
      expect(chunk.object).toBe('chat.completion.chunk');
      expect(chunk.choices).toHaveLength(1);
    });
  });

  describe('ChatCompletionMessage', () => {
    it('should create valid completion message', () => {
      const message: ChatCompletionMessage = {
        role: 'assistant',
        content: 'Hello! How can I help you?',
      };
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hello! How can I help you?');
    });
  });

  describe('ChatCompletionNonStreamingChoice', () => {
    it('should create valid non-streaming choice', () => {
      const choice: ChatCompletionNonStreamingChoice = {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Response',
        },
        finish_reason: 'stop',
      };
      expect(choice.index).toBe(0);
      expect(choice.message.content).toBe('Response');
      expect(choice.finish_reason).toBe('stop');
    });

    it('should allow null finish_reason', () => {
      const choice: ChatCompletionNonStreamingChoice = {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Response',
        },
        finish_reason: null,
      };
      expect(choice.finish_reason).toBeNull();
    });
  });

  describe('ChatCompletionResponse', () => {
    it('should create valid response without usage', () => {
      const response: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Response',
            },
            finish_reason: 'stop',
          },
        ],
      };
      expect(response.object).toBe('chat.completion');
      expect(response.choices).toHaveLength(1);
      expect(response.usage).toBeUndefined();
    });

    it('should create valid response with usage', () => {
      const response: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Response',
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
      expect(response.usage).toBeDefined();
      expect(response.usage?.total_tokens).toBe(30);
    });
  });
});

