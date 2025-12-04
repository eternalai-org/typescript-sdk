# Bun/Node.js Example

This example demonstrates how to use @eternalai-org/sdk with Bun (or Node.js).

## Installation

From this directory:

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

## Usage

### Streaming Example

```bash
# Using Bun (recommended)
bun run streaming

# Or using npm
npm run streaming
```

### Non-Streaming Example

```bash
# Using Bun (recommended)
bun run non-streaming

# Or using npm
npm run non-streaming
```

### Image Generation Example

For models that support image generation, you can use the `image_config` option:

```bash
# Using Bun (recommended)
bun run image-generation

# Or using npm
npm run image-generation
```

## Environment Variables

Create a `.env` file in this directory:

```env
ETERNALAI_API_KEY=your-api-key-here
```

## Code Examples

See the source files:
- `streaming.ts` - Shows streaming chat completions
- `non-streaming.ts` - Shows regular chat completions
- `image-generation.ts` - Shows image generation with `image_config` option
