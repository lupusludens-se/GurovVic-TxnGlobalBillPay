import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { faker } from "@faker-js/faker";

test.describe("Invalid password rejected after multiple attempts", () => {
  let login;
  let resources;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    resources = new CommonTestResources();
    await login.navigate(resources.environmentURL); // Navigate before each test
  });

  test("Invalid password rejected after multiple attempts", async () => {
    const maxAttempts = 12; // Set the number of attempts for invalid passwords
    let attempts = 0;

    // Enter email first
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();

    // Loop to attempt submitting invalid passwords
    for (let i = 0; i < maxAttempts; i++) {
      const invalidPassword = faker.internet.password(); // Generate a random password
      await login.enterPWD(invalidPassword); // Enter invalid password
      await login.clickOnSubmitBtn(); // Click submit

      attempts++; // Increment attempts
      await expect(login.invalidPasswordToastMessage).toBeVisible({ timeout: 5000 });

      // Close the error message after each attempt
      await login.closeErrorMessageButton.click();
    }

    // After maximum attempts, simulate a blocking indication
    console.log(`Too many: "${attempts}" invalid password attempts. Please contact support.`);

    // After maximum attempts, check if the error message is still visible
    await expect(login.invalidPasswordToastMessage).toBeVisible({ timeout: 5000 });

  });
});
