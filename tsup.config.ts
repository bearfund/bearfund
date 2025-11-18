import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    index: 'src/index.ts',
    native: 'src/native.ts',
  },
  
  // Output formats (dual CJS/ESM per plan.md)
  format: ['cjs', 'esm'],
  
  // Generate TypeScript declarations
  dts: true,
  
  // Source maps for debugging
  sourcemap: true,
  
  // Clean dist before build
  clean: true,
  
  // Split chunks for better tree-shaking
  splitting: true,
  
  // Minify production builds
  minify: false, // Keep readable for now, can enable for production
  
  // External dependencies (not bundled)
  external: [
    'react',
    'react-native',
    '@tanstack/react-query',
    'axios',
    'laravel-echo',
    'pusher-js',
  ],
  
  // Tree-shaking
  treeshake: true,
  
  // Target ES2020 per tsconfig
  target: 'es2020',
  
  // Platform-agnostic output
  platform: 'neutral',
});
