import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// fs.allow lets the dev server read ../results/metrics.json (single source of truth for metrics).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, fs: { allow: [".."] } },
});
