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

### Provider-Specific Features

The SDK automatically routes requests to the appropriate provider based on the model name prefix. All providers can be accessed through `chat.send()`:

#### Nano Banana - Gemini with Image Generation

```typescript
// Using nano-banana provider (supports streaming)
const result = await eai.chat.send({
  messages: [{ role: 'user', content: 'Describe this image' }],
  model: 'nano-banana/gemini-2.5-flash-image',
  stream: true, // Supports streaming
});

for await (const chunk of result) {
  console.log(chunk.choices[0].delta.content);
}
```

#### Tavily - AI-Powered Search

```typescript
// Using Tavily for search (non-streaming only)
const result = await eai.chat.send({
  messages: [{ role: 'user', content: 'What is the latest news about AI?' }],
  model: 'tavily/search',
  stream: false, // Tavily doesn't support streaming
});

console.log(result.choices[0].message.content);
// Returns search results with sources
```

#### Uncensored AI - Image & Video Generation

You can use Uncensored AI through `chat.send()` (simplified) or `uncensoredAI.generate()` (with advanced options):

**Option 1: Using `chat.send()` (Simplified)**

```typescript
// Text-to-Image Generation via chat.send()
const imageResult = await eai.chat.send({
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
  stream: false, // Uncensored AI doesn't support streaming
});

// Image URL is in the response content
const imageUrl = imageResult.choices[0].message.content;
console.log('Generated image:', imageUrl);
```

**Option 2: Using `uncensoredAI.generate()` (Advanced Options)**

```typescript
// Text-to-Image Generation with polling options
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
  lora_config: { 'style-lora': 1 },
  polling: {
    interval: 3000, // Poll every 3 seconds
    maxAttempts: 60, // Maximum 60 attempts
    onStatusUpdate: (status, attempt) => {
      console.log(`[${attempt}] Status: ${status}`);
    },
  },
}, 'uncensored-image');

const imageUrl = imageResult.result_url;
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
}, 'uncensored-video');

const videoUrl = videoResult.result_url;
console.log('Generated video:', videoUrl);
```

**Note:** 
- `chat.send()` with `uncensored-ai/` prefix automatically polls and returns a `ChatCompletionResponse` with the URL in `choices[0].message.content`
- `uncensoredAI.generate()` provides more control over polling options and returns `UncensoredResultResponse` with `result_url` directly
- Both methods automatically poll for results until completion

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

Send a chat completion request. Automatically routes to the appropriate provider based on the model name prefix.

**Provider Routing:**
- `openai/*`, `anthropic/*`, `xai/*`, `gemini/*`, `qwen/*` → Standard EternalAI API
- `nano-banana/*` → Nano Banana service (supports streaming)
- `tavily/*` → Tavily search service (non-streaming only)
- `uncensored-ai/*` → Uncensored AI service (non-streaming only, auto-polls)

**Parameters:**

- `request.messages` (ChatMessage[], required) - Array of chat messages
- `request.model` (string, required) - Model name with provider prefix (e.g., `"openai/gpt-5.1"`, `"nano-banana/gemini-2.5-flash-image"`, `"tavily/search"`, `"uncensored-ai/uncensored-image"`)
- `request.stream` (boolean, optional) - Enable streaming responses (default: `false`)
  - Note: `tavily/*` and `uncensored-ai/*` don't support streaming
- `request.image_config` (ImageConfigOptions, optional) - Image generation configuration for models that support image generation
  - `image_config.aspect_ratio` (string, optional) - Aspect ratio for generated images (e.g., `"16:9"`, `"1:1"`, `"9:16"`)

**Returns:**

- If `stream: true` → `AsyncIterable<ChatCompletionChunk>` (only for standard models and `nano-banana/*`)
- If `stream: false` → `ChatCompletionResponse`

**Examples:**

```typescript
// Standard model
const result = await eai.chat.send({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'openai/gpt-5.1',
});

// Nano Banana with streaming
const stream = await eai.chat.send({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'nano-banana/gemini-2.5-flash-image',
  stream: true,
});

// Tavily search
const search = await eai.chat.send({
  messages: [{ role: 'user', content: 'Latest AI news' }],
  model: 'tavily/search',
});

// Uncensored AI (auto-polls)
const image = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A sunset' }]
  }],
  model: 'uncensored-ai/uncensored-image',
});
```

#### `uncensoredAI.generate(request, endpoint)`

Generate images or videos using Uncensored AI with advanced options. Automatically polls for results until completion.

**Note:** For simpler usage, you can also use `chat.send()` with `uncensored-ai/uncensored-image` or `uncensored-ai/uncensored-video` model names.

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
- `endpoint` (string, optional) - Endpoint name: `'uncensored-image'` or `'uncensored-video'` (default: `'uncensored-image'`)

**Returns:**

- `UncensoredResultResponse` - Response with `result_url` containing the generated image/video URL

**Example:**

```typescript
const result = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A beautiful sunset' }]
  }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',
  lora_config: { 'style-lora': 1 }
}, 'uncensored-image');

const imageUrl = result.result_url;
```

**Note:** The method automatically polls for results with smart defaults (3s interval, 60 attempts for images; 5s interval, 120 attempts for videos).

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