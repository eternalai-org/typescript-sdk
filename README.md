# @eternalai-org/sdk

Official TypeScript SDK for **EternalAI** - Access hundreds of AI models through one unified interface.

[![npm version](https://img.shields.io/npm/v/@eternalai-org/sdk.svg)](https://www.npmjs.com/package/@eternalai-org/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Installation

```bash
npm install @eternalai-org/sdk
# or
yarn add @eternalai-org/sdk
# or
bun add @eternalai-org/sdk
```

## Quick Start

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });
```

### Chat Completion

```typescript
// Streaming
const stream = await eai.chat.send({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'openai/gpt-5.1',
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}

// Non-streaming
const response = await eai.chat.send({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'openai/gpt-5.1',
});
console.log(response.choices[0].message.content);
```

### Image Generation

```typescript
// Flux - Text-to-Image
const image = await eai.chat.send({
  messages: [{ role: 'user', content: 'A futuristic city at sunset' }],
  model: 'flux/flux-2-pro',
  width: 1920,
  height: 1080,
});
console.log('Image URL:', image.choices[0].message.content);

// Flux - Image-to-Image (with reference)
const edited = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Transform into cyberpunk style' },
      { type: 'image_url', image_url: { url: 'https://example.com/photo.jpg' } }
    ]
  }],
  model: 'flux/flux-2-pro',
});

// Flux - Blend 2 images
const blended = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Blend subject with style reference' },
      { type: 'image_url', image_url: { url: 'https://example.com/subject.jpg' } },
      { type: 'image_url', image_url: { url: 'https://example.com/style.jpg' } }
    ]
  }],
  model: 'flux/flux-2-pro',
});

// Uncensored AI - Text-to-Image
const uncensored = await eai.chat.send({
  messages: [{ role: 'user', content: [{ type: 'text', text: 'A sunset' }] }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',                        // 'new' = text-to-image, 'edit' = image-to-image
  lora_config: { 'style-lora': 1 },   // optional LoRA config
});

// Uncensored AI - Image-to-Image
const edited = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Transform this image' },
      { type: 'image_url', image_url: { url: 'https://example.com/input.jpg', filename: 'input.jpg' } }
    ]
  }],
  model: 'uncensored-ai/uncensored-image',
  type: 'edit',
  image_config: { loras: ['skin', 'lightning'] },
});
```

### Video Generation

```typescript
// Wan - Image-to-Video (via chat.send - auto polls)
// ⚠️ Note: This can take 5-10 minutes as it waits for video generation to complete.
// For browser apps, consider using wan.generate() + getResult() for manual polling with UI updates.
const wanVideo = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Animate this character' },
      { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
    ]
  }],
  model: 'wan/wan2.5-i2v-preview',
  resolution: '480P',
  duration: 5,
});
console.log('Video URL:', wanVideo.choices[0].message.content);

// Wan - Direct usage (manual polling - recommended for browser)
const task = await eai.wan.generate({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Animate this character' },
      { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
    ]
  }],
  model: 'wan/wan2.5-i2v-preview',
  resolution: '480P',
  duration: 5,
});

// Get task_id and poll manually (good for UI progress updates)
const taskId = task.output?.task_id;
const result = await eai.wan.getResult(taskId);
if (result.output?.task_status === 'SUCCEEDED') {
  console.log('Video URL:', result.output.video_url);
}

// Uncensored AI - Video generation
const uncensoredVideo = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Animate this image' },
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
    ]
  }],
  model: 'uncensored-ai/uncensored-video',
  type: 'edit',
  is_magic_prompt: true,
  duration: 5,
  audio: true,
  video_config: { loras: ['flip', 'nsfw'] },
});
```

### AI Search

```typescript
const search = await eai.chat.send({
  messages: [{ role: 'user', content: 'Latest AI news 2024' }],
  model: 'tavily/search',
});
console.log(search.choices[0].message.content);
```

---

## Supported Providers

| Provider | Model Format | Type |
|----------|-------------|------|
| OpenAI | `openai/gpt-5.1` | Chat |
| Claude | `anthropic/claude-*` | Chat |
| Gemini | `gemini/gemini-*` | Chat |
| Grok | `xai/grok-*` | Chat |
| Qwen | `qwen/qwen-*` | Chat |
| Flux | `flux/flux-2-pro` | Image |
| Uncensored AI | `uncensored-ai/uncensored-image` | Image |
| Uncensored AI | `uncensored-ai/uncensored-video` | Video |
| Wan | `wan/wan2.5-i2v-preview` | Video |
| Tavily | `tavily/search` | Search |
| Nano Banana | `nano-banana/gemini-*` | Chat + Image |

---

## Advanced Usage

### Flux - Manual Polling (Recommended for Browser)

```typescript
// Step 1: Start generation - returns immediately with polling_url
const task = await eai.flux.generate({
  messages: [{ role: 'user', content: 'A mountain landscape' }],
  model: 'flux/flux-2-pro',
  width: 1024,
  height: 1024,
  safety_tolerance: 2,
});
console.log('Task started:', task.polling_url);

// Step 2: Poll for result
const result = await eai.flux.pollResult(task.polling_url, {
  interval: 3000,
  maxAttempts: 60,
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});
console.log('Image URL:', result.result?.sample);

