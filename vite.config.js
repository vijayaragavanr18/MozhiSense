import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Listen on all network interfaces for mobile testing
    strictPort: false, // Use alternative port if 3000 is taken
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Don't generate sourcemaps for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendors': ['react', 'react-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

