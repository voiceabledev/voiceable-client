import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            // Keep React, React DOM, and all React-dependent libraries together
            // This ensures React is available when other libraries need createContext, forwardRef, etc.
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('@radix-ui') ||
              id.includes('react-router') ||
              id.includes('react-hook-form') ||
              id.includes('@tanstack/react-query') ||
              id.includes('framer-motion') ||
              id.includes('cmdk')
            ) {
              return 'react-vendor';
            }
            // Separate large third-party libraries that don't depend on React
            if (id.includes('@stripe')) {
              return 'stripe';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // All other node_modules
            return 'vendor';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production for debugging (optional)
    sourcemap: false,
  },
}));
