## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.wan.generate(
  {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'A stylized artwork coming to life' },
        { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
      ]
    }],
    model: 'wan/wan2.5-i2v-preview',
    // resolution: '480P', // optional: '480P', '720P', '1080P'
    // prompt_extend: true, // optional
  },
  'wan2.5-i2v-preview',
  // {
  //   interval: 5000, // optional, default: 5000
  //   maxAttempts: 120, // optional, default: 120
  //   onStatusUpdate: (status, attempt) => { // optional
  //     console.log(`[${attempt}] Status: ${status}`);
  //   },
  // }
);

console.log('Image URL:', result.output?.results?.[0]?.url);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
