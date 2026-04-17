import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "server.ts" },
  format: "esm",
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
});
