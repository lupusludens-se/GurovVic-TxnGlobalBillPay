import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { PinModal } from "../pages/components/PinModal";
import { faker } from "@faker-js/faker";

test.describe("1000 chars login rejected", () => {
  let login;
  let resources;
  let pinModal;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    resources = new CommonTestResources();
    pinModal = new PinModal(page);
    await login.navigate(resources.environmentURL);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

   test("1000 chars login rejected", async () => {
    // Generate a local part longer than 64 characters
    const localPart = faker.internet.userName().padEnd(65, 'a'); // 65 characters
    
    // Generate a domain part longer than 253 characters
    const domainPart = faker.internet.domainName().padEnd(254, 'b'); // 254 characters
    
    // Create the email with total length of 1000 characters
    const totalEmail = `${localPart}@${domainPart}`;
    const remainingChars = 1000 - totalEmail.length;

    // Extend the email to reach 1000 characters
    const fullEmail = `${totalEmail}${'c'.repeat(remainingChars)}`; // Fill remaining with 'c'

    // Enter the generated email to the login field
    await login.enterEmail(fullEmail); // Enter the generated email
    await login.clickOnSubmitBtn(); // Click submit

    // Expect an invalid email error to be visible
    await expect(login.invalidEmailAddressToastMessage).toBeVisible({ timeout: 5000 });
    await login.closeErrorMessageButton.click(); // Close the error message

    // After maximum attempts, check if the error message is still visible
    await expect(login.invalidEmailAddressToastMessage).toBeVisible({ timeout: 5000 });

    // Log lengths in one statement
    console.log(`Total Length: "${fullEmail.length}". \nEmail: "${fullEmail}".  \nLocal Part Length: "${localPart.length}". \nDomain Part Length: "${domainPart.length}"`);

  });

});