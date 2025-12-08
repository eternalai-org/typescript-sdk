# Tests

## Unit Tests (mocked, no API calls)

```bash
npm test
```

## Live API Tests

Individual tests in `tests/live/` - run specific tests to save API costs.

### Run Single Test

```bash
# Chat
npx ts-node tests/live/chat-streaming.live.ts
npx ts-node tests/live/chat-nonstreaming.live.ts

# Flux Image
npx ts-node tests/live/flux-t2i.live.ts      # text-to-image
npx ts-node tests/live/flux-i2i.live.ts      # image-to-image
npx ts-node tests/live/flux-blend.live.ts    # blend 2 images

# Wan Video
npx ts-node tests/live/wan-i2v.live.ts       # image-to-video

# Uncensored AI
npx ts-node tests/live/uncensored-t2i.live.ts
npx ts-node tests/live/uncensored-i2i.live.ts
npx ts-node tests/live/uncensored-video.live.ts

# Tavily
npx ts-node tests/live/tavily-search.live.ts
```

### Run by Category

```bash
npx ts-node tests/live/run-all.ts chat
npx ts-node tests/live/run-all.ts flux
npx ts-node tests/live/run-all.ts wan
npx ts-node tests/live/run-all.ts uncensored
npx ts-node tests/live/run-all.ts tavily
```

### Run All

```bash
npx ts-node tests/live/run-all.ts
```

## Environment

```bash
export ETERNALAI_API_KEY=your_api_key
```
