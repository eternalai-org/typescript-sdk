# Flux Image Generation

Generate images from text and images using Flux AI models.

## Quick Start (via chat.send)

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

// ⚠️ Note: This can take 1-2 minutes as it waits for image generation to complete.
const result = await eai.chat.send({
  messages: [{
    role: 'user',
    content: 'A futuristic cityscape at sunset'
  }],
  model: 'flux/flux-2-pro',
  width: 1024,
  height: 1024,
});

console.log('Image URL:', result.choices[0].message.content);
```

## Manual Polling (Recommended for Browser Apps)

For better control over UI progress updates, use manual polling:

### Text-to-Image

```typescript
// Step 1: Start generation - returns immediately with polling_url
const task = await eai.flux.generate({
  messages: [{ role: 'user', content: 'A futuristic cityscape at sunset' }],
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
```

### Image-to-Image

```typescript
// Start generation with reference images
const task = await eai.flux.generate({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Transform this image into cyberpunk style' },
      { type: 'image_url', image_url: { url: 'https://example.com/image1.png' } },
      { type: 'image_url', image_url: { url: 'https://example.com/image2.png' } } // optional 2nd reference
    ]
  }],
  model: 'flux/flux-2-pro',
});

// Poll for result
const result = await eai.flux.pollResult(task.polling_url);
console.log('Image URL:', result.result?.sample);
```

## API Reference

### `flux.generate(request)`

Start image generation. Returns immediately with polling_url.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request.messages` | `ChatMessage[]` | Messages with text prompt and optional images |
| `request.model` | `string` | Model name: `flux/flux-2-pro` or `flux/flux-2` |
| `request.width` | `number` | Image width in pixels (default: `1024`) |
| `request.height` | `number` | Image height in pixels (default: `1024`) |
| `request.safety_tolerance` | `number` | Safety level 0-6 (default: `2`) |

**Returns:** `FluxGenerateResponse` with `polling_url`

### `flux.getResult(pollingUrl)`

Get current task status and result.

**Returns:** `FluxResultResponse` with:
- `status`: `'Pending'` | `'Running'` | `'Ready'` | `'Failed'`
- `result.sample`: Image URL (when Ready)

### `flux.pollResult(pollingUrl, options)`

Auto-poll until completion.

| Option | Type | Description |
|--------|------|-------------|
| `interval` | `number` | Poll interval in ms (default: `3000`) |
| `maxAttempts` | `number` | Max attempts (default: `60`) |
| `onStatusUpdate` | `function` | Callback: `(status, attempt) => void` |

**Returns:** `FluxResultResponse` with `result.sample`

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
