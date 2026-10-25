import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests cover server actions and utilities only (no component tests), so .tsx files are excluded.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
  },
});
