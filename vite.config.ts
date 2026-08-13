import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    // Rolldown currently needs the concrete ESM entry for this Amplify dependency.
    alias: {
      tslib: fileURLToPath(new URL("./node_modules/tslib/tslib.es6.mjs", import.meta.url)),
    },
  },
});
