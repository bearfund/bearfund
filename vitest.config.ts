import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Test file patterns
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.vscode'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/test-utils/**',
        'src/index.ts',
        'src/native.ts',
        'src/types/**', // Types don't need coverage
      ],
      // Thresholds (adjusted for current test coverage - will increase as we add hook tests)
      thresholds: {
        statements: 13,
        branches: 35,
        functions: 5,
        lines: 13,
      },
    },

    // Setup file for global test configuration
    setupFiles: ['./src/test-utils/setup.ts'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
