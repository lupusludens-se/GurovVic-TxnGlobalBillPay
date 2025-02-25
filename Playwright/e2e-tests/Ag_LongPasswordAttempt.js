import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { faker } from "@faker-js/faker";

test.describe("1024 chars password rejected", () => {
  let login;
  let resources;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    resources = new CommonTestResources();
    await login.navigate(resources.environmentURL); // Navigate before each test
  });

  test("1024 chars password rejected", async () => {
    // Enter email first
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();

    // Generate a long invalid password (1024 characters) with randomized characters
    const longInvalidPassword = faker.string.alphanumeric(1024); // 1024 random alphanumeric characters

    // Enter the long invalid password
    await login.enterPWD(longInvalidPassword); // Enter the long invalid password
    await login.clickOnSubmitBtn(); // Click submit

    // Expect the invalid password toast message to be visible
    await expect(login.invalidPasswordToastMessage).toBeVisible({ timeout: 5000 });

    // Close the error message
    await login.closeErrorMessageButton.click();

    // After attempt, check if the error message is still visible
    await expect(login.invalidPasswordToastMessage).toBeVisible({ timeout: 5000 });

    // Log the attempt indication
    console.log(`Total length: "${longInvalidPassword.length}". \nAttempted login with 1024 chars password: "${longInvalidPassword}"`);
  });
});