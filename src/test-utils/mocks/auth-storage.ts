/**
 * Mock AuthStorage implementation for testing
 */

import { vi } from 'vitest';
import type { AuthStorage } from '../../types';

/**
 * Creates a mock AuthStorage instance for testing.
 *
 * All methods are vi.fn() mocks that can be inspected and controlled.
 *
 * @param initialToken - Initial token value to return from getToken()
 * @returns Mock AuthStorage instance
 *
 * @example
 * ```typescript
 * const mockAuth = createMockAuthStorage('test-token');
 *
 * // Token is available
 * await mockAuth.getToken(); // Returns 'test-token'
 *
 * // Verify method was called
 * expect(mockAuth.clearToken).toHaveBeenCalledTimes(1);
 *
 * // Change token mid-test
 * mockAuth.getToken.mockResolvedValueOnce('new-token');
 * ```
 */
export function createMockAuthStorage(initialToken: string | null = 'mock-token'): AuthStorage {
  return {
    getToken: vi.fn().mockResolvedValue(initialToken),
    setToken: vi.fn().mockResolvedValue(undefined),
    clearToken: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock AuthStorage that throws errors for testing error handling.
 *
 * @param errorMessage - Error message to throw
 * @returns Mock AuthStorage that throws errors
 */
export function createFailingMockAuthStorage(errorMessage = 'Storage error'): AuthStorage {
  return {
    getToken: vi.fn().mockRejectedValue(new Error(errorMessage)),
    setToken: vi.fn().mockRejectedValue(new Error(errorMessage)),
    clearToken: vi.fn().mockRejectedValue(new Error(errorMessage)),
  };
}
