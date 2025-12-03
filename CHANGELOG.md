# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-02

### Added
- 🎉 Initial release of @eternalai-org/sdk
- `EternalAPI` client class for chat completions
- `chat.send()` method with streaming and non-streaming support
- OpenAI-compatible API interface
- Full TypeScript type definitions
- Dual module support (ESM + CommonJS)
- Comprehensive test suite (46 tests, 100% coverage)
- Examples for Node.js and web applications

### Features
- **Chat Completions** - Send messages to AI models and get responses
- **Streaming Support** - Real-time streaming responses using async iterators
- **OpenAI Compatible** - Drop-in replacement for OpenAI API
- **TypeScript First** - Strict typing with full IntelliSense support
- **Multi-Environment** - Works in Node.js (v18+) and browser
- **Error Handling** - Descriptive error messages for debugging
- **Server-Sent Events** - Efficient SSE streaming parser
- **Configurable Timeout** - AbortController support for request timeouts

### Supported AI Providers
Access multiple AI providers through EternalAI's unified API:
- OpenAI (GPT-4, GPT-3.5-turbo, etc.)
- Anthropic Claude
- xAI Grok
- Google Gemini
- And more via [eternalai.org](https://eternalai.org/api/build)

[0.1.0]: https://github.com/eternalai-org/sdk/releases/tag/v0.1.0
