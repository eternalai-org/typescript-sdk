import { describe, it, expect } from 'vitest';
import { EternalAPI } from '../src/client';
import { Chat } from '../src/services/chat';

describe('EternalAPI Client', () => {
  describe('Constructor', () => {
    it('should initialize with valid API key', () => {
      const client = new EternalAPI({ apiKey: 'test-api-key' });
      expect(client).toBeDefined();
      expect(client.chat).toBeInstanceOf(Chat);
    });

    it('should throw error when API key is missing', () => {
      expect(() => new EternalAPI({ apiKey: '' })).toThrow('API key is required');
    });

    it('should throw error when API key is undefined', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => new EternalAPI({})).toThrow('API key is required');
    });

    it('should accept optional timeout configuration', () => {
      const client = new EternalAPI({
        apiKey: 'test-api-key',
        timeout: 30000,
      });
      expect(client).toBeDefined();
    });
  });

  describe('Properties', () => {
    it('should have chat property', () => {
      const client = new EternalAPI({ apiKey: 'test-api-key' });
      expect(client.chat).toBeDefined();
      expect(client.chat).toBeInstanceOf(Chat);
    });

    it('should mark config as private in TypeScript', () => {
      const client = new EternalAPI({ apiKey: 'test-api-key' });
      // Note: TypeScript private is compile-time only, so we verify it's not part of the public API
      // @ts-expect-error - config is private and should not be accessed
      const config = client.config;
      expect(config).toBeDefined(); // Runtime: still accessible but marked private
    });
  });
});

