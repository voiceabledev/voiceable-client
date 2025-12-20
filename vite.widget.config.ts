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
 * Output: ../backend/public/widget.js (served by Rails at /widget.js)
 * 
 * The widget is output directly to the Rails public folder so it can be
 * served as a static file at the root URL (e.g., https://yourdomain.com/widget.js)
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
    // Output directly to the Rails backend public folder
    // Rails automatically serves files from public/ at the root URL
    outDir: path.resolve(__dirname, '../backend/public'),
    
    // Don't clear the output directory - we're writing to backend/public which has other files
    emptyOutDir: false,
    
    // Don't copy public folder files - they would conflict with existing backend public files
    copyPublicDir: false,
    
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

