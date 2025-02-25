import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class EditMyInfoPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.profileInformationHeader = page.getByRole("heading", {
      name: "Profile Information",
    });
    this.accountEmail = page.locator('p:has-text("Account Email:")');
    this.phoneNo = page.locator('p:has-text("Phone Number: ")');
    this.newEmailTextField = page.getByPlaceholder("New Email");
    this.confirmEmailTextField = page.getByPlaceholder("Confirm Email");
    this.verifyIdentityBtn = page.getByRole("button", {
      name: "Verify Identity",
    });
    this.updateInformationBtn = page.getByRole("button", {
      name: "Update Information",
    });
  }

  async verifyUserDetails(element, expectedText, label) {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    const actualText = await element.textContent();
    // Extract the relevant text by removing the label
    const extractedText = actualText.replace(label, "").trim();
    expect(extractedText).toBe(expectedText);
  }
}
