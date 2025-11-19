/**
 * Real-time barrel file
 *
 * Re-exports real-time/WebSocket functionality.
 *
 * @packageDocumentation
 */

// Echo client setup
export { setupEcho } from './echo-client';
export type { EchoConfig } from './echo-client';

// Real-time hooks
export { useRealtimeGame } from './useRealtimeGame';
export type { UseRealtimeGameOptions } from './useRealtimeGame';

export { useRealtimeLobby } from './useRealtimeLobby';
export type { UseRealtimeLobbyOptions } from './useRealtimeLobby';
