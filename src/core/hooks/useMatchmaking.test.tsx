import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  useJoinQueue,
  useLeaveQueue,
  useLobbiesQuery,
  useLobbyQuery,
  useCreateLobby,
  useDeleteLobby,
  useStartReadyCheck,
  useSeatPlayers,
  useInvitePlayers,
  useJoinLobby,
  useRemoveLobbyPlayer,
  useCreateProposal,
  useAcceptProposal,
  useDeclineProposal,
} from './useMatchmaking';
import type {
  Lobby,
  QueueSlotResponse,
  JoinQueueRequest,
  CreateLobbyRequest,
  JoinLobbyRequest,
  SeatPlayersRequest,
  InvitePlayersRequest,
  CreateProposalRequest,
  ProposalResponse,
  AcceptProposalResponse,
  DeclineProposalResponse,
} from '../../types/matchmaking.types';
import type { PaginatedResponse, ErrorResponse } from '../../types/api.types';

describe('useMatchmaking hooks', () => {
  let apiClient: AxiosInstance;
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    apiClient = axios.create({ baseURL: 'http://localhost/api' });
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    mock.reset();
    queryClient.clear();
    vi.clearAllMocks();
  });

  const mockLobby: Lobby = {
    ulid: '01HQ5XABCDEFGHIJK123456789',
    host: {
      username: 'player1',
      name: 'Player One',
      avatar: null,
      bio: null,
      social_links: null,
    },
    game_title: 'ValidateFour',
    game_mode: 'standard',
    is_public: true,
    min_players: 2,
    current_players: 1,
    status: 'pending',
    players: [
      {
        username: 'player1',
        name: 'Player One',
        avatar: null,
        status: 'accepted',
        invited_at: null,
        joined_at: '2024-01-01T00:00:00Z',
      },
    ],
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockPaginationLinks = {
    first: 'http://localhost/api/v1/matchmaking/lobbies?page=1',
    last: 'http://localhost/api/v1/matchmaking/lobbies?page=1',
    prev: null,
    next: null,
  };

  // ============================================================================
  // Queue Tests
  // ============================================================================

  describe('useJoinQueue', () => {
    test('successfully joins matchmaking queue', async () => {
      const mockResponse: QueueSlotResponse = {
        data: {
          ulid: '01HQ5XQUEUE12345678901234',
          user_id: 1,
          title_slug: 'validate-four',
          mode_id: 1,
          game_mode: 'standard',
          skill_rating: 1500,
          status: 'active',
          preferences: {},
          expires_at: '2024-01-01T01:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
        message: 'Successfully joined matchmaking queue',
      };

      mock.onPost('/matchmaking/queue').reply(200, mockResponse);

      const { result } = renderHook(() => useJoinQueue(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const queueRequest: JoinQueueRequest = {
        game_title: 'validate-four',
        mode_id: 1,
        skill_rating: 1500,
      };

      result.current.mutate(queueRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.ulid).toBe('01HQ5XQUEUE12345678901234');
      expect(result.current.data?.data.status).toBe('active');
      expect(result.current.data?.message).toBe('Successfully joined matchmaking queue');
    });

    test('handles validation error when joining queue', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Validation failed',
        errors: {
          game_title: ['The game title field is required.'],
        },
      };

      mock.onPost('/matchmaking/queue').reply(422, errorResponse);

      const { result } = renderHook(() => useJoinQueue(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const queueRequest: JoinQueueRequest = {
        game_title: '',
        mode_id: 1,
        skill_rating: 1500,
      };

      result.current.mutate(queueRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 422');
    });
  });

  describe('useLeaveQueue', () => {
    test('successfully leaves matchmaking queue', async () => {
      const queueUlid = '01HQ5XQUEUE12345678901234';
      mock.onDelete(`/matchmaking/queue/${queueUlid}`).reply(204);

      const { result } = renderHook(() => useLeaveQueue(apiClient, queueUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    test('handles error when leaving non-existent queue', async () => {
      const queueUlid = 'invalid-ulid';
      const errorResponse: ErrorResponse = {
        message: 'Queue slot not found',
      };

      mock.onDelete(`/matchmaking/queue/${queueUlid}`).reply(404, errorResponse);

      const { result } = renderHook(() => useLeaveQueue(apiClient, queueUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // Lobby Query Tests
  // ============================================================================

  describe('useLobbiesQuery', () => {
    test('fetches lobbies list successfully', async () => {
      const mockResponse: PaginatedResponse<Lobby> = {
        data: [mockLobby],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/matchmaking/lobbies',
        },
      };

      mock.onGet('/matchmaking/lobbies').reply(200, mockResponse);

      const { result } = renderHook(() => useLobbiesQuery(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
      expect(result.current.data?.data[0]).toEqual(mockLobby);
    });

    test('supports game_title filter', async () => {
      const mockResponse: PaginatedResponse<Lobby> = {
        data: [mockLobby],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/matchmaking/lobbies',
        },
      };

      mock
        .onGet('/matchmaking/lobbies', { params: { game_title: 'ValidateFour' } })
        .reply(200, mockResponse);

      const { result } = renderHook(
        () => useLobbiesQuery(apiClient, { game_title: 'ValidateFour' }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
    });

    test('supports pagination parameters', async () => {
      const mockResponse: PaginatedResponse<Lobby> = {
        data: [mockLobby],
        links: mockPaginationLinks,
        meta: {
          current_page: 2,
          from: 11,
          to: 11,
          per_page: 10,
          total: 11,
          last_page: 2,
          path: '/matchmaking/lobbies',
        },
      };

      mock
        .onGet('/matchmaking/lobbies', { params: { page: 2, per_page: 10 } })
        .reply(200, mockResponse);

      const { result } = renderHook(() => useLobbiesQuery(apiClient, { page: 2, per_page: 10 }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.meta.current_page).toBe(2);
    });
  });

  describe('useLobbyQuery', () => {
    test('fetches single lobby successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      mock.onGet(`/matchmaking/lobbies/${lobbyUlid}`).reply(200, { data: mockLobby });

      const { result } = renderHook(() => useLobbyQuery(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLobby);
    });

    test('can be disabled via options', () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';

      const { result } = renderHook(() => useLobbyQuery(apiClient, lobbyUlid, { enabled: false }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });

    test('handles 404 for non-existent lobby', async () => {
      const lobbyUlid = 'invalid-ulid';
      const errorResponse: ErrorResponse = {
        message: 'Lobby not found',
      };

      mock.onGet(`/matchmaking/lobbies/${lobbyUlid}`).reply(404, errorResponse);

      const { result } = renderHook(() => useLobbyQuery(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // Lobby Mutation Tests
  // ============================================================================

  describe('useCreateLobby', () => {
    test('creates lobby successfully', async () => {
      const mockResponse = { data: mockLobby };
      mock.onPost('/matchmaking/lobbies').reply(201, mockResponse);

      const { result } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const createRequest: CreateLobbyRequest = {
        game_title: 'validate-four',
        mode_id: 1,
        is_public: true,
        min_players: 2,
      };

      result.current.mutate(createRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
    });

    test('invalidates lobbies query after creation', async () => {
      const mockResponse = { data: mockLobby };
      mock.onPost('/matchmaking/lobbies').reply(201, mockResponse);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const createRequest: CreateLobbyRequest = {
        game_title: 'validate-four',
        mode_id: 1,
        is_public: true,
        min_players: 2,
      };

      result.current.mutate(createRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['matchmaking', 'lobbies'] });
    });

    test('handles validation error when creating lobby', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Validation failed',
        errors: {
          max_players: ['Max players must be at least 2'],
        },
      };

      mock.onPost('/matchmaking/lobbies').reply(422, errorResponse);

      const { result } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const createRequest: CreateLobbyRequest = {
        game_title: 'validate-four',
        mode_id: 1,
        is_public: true,
        min_players: 1, // Invalid - should be at least 2
      };

      result.current.mutate(createRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useDeleteLobby', () => {
    test('deletes lobby successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      mock.onDelete(`/matchmaking/lobbies/${lobbyUlid}`).reply(204);

      const { result } = renderHook(() => useDeleteLobby(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    test('invalidates lobby queries after deletion', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      mock.onDelete(`/matchmaking/lobbies/${lobbyUlid}`).reply(204);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteLobby(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['matchmaking', 'lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['matchmaking', 'lobbies'] });
    });
  });

  describe('useStartReadyCheck', () => {
    test('starts ready check successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const mockResponse = {
        data: mockLobby,
        message: 'Ready check started',
      };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/ready-check`).reply(200, mockResponse);

      const { result } = renderHook(() => useStartReadyCheck(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
      expect(result.current.data?.message).toBe('Ready check started');
    });

    test('handles error when non-host tries to start ready check', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const errorResponse: ErrorResponse = {
        message: 'Only the host can start a ready check',
      };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/ready-check`).reply(403, errorResponse);

      const { result } = renderHook(() => useStartReadyCheck(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useSeatPlayers', () => {
    test('seats players successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const mockResponse = { data: mockLobby };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/seat`).reply(200, mockResponse);

      const { result } = renderHook(() => useSeatPlayers(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const seatRequest: SeatPlayersRequest = {
        seats: {
          player1: 1,
          player2: 2,
        },
      };

      result.current.mutate(seatRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
    });

    test('handles error when seating arrangement is invalid', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const errorResponse: ErrorResponse = {
        message: 'Invalid seating arrangement',
        errors: {
          seating_arrangement: ['Duplicate seat numbers are not allowed'],
        },
      };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/seat`).reply(422, errorResponse);

      const { result } = renderHook(() => useSeatPlayers(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const seatRequest: SeatPlayersRequest = {
        seats: {
          player1: 1,
          player2: 1, // Duplicate seat number
        },
      };

      result.current.mutate(seatRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useInvitePlayers', () => {
    test('invites players successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const mockResponse = { data: mockLobby };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/players`).reply(200, mockResponse);

      const { result } = renderHook(() => useInvitePlayers(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const inviteRequest: InvitePlayersRequest = {
        user_ids: [2, 3],
      };

      result.current.mutate(inviteRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
    });

    test('handles error when inviting non-existent user', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const errorResponse: ErrorResponse = {
        message: 'User not found',
        errors: {
          usernames: ['User "nonexistent" does not exist'],
        },
      };

      mock.onPost(`/matchmaking/lobbies/${lobbyUlid}/players`).reply(404, errorResponse);

      const { result } = renderHook(() => useInvitePlayers(apiClient, lobbyUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const inviteRequest: InvitePlayersRequest = {
        user_ids: [999],
      };

      result.current.mutate(inviteRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useJoinLobby', () => {
    test('joins lobby successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'player2';
      const mockResponse = { data: mockLobby };

      mock.onPut(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`).reply(200, mockResponse);

      const { result } = renderHook(() => useJoinLobby(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const joinRequest: JoinLobbyRequest = {
        status: 'accepted',
      };

      result.current.mutate(joinRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
    });

    test('handles error when lobby is full', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'player3';
      const errorResponse: ErrorResponse = {
        message: 'Lobby is full',
      };

      mock.onPut(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`).reply(400, errorResponse);

      const { result } = renderHook(() => useJoinLobby(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ status: 'accepted' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    test('invalidates lobby queries after joining', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'player2';
      const mockResponse = { data: mockLobby };

      mock.onPut(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`).reply(200, mockResponse);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useJoinLobby(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ status: 'accepted' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['matchmaking', 'lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['matchmaking', 'lobbies'] });
    });
  });

  describe('useRemoveLobbyPlayer', () => {
    test('removes player successfully', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'player2';

      mock.onDelete(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`).reply(204);

      const { result } = renderHook(() => useRemoveLobbyPlayer(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    test('invalidates lobby queries after removal', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'player2';

      mock.onDelete(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`).reply(204);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRemoveLobbyPlayer(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['matchmaking', 'lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['matchmaking', 'lobbies'] });
    });

    test('handles error when removing non-existent player', async () => {
      const lobbyUlid = '01HQ5XABCDEFGHIJK123456789';
      const username = 'nonexistent';
      const errorResponse: ErrorResponse = {
        message: 'Player not in lobby',
      };

      mock
        .onDelete(`/matchmaking/lobbies/${lobbyUlid}/players/${username}`)
        .reply(404, errorResponse);

      const { result } = renderHook(() => useRemoveLobbyPlayer(apiClient, lobbyUlid, username), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ============================================================================
  // Proposal Tests
  // ============================================================================

  describe('useCreateProposal', () => {
    test('creates rematch proposal successfully', async () => {
      const mockResponse: ProposalResponse = {
        data: {
          ulid: '01HQ5XPROPOSAL123456789',
          type: 'rematch',
          requesting_user_id: 1,
          opponent_user_id: 2,
          title_slug: 'validate-four',
          mode_id: 1,
          game_settings: {},
          status: 'pending',
          responded_at: null,
          expires_at: '2024-01-01T01:00:00Z',
          original_game_ulid: '01HQ5XGAME1234567890123',
          game_ulid: null,
        },
        message: 'Rematch proposal created',
      };

      mock.onPost('/matchmaking/proposals').reply(201, mockResponse);

      const { result } = renderHook(() => useCreateProposal(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const proposalRequest: CreateProposalRequest = {
        type: 'rematch',
        original_game_ulid: '01HQ5XGAME1234567890123',
      };

      result.current.mutate(proposalRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.type).toBe('rematch');
      expect(result.current.data?.data.status).toBe('pending');
    });

    test('creates challenge proposal successfully', async () => {
      const mockResponse: ProposalResponse = {
        data: {
          ulid: '01HQ5XPROPOSAL123456789',
          type: 'casual',
          requesting_user_id: 1,
          opponent_user_id: 3,
          title_slug: 'validate-four',
          mode_id: 1,
          game_settings: {},
          status: 'pending',
          responded_at: null,
          expires_at: '2024-01-01T01:00:00Z',
          original_game_ulid: null,
          game_ulid: null,
        },
        message: 'Challenge proposal created',
      };

      mock.onPost('/matchmaking/proposals').reply(201, mockResponse);

      const { result } = renderHook(() => useCreateProposal(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const proposalRequest: CreateProposalRequest = {
        type: 'casual',
        opponent_username: 'player3',
        title_slug: 'validate-four',
        mode_id: 1,
      };

      result.current.mutate(proposalRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.type).toBe('casual');
    });

    test('handles validation error when creating proposal', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Validation failed',
        errors: {
          to_username: ['The to username field is required for challenges'],
        },
      };

      mock.onPost('/matchmaking/proposals').reply(422, errorResponse);

      const { result } = renderHook(() => useCreateProposal(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const proposalRequest: CreateProposalRequest = {
        type: 'casual',
        opponent_username: '',
        title_slug: 'validate-four',
        mode_id: 1,
        // Empty opponent_username will trigger validation error
      };

      result.current.mutate(proposalRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAcceptProposal', () => {
    test('accepts proposal successfully', async () => {
      const proposalUlid = '01HQ5XPROPOSAL123456789';
      const mockResponse: AcceptProposalResponse = {
        data: {
          ulid: '01HQ5XPROPOSAL123456789',
          type: 'rematch',
          requesting_user_id: 1,
          opponent_user_id: 2,
          title_slug: 'validate-four',
          mode_id: 1,
          game_settings: {},
          status: 'accepted',
          responded_at: '2024-01-01T00:05:00Z',
          expires_at: '2024-01-01T01:00:00Z',
          original_game_ulid: '01HQ5XGAME1234567890123',
          game_ulid: '01HQ5XNEWGAME123456789',
          new_game_ulid: '01HQ5XNEWGAME123456789',
        },
        message: 'Proposal accepted. Game started.',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/accept`).reply(200, mockResponse);

      const { result } = renderHook(() => useAcceptProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.new_game_ulid).toBe('01HQ5XNEWGAME123456789');
      expect(result.current.data?.message).toBe('Proposal accepted. Game started.');
    });

    test('accepts proposal creating lobby', async () => {
      const proposalUlid = '01HQ5XPROPOSAL123456789';
      const mockResponse: AcceptProposalResponse = {
        data: {
          ulid: '01HQ5XPROPOSAL123456789',
          type: 'casual',
          requesting_user_id: 1,
          opponent_user_id: 3,
          title_slug: 'validate-four',
          mode_id: 1,
          game_settings: {},
          status: 'accepted',
          responded_at: '2024-01-01T00:05:00Z',
          expires_at: '2024-01-01T01:00:00Z',
          original_game_ulid: null,
          game_ulid: '01HQ5XNEWGAME123456789',
          new_game_ulid: '01HQ5XNEWGAME123456789',
        },
        message: 'Proposal accepted. Game started.',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/accept`).reply(200, mockResponse);

      const { result } = renderHook(() => useAcceptProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.new_game_ulid).toBe('01HQ5XNEWGAME123456789');
    });

    test('handles error when proposal already accepted', async () => {
      const proposalUlid = '01HQ5XPROPOSAL123456789';
      const errorResponse: ErrorResponse = {
        message: 'Proposal already accepted',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/accept`).reply(400, errorResponse);

      const { result } = renderHook(() => useAcceptProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useDeclineProposal', () => {
    test('declines proposal successfully', async () => {
      const proposalUlid = '01HQ5XPROPOSAL123456789';
      const mockResponse: DeclineProposalResponse = {
        data: {
          ulid: '01HQ5XPROPOSAL123456789',
          type: 'rematch',
          requesting_user_id: 1,
          opponent_user_id: 2,
          title_slug: 'validate-four',
          mode_id: 1,
          game_settings: {},
          status: 'declined',
          responded_at: '2024-01-01T00:05:00Z',
          expires_at: '2024-01-01T01:00:00Z',
          original_game_ulid: '01HQ5XGAME1234567890123',
          game_ulid: null,
        },
        message: 'Proposal declined',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/decline`).reply(200, mockResponse);

      const { result } = renderHook(() => useDeclineProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.message).toBe('Proposal declined');
    });

    test('handles error when proposal not found', async () => {
      const proposalUlid = 'invalid-ulid';
      const errorResponse: ErrorResponse = {
        message: 'Proposal not found',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/decline`).reply(404, errorResponse);

      const { result } = renderHook(() => useDeclineProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    test('handles error when user not authorized to decline', async () => {
      const proposalUlid = '01HQ5XPROPOSAL123456789';
      const errorResponse: ErrorResponse = {
        message: 'You are not authorized to decline this proposal',
      };

      mock.onPost(`/matchmaking/proposals/${proposalUlid}/decline`).reply(403, errorResponse);

      const { result } = renderHook(() => useDeclineProposal(apiClient, proposalUlid), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
