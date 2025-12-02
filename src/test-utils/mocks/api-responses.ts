/**
 * Mock API responses for testing
 */

import type { AuthResponse, User, ErrorResponse } from '../../types';

/**
 * Mock user data for testing
 */
export const mockUser: User = {
  username: 'testuser',
  email: 'testuser@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  bio: 'Test bio',
  social_links: {
    twitter: 'https://twitter.com/testuser',
    discord: 'testuser#1234',
  },
  level: 5,
  total_xp: 1250,
  member_since: '2024-01-01T00:00:00Z',
};

/**
 * Mock authentication response
 */
export const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  token_type: 'Bearer',
  expires_in: 3600,
  user: mockUser,
};

/**
 * Common mock API responses
 */
export const mockApiResponses = {
  /**
   * Successful login response
   */
  loginSuccess: mockAuthResponse,

  /**
   * Successful registration response
   */
  registerSuccess: mockAuthResponse,

  /**
   * Successful social login response
   */
  socialLoginSuccess: mockAuthResponse,

  /**
   * 422 Validation error response
   */
  validationError: {
    message: 'The given data was invalid.',
    error_code: 'VALIDATION_ERROR',
    errors: {
      email: ['The email field is required.'],
      password: ['The password must be at least 8 characters.'],
    },
  } as ErrorResponse,

  /**
   * 401 Unauthorized error response
   */
  unauthorizedError: {
    message: 'Unauthenticated.',
    error_code: 'UNAUTHORIZED',
  } as ErrorResponse,

  /**
   * 403 Forbidden error response
   */
  forbiddenError: {
    message: 'This action is unauthorized.',
    error_code: 'FORBIDDEN',
  } as ErrorResponse,

  /**
   * 404 Not found error response
   */
  notFoundError: {
    message: 'Resource not found.',
    error_code: 'NOT_FOUND',
  } as ErrorResponse,

  /**
   * 500 Server error response
   */
  serverError: {
    message: 'Internal server error.',
    error_code: 'SERVER_ERROR',
  } as ErrorResponse,

  /**
   * Network error (no response)
   */
  networkError: {
    message: 'Network request failed',
    error_code: 'NETWORK_ERROR',
  } as ErrorResponse,
};
