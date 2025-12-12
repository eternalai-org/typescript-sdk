# GLM (ChatGLM) Chat

Use GLM models for chat completions via the EternalAI platform.

## Quick Start

```typescript
const stream = await eai.chat.send({
  messages: [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Tell me a short story.' }
  ],
  model: 'glm/glm-4.5-flash',
  stream: true,
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
| `model` | `string` | Model name with `glm/` prefix |
| `stream` | `boolean` | Enable streaming (default: `true`) |

**Returns:** `ChatCompletionResponse` or `AsyncIterable<ChatCompletionChunk>` (if streaming)

## Installation

```bash
bun add @eternalai-org/sdk
# or
npm install @eternalai-org/sdk
```