// Or check status manually
const status = await eai.flux.getResult(task.polling_url);
if (status.status === 'Ready') {
  console.log('Image URL:', status.result?.sample);
}
```

### Wan - Manual Polling (Recommended for Browser)

```typescript
// Step 1: Start generation - returns immediately with task_id
const task = await eai.wan.generate(
  {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Animate this character...' },
        { type: 'image_url', image_url: { url: 'https://...' } }
      ]
    }],
    model: 'wan/wan2.5-i2v-preview',
    resolution: '480P',
    duration: 5,
  }
);
console.log('Task started:', task.output?.task_id);

// Step 2a: Poll manually (good for custom UI updates)
const taskId = task.output?.task_id;
let result = await eai.wan.getResult(taskId);
while (result.output?.task_status === 'RUNNING' || result.output?.task_status === 'PENDING') {
  await new Promise(r => setTimeout(r, 5000)); // wait 5s
  result = await eai.wan.getResult(taskId);
  console.log('Status:', result.output?.task_status);
}
console.log('Video URL:', result.output?.video_url);

// Step 2b: Or use pollResult for auto-polling with callbacks
const finalResult = await eai.wan.pollResult(taskId, {
  interval: 5000,
  maxAttempts: 120,
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});
console.log('Video URL:', finalResult.output?.video_url);
```

### Uncensored AI - Manual Polling (Recommended for Browser)

```typescript
// Step 1: Start generation - returns immediately with request_id
const task = await eai.uncensoredAI.generate({
  messages: [{ role: 'user', content: [{ type: 'text', text: 'A sunset' }] }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',
  lora_config: { 'style-lora': 1 },
});
console.log('Task started:', task.request_id);

// Step 2: Poll for result
const result = await eai.uncensoredAI.pollResult(task.request_id, 'uncensored-image', {
  interval: 3000,
  maxAttempts: 60,
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});
console.log('URL:', result.result_url);

// Or check status manually
const status = await eai.uncensoredAI.getResult(task.request_id, 'uncensored-image');
if (status.status === 'success') {
  console.log('URL:', status.result_url);
}
```

---

## API Reference

### `new EternalAI(config)`

```typescript
const eai = new EternalAI({
  apiKey: 'your-api-key',
  timeout: 30000, // optional, in ms
});
```

### `eai.chat.send(request)`

Universal method for all providers. Auto-routes based on model prefix.

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | `ChatMessage[]` | Array of messages |
| `model` | `string` | Provider/model (e.g., `openai/gpt-5.1`) |
| `stream` | `boolean` | Enable streaming (default: `false`) |
| `width` | `number` | Image width (Flux only) |
| `height` | `number` | Image height (Flux only) |
| `safety_tolerance` | `number` | 0-6 (Flux only, default: 2) |
| `resolution` | `string` | `480P`/`720P`/`1080P` (Wan only) |
| `duration` | `number` | Video duration in seconds (Wan only) |

**Returns:** `ChatCompletionResponse` or `AsyncIterable<ChatCompletionChunk>` (if streaming)

### `eai.flux.generate(request)`

Start image generation. Returns immediately with polling_url.

**Returns:** `FluxGenerateResponse` with `polling_url`

### `eai.flux.getResult(pollingUrl)`

Get current task status and result.

**Returns:** `FluxResultResponse` with `status` and `result.sample`

### `eai.flux.pollResult(pollingUrl, pollingOptions)`

Auto-poll until completion with callbacks.

**Returns:** `FluxResultResponse` with `result.sample` (image URL)

### `eai.wan.generate(request)`

Start video generation. Returns immediately with task_id.

**Returns:** `WanTaskResponse` with `output.task_id`

### `eai.wan.getResult(taskId)`

Get current task status and result.

**Returns:** `WanResultResponse` with `output.task_status` and `output.video_url`

### `eai.wan.pollResult(taskId, pollingOptions)`

Auto-poll until completion with callbacks.

**Returns:** `WanResultResponse` with `output.video_url` (video URL)

### `eai.uncensoredAI.generate(request)`

Start image/video generation. Returns immediately with request_id.

**Returns:** `UncensoredGenerateResponse` with `request_id`

### `eai.uncensoredAI.getResult(requestId, endpoint)`

Get current task status and result.

**Returns:** `UncensoredResultResponse` with `status` and `result_url`

### `eai.uncensoredAI.pollResult(requestId, endpoint, pollingOptions)`

Auto-poll until completion with callbacks.

**Returns:** `UncensoredResultResponse` with `result_url`

---

## TypeScript

All types are exported:

```typescript
import type {
  EternalAIConfig,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from '@eternalai-org/sdk';
```

---

## Error Handling

```typescript
try {
  const result = await eai.chat.send({ ... });
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## Environment Support

- **Node.js** 18+
- **Bun** 1.0+
- **Browser** (with bundler)

---

## Links

- 📦 [npm](https://www.npmjs.com/package/@eternalai-org/sdk)
- 🌐 [EternalAI Platform](https://eternalai.org/api/build)
- 🐛 [GitHub Issues](https://github.com/eternalai-org/typescript-sdk/issues)

## License

MIT