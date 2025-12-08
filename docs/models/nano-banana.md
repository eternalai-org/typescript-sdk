## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'A beautiful mountain landscape at dawn' },
      // { type: 'image_url', image_url: { url: 'https://example.com/photo.png' } } // optional for i2i
    ]
  }],
  model: 'nano-banana/gemini-2.5-flash-image',
  // image_config: {
  //   aspect_ratio: '16:9', // optional
  // },
});

console.log('Image URL:', result.choices[0].message.content);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
