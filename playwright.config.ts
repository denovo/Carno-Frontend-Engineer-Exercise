import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4200",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env["CI"]
      ? "npx serve dist/petello/browser -l 4200 --no-clipboard"
      : "ng serve",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
