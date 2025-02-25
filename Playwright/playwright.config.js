// @ts-check
const { defineConfig, devices } = require("@playwright/test");
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

if (path.resolve("env")) {
  require("dotenv").config({ path: ".env" });
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./e2e-tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 7 : undefined,
  /* Maximum time one test can run for. */
  timeout: 100 * 1000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 80,
      maxDiffPixelRatio: 0.2,
    },
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixels: 80,
      maxDiffPixelRatio: 0.2,
    },
  },
  // Limit the number of failures on CI to save resources
  maxFailures: process.env.CI ? 30 : undefined,
  reporter: "html",
  outputDir: `${process.cwd()}/test-results`,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    launchOptions: {
      args: ["--disable-cache"], // disable cache. Allows to pull data directly from server
    },
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 5000,
    navigationTimeout: 10000, // Timeout for page navigation
    ignoreHTTPSErrors: true,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    permissions: ["geolocation"],
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: `${process.cwd()}/e2e-tests/**`,
      grepInvert: process.env.CI ? /@not_parallel/ : undefined, // Exclude @not_parallel in CI
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: `${process.cwd()}/e2e-tests/**`,
      grepInvert: process.env.CI ? /@not_parallel/ : undefined, // Exclude @not_parallel in CI
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: `${process.cwd()}/e2e-tests/**`,
      grepInvert: process.env.CI ? /@not_parallel/ : undefined, // Exclude @not_parallel in CI
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
