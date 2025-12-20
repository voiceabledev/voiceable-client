import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vite configuration for building the standalone embeddable widget.
 * 
 * This creates a single JavaScript file that can be loaded on any website
 * to add the voice agent widget.
 * 
 * Build command: npm run build:widget
 * Output: dist/widget/widget.js
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Ensure React is in production mode
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    // Output to a separate directory
    outDir: 'dist/widget',
    
    // Clear the output directory
    emptyOutDir: true,
    
    // Library mode configuration
    lib: {
      // Entry point
      entry: path.resolve(__dirname, 'src/widget/widget-entry.ts'),
      
      // Output as IIFE (Immediately Invoked Function Expression)
      // This creates a standalone script that can be loaded directly
      formats: ['iife'],
      
      // Output filename
      name: 'VoiceAgentWidget',
      fileName: () => 'widget.js',
    },
    
    rollupOptions: {
      output: {
        // Ensure all dependencies are bundled inline
        inlineDynamicImports: true,
        
        // No code splitting - single file output
        manualChunks: undefined,
        
        // Minimize external dependencies
        globals: {},
      },
    },
    
    // Minification for smaller bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.error for debugging
        drop_debugger: true,
      },
    },
    
    // Generate source maps for debugging (optional)
    sourcemap: false,
    
    // Target modern browsers
    target: 'es2020',
    
    // CSS handling - inline styles
    cssCodeSplit: false,
  },
});

