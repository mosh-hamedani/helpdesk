import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun run --cwd server --env-file=.env.test src/index.ts",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "VITE_API_URL=http://localhost:3001 bun run --cwd client vite --port 5174",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
