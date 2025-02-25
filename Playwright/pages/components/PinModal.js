export class PinModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.enterPinNumberHeader = page.getByText("Enter the PIN Number sent to");
    this.pinNumberTextField = page.getByPlaceholder("000000");
    this.submitBtn = page
      .getByLabel("Enter the PIN Number sent to")
      .getByRole("button", { name: "Submit" });
    this.sendAgainBtn = page.getByRole("button", { name: "Send again" });
    this.closeIcon = page.locator('[title="Close"]');
    this.toastInvalidPin = page.locator(".k-overlay");
    this.transactionSecureText = page.locator(
      "text=By using a device to validate your email, we are making your transaction more secure."
    );
    this.pinValidationCanceledToast = page.locator(
      "text=PIN validation canceled"
    );
  }
}
