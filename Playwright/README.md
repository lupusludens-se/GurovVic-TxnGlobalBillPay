# What are we using

The GBP Customer Portal application uses Playwright to write end-to-end (E2E) tests.
E2E tests should be written from the end user's perspective to simulate real user scenarios.

# End-to-End Testing by Playwright

Playwright UI test framework that enables reliable end-to-end testing for modern web apps.

Features:

- Supports cross-browser testing.
- Supports cross-platform testing.
- Support for cross-languages(TS, JS, Python, .NET, Java)
- Test Mobile Web.

# Playwright docs

- [Playwright](https://playwright.dev/docs/intro)
- [How to run Playwright tests](https://playwright.dev/docs/running-tests)

# Dependencies and instructions on how to execute tests

## Node

Download and install **NodeJS v20+**

### Dependencies

From `Playwright` directory, install Playwright locally via command-line (generally done once)

```
npm install -D @playwright/test
```

Install new browsers via Playwright command-line (generally done once)

```
npx playwright install
```

Install node modules in `Playwright` directory. Re-install `node_modules` anytime a dependency is updated in `package.json`.

```
npm install
```

Create .env file in the `Playwright` directory and set certain variables as dependencies (reach out to QA team for the content of .env file)

also, run from `Playwright` directory

```
npm install dotenv
```

### To execute tests locally in headed mode with test results

From comamand-line, export `CI` environment variable to run retries and additional workers

```
export CI=1
```

```
npm run playwright:tests:headed
```

### In headless mode

To execute tests locally in headless mode against an environment defined in `.env`

```
npm run playwright:tests
```

For all other specific browser and mobile device execution, please see `package.json` for a list of commands.
