# Contributing to @eternalai-org/sdk

Thank you for your interest in contributing! This document provides guidelines for development.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/eternalai-org/sdk.git
   cd sdk
   ```

2. **Install dependencies**
   ```bash
   # Using yarn (recommended - project uses yarn.lock)
   yarn install
   
   # Or using npm
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the SDK**
   ```bash
   npm run build
   ```

## Development Commands

- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run build` - Build production bundle

## Project Structure

```
src/
├── index.ts           # Main entry point
├── client.ts          # EternalAPI class
├── types/             # TypeScript type definitions
│   └── index.ts
└── services/          # Service layer
    └── chat.ts        # Chat service

tests/                 # Test files
├── README.md          # Test documentation
├── client.test.ts     # Client initialization tests
├── chat.test.ts       # Chat service tests
├── types.test.ts      # Type definition tests
└── integration.test.ts # Integration tests
```

## Code Style

- **Language**: TypeScript (strict mode enabled)
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Comments**: All code comments must be in English

Run linting and formatting before committing:

```bash
npm run lint:fix
npm run format
```

## Writing Tests

- Use Vitest for testing
- Place test files in the `tests/` directory
- Name test files with `.test.ts` suffix
- Maintain 100% code coverage (current standard)
- Mock external dependencies (like `fetch`) to avoid real API calls
- Use descriptive test names that explain what is being tested
- Suppress console.error when testing error handling with `vi.spyOn()`

Example test:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EternalAPI } from '../src/client';

describe('EternalAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize correctly with valid API key', () => {
    const client = new EternalAPI({ apiKey: 'test' });
    expect(client).toBeDefined();
    expect(client.chat).toBeDefined();
  });

  it('should throw error when API key is missing', () => {
    expect(() => new EternalAPI({ apiKey: '' })).toThrow('API key is required');
  });
});
```

### Test Coverage Goals

Current and target coverage metrics:
- **Statements**: 100% ✅
- **Branches**: 100% ✅
- **Functions**: 100% ✅
- **Lines**: 100% ✅

Please maintain 100% coverage for all new code. View the test suite documentation at [tests/README.md](./tests/README.md).

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes with a descriptive message
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Commit Message Guidelines

Use clear and descriptive commit messages:

- `feat: add new feature`
- `fix: resolve bug in chat service`
- `docs: update README`
- `test: add tests for streaming`
- `refactor: improve error handling`
- `chore: update dependencies`

## SDK Overview

This SDK provides TypeScript bindings for EternalAI's chat completion API:
- **Purpose**: Enable developers to easily integrate AI chat capabilities
- **Main Features**: Chat completions with streaming support
- **API Endpoint**: `https://open.eternalai.org/api/v1`
- **Compatible With**: OpenAI API format

For more information about EternalAI platform, visit [eternalai.org/api/build](https://eternalai.org/api/build).

## Questions?

- 🐛 **Bug Reports**: Open an issue on [GitHub](https://github.com/eternalai-org/sdk/issues)
- 💬 **Questions**: Open a discussion or issue
- 📖 **Documentation**: See [README.md](./README.md) and [tests/README.md](./tests/README.md)
