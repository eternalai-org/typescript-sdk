## Code Example

```typescript
import { EternalAI } from '@eternalai-org/sdk';

const eai = new EternalAI({ apiKey: 'your-api-key' });

const result = await eai.chat.send({
  messages: [{ role: 'user', content: 'Latest news about AI in 2024' }],
  model: 'tavily/search',
});

console.log('Search results:', result.choices[0].message.content);
```

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
