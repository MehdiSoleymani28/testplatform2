import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    headless: true,
    actionTimeout: 0,
    navigationTimeout: 30_000,
    trace: 'off',
    viewport: { width: 1366, height: 900 },
  },
  outputDir: 'test-results',
});