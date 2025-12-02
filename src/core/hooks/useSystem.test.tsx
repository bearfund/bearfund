/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosInstance } from 'axios';
import type { ReactNode } from 'react';
import {
  useHealthQuery,
  useTimeQuery,
  useConfigQuery,
  useSubmitFeedback,
  useLibraryQuery,
  useGameTitleQuery,
  useGameRulesQuery,
  useGameEntitiesQuery,
} from './useSystem';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Wrapper;
}

describe('useHealthQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches system health successfully', async () => {
    const mockHealth = {
      status: 'healthy',
      version: '1.2.3',
      database: 'connected',
      timestamp: 1234567890,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockHealth });

    const { result } = renderHook(() => useHealthQuery(mockedAxios as unknown as AxiosInstance), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockHealth);
    expect(mockedAxios.get).toHaveBeenCalledWith('/system/health');
  });

  it('supports custom refetch interval', async () => {
    const mockHealth = {
      status: 'healthy',
      version: '1.2.3',
      database: 'connected',
      timestamp: 1234567890,
    };

    mockedAxios.get.mockResolvedValue({ data: mockHealth });

    const { result } = renderHook(
      () => useHealthQuery(mockedAxios as unknown as AxiosInstance, { refetchInterval: 5000 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockHealth);
  });
});

describe('useTimeQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches server time successfully', async () => {
    const mockTime = {
      timestamp: 1234567890,
      iso8601: '2024-01-01T00:00:00Z',
      timezone: 'UTC',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockTime });

    const { result } = renderHook(() => useTimeQuery(mockedAxios as unknown as AxiosInstance), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTime);
    expect(mockedAxios.get).toHaveBeenCalledWith('/system/time');
  });
});

describe('useConfigQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches platform configuration successfully', async () => {
    const mockConfig = {
      api_version: '1.0.0',
      platform_name: 'GamerProtocol',
      features: {
        realtime_enabled: true,
        webhooks_enabled: true,
        analytics_enabled: false,
      },
      supported_games: ['chess', 'checkers', 'tictactoe'],
      limits: {
        max_concurrent_games: 10,
        max_lobby_size: 8,
        rate_limit_per_minute: 60,
      },
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockConfig });

    const { result } = renderHook(() => useConfigQuery(mockedAxios as unknown as AxiosInstance), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockConfig);
    expect(mockedAxios.get).toHaveBeenCalledWith('/system/config');
  });
});

describe('useSubmitFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits bug report successfully', async () => {
    const mockResponse = {
      id: 'fbk_123',
      type: 'bug',
      status: 'received',
      message: 'Thank you for your feedback!',
      created_at: '2024-01-01T00:00:00Z',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(
      () => useSubmitFeedback(mockedAxios as unknown as AxiosInstance),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({
      type: 'bug',
      content: 'Found a bug',
      metadata: { page: '/game' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('/system/feedback', {
      type: 'bug',
      content: 'Found a bug',
      metadata: { page: '/game' },
    });
  });

  it('submits feature request successfully', async () => {
    const mockResponse = {
      id: 'fbk_456',
      type: 'feature',
      status: 'received',
      message: 'Thank you for your suggestion!',
      created_at: '2024-01-01T00:00:00Z',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(
      () => useSubmitFeedback(mockedAxios as unknown as AxiosInstance),
      {
        wrapper: createWrapper(),
      }
    );

    result.current.mutate({
      type: 'feature',
      content: 'Add dark mode',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
  });
});

describe('useLibraryQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches game library successfully', async () => {
    const mockLibrary = {
      games: [
        { title: 'chess', display_name: 'Chess', version: '1.0.0' },
        { title: 'checkers', display_name: 'Checkers', version: '1.0.0' },
      ],
      total: 2,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockLibrary });

    const { result } = renderHook(() => useLibraryQuery(mockedAxios as unknown as AxiosInstance), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLibrary);
    expect(mockedAxios.get).toHaveBeenCalledWith('/library');
  });
});

describe('useGameTitleQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches game title successfully', async () => {
    const mockGameTitle = {
      title: 'chess',
      display_name: 'Chess',
      version: '1.0.0',
      description: 'Classic chess game',
      min_players: 2,
      max_players: 2,
      supported_modes: ['standard', 'blitz', 'rapid'],
      metadata: { difficulty: 'medium' },
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockGameTitle });

    const { result } = renderHook(
      () => useGameTitleQuery(mockedAxios as unknown as AxiosInstance, 'chess'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGameTitle);
    expect(mockedAxios.get).toHaveBeenCalledWith('/library/chess');
  });

  it('does not fetch when gameTitle is not provided', () => {
    const { result } = renderHook(
      () => useGameTitleQuery(mockedAxios as unknown as AxiosInstance, ''),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});

describe('useGameRulesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches game rules successfully', async () => {
    const mockRules = {
      title: 'chess',
      version: '1.0.0',
      rules: {
        objective: 'Checkmate the opponent',
        setup: 'Standard 8x8 board',
        gameplay: 'Turn-based movement',
      },
      examples: [{ move: 'e2-e4', description: 'Opening move' }],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockRules });

    const { result } = renderHook(
      () => useGameRulesQuery(mockedAxios as unknown as AxiosInstance, 'chess'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRules);
    expect(mockedAxios.get).toHaveBeenCalledWith('/library/chess/rules');
  });

  it('does not fetch when gameTitle is not provided', () => {
    const { result } = renderHook(
      () => useGameRulesQuery(mockedAxios as unknown as AxiosInstance, ''),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});

describe('useGameEntitiesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches game entities successfully', async () => {
    const mockEntities = {
      title: 'chess',
      version: '1.0.0',
      entities: {
        pieces: ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'],
        board: { type: 'grid', dimensions: { rows: 8, columns: 8 } },
      },
      schemas: {
        move: { from: 'string', to: 'string' },
        position: { row: 'number', column: 'number' },
      },
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockEntities });

    const { result } = renderHook(
      () => useGameEntitiesQuery(mockedAxios as unknown as AxiosInstance, 'chess'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEntities);
    expect(mockedAxios.get).toHaveBeenCalledWith('/library/chess/entities');
  });

  it('does not fetch when gameTitle is not provided', () => {
    const { result } = renderHook(
      () => useGameEntitiesQuery(mockedAxios as unknown as AxiosInstance, ''),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
