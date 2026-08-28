import { defineConfig } from '@playwright/test';

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/system',
  fullyParallel: false,
  forbidOnly: ci,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      scale: 'css',
    },
  },
  outputDir: 'output/playwright/test-results',
  reporter: ci
    ? [
        ['line'],
        ['html', { outputFolder: 'output/playwright/report', open: 'never' }],
      ]
    : [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    colorScheme: 'dark',
    locale: 'en-US',
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    video: 'off',
    viewport: { width: 1280, height: 1000 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command:
      'node scripts/serve-system-fixtures.js --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/__health',
    // Never attach to an unrelated local process; the test run owns this server.
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
