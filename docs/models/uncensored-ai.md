## Code Example (Image)

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'A beautiful sunset over the ocean' },
      // { type: 'image_url', image_url: { url: 'https://example.com/reference.png' } } // optional for i2i
    ]
  }],
  model: 'uncensored-ai/uncensored-image',
  // type: 'new', // optional: 'new' for t2i, 'edit' for i2i
  // lora_config: { 'style-lora': 1 }, // optional
  // polling: {
  //   interval: 3000, // optional, default: 3000
  //   maxAttempts: 60, // optional, default: 60
  //   onStatusUpdate: (status, attempt) => { // optional
  //     console.log(`[${attempt}] Status: ${status}`);
  //   },
  // },
}, 'uncensored-image');

console.log('Image URL:', result.result_url);
```

## Code Example (Video)

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.uncensoredAI.generate({
  messages: [{
    role: 'user',
    content: [{ type: 'text', text: 'A smooth animation of clouds moving' }]
  }],
  model: 'uncensored-ai/uncensored-video',
  // type: 'new', // optional
  // is_magic_prompt: true, // optional
  // duration: 5, // optional, seconds
  // audio: false, // optional
  // polling: {
  //   interval: 5000, // optional, default: 5000
  //   maxAttempts: 120, // optional, default: 120
  //   onStatusUpdate: (status, attempt) => { // optional
  //     console.log(`[${attempt}] Status: ${status}`);
  //   },
  // },
}, 'uncensored-video');

console.log('Video URL:', result.result_url);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
