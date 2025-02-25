import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class UserOptionsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    //selectors
    this.userOptionsSubNavBtnsSelector = "mud-nav-link mud-ripple mud-expanded";
  }
}
