import { Chat } from './services/chat';
import type { EternalAIConfig } from './types';

export class EternalAI {
  public readonly chat: Chat;
  private readonly config: EternalAIConfig;

  constructor(config: EternalAIConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.config = config;
    this.chat = new Chat(this.config);
  }
}
