# Test Suite

This directory contains comprehensive test cases for the EternalAI SDK.

## Test Structure

```
tests/
├── README.md           # This file
├── client.test.ts      # Tests for EternalAPI client initialization
├── chat.test.ts        # Tests for Chat service (streaming & non-streaming)
├── types.test.ts       # Tests for TypeScript type definitions
└── integration.test.ts # Integration and end-to-end tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### Client Tests (`client.test.ts`)
- ✅ Client initialization with valid API key
- ✅ Error handling for missing/invalid API key
- ✅ Optional timeout configuration
- ✅ Property visibility and encapsulation

### Chat Service Tests (`chat.test.ts`)
- ✅ Non-streaming chat completions
- ✅ Streaming chat completions with Server-Sent Events
- ✅ Request headers and authorization
- ✅ Error handling for API failures (401, 500, etc.)
- ✅ Network error handling
- ✅ Timeout configuration
- ✅ Invalid JSON handling in streams
- ✅ Empty lines in streaming responses

### Type Tests (`types.test.ts`)
- ✅ All TypeScript type definitions
- ✅ Required and optional fields
- ✅ Message roles (system, user, assistant)
- ✅ Request and response structures
- ✅ Streaming and non-streaming types

### Integration Tests (`integration.test.ts`)
- ✅ SDK exports verification
- ✅ End-to-end flow testing
- ✅ Type safety validation
- ✅ Error message clarity

## Test Framework

- **Framework**: [Vitest](https://vitest.dev/)
- **Coverage**: v8 provider
- **Environment**: Node.js

## Writing New Tests

When adding new features, please:

1. Add corresponding tests in the appropriate test file
2. Maintain test coverage above 80%
3. Follow the existing test structure and naming conventions
4. Use descriptive test names that explain what is being tested
5. Mock external dependencies (like `fetch`) to avoid real API calls

Example test structure:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  describe('Specific Functionality', () => {
    it('should behave in expected way', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Coverage Goals

Target coverage metrics:
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

View coverage report after running `npm run test:coverage` in the `coverage/` directory.

