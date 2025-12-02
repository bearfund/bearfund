import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  useGameQuery,
  useGamesQuery,
  useGameAction,
  useForfeitGame,
  useGameOptions,
  useLobbiesQuery,
  useLobbyQuery,
  useCreateLobby,
  useJoinLobby,
  useRemoveLobbyPlayer,
  useDeleteLobby,
  useStartReadyCheck,
  useJoinQuickplay,
  useLeaveQuickplay,
  useRequestRematch,
  useAcceptRematch,
  useDeclineRematch,
} from './useGame';
import type {
  Game,
  Lobby,
  SubmitActionRequest,
  CreateLobbyRequest,
  PaginatedResponse,
  ErrorResponse,
} from '../../types';

describe('useGame hooks', () => {
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

  const mockGame: Game = {
    ulid: '01HQ5X9K3G2YM4N6P7Q8R9S0T1',
    title: 'Connect Four',
    mode: 'Standard',
    status: 'active',
    current_turn: '01J3PLY1',
    players: [
      {
        ulid: '01J3PLY1',
        user_id: 1,
        username: 'player1',
        color: 'red',
        is_current_turn: true,
        is_winner: false,
      },
      {
        ulid: '01J3PLY2',
        user_id: 2,
        username: 'player2',
        color: 'yellow',
        is_current_turn: false,
        is_winner: false,
      },
    ],
    state: {
      board: [
        [0, 0],
        [0, 0],
      ],
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockLobby: Lobby = {
    ulid: '01HQ5XABCDEFGHIJK123456789',
    host: {
      id: 1,
      username: 'player1',
    },
    game_title: 'validate-four',
    mode: {
      id: 1,
      slug: 'standard',
      name: 'Standard',
    },
    is_public: true,
    min_players: 2,
    status: 'pending',
    players: [
      {
        user_id: 1,
        username: 'player1',
        status: 'accepted',
        source: 'host',
      },
    ],
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockPaginationLinks = {
    first: 'http://localhost/api/v1/resource?page=1',
    last: 'http://localhost/api/v1/resource?page=1',
    prev: null,
    next: null,
  };

  describe('useGameQuery', () => {
    test('fetches game successfully', async () => {
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1').reply(200, { data: mockGame });

      const { result } = renderHook(() => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockGame);
      expect(result.current.data?.status).toBe('active');
      expect(result.current.data?.players).toHaveLength(2);
    });

    test('handles 404 for non-existent game', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Game not found',
        errors: undefined,
      };
      mock.onGet('/games/invalid-ulid').reply(404, errorResponse);

      const { result } = renderHook(() => useGameQuery(apiClient, 'invalid-ulid'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 404');
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1', { enabled: false }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });

    test('uses correct query key for caching', async () => {
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1').reply(200, { data: mockGame });

      const { result: result1 } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      const { result: result2 } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result2.current.data).toEqual(mockGame);
      expect(mock.history.get.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('useGamesQuery', () => {
    test('fetches games list successfully', async () => {
      const mockResponse: PaginatedResponse<Game> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
      expect(result.current.data?.data[0]).toEqual(mockGame);
      expect(result.current.data?.meta.total).toBe(1);
    });

    test('supports status filter parameter', async () => {
      const mockResponse: PaginatedResponse<Game> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games', { params: { status: 'active' } }).reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient, { status: 'active' }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mock.history.get[0].params).toEqual({ status: 'active' });
    });

    test('supports pagination parameters', async () => {
      const mockResponse: PaginatedResponse<Game> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 2,
          from: 11,
          to: 11,
          per_page: 10,
          total: 11,
          last_page: 2,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient, { page: 2, per_page: 10 }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.meta.current_page).toBe(2);
      expect(mock.history.get[0].params).toEqual({ page: 2, per_page: 10 });
    });

    test('handles empty games list', async () => {
      const mockResponse: PaginatedResponse<Game> = {
        data: [],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: null,
          to: null,
          per_page: 10,
          total: 0,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(0);
      expect(result.current.data?.meta.total).toBe(0);
    });
  });

  describe('useGameAction', () => {
    test('submits action successfully', async () => {
      const updatedGame = { ...mockGame, current_turn: '01J3PLY2' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(200, { data: updatedGame });

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action: 'place_piece',
        parameters: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(updatedGame);
      expect(mock.history.post[0].data).toBe(JSON.stringify(actionRequest));
    });

    test('invalidates game query on success', async () => {
      const updatedGame = { ...mockGame, current_turn: '01J3PLY2' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(200, { data: updatedGame });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action: 'place_piece',
        parameters: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['game', '01HQ5X9K3G2YM4N6P7Q8R9S0T1'],
      });
    });

    test('handles invalid action error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Invalid action',
        errors: { action_type: ['Action not allowed in current state'] },
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(400, errorResponse);

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action: 'invalid_action',
        parameters: {},
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 400');
    });

    test('handles not your turn error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Not your turn',
        errors: undefined,
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(403, errorResponse);

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action: 'place_piece',
        parameters: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 403');
    });
  });

  describe('useForfeitGame', () => {
    test('forfeits game successfully', async () => {
      const forfeitedGame = {
        ...mockGame,
        status: 'completed' as const,
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(200, { data: forfeitedGame });

      const { result } = renderHook(() => useForfeitGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.status).toBe('completed');
    });

    test('invalidates game query on forfeit', async () => {
      const forfeitedGame = { ...mockGame, status: 'completed' as const };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(200, { data: forfeitedGame });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useForfeitGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['game', '01HQ5X9K3G2YM4N6P7Q8R9S0T1'],
      });
    });

    test('handles already completed game error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Game already completed',
        errors: undefined,
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(400, errorResponse);

      const { result } = renderHook(() => useForfeitGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 400');
    });
  });

  describe('useGameOptions', () => {
    test('fetches game options successfully', async () => {
      const mockOptions = {
        valid_actions: ['place_piece', 'forfeit'],
        valid_columns: [0, 1, 2, 3, 4, 5, 6],
      };
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/options').reply(200, { data: mockOptions });

      const { result } = renderHook(() => useGameOptions(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOptions);
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(
        () => useGameOptions(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1', { enabled: false }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });
  });

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
        .onGet('/matchmaking/lobbies', { params: { game_title: 'validate-four' } })
        .reply(200, mockResponse);

      const { result } = renderHook(
        () => useLobbiesQuery(apiClient, { game_title: 'validate-four' }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mock.history.get[0].params).toEqual({ game_title: 'validate-four' });
    });
  });

  describe('useLobbyQuery', () => {
    test('fetches lobby successfully', async () => {
      mock.onGet('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789').reply(200, { data: mockLobby });

      const { result } = renderHook(() => useLobbyQuery(apiClient, '01HQ5XABCDEFGHIJK123456789'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLobby);
      expect(result.current.data?.players).toHaveLength(1);
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(
        () => useLobbyQuery(apiClient, '01HQ5XABCDEFGHIJK123456789', { enabled: false }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });
  });

  describe('useCreateLobby', () => {
    test('creates lobby successfully', async () => {
      mock.onPost('/matchmaking/lobbies').reply(200, { data: mockLobby });

      const { result } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const createRequest: CreateLobbyRequest = {
        game_title: 'validate-four',
        mode: 'standard',
        is_public: true,
        min_players: 2,
      };

      result.current.mutate(createRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(mockLobby);
    });

    test('invalidates lobbies query on create', async () => {
      mock.onPost('/matchmaking/lobbies').reply(200, { data: mockLobby });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const createRequest: CreateLobbyRequest = {
        game_title: 'validate-four',
        mode: 'standard',
        is_public: true,
        min_players: 2,
      };

      result.current.mutate(createRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lobbies'] });
    });
  });

  describe('useJoinLobby', () => {
    test('joins lobby successfully', async () => {
      const updatedLobby = {
        ...mockLobby,
        players: [...mockLobby.players, { username: 'player2', is_ready: false }],
      };
      mock
        .onPut('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789/players/player2')
        .reply(200, { data: updatedLobby });

      const { result } = renderHook(
        () => useJoinLobby(apiClient, '01HQ5XABCDEFGHIJK123456789', 'player2'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.players).toHaveLength(2);
    });

    test('invalidates lobby and lobbies queries on join', async () => {
      mock
        .onPut('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789/players/player2')
        .reply(200, { data: mockLobby });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useJoinLobby(apiClient, '01HQ5XABCDEFGHIJK123456789', 'player2'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lobby', '01HQ5XABCDEFGHIJK123456789'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lobbies'] });
    });
  });

  describe('useRemoveLobbyPlayer', () => {
    test('removes player successfully', async () => {
      mock.onDelete('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789/players/player2').reply(204);

      const { result } = renderHook(
        () => useRemoveLobbyPlayer(apiClient, '01HQ5XABCDEFGHIJK123456789', 'player2'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useDeleteLobby', () => {
    test('deletes lobby successfully', async () => {
      mock.onDelete('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789').reply(204);

      const { result } = renderHook(() => useDeleteLobby(apiClient, '01HQ5XABCDEFGHIJK123456789'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useStartReadyCheck', () => {
    test('starts ready check successfully', async () => {
      const mockResponse = { data: { message: 'Ready check started' } };
      mock
        .onPost('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789/ready-check')
        .reply(200, mockResponse);

      const { result } = renderHook(
        () => useStartReadyCheck(apiClient, '01HQ5XABCDEFGHIJK123456789'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.message).toBe('Ready check started');
    });
  });

  describe('useJoinQuickplay', () => {
    test('joins quickplay queue successfully', async () => {
      const mockResponse = { data: { message: 'Joined quickplay queue' } };
      mock.onPost('/matchmaking/queue').reply(200, mockResponse);

      const { result } = renderHook(() => useJoinQuickplay(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate({ game_title: 'validate-four', mode: 'standard' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.message).toBe('Joined quickplay queue');
    });
  });

  describe('useLeaveQuickplay', () => {
    test('leaves quickplay queue successfully', async () => {
      mock.onDelete('/matchmaking/queue/01HQ5XQUEUE123456789ABC').reply(204);

      const { result } = renderHook(() => useLeaveQuickplay(apiClient, '01HQ5XQUEUE123456789ABC'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useRequestRematch', () => {
    test('requests rematch successfully', async () => {
      const mockResponse = { data: { ulid: 'proposal_123', message: 'Rematch requested' } };
      mock.onPost('/matchmaking/proposals').reply(200, mockResponse);

      const { result } = renderHook(
        () => useRequestRematch(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      result.current.mutate({});

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.message).toBe('Rematch requested');
      expect(result.current.data?.data.ulid).toBe('proposal_123');
    });
  });

  describe('useAcceptRematch', () => {
    test('accepts rematch successfully', async () => {
      const mockResponse = { data: { message: 'Rematch accepted' } };
      mock.onPost('/matchmaking/proposals/proposal_123/accept').reply(200, mockResponse);

      const { result } = renderHook(() => useAcceptRematch(apiClient, 'proposal_123'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.message).toBe('Rematch accepted');
    });
  });

  describe('useDeclineRematch', () => {
    test('declines rematch successfully', async () => {
      const mockResponse = { data: { message: 'Rematch declined' } };
      mock.onPost('/matchmaking/proposals/proposal_123/decline').reply(200, mockResponse);

      const { result } = renderHook(() => useDeclineRematch(apiClient, 'proposal_123'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.message).toBe('Rematch declined');
    });
  });

  describe('integration tests', () => {
    test('complete game flow: fetch → action → verify cache invalidation', async () => {
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1').reply(200, { data: mockGame });
      const updatedGame = { ...mockGame, current_turn: '01J3PLY2' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(200, { data: updatedGame });

      const { result: gameResult } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => expect(gameResult.current.isSuccess).toBe(true));
      expect(gameResult.current.data?.current_turn).toBe('01J3PLY1');

      const { result: actionResult } = renderHook(
        () => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      const actionRequest: SubmitActionRequest = {
        action: 'place_piece',
        parameters: { column: 3 },
      };

      actionResult.current.mutate(actionRequest);

      await waitFor(() => expect(actionResult.current.isSuccess).toBe(true));
      expect(actionResult.current.data?.data.current_turn).toBe('01J3PLY2');
    });

    test('lobby flow: create → join → delete', async () => {
      mock.onPost('/matchmaking/lobbies').reply(200, { data: mockLobby });
      mock
        .onPut('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789/players/player2')
        .reply(200, { data: mockLobby });
      mock.onDelete('/matchmaking/lobbies/01HQ5XABCDEFGHIJK123456789').reply(204);

      const { result: createResult } = renderHook(() => useCreateLobby(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      createResult.current.mutate({
        game_title: 'validate-four',
        mode: 'standard',
        is_public: true,
        min_players: 2,
      });

      await waitFor(() => expect(createResult.current.isSuccess).toBe(true));

      const { result: joinResult } = renderHook(
        () => useJoinLobby(apiClient, '01HQ5XABCDEFGHIJK123456789', 'player2'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      joinResult.current.mutate();
      await waitFor(() => expect(joinResult.current.isSuccess).toBe(true));

      const { result: deleteResult } = renderHook(
        () => useDeleteLobby(apiClient, '01HQ5XABCDEFGHIJK123456789'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      deleteResult.current.mutate();
      await waitFor(() => expect(deleteResult.current.isSuccess).toBe(true));
    });
  });
});
