import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include crypto specifically for retell-sdk
      include: ["crypto"],
      // Add globals that might be needed
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
