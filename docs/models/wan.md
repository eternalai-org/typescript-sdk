# Wan Video Generation

Generate videos from images using Wan AI models.

## Quick Start (via chat.send)

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

// ⚠️ Note: This can take 5-10 minutes as it waits for video generation to complete.
const result = await eai.chat.send({
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

console.log('Video URL:', result.choices[0].message.content);
```

## Manual Polling (Recommended for Browser Apps)

For better control over UI progress updates, use manual polling:

```typescript
// Step 1: Start generation - returns immediately with task_id
const task = await eai.wan.generate(
  {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'A stylized artwork coming to life' },
        { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
      ]
    }],
    model: 'wan/wan2.5-i2v-preview',
    resolution: '480P',  // optional: '480P', '720P', '1080P'
    duration: 5,         // optional: video duration in seconds
    prompt_extend: true, // optional: enhance prompt
    audio: true,         // optional: include audio
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
  interval: 5000,       // poll every 5 seconds
  maxAttempts: 120,     // max 10 minutes
  onStatusUpdate: (status, attempt) => console.log(`[${attempt}] ${status}`),
});

console.log('Video URL:', finalResult.output?.video_url);
```

## API Reference

### `wan.generate(request)`

Start video generation. Returns immediately with task_id.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request.messages` | `ChatMessage[]` | Messages with text prompt and image URL |
| `request.model` | `string` | Model name: `wan/wan2.5-i2v-preview` |
| `request.resolution` | `string` | `480P`, `720P`, or `1080P` (default: `480P`) |
| `request.duration` | `number` | Video duration in seconds (default: `10`) |
| `request.prompt_extend` | `boolean` | Enhance prompt (default: `true`) |
| `request.audio` | `boolean` | Include audio (default: `true`) |

**Returns:** `WanTaskResponse` with `output.task_id`

### `wan.getResult(taskId)`

Get current task status and result.

**Returns:** `WanResultResponse` with:
- `output.task_status`: `'PENDING'` | `'RUNNING'` | `'SUCCEEDED'` | `'FAILED'`
- `output.video_url`: Video URL (when succeeded)

### `wan.pollResult(taskId, options)`

Auto-poll until completion.

| Option | Type | Description |
|--------|------|-------------|
| `interval` | `number` | Poll interval in ms (default: `5000`) |
| `maxAttempts` | `number` | Max attempts (default: `120`) |
| `onStatusUpdate` | `function` | Callback: `(status, attempt) => void` |

**Returns:** `WanResultResponse` with `output.video_url`

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
