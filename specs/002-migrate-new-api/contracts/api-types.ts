export interface User {
  username: string;
  email: string;
  name: string;
  avatar: string;
  bio?: string;
  social_links?: Record<string, string>;
  level: number;
  total_xp: number;
  member_since: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Game {
  ulid: string;
  title: string;
  mode: string;
  status: 'active' | 'completed' | 'pending';
  current_turn: string;
  players: GamePlayer[];
  state: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  ulid: string;
  user_id: number;
  username: string;
  color?: string;
  is_current_turn: boolean;
  is_winner: boolean;
}

export interface Lobby {
  ulid: string;
  host: { id: number; username: string };
  game_title: string;
  mode: { id: number; slug: string; name: string };
  is_public: boolean;
  min_players: number;
  status: 'pending' | 'active';
  players: LobbyPlayer[];
  scheduled_at?: string;
  created_at: string;
}

export interface LobbyPlayer {
  user_id: number;
  username: string;
  status: 'accepted' | 'pending';
  source: 'host' | 'invited';
}

export interface GameAction {
  action_id: string;
  game_ulid: string;
  player_ulid: string;
  action: string;
  parameters: Record<string, any>;
  status: 'queued' | 'processed';
  created_at: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ErrorResponse {
  message: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}
