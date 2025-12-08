## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
  messages: [
    // { role: 'system', content: 'You are a helpful assistant.' }, // optional
    { role: 'user', content: 'Hello, how are you?' }
  ],
  model: 'openai/gpt-5.1',
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
