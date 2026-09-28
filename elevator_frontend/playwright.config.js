const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3000",
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
      command: "uv run uvicorn main:app --host 127.0.0.1 --port 8000",
      cwd: "../elevator_backend",
      url: "http://127.0.0.1:8000/docs",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        BROWSER: "none",
        CI: "true",
      },
    },
  ],
});
