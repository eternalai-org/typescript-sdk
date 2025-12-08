## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'A futuristic cityscape at sunset' },
      // { type: 'image_url', image_url: { url: 'https://example.com/image1.png' } }, // optional for i2i
      // { type: 'image_url', image_url: { url: 'https://example.com/image2.png' } }, // optional for multi-image
      // { type: 'image_url', image_url: { url: 'https://example.com/image3.png' } }  // optional for multi-image
    ]
  }],
  model: 'flux/flux-pro',
});

console.log('Image URL:', result.choices[0].message.content);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
