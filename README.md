# @eternalai-org/sdk

Official TypeScript SDK for **EternalAI** - The next-generation API platform for AI applications. Access hundreds of AI models through one unified interface with cashback rewards on every API call.

[![npm version](https://img.shields.io/npm/v/@eternalai-org/sdk.svg)](https://www.npmjs.com/package/@eternalai-org/sdk)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun)](https://bun.sh)
[![Yarn](https://img.shields.io/badge/Yarn-1.22+-2C8EBB?logo=yarn&logoColor=white)](https://yarnpkg.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Quick Start

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
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

### Image Generation Example

For models that support image generation, you can configure image options:

```typescript
const result = await eai.chat.send({
  messages: [
    {
      role: 'user',
      content: 'Generate a beautiful landscape',
    },
  ],
  model: 'image-generation-model',
  image_config: {
    aspect_ratio: '16:9', // Optional: '16:9', '1:1', '9:16', etc.
  },
  stream: false,
});

console.log(result.choices[0].message.content);
```

### Uncensored AI - Image & Video Generation

Generate images and videos using Uncensored AI. The SDK automatically polls for results until completion:

```typescript
// Text-to-Image Generation
const imageResult = await eai.uncensoredAI.generate({
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'A beautiful sunset over the ocean with vibrant colors',
        },
      ],
    },
  ],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',
  polling: {
    interval: 3000, // Poll every 3 seconds
    maxAttempts: 60, // Maximum 60 attempts
    onStatusUpdate: (status, attempt) => {
      console.log(`[${attempt}] Status: ${status}`);
    },
  },
});

// Image URL is in the response content
const imageUrl = imageResult.choices[0].message.content;
console.log('Generated image:', imageUrl);
```

```typescript
// Video Generation
const videoResult = await eai.uncensoredAI.generate({
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Create a smooth animation',
        },
      ],
    },
  ],
  model: 'uncensored-ai/uncensored-video',
  type: 'new',
  is_magic_prompt: true,
  duration: 5,
  audio: false,
  polling: {
    interval: 5000, // Video takes longer, poll every 5 seconds
    maxAttempts: 120,
  },
});

const videoUrl = videoResult.choices[0].message.content;
console.log('Generated video:', videoUrl);
```

**Note:** The `generate()` method automatically polls for results. Set `polling: false` to disable auto-polling and get the request_id immediately.

## Installation

Install from npm:

```bash
# Using Bun (recommended)
bun add @eternalai-org/sdk

# Using npm
npm install @eternalai-org/sdk

# Using yarn
yarn add @eternalai-org/sdk

# Using pnpm
pnpm add @eternalai-org/sdk
```

Or install directly from GitHub:

```bash
# Using Bun
bun add git+https://github.com/eternalai-org/sdk.git

# Using npm
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

- **OpenAI** (`openai/*`) - GPT-4, GPT-3.5, and more
- **Claude** (`anthropic/*`) - Anthropic's Claude models
- **Grok** (`xai/*`) - xAI's Grok models
- **Gemini** (`gemini/*`) - Google's Gemini models
- **Qwen** (`qwen/*`) - Alibaba's Qwen models
- **Tavily** (`tavily/*`) - AI-powered search engine
- **Uncensored AI** (`uncensored-ai/*`) - Image/video generation (`uncensored-image`, `uncensored-video`)
- **Nano Banana** (`nano-banana/*`) - Custom Gemini endpoint with image generation
- **And more** - Wan, and growing

**Model Format:** Use `provider/model-name` format, e.g., `openai/gpt-5.1`, `uncensored-ai/uncensored-image`, `uncensored-ai/uncensored-video`

## API Reference

### `EternalAI`

Main SDK client class.

#### Constructor

```typescript
new EternalAI(config: EternalAIConfig)
```

**Parameters:**

- `config.apiKey` (string, required) - Your EternalAI API key
- `config.timeout` (number, optional) - Request timeout in milliseconds

**Example:**

```typescript
const client = new EternalAI({
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
- `request.image_config` (ImageConfigOptions, optional) - Image generation configuration for models that support image generation
  - `image_config.aspect_ratio` (string, optional) - Aspect ratio for generated images (e.g., `"16:9"`, `"1:1"`, `"9:16"`)

**Returns:**

- If `stream: true` → `AsyncIterable<ChatCompletionChunk>`
- If `stream: false` → `ChatCompletionResponse`

#### `uncensoredAI.generate(request, endpoint)`

Generate images or videos using Uncensored AI. Automatically polls for results until completion.

**Parameters:**

- `request.messages` (ChatMessage[], required) - Array of chat messages with content parts
- `request.model` (string, required) - Model name: `"uncensored-ai/uncensored-image"` or `"uncensored-ai/uncensored-video"`
- `request.type` (`'new'` | `'edit'`, optional) - Generation type: `'new'` for text-to-image/video, `'edit'` for image-to-image/video
- `request.lora_config` (Record<string, number>, optional) - LoRA configuration for image generation
- `request.image_config` (string | Record<string, any>, optional) - Image configuration for image-to-image
- `request.video_config` (string | Record<string, any>, optional) - Video configuration
- `request.is_magic_prompt` (boolean, optional) - Enable magic prompt for video
- `request.duration` (number, optional) - Video duration in seconds
- `request.audio` (boolean, optional) - Enable audio in video
- `request.polling` (PollingOptions | false, optional) - Polling configuration. Default: auto-poll with smart defaults
  - `polling.interval` (number, optional) - Polling interval in ms (default: 3000 for image, 5000 for video)
  - `polling.maxAttempts` (number, optional) - Maximum polling attempts (default: 60 for image, 120 for video)
  - `polling.onStatusUpdate` (function, optional) - Callback for status updates: `(status: string, attempt: number) => void`
- `endpoint` (string, optional) - Endpoint name: `'uncensored-image'` or `'uncensored-video'` (default: `'uncensored-image'`)

**Returns:**

- `ChatCompletionResponse` - Response with generated URL in `choices[0].message.content`

**Example:**

```typescript
const result = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A beautiful sunset' }]
  }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',
  polling: {
    onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`)
  }
}, 'uncensored-image');

const imageUrl = result.choices[0].message.content;
```

**Note:** The method automatically polls for results. Set `polling: false` to disable auto-polling and get the request_id immediately.

## TypeScript Support

This SDK is written in TypeScript and includes comprehensive type definitions. All types are exported for your convenience:

```typescript
import type {
  EternalAIConfig,
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
} from '@eternalai-org/sdk';
```

## Error Handling

```typescript
try {
  const result = await eai.chat.send({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'openai/gpt-5.1',
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Browser vs Node.js vs Bun

This SDK works in multiple environments:

- **Bun** - Full support (v1.0.0+) - Recommended for best performance
- **Node.js** - Full support (v18+)
- **Browser** - Requires a bundler (Webpack, Vite, etc.) that supports ESM

## Testing

This SDK includes a comprehensive test suite. To run the tests:

```bash
# Using Bun (recommended)
bun test
bun run test:watch
bun run test:coverage

# Using npm
npm test
npm run test:watch
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
- 📦 **npm Package**: [npmjs.com/package/@eternalai-org/sdk](https://www.npmjs.com/package/@eternalai-org/sdk)
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