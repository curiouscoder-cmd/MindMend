import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';

// Generate manual chunks for each dependency
function renderChunks(deps) {
  const chunks = {};
  Object.keys(deps).forEach((key) => {
    // Keep core React dependencies together
    if (['react', 'react-dom', 'react-scripts'].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor bundle
          'react-vendor': ['react', 'react-dom'],
          // Chart vendor bundle
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          // Animation vendor bundle
          'motion-vendor': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app'],
  },
})
