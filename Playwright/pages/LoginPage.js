import { BasePage } from "./BasePage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { PinModal } from "./components/PinModal";
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.resources = new CommonTestResources();
    this.pinModal = new PinModal(page);
    this.logo = page.getByRole("img", { name: "CardSecure" });
    this.schneiderElectricPaymentPortalTitle = "Schneider Electric Payment Portal";
    this.enterYourEmailHeader = page.getByRole("heading", {
      name: "Enter your email",
    });
       this.enterYourEmailToBeginPayment = page
      .locator("a")
      .filter({ hasText: "Use your email to begin payment" });
    this.emailInput = page.getByLabel("Email address");
    this.submitButton = page.locator('text="Submit"');
    this.pwdInput = page.getByPlaceholder("Enter password");
    this.verificationCompletedText = page.locator(
      "text=Verification completed. Welcome, power user!"
    );
    this.invalidEmailAddressToastMessage = page.locator(
      "text=You are not a current customer. Please reach out to our administrator to sign up"
    );
    this.passwordTextAboveTheField = page.locator("text=Password");
    this.invalidPasswordToastMessage = page.getByText("The password entered is incorrect.", { exact: false });
    
    this.closeErrorMessageButton = page
      .locator("#mud-snackbar-container")
      .getByRole("button");
    this.errorWithLogin = page.locator("#blazor-error-ui");
  }

  async navigate(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState("domcontentloaded");
    const isErrorVisible = await this.errorWithLogin.isVisible();
    if (isErrorVisible) {
      // Navigate to the URL again if error UI is detected
      await this.page.goto(url);
      await this.page.waitForLoadState("domcontentloaded");
    }
  }

  async enterEmail(email) {
    await this.emailInput.click();
    await this.page.waitForTimeout(4000);
    await this.emailInput.fill(email);
  }

  async clickOnSubmitBtn() {
    await this.submitButton.click({ force: true, timeout: 10000 });
  }

  async enterPWD(pwd) {
    await this.page.waitForTimeout(2000);
    await this.pwdInput.click();
    await this.pwdInput.fill(pwd);
  }

  async checkSchneiderElectricPaymentPortalTitle() {
    await expect(this.page).toHaveTitle(this.schneiderElectricPaymentPortalTitle);
  }

  async isVerificationCompletedVisible() {
    await this.verificationCompletedText.isVisible({ timeout: 10000 });
  }

  async loginAsUser(email, password) {
    await this.navigate(this.resources.environmentURL);
    await this.enterEmail(email);
    await this.clickOnSubmitBtn();
    await this.enterPWD(password);
    await this.clickOnSubmitBtn();
    return;
  }

  async submitPinNumberInModal({ pinNumber }) {
    await this.pinModal.enterPinNumberHeader.waitFor({ state: "visible" });
    await this.pinModal.pinNumberTextField.fill(pinNumber.toString());
    await this.pinModal.submitBtn.waitFor({ state: "visible" });
    await this.pinModal.submitBtn.click({ timeout: 10000 });
    return;
  }
}
