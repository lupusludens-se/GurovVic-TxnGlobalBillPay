import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { PinModal } from "../pages/components/PinModal";
import { faker } from "@faker-js/faker";

test.describe("Customer Portal: Login Tests", () => {
  let login;
  let resources;
  let pinModal;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    login = new LoginPage(page);
    pinModal = new PinModal(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // QGBP-7
  test("should verify the content of the Customer Portal's login page.", async () => {
    await login.navigate(resources.environmentURL);
    await login.checkSchneiderElectricPaymentPortalTitle();
    await expect(login.logo).toBeVisible({ timeout: 10000 });
    expect(await login.enterYourEmailHeader.innerText()).toEqual(
      resources.commonUItext.ENTER_EMAIL
    );
    expect(await login.enterYourEmailToBeginPayment).toHaveText(
      resources.commonUItext.USE_EMAIL_FOR_PAYMENT
    );
    await expect(login.emailInput).toBeVisible({ timeout: 5000 });
    await expect(login.submitButton).toBeVisible({ timeout: 5000 });
    await expect(login.submitButton).toBeEnabled({ timeout: 5000 });
  });

  // QGBP-19
  test("should verify login restricts invalid customer email address.", async () => {
    await login.navigate(resources.environmentURL);
    await expect(login.logo).toBeVisible({ timeout: 10000 });
    await login.enterEmail(faker.internet.email());
    await login.clickOnSubmitBtn();
    await expect(login.invalidEmailAddressToastMessage).toBeVisible({
      timeout: 15000,
    });
    // click on close button and it should get dismissed
    await login.closeErrorMessageButton.click();
    await expect(login.invalidEmailAddressToastMessage).toBeVisible({
      timeout: 15000,
      visible: false,
    });
  });

  // QGBP-20
  test("should verify the UI of the PIN number pop up and its elements.", async () => {
    await login.navigate(resources.environmentURL);
    await login.enterEmail(resources.mfaEmail);
    await login.clickOnSubmitBtn();
    const timeout = 10000;
    await expect(pinModal.enterPinNumberHeader).toBeVisible({
      timeout: timeout,
    });
    await expect(pinModal.pinNumberTextField).toBeVisible({
      timeout: timeout,
    });
    await expect(pinModal.submitBtn).toBeEnabled({ timeout: timeout });
    await expect(pinModal.sendAgainBtn).toBeEnabled({
      timeout: timeout,
    });
    await expect(pinModal.transactionSecureText).toBeVisible({
      timeout: 10000,
    });
  });

  // QGBP-20
  test("should verify the UI of the PIN number pop up and dismiss the Pin modal when clicked on X icon.", async () => {
    await login.navigate(resources.environmentURL);
    await login.enterEmail(resources.mfaEmail);
    await login.clickOnSubmitBtn();
    // enter invalid pin
    await login.submitPinNumberInModal({
      pinNumber: faker.number.int({ min: 10000, max: 1000000 }),
    });
    await pinModal.closeIcon.waitFor({ state: "attached" });
    // close pin modal (an extra click is required to close the modal, will likely needs to be revisited in the future)
    await pinModal.closeIcon.click({ timeout: 10000, force: true });
    // verify the modal is closed
    await expect(pinModal.enterPinNumberHeader).toBeVisible({
      visible: false,
      timeout: 10000,
    });
  });

  // QGBP-20
  test("should verify that entering no pin and dismissing the Pin modal throws an error in toast.", async () => {
    await login.navigate(resources.environmentURL);
    await login.enterEmail(resources.mfaEmail);
    await login.clickOnSubmitBtn();
    // enter empty pin
    await login.submitPinNumberInModal({
      pinNumber: "",
    });
    // close pin modal
    await pinModal.closeIcon.click({ force: true });
    // verify when entering no pin and dismissing the modal throws an error in toast ("PIN validation canceled")
    await expect(pinModal.pinValidationCanceledToast.first()).toBeVisible({
      timeout: 10000,
    });
  });

  // QGBP-22
  test("should verify that a valid user is restricted from logging in when using an incorrect PIN.", async () => {
    await login.navigate(resources.environmentURL);
    await login.enterEmail(resources.mfaEmail);
    await login.clickOnSubmitBtn();
    // enter invalid pin
    await login.submitPinNumberInModal({
      pinNumber: faker.number.int({ min: 10000, max: 1000000 }),
    });
    // verify when entering an invalid pin the toast is thrown with an error message
    await expect(pinModal.toastInvalidPin).toBeVisible({ timeout: 10000 });
  });

  test("Successful Login by using Password in Customer Portal", async () => {
    await login.navigate(resources.environmentURL);
    await login.enterEmail(resources.email);
    await login.clickOnSubmitBtn();
    await login.enterPWD(resources.password);
    await login.clickOnSubmitBtn();
    await login.isVerificationCompletedVisible();
   });
});
