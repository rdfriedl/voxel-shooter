// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "./game",
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  build: {
    outDir: "../dist/game",
    emptyOutDir: true,
  },
});
