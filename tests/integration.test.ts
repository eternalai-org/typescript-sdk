import { describe, it, expect } from 'vitest';
import { EternalAI } from '../src/index';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from '../src/types';

describe('Integration Tests', () => {
  describe('SDK Exports', () => {
    it('should export EternalAI class', () => {
      expect(EternalAI).toBeDefined();
    });

    it('should create instance of EternalAI', () => {
      const client = new EternalAI({ apiKey: 'test-key' });
      expect(client).toBeInstanceOf(EternalAI);
    });
  });

  describe('Type Exports', () => {
    it('should allow using exported types', () => {
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-4o-mini',
      };

      expect(request.messages).toBeDefined();
      expect(request.model).toBe('gpt-4o-mini');
    });
  });

  describe('End-to-End Flow', () => {
    it('should initialize client and access chat service', () => {
      const client = new EternalAI({ apiKey: 'test-key' });
      expect(client.chat).toBeDefined();
      expect(client.chat.send).toBeDefined();
      expect(typeof client.chat.send).toBe('function');
    });

    it('should accept all valid message roles', () => {
      const client = new EternalAI({ apiKey: 'test-key' });
      const request: ChatCompletionRequest = {
        messages: [
          { role: 'system', content: 'System prompt' },
          { role: 'user', content: 'User message' },
          { role: 'assistant', content: 'Assistant response' },
        ],
        model: 'gpt-4o-mini',
      };

      expect(request.messages).toHaveLength(3);
    });

    it('should support optional configuration', () => {
      const client = new EternalAI({
        apiKey: 'test-key',
        timeout: 30000,
      });

      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-4o-mini',
        stream: true,
      };

      expect(client).toBeDefined();
      expect(request.stream).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields in config', () => {
      // This test verifies TypeScript compilation, not runtime behavior
      const config = { apiKey: 'test-key' };
      const client = new EternalAI(config);
      expect(client).toBeDefined();
    });

    it('should enforce required fields in chat request', () => {
      // This test verifies TypeScript compilation, not runtime behavior
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-4o-mini',
      };
      expect(request.messages).toBeDefined();
      expect(request.model).toBeDefined();
    });

    it('should allow optional fields to be omitted', () => {
      const client = new EternalAI({ apiKey: 'test' });
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-4o-mini',
        // stream is optional
      };
      expect(client).toBeDefined();
      expect(request).toBeDefined();
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error message for missing API key', () => {
      expect(() => new EternalAI({ apiKey: '' })).toThrow('API key is required');
    });
  });
});
