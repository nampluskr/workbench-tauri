import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Tauri dev server settings: fixed port so tauri.conf.json devUrl matches.
export default defineConfig({
  plugins: [solid()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  define: { __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString("sv")) }, // I-29: the About window's Date
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
