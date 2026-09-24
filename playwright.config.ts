import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:8091',
    channel: 'chrome',
    viewport: { width: 1100, height: 900 },
  },
  webServer: {
    command: 'npx expo start --offline --port 8091',
    url: 'http://localhost:8091',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
