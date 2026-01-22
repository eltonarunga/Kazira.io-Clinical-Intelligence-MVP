
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically define only the needed env var for security
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production to reduce bundle size and hide source logic
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove logs for production security
        drop_debugger: true
      }
    }
  }
});
