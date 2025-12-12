# Mistral AI Chat

Use Mistral AI models for chat completions via the EternalAI platform.

## Quick Start

```typescript
const stream = await eai.chat.send({
  messages: [
    { role: 'user', content: 'Who is the most renowned French painter?' }
  ],
  model: 'mistralai/devstral-2512',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## API Reference

### `chat.send(request)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | `ChatMessage[]` | Array of messages with role and content |
| `model` | `string` | Model name with `mistralai/` prefix |
| `stream` | `boolean` | Enable streaming (default: `true`) |

**Returns:** `ChatCompletionResponse` or `AsyncIterable<ChatCompletionChunk>` (if streaming)

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
