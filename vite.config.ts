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
    // Temporarily disable manual chunking to fix React availability issues
    // This ensures all dependencies are available when needed
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically - it's better at managing dependencies
        // manualChunks: undefined,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production for debugging (optional)
    sourcemap: false,
  },
}));
