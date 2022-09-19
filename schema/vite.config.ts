import { defineConfig } from "vite";
import pkg from "./package.json";

const dependencies = Object.keys(pkg.dependencies ?? {});
const devDependencies = Object.keys(pkg.devDependencies ?? {});

export default defineConfig({
  build: {
    target: "es2020",
    lib: {
      entry: "./src/index",
      formats: ["es"],
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [...dependencies, ...devDependencies],
    },
  },
});
