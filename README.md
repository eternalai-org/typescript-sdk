# @eternalai-org/typescript-sdk

Official TypeScript SDK for **EternalAI** - The next-generation API platform for AI applications. Access hundreds of AI models through one unified interface with cashback rewards on every API call.

[![npm version](https://img.shields.io/npm/v/@eternalai-org/typescript-sdk.svg)](https://www.npmjs.com/package/@eternalai-org/typescript-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Quick Start

```typescript
import { EternalAPI } from '@eternalai-org/typescript-sdk';

const eternalApi = new EternalAPI({ apiKey: 'your-api-key' });

const result = await eternalApi.chat.send({
  messages: [
    {
      role: 'user',
      content: 'Hello, how are you?',
    },
  ],
  model: 'openai/gpt-5.1',
  stream: true, // optional
});

for await (const chunk of result) {
  console.log(chunk.choices[0].delta.content);
}
```

## Installation

Install from npm:

```bash
# Using npm
npm install @eternalai-org/typescript-sdk

# Using yarn
yarn add @eternalai-org/typescript-sdk

# Using pnpm
pnpm add @eternalai-org/typescript-sdk
```

Or install directly from GitHub:

```bash
npm install git+https://github.com/eternalai-org/sdk.git
```

## Getting Your API Key

1. Visit [eternalai.org/api/build](https://eternalai.org/api/build)
2. Buy credits (can be used with any AI model)
3. Get your API key from the dashboard
4. Start building and earning cashback!

## Why EternalAI?

- 🚀 **Build Faster** - One API key, one unified interface for hundreds of AI models and APIs
- 💰 **Build Cheaper** - Earn cashback on every API call — use more, earn more (up to 4.96% rewards)
- ♾️ **Build Unlimited** - No rate limits, no restrictions — scale from OpenAI to any AI provider effortlessly
- 🌐 **Multiple AI Providers** - Access OpenAI, Claude, Grok, Gemini, and more through a single API
- 💳 **Credit System** - Buy credits once, use with any AI model or API service

## SDK Features

- 📘 **TypeScript First** - Full type safety and IntelliSense support
- 🌊 **Streaming Support** - Real-time responses using async iterators
- 🎯 **OpenAI Compatible** - Drop-in replacement with familiar message format
- 📦 **Dual Module** - ESM and CommonJS support for maximum compatibility
- ⚡️ **Lightweight** - Minimal dependencies, optimized bundle size
- ✅ **Well Tested** - Comprehensive test suite with 100% code coverage
- 🔒 **Type Safe** - Strict TypeScript compilation with full type inference
- 🛡️ **Error Handling** - Robust error handling with descriptive messages

## Supported AI Providers

Access multiple AI providers through one unified API:


- **Uncensored AI** - Open and uncensored models
- **OpenAI** - GPT-4, GPT-3.5, and more
- **Claude** - Anthropic's Claude models
- **Grok** - xAI's Grok models
- **Gemini** - Google's Gemini models
- **And more** - Tavily, Qwen, Wan, Nano Banana, and growing

## API Reference

### `EternalAPI`

Main SDK client class.

#### Constructor

```typescript
new EternalAPI(config: EternalAPIConfig)
```

**Parameters:**

- `config.apiKey` (string, required) - Your EternalAI API key
- `config.timeout` (number, optional) - Request timeout in milliseconds

**Example:**

```typescript
const client = new EternalAPI({
  apiKey: 'your-api-key',
  timeout: 30000, // 30 seconds
});
```

#### `chat.send(request)`

Send a chat completion request.

**Parameters:**

- `request.messages` (ChatMessage[], required) - Array of chat messages
- `request.model` (string, required) - Model name (e.g., `"openai/gpt-5.1"`)
- `request.stream` (boolean, optional) - Enable streaming responses (default: `false`)

**Returns:**

- If `stream: true` → `AsyncIterable<ChatCompletionChunk>`
- If `stream: false` → `ChatCompletionResponse`

## TypeScript Support

This SDK is written in TypeScript and includes comprehensive type definitions. All types are exported for your convenience:

```typescript
import type {
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
} from '@eternalai-org/typescript-sdk';
```

## Error Handling

```typescript
try {
  const result = await eternalApi.chat.send({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'openai/gpt-5.1',
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Browser vs Node.js

This SDK works in both Node.js and browser environments:

- **Node.js** - Full support (v18+)
- **Browser** - Requires a bundler (Webpack, Vite, etc.) that supports ESM

## Testing

This SDK includes a comprehensive test suite. To run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

The test suite covers:
- ✅ Client initialization and configuration
- ✅ Streaming and non-streaming chat completions
- ✅ Error handling and edge cases
- ✅ TypeScript type definitions
- ✅ Integration and end-to-end flows

See [tests/README.md](./tests/README.md) for detailed testing documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT - see [LICENSE](./LICENSE) file for details.

## Support

For issues and questions:
- 📦 **npm Package**: [npmjs.com/package/@eternalai-org/typescript-sdk](https://www.npmjs.com/package/@eternalai-org/typescript-sdk)
- 🌐 **Website**: [eternalai.org](https://eternalai.org)
- 📖 **API Platform**: [eternalai.org/api/build](https://eternalai.org/api/build)
- 🐛 **GitHub Issues**: [github.com/eternalai-org/sdk/issues](https://github.com/eternalai-org/sdk/issues)
- 📚 **Documentation**: [github.com/eternalai-org/sdk](https://github.com/eternalai-org/sdk)

## Pricing

EternalAI offers competitive pricing with cashback rewards:
- 💳 **Credit-based system** - Buy credits, use with any AI model
- 💰 **Earn cashback** - Get rewards on every API call (up to 4.96%)
- ♾️ **No rate limits** - Scale without restrictions
- 🎯 **Pay as you go** - Only pay for what you use

Visit [eternalai.org/api/build](https://eternalai.org/api/build) for detailed pricing.