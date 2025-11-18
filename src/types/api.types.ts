/**
 * API foundation type definitions
 * 
 * Core types for API communication, response wrapping, pagination, and error handling.
 * These types are platform-agnostic and work identically across all supported platforms.
 * 
 * @packageDocumentation
 */

/**
 * Standard API response wrapper for single resources.
 * 
 * Most API endpoints return data wrapped in this structure.
 * 
 * @template T - The type of the data payload
 * 
 * @example
 * ```typescript
 * // GET /v1/games/{ulid} returns ApiResponse<Game>
 * const response: ApiResponse<Game> = {
 *   data: {
 *     ulid: '01HQ...',
 *     game_title: 'validate-four',
 *     state: 'active',
 *     // ...
 *   }
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** The response payload */
  data: T;

  /** Optional success message */
  message?: string;
}

/**
 * Pagination metadata structure.
 * Follows Laravel pagination format.
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  current_page: number;

  /** First item number on current page (null if no items) */
  from: number | null;

  /** Last page number */
  last_page: number;

  /** Base URL without query parameters */
  path: string;

  /** Number of items per page */
  per_page: number;

  /** Last item number on current page (null if no items) */
  to: number | null;

  /** Total number of items across all pages */
  total: number;
}

/**
 * Pagination navigation links structure
 */
export interface PaginationLinks {
  /** URL to first page (null if not applicable) */
  first: string | null;

  /** URL to last page (null if not applicable) */
  last: string | null;

  /** URL to previous page (null if on first page) */
  prev: string | null;

  /** URL to next page (null if on last page) */
  next: string | null;
}

/**
 * Paginated API response wrapper for collections.
 * 
 * Used by list endpoints that support pagination.
 * 
 * @template T - The type of items in the collection
 * 
 * @example
 * ```typescript
 * // GET /v1/games returns PaginatedResponse<Game>
 * // Response includes data array, links object, and meta object
 * // with pagination details like current_page, per_page, total, etc.
 * ```
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];

  /** Pagination navigation links */
  links: PaginationLinks;

  /** Pagination metadata */
  meta: PaginationMeta;
}

/**
 * Standard error response structure.
 * 
 * All API errors are transformed to this shape by the error interceptor.
 * 
 * @example 422 Validation Error
 * ```typescript
 * const error: ErrorResponse = {
 *   message: 'The given data was invalid.',
 *   error_code: 'VALIDATION_ERROR',
 *   errors: {
 *     email: ['The email field is required.'],
 *     password: ['The password must be at least 8 characters.']
 *   }
 * };
 * ```
 * 
 * @example 401 Unauthorized
 * ```typescript
 * const error: ErrorResponse = {
 *   message: 'Unauthenticated.',
 *   error_code: 'UNAUTHORIZED'
 * };
 * ```
 * 
 * @example Network Error (transformed by interceptor)
 * ```typescript
 * const error: ErrorResponse = {
 *   message: 'Network request failed',
 *   error_code: 'NETWORK_ERROR'
 * };
 * ```
 */
export interface ErrorResponse {
  /** Human-readable error message for display to users */
  message: string;

  /** Machine-readable error code (e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED', 'NETWORK_ERROR') */
  error_code?: string;

  /** Field-specific validation errors (key = field name, value = array of error messages) */
  errors?: Record<string, string[]>;
}
