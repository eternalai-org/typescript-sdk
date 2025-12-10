# Uncensored AI Image/Video Generation

Generate images and videos using Uncensored AI models.

## Quick Start (via chat.send)

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

// ⚠️ Note: This can take 1-5 minutes as it waits for generation to complete.
const result = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A beautiful sunset over the ocean' }]
  }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',
});

console.log('Image URL:', result.choices[0].message.content);
```

## Manual Polling (Recommended for Browser Apps)

For better control over UI progress updates, use manual polling:

### Image Generation

```typescript
// Step 1: Start generation - returns immediately with request_id
const task = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'A beautiful sunset over the ocean' },
      // { type: 'image_url', image_url: { url: 'https://...' } } // optional for i2i
    ]
  }],
  model: 'uncensored-ai/uncensored-image',
  type: 'new',           // 'new' for t2i, 'edit' for i2i
  lora_config: { 'style-lora': 1 }, // optional
});

console.log('Task started:', task.request_id);

// Step 2: Poll for result
const result = await eai.uncensoredAI.pollResult(task.request_id, 'uncensored-image', {
  interval: 3000,
  maxAttempts: 60,
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});

console.log('Image URL:', result.result_url);
```

### Video Generation

```typescript
// Step 1: Start video generation
const task = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A smooth animation of clouds moving' }]
  }],
  model: 'uncensored-ai/uncensored-video',
  type: 'new',
  is_magic_prompt: true,
  duration: 5,
  audio: true,
});

console.log('Task started:', task.request_id);

// Step 2: Poll for video result (takes longer)
const result = await eai.uncensoredAI.pollResult(task.request_id, 'uncensored-video', {
  interval: 5000,
  maxAttempts: 120,
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});

console.log('Video URL:', result.result_url);
```

## API Reference

### `uncensoredAI.generate(request)`

Start image/video generation. Returns immediately with request_id.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request.messages` | `ChatMessage[]` | Messages with text prompt and optional image |
| `request.model` | `string` | `uncensored-ai/uncensored-image` or `uncensored-ai/uncensored-video` |
| `request.type` | `string` | `'new'` for text-to-image, `'edit'` for image-to-image |
| `request.lora_config` | `object` | LoRA weights (optional) |
| `request.image_config` | `object` | Image config (optional) |
| `request.video_config` | `object` | Video config (optional) |
| `request.is_magic_prompt` | `boolean` | Enable magic prompt (default: `true`) |
| `request.duration` | `number` | Video duration in seconds (default: `5`) |
| `request.audio` | `boolean` | Include audio (default: `true`) |

**Returns:** `UncensoredGenerateResponse` with `request_id`

### `uncensoredAI.getResult(requestId, endpoint)`

Get current task status and result.

**Returns:** `UncensoredResultResponse` with:
- `status`: `'pending'` | `'processing'` | `'success'` | `'failed'`
- `result_url`: Generated image/video URL (when succeeded)

### `uncensoredAI.pollResult(requestId, endpoint, options)`

Auto-poll until completion.

| Option | Type | Description |
|--------|------|-------------|
| `interval` | `number` | Poll interval in ms (default: `3000` for image, `5000` for video) |
| `maxAttempts` | `number` | Max attempts (default: `60` for image, `120` for video) |
| `onStatusUpdate` | `function` | Callback: `(status, attempt) => void` |

**Returns:** `UncensoredResultResponse` with `result_url`

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
