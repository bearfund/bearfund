/**
 * Matchmaking type definitions
 *
 * Types for matchmaking queue, lobbies, and proposals (challenges/rematches).
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/**
 * Queue slot resource
 *
 * Represents a user's position in the matchmaking queue.
 */
export interface QueueSlot {
  /** Unique queue slot identifier (ULID) */
  ulid: string;

  /** User ID */
  user_id: number;

  /** Game title slug */
  title_slug: string;

  /** Game mode ID */
  mode_id: number;

  /** Game mode name */
  game_mode: string;

  /** User's skill rating */
  skill_rating: number;

  /** Queue slot status */
  status: 'active' | 'cancelled' | 'matched';

  /** User preferences for matchmaking */
  preferences: Record<string, unknown>;

  /** ISO 8601 timestamp when slot expires */
  expires_at: string;

  /** ISO 8601 timestamp when slot was created */
  created_at: string;
}

/**
 * Join matchmaking queue request payload
 */
export interface JoinQueueRequest {
  /** Game title slug (e.g., 'connect-four') */
  game_title: string;

  /** Game mode ID */
  mode_id: number;

  /** User's skill rating */
  skill_rating: number;

  /** Optional user preferences */
  preferences?: Record<string, unknown>;
}

/**
 * Queue slot response
 */
export interface QueueSlotResponse {
  /** Queue slot data */
  data: QueueSlot;

  /** Success message */
  message: string;
}

/**
 * Lobby player with full details
 */
export interface LobbyPlayerDetailed {
  /** Username */
  username: string;

  /** Display name */
  name: string;

  /** Avatar URL */
  avatar: string | null;

  /** Player status in lobby */
  status: 'accepted' | 'pending';

  /** ISO 8601 timestamp when invited (null if host) */
  invited_at: string | null;

  /** ISO 8601 timestamp when joined */
  joined_at: string;
}

/**
 * Lobby host details
 */
export interface LobbyHost {
  /** Username */
  username: string;

  /** Display name */
  name: string;

  /** Avatar URL */
  avatar: string | null;

  /** Biography */
  bio: string | null;

  /** Social links */
  social_links: Record<string, string> | null;
}

/**
 * Game lobby resource
 *
 * Represents a multiplayer game lobby where players can join before game starts.
 */
export interface Lobby {
  /** Unique lobby identifier (ULID) */
  ulid: string;

  /** Game title slug */
  game_title: string;

  /** Game mode name */
  game_mode: string;

  /** The user who created the lobby */
  host: LobbyHost;

  /** Minimum players required */
  min_players: number;

  /** Current player count */
  current_players: number;

  /** Whether lobby is publicly visible */
  is_public: boolean;

  /** Scheduled start time (optional) */
  scheduled_at?: string;

  /** Lobby status */
  status: 'pending' | 'active' | 'cancelled';

  /** List of players in the lobby */
  players: LobbyPlayerDetailed[];

  /** ISO 8601 timestamp when lobby was created */
  created_at: string;
}

/**
 * Create lobby request payload
 */
export interface CreateLobbyRequest {
  /** Game title slug */
  game_title: string;

  /** Game mode ID */
  mode_id: number;

  /** Whether lobby is publicly visible */
  is_public: boolean;

  /** Minimum players required to start */
  min_players: number;

  /** Optional scheduled start time (ISO 8601) */
  scheduled_at?: string;

  /** Optional list of user IDs to invite */
  invitees?: number[];
}

/**
 * Join/accept lobby request payload
 */
export interface JoinLobbyRequest {
  /** Player status (always 'accepted' for joining) */
  status: 'accepted';
}

/**
 * Seat players request payload
 */
export interface SeatPlayersRequest {
  /** Player seating assignments */
  seats: Record<string, number>; // { username: seat_position }
}

/**
 * Invite players request payload
 */
export interface InvitePlayersRequest {
  /** List of user IDs to invite */
  user_ids: number[];
}

/**
 * Proposal (challenge/rematch) resource
 */
export interface Proposal {
  /** Unique proposal identifier (ULID) */
  ulid: string;

  /** User ID who created the proposal */
  requesting_user_id: number;

  /** User ID of the opponent */
  opponent_user_id: number;

  /** Proposal type */
  type: 'rematch' | 'casual' | 'ranked';

  /** Game title slug */
  title_slug: string;

  /** Game mode ID */
  mode_id: number;

  /** Optional game settings */
  game_settings: Record<string, unknown>;

  /** Proposal status */
  status: 'pending' | 'accepted' | 'declined' | 'expired';

  /** ISO 8601 timestamp when opponent responded (null if pending) */
  responded_at: string | null;

  /** ISO 8601 timestamp when proposal expires */
  expires_at: string;

  /** Original game ULID (for rematches, null for challenges) */
  original_game_ulid: string | null;

  /** Created game ULID (null until accepted) */
  game_ulid: string | null;
}

/**
 * Create proposal request payload (rematch)
 */
export interface CreateRematchRequest {
  /** Proposal type (must be 'rematch') */
  type: 'rematch';

  /** Original game ULID to rematch */
  original_game_ulid: string;
}

/**
 * Create proposal request payload (challenge)
 */
export interface CreateChallengeRequest {
  /** Proposal type ('casual' or 'ranked') */
  type: 'casual' | 'ranked';

  /** Opponent username */
  opponent_username: string;

  /** Game title slug */
  title_slug: string;

  /** Game mode ID */
  mode_id: number;

  /** Optional game settings */
  game_settings?: Record<string, unknown>;
}

/**
 * Union type for all proposal creation requests
 */
export type CreateProposalRequest = CreateRematchRequest | CreateChallengeRequest;

/**
 * Proposal response with additional data
 */
export interface ProposalResponse {
  /** Proposal data */
  data: Proposal;

  /** Success message */
  message: string;
}

/**
 * Accept proposal response
 */
export interface AcceptProposalResponse {
  /** Updated proposal data */
  data: Proposal & {
    /** Newly created game ULID */
    new_game_ulid: string;
  };

  /** Success message */
  message: string;
}

/**
 * Decline proposal response
 */
export interface DeclineProposalResponse {
  /** Updated proposal data */
  data: Proposal;

  /** Success message */
  message: string;
}
