# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-12-XX

### Fixed
- Improved streaming response handling - better error handling for malformed SSE chunks
- Code cleanup - removed debug logging for production-ready SDK
- Enhanced error handling - silently skip invalid JSON chunks to maintain stream continuity

### Changed
- Improved code quality and professionalism for public SDK release
- Better error messages and handling throughout the SDK

## [0.2.0] - 2025-12-XX

### Added
- 🖼️ **Image Generation Support** - Added `image_config` option for models that support image generation
  - `image_config.aspect_ratio` - Configure aspect ratio for generated images (e.g., "16:9", "1:1", "9:16")
  - Works with both streaming and non-streaming requests
  - Full TypeScript type safety with `ImageConfigOptions` interface
- Comprehensive test coverage for image config functionality

### Changed
- `ChatCompletionStreamingRequest` and `ChatCompletionNonStreamingRequest` now support `image_config` option
- Updated API documentation with image generation examples

## [0.1.1] - 2025-12-XX

### Added
- 🚀 **Bun Support** - Full support for Bun runtime (v1.0.0+)
- Updated examples to use Bun instead of tsx
- Updated build scripts to use Bun commands

### Changed
- Development scripts now use Bun by default (npm still supported)
- Examples updated to work with Bun's native TypeScript support
- Documentation updated to mention Bun as recommended runtime

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
- **Multi-Environment** - Works in Bun (v1.0.0+), Node.js (v18+), and browser
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

[0.2.1]: https://github.com/eternalai-org/sdk/releases/tag/v0.2.1
[0.2.0]: https://github.com/eternalai-org/sdk/releases/tag/v0.2.0
[0.1.1]: https://github.com/eternalai-org/sdk/releases/tag/v0.1.1
[0.1.0]: https://github.com/eternalai-org/sdk/releases/tag/v0.1.0
