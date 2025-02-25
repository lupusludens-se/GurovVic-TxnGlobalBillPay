import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { faker } from "@faker-js/faker";

test.describe("User login email validation", () => {
  let login;
  let resources;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    resources = new CommonTestResources();
    await login.navigate(resources.environmentURL); // Navigate before each test
  });

  test("Rejects invalid email after max attempts", async () => {
    const maxAttempts = 12; // Set the number of attempts for invalid logins
    let attempts = 0;

    // Loop to attempt submitting invalid emails
    for (let i = 0; i < maxAttempts; i++) {
      const invalidEmail = faker.internet.email(); // Generate a random email
      await login.enterEmail(invalidEmail); // Enter invalid email
      await login.clickOnSubmitBtn(); // Click submit

      attempts++; // Increment attempts
      await expect(login.invalidEmailAddressToastMessage).toBeVisible({ timeout: 5000 });

      // Close the error message after each attempt
      await login.closeErrorMessageButton.click();
    }

    // After maximum attempts, simulate a blocking indication
    console.log(`Too many: "${attempts}" invalid login attempts. Please contact support.`);

    // After maximum attempts, check if the error message is still visible
    await expect(login.invalidEmailAddressToastMessage).toBeVisible({ timeout: 5000 });

    });
});
