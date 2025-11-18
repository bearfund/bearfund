/**
 * Base API client configuration
 *
 * Provides authenticated Axios client with automatic header injection and error handling.
 * Platform-agnostic - works identically across Web, React Native, Electron, and Telegram Mini Apps.
 *
 * @packageDocumentation
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthStorage, ErrorResponse } from '../../types';

/**
 * Configuration for API client setup.
 */
export interface APIClientConfig {
  /**
   * Client API key for X-Client-Key header.
   * Required for all API requests.
   */
  clientKey: string;

  /**
   * Platform-specific storage implementation for authentication tokens.
   * Must implement AuthStorage interface (getToken, setToken, clearToken).
   */
  authStorage: AuthStorage;

  /**
   * Base URL for API requests.
   * @default 'https://api.gamerprotocol.io/v1'
   */
  baseURL?: string;
}

/**
 * Flag to prevent multiple simultaneous clearToken() calls on concurrent 401 errors.
 * Resets after 1 second to allow retries after re-authentication.
 */
let isClearing401 = false;

/**
 * Creates and configures an authenticated Axios client.
 *
 * The client automatically:
 * - Injects X-Client-Key header on all requests
 * - Injects Authorization Bearer token when available
 * - Handles 401 errors by clearing stored tokens
 * - Transforms all errors to ErrorResponse format
 *
 * @param config - API client configuration
 * @returns Configured Axios instance
 * @throws Error if baseURL format is invalid
 *
 * @example Web/Electron (localStorage)
 * ```typescript
 * const authStorage: AuthStorage = {
 *   getToken: async () => localStorage.getItem('auth_token'),
 *   setToken: async (token) => localStorage.setItem('auth_token', token),
 *   clearToken: async () => localStorage.removeItem('auth_token')
 * };
 *
 * const client = setupAPIClient({
 *   clientKey: 'your-client-key',
 *   authStorage
 * });
 * ```
 *
 * @example React Native (SecureStore)
 * ```typescript
 * import * as SecureStore from 'expo-secure-store';
 *
 * const authStorage: AuthStorage = {
 *   getToken: async () => await SecureStore.getItemAsync('auth_token'),
 *   setToken: async (token) => await SecureStore.setItemAsync('auth_token', token),
 *   clearToken: async () => await SecureStore.deleteItemAsync('auth_token')
 * };
 *
 * const client = setupAPIClient({
 *   clientKey: 'your-client-key',
 *   authStorage
 * });
 * ```
 */
export function setupAPIClient(config: APIClientConfig): AxiosInstance {
  const { clientKey, authStorage, baseURL = 'https://api.gamerprotocol.io/v1' } = config;

  // Validate baseURL format
  try {
    new URL(baseURL);
  } catch {
    throw new Error(
      `Invalid baseURL format: "${baseURL}". Must be a valid URL (e.g., "https://api.example.com/v1")`
    );
  }

  // Create Axios instance with base configuration
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Inject X-Client-Key and Authorization headers
  client.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      // Always inject X-Client-Key header
      requestConfig.headers.set('X-Client-Key', clientKey);

      // Inject Authorization Bearer token if available
      try {
        const token = await authStorage.getToken();
        if (token) {
          requestConfig.headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        // Log error but proceed without authentication
        // This allows requests to continue even if token retrieval fails
        console.error('Failed to retrieve auth token:', error);
      }

      return requestConfig;
    },
    (error: Error) => {
      // Request setup failed - transform to ErrorResponse
      return Promise.reject(transformToErrorResponse(error));
    }
  );

  // Response interceptor: Handle errors and 401 Unauthorized
  client.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error: AxiosError) => {
      // Handle 401 Unauthorized - clear stored token
      if (error.response?.status === 401) {
        // Debounce clearToken to prevent multiple simultaneous calls
        if (!isClearing401) {
          isClearing401 = true;

          try {
            await authStorage.clearToken();
          } catch (clearError) {
            console.error('Failed to clear auth token:', clearError);
          }

          // Reset flag after 1 second
          setTimeout(() => {
            isClearing401 = false;
          }, 1000);
        }
      }

      // Transform error to ErrorResponse format
      return Promise.reject(transformToErrorResponse(error));
    }
  );

  return client;
}

/**
 * Transforms Axios errors to standardized ErrorResponse format.
 *
 * Handles three error types:
 * 1. Network errors (no response) - NETWORK_ERROR
 * 2. HTTP errors (4xx, 5xx) - error_code from API or status-based
 * 3. Request setup errors - REQUEST_ERROR
 *
 * @param error - Axios error object
 * @returns Standardized ErrorResponse
 */
function transformToErrorResponse(error: unknown): ErrorResponse {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    // Network error (no response received)
    if (!axiosError.response) {
      return {
        message: axiosError.message || 'Network request failed',
        error_code: 'NETWORK_ERROR',
      };
    }

    // HTTP error with response
    const { data, status } = axiosError.response;

    // API returned ErrorResponse format
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data && typeof data === 'object' && 'message' in data) {
      return {
        message: data.message,
        error_code: data.error_code ?? `HTTP_${status}`,
        errors: data.errors,
      };
    }

    // API returned non-standard error format
    return {
      message: `Request failed with status ${status}`,
      error_code: `HTTP_${status}`,
    };
  }

  // Non-Axios error (shouldn't happen, but handle gracefully)
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    error_code: 'UNKNOWN_ERROR',
  };
}
