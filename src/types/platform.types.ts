/**
 * Platform/System type definitions
 *
 * Types for public platform information and system status.
 *
 * @packageDocumentation
 */

/**
 * API System Status response structure
 */
export interface ApiStatus {
  /** System status message (e.g., "operational", "maintenance") */
  status: string;

  /** API version string */
  version: string;

  /** Server timestamp (ISO 8601) */
  timestamp: string;

  /** Environment name (production, staging, etc.) */
  environment: string;
}
