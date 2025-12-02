/**
 * Competition/Tournament Types
 * API Namespace: Competitions
 */

/**
 * Tournament format types
 */
export type TournamentFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss';

/**
 * Tournament status types
 */
export type TournamentStatus =
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * Tournament currency types
 */
export type TournamentCurrency = 'tokens' | 'chips';

/**
 * Tournament details
 */
export interface Tournament {
  ulid: string;
  name: string;
  game_title: string;
  format: TournamentFormat;
  status: TournamentStatus;
  max_participants: number;
  current_participants: number;
  buy_in_amount: number;
  buy_in_currency: TournamentCurrency;
  prize_pool: number;
  rules: Record<string, unknown>;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

/**
 * Tournament entry confirmation
 */
export interface TournamentEntry {
  tournament_ulid: string;
}

/**
 * Tournament structure/format rules
 */
export interface TournamentStructure {
  tournament_ulid: string;
  format: TournamentFormat;
  rules: Record<string, unknown>;
  round_duration_minutes?: number;
  max_rounds?: number;
  advancement_rules?: Record<string, unknown>;
}

/**
 * Match within a tournament bracket
 */
export interface BracketMatch {
  match_id: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  game_ulid?: string;
  scheduled_at?: string;
  completed_at?: string;
}

/**
 * Round within a tournament bracket
 */
export interface BracketRound {
  round_number: number;
  matches: BracketMatch[];
}

/**
 * Tournament bracket structure
 */
export interface TournamentBracket {
  tournament_ulid: string;
  format: TournamentFormat;
  rounds: BracketRound[];
  current_round: number;
}

/**
 * Participant standing in tournament
 */
export interface TournamentStanding {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  draws?: number;
  points?: number;
  buchholz_score?: number;
  is_active: boolean;
}

/**
 * Tournament standings list
 */
export interface TournamentStandings {
  tournament_ulid: string;
  standings: TournamentStanding[];
  current_round?: number;
  updated_at: string;
}

/**
 * Response for tournament list endpoint
 */
export interface TournamentsResponse {
  data: Tournament[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Response for single tournament endpoint
 */
export interface TournamentResponse {
  data: Tournament;
}

/**
 * Response for tournament entry
 */
export interface TournamentEntryResponse {
  data: TournamentEntry;
  message: string;
}

/**
 * Response for tournament structure
 */
export interface TournamentStructureResponse {
  data: TournamentStructure;
}

/**
 * Response for tournament bracket
 */
export interface TournamentBracketResponse {
  data: TournamentBracket;
}

/**
 * Response for tournament standings
 */
export interface TournamentStandingsResponse {
  data: TournamentStandings;
}
