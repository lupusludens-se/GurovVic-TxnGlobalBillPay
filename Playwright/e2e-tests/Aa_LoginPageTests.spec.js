import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { PinModal } from "../pages/components/PinModal";
import { faker } from "@faker-js/faker";

test.describe("Login page", () => {
  let login;
  let resources;
  let pinModal;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    resources = new CommonTestResources();
    pinModal = new PinModal(page);
    await login.navigate(resources.environmentURL);
    await login.checkSchneiderElectricPaymentPortalTitle();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("Attributes presence", async ({ page }) => {
    await expect(login.logo).toBeVisible();
    await expect(login.enterYourEmailHeader).toHaveText(resources.commonUItext.ENTER_EMAIL);
    await expect(login.enterYourEmailToBeginPayment).toHaveText(resources.commonUItext.USE_EMAIL_FOR_PAYMENT);
    await expect(login.emailInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(login.emailInput).toBeEmpty();
  });

  test("Invalid email rejected", async ({ page }) => {
    await expect(login.logo).toBeVisible();
    await login.enterEmail(faker.internet.email());
    await login.clickOnSubmitBtn();
    await login.invalidEmailAddressToastMessage.waitFor();
    await expect(login.invalidEmailAddressToastMessage).toBeVisible();
    await login.closeErrorMessageButton.click();
    await login.invalidEmailAddressToastMessage.waitFor();
    await expect(login.invalidEmailAddressToastMessage).not.toBeVisible();
    await expect(page).toHaveURL(`${resources.environmentURL}/Login/`);
  });

  test("Valid email accepted", async ({ page }) => {
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();
    await login.passwordTextAboveTheField.waitFor();
    await expect(login.passwordTextAboveTheField).toBeVisible();
    await expect(login.pwdInput).toBeEmpty();
    await expect(login.submitButton).toBeVisible();
  });

  test("Invalid password rejected", async ({ page }) => {
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();
    await login.enterPWD(faker.internet.password());
    await login.clickOnSubmitBtn();
    await login.isVerificationCompletedVisible();
    await expect(page).toHaveURL(`${resources.environmentURL}/Login/`);
  });

  test("Login with valid password", async () => {
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();
    await login.enterPWD(resources.password);
    await login.clickOnSubmitBtn();
    await login.isVerificationCompletedVisible();
  });

  test("MFA pop-up attributes presence", async () => {
    await login.enterEmail(resources.mfaEmail);
    await login.clickOnSubmitBtn();
    await expect(pinModal.enterPinNumberHeader).toBeVisible();
    await expect(pinModal.pinNumberTextField).toBeVisible(); 
    await expect(pinModal.submitBtn).toBeEnabled(); 
    await expect(pinModal.sendAgainBtn).toBeEnabled(); 
    await expect(pinModal.transactionSecureText).toBeVisible(); 
  });
});