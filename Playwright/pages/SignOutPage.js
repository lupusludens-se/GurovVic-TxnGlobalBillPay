import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SignOutPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.schneiderLogoInSignOut = page.getByRole("img").nth(1);
    this.areYouSureToSignOut = page.getByRole("heading", {
      name: "Are you sure you would like",
    });
    this.confirmBtn = page.getByRole("button", { name: "Confirm" });
    this.genericLogo = page.getByRole("complementary").getByRole("img");
  }
}
