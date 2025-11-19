/**
 * @gamerprotocol/ui/native
 *
 * Entry point for React Native (iOS/Android) platforms.
 * Exports the same API as the main entry point for consistent usage across platforms.
 *
 * @packageDocumentation
 */

// Export all types
export * from './types';

// Export API client
export * from './core/api';

// Export React Query hooks
export * from './core/hooks';

// Export real-time utilities
export * from './core/realtime';
