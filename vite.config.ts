
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically define only the needed env var for security.
    // This replaces occurrences of process.env.API_KEY in the source code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  // esbuild is Vite's default and faster minifier.
  // We use it here to drop production logs without requiring the 'terser' package.
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production to reduce bundle size and hide source logic
    minify: 'esbuild',
    target: 'esnext'
  }
});
