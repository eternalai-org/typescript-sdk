import { Chat } from './services/chat';
import type { EternalAPIConfig } from './types';

export class EternalAPI {
  public readonly chat: Chat;
  private readonly config: EternalAPIConfig;

  constructor(config: EternalAPIConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.config = config;
    this.chat = new Chat(this.config);
  }
}
