// vitest.config.ts
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname),
    },
  },
  test: {
    testTimeout: 15000,
    globalSetup: ["./tests/globalTeardown.ts"],
  },
});
