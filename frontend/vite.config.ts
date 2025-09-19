import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'  // Add this import
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()  // Add the Tailwind Vite plugin
  ],
  
  // Resolve @ to src directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/miniapp': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // Optimize for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // Define global constants
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
})