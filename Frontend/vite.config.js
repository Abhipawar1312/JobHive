import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit"],
          "vendor-ui": ["framer-motion", "lucide-react", "clsx", "tailwind-merge", "sonner"],
          "vendor-charts": ["recharts"],
          "vendor-editor": ["@uiw/react-md-editor"],
          "vendor-socket": ["socket.io-client"],
        },
      },
    },
  },
})
