# Test Utilities

This directory contains shared testing utilities for the @gamerprotocol/ui package.

## Structure

```
test-utils/
├── mocks/              # Mock implementations
│   ├── auth-storage.ts # Mock AuthStorage for testing
│   └── api-responses.ts # Common API response fixtures
├── helpers/            # Test helper functions (future)
├── setup.ts           # Global test setup
└── index.ts           # Barrel file
```

## Usage

### Mock AuthStorage

```typescript
import { createMockAuthStorage } from '../../test-utils';

test('example test', async () => {
  const mockAuth = createMockAuthStorage('test-token');

  // Use in your tests
  const client = setupAPIClient({
    clientKey: 'key',
    authStorage: mockAuth,
  });

  // Verify calls
  expect(mockAuth.clearToken).toHaveBeenCalled();
});
```

### Mock API Responses

```typescript
import { mockApiResponses, mockUser } from '../../test-utils';

test('handles validation error', async () => {
  mock.onPost('/register').reply(422, mockApiResponses.validationError);

  // Test error handling...
});
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Coverage Thresholds

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Writing Tests

Tests are co-located with source files:

- `src/core/api/base-client.ts` → `src/core/api/base-client.test.ts`
- `src/core/hooks/useAuth.ts` → `src/core/hooks/useAuth.test.ts`

Use descriptive test names:

```typescript
test('injects X-Client-Key header on all requests');
test('calls clearToken when receiving 401 response');
```
