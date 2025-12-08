## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
  messages: [
    // { role: 'system', content: 'You are a helpful assistant.' }, // optional
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe this image in detail' },
        { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
        // Add more image_url for multi-image understanding // optional
      ]
    }
  ],
  model: 'gemini/gemini-pro-vision',
  // stream: false, // optional, default: true
});

// Streaming response (default)
for await (const chunk of result) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}

// Non-streaming response (when stream: false)
// console.log(result.choices[0].message.content);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
