import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    //sideNav items
    this.dashboardSideNav = page.getByRole("link", { name: "Dashboard" });
    this.pendingTxnsSideNav = page.getByRole("link", {
      name: "Pending Transactions",
    });
    this.completedTxnsSideNav = page.getByRole("link", {
      name: "Completed Transactions",
    });
    this.viewPaymentsSideNav = page.getByRole("link", {
      name: "View Payments",
    });
    this.bankAccountsSideNav = page.getByRole("button", {
      name: "Bank Accounts",
    });
    this.myBankAccountsSubNav = page.getByRole("link", {
      name: "My Bank Accounts",
    });
    this.addBankAccountSubNav = page.getByRole("link", {
      name: "Add Bank Account",
    });
    this.userOptionsSideNav = page.getByRole("button", {
      name: "User Options",
    });
    this.editMyInfoSideNav = page.getByRole("link", { name: "Edit My Info" });
    this.signOutSideNav = page.getByRole("link", { name: "Sign Out" });
    //common elements
    this.loadMoreBtn = page.getByRole("button", { name: "Load More" });
    this.searchField = page.getByPlaceholder("Search...").first();
    this.orderInvoiceColumn = page.getByText("Order/Invoice");
    this.amountColumn = page.getByText("Amount");
    this.currencyColumn = page.getByText("Currency");
    this.dueDateColumn = page.getByText("Due Date");
    this.referenceColumn = page.getByText("Reference");
    this.pagination = page.getByLabel("Page navigation, page 1 of");
    this.noRecordsAvailable = page.getByText("No records available.").first();
    this.genericSchneiderLogo = page.locator('img[src*="SchneiderLogo.jpg"]');
    this.dashboardIconSelector = page
      .getByRole("link", { name: "Dashboard" })
      .locator("svg");
    this.pendingTxnsIconSelector = page
      .getByRole("link", { name: "Pending Transactions" })
      .locator("svg");
    this.completedTxnsIconSelector = page
      .getByRole("link", { name: "Completed Transactions" })
      .locator("svg");
    this.viewPaymentsIconSelector = page
      .getByRole("link", { name: "View Payments" })
      .locator("svg");
    this.bankAccountsIconSelector = page
      .getByRole("button", { name: "Bank Accounts" })
      .locator("svg.mud-icon-root");
    this.myBankAccountsIconSelector = page
      .getByRole("link", { name: "My Bank Accounts" })
      .locator("svg");
    this.addBankAccountIconSelector = page
      .getByRole("link", { name: "Add Bank Account" })
      .locator("svg.mud-icon-root");
    this.userOptionsIconSelector = page
      .getByRole("button", { name: "User Options" })
      .locator("svg");
    this.editMyInfoIconSelector = page
      .getByRole("link", { name: "Edit My Info" })
      .locator("svg");
    this.signOutIconSelector = page
      .getByRole("link", { name: "Sign Out" })
      .locator("svg");
    this.paginationFirstBtn = page.getByRole("button", { name: "1" });
    this.paginationSecondBtn = page.getByRole("button", { name: "2" });
    //selectors
    this.pdfEmbedSelector = 'embed[type="application/pdf"]';
    this.imgSelector = "img";
    this.iframeSelector = "iframe";
    this.tableWithInvoiceDetails = 'table[data-role="grid"]';
    this.tableInvoiceDetailsFullSelector = 'table[data-role="grid"] tbody tr';
    this.tableForScrollingSelector = 'table[data-role="grid"] tbody';
    this.viewButtonSelector =
      'button.telerik-blazor.k-button:has(span:has-text("View"))';
  }

  async generateInvalidData(length) {
    const invalidString = faker.string.alphanumeric(length);
    return invalidString;
  }

  async searchRandomDataAndVerifyNoRecords(digitLength) {
    const elementTimeout = 2000;
    const randomData = await this.generateInvalidData(digitLength);
    await this.searchForValue(randomData);
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.noRecordsAvailable).toBeVisible({
      timeout: elementTimeout,
    });
  }

  async clickRandomElementInColumnTableWithInvoices(columnIndex, selector) {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0];
    const rows = await firstTable.$$("tbody tr");
    if (rows.length === 0) {
      throw new Error("No rows found in the table.");
    }
    const randomRowIndex = faker.number.int({ min: 0, max: rows.length - 1 });
    const selectedRow = rows[randomRowIndex];
    // Ensure the cell exists before trying to click the element
    const cellSelector = `td:nth-child(${columnIndex})`;
    await this.page.waitForTimeout(1000);
    await selectedRow.waitForSelector(cellSelector, {
      timeout: elementTimeout,
    });
    const cell = await selectedRow.$(cellSelector);
    if (!cell) {
      throw new Error(
        `Cell not found in column ${columnIndex} of the selected row.`
      );
    }
    const selectedElement = await cell.$(selector);
    if (!selectedElement) {
      throw new Error(
        `Element with selector not found in column of the selected row.`
      );
    }
    await selectedElement.click();
    return selectedRow;
  }

  async verifyNewPageContent(newPage) {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    const browserName = test.info().project.name;
    const newPageURL = newPage.url();
    // verify new page is loaded in Firefox and WebKit
    if (browserName === "webkit" || browserName === "firefox") {
      try {
        await newPage.waitForLoadState("load", { timeout: elementTimeout });
        return;
      } catch (error) {
        throw error;
      }
    }
    // Verify the new URL is not empty
    if (!newPageURL) {
      throw new Error(`Expected URL to be non-empty but got: ${newPageURL}`);
    }
    // verify new page content in Chromium
    if (browserName === "chromium") {
      const pageContent = await newPage.content();
      if (!pageContent || pageContent.trim() === "") {
        throw new Error("The new page content is empty");
      }
    }
    // Helper function to check element visibility
    const isElementVisible = async (page, selector) => {
      try {
        return await page
          .locator(selector)
          .isVisible({ timeout: elementTimeout });
      } catch {
        return false;
      }
    };
    // Check for embed or image element on the new page or within an iframe
    let isPdfEmbedVisible = await isElementVisible(
      newPage,
      this.pdfEmbedSelector
    );
    let isImgVisible = await isElementVisible(newPage, this.imgSelector);
    if (!isPdfEmbedVisible && !isImgVisible) {
      const iframeElement = await newPage.$(this.iframeSelector);
      if (iframeElement) {
        const iframe = await iframeElement.contentFrame();
        if (iframe) {
          isPdfEmbedVisible = await isElementVisible(
            iframe,
            this.pdfEmbedSelector
          );
          isImgVisible = await isElementVisible(iframe, this.imgSelector);
        }
      }
    }
    // Verify that either the PDF embed or image element is visible
    const pdfEmbedLocator = newPage.locator(this.pdfEmbedSelector);
    const imgLocator = newPage.locator(this.imgSelector);
    if (isPdfEmbedVisible) {
      await expect(pdfEmbedLocator).toBeVisible({ timeout: elementTimeout });
    } else if (isImgVisible) {
      await expect(imgLocator).toBeVisible({ timeout: elementTimeout });
    } else {
      throw new Error("No expected element is visible.");
    }
  }

  async getRandomValuesFromFirstTable(columnIndex) {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2500);
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0];
    const rows = await firstTable.$$("tbody tr");
    if (rows.length === 0) {
      return null;
    }
    // Function to get a random row and extract the value from the specified column
    const getRandomValue = async () => {
      const randomIndex = faker.number.int({ min: 0, max: rows.length - 1 });
      const randomRow = rows[randomIndex];
      const cellSelector = `td:nth-child(${columnIndex})`;
      await this.page.waitForTimeout(500);
      await randomRow.waitForSelector(cellSelector, { timeout: 3000 });
      const cell = await randomRow.$(cellSelector);
      return cell.innerText();
    };
    const fullValue = await getRandomValue();
    const first3Values = (await getRandomValue()).substring(0, 3);
    const first2Values = (await getRandomValue()).substring(0, 2);
    const first6Values = (await getRandomValue()).substring(0, 6);
    const middleIndex = Math.floor((await getRandomValue()).length / 2);
    const middle2Values = (await getRandomValue()).substring(
      middleIndex - 1,
      middleIndex + 1
    );
    const last2Values = (await getRandomValue()).substring(
      (await getRandomValue()).length - 2
    );
    // Extract amount without currency symbol
    const amountWithoutCurrency = (await getRandomValue()).replace(
      /[^\d.]/g,
      ""
    );
    // Extract currency symbol
    const currencySymbol = (await getRandomValue()).match(/[^\d.,\s]+/);
    return {
      fullValue,
      first3Values,
      first2Values,
      middle2Values,
      first6Values,
      last2Values,
      amountWithoutCurrency,
      currencySymbol: currencySymbol ? currencySymbol[0] : null,
    };
  }

  async searchForValue(searchValue) {
    const searchValueString = String(searchValue);
    await this.searchField.fill(searchValueString);
    await this.searchField.click();
  }

  async verifySearchResult(columnIndex, expectedValue) {
    await this.page.waitForTimeout(2500);
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0];
    const rows = await firstTable.$$("tbody tr");
    if (rows.length === 0) {
      throw new Error("No rows found in the table");
    }
    let found = false;
    for (const row of rows) {
      const cell = await row.$(`td:nth-child(${columnIndex})`);
      if (cell) {
        const cellText = (await cell.innerText()).trim().toLowerCase();
        if (cellText.includes(expectedValue.toLowerCase())) {
          found = true;
        }
      }
    }
    if (!found) {
      const noRecordsVisible = await this.noRecordsAvailable
        .isVisible()
        .catch(() => false);
      if (noRecordsVisible) {
        await expect(this.noRecordsAvailable).toBeVisible({ timeout: 2000 });
      } else {
        throw new Error(
          `Expected value not found in the search results and 'No records available' message not visible`
        );
      }
    }
  }

  async verifyButtonBlueColor(elementLocator) {
    const buttonColor = await elementLocator.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.getPropertyValue("background-color");
    });
    const colorValues = buttonColor.match(/\d+/g).map(Number); //the match method returns an array of all sequences of digits found in the string.
    if (colorValues.length === 3) {
      // RGB color
      const [r, b] = colorValues; //r - red color, b - blue one
      try {
        // checking the blue shade of element is existing more than other colors
        expect(r).toBeLessThanOrEqual(20);
        expect(b).toBeGreaterThan(r);
      } catch (error) {
        throw error;
      }
    }
  }

  async clickAndVerifyElement(navButton, pageTitle, elementTimeout) {
    await navButton.click();
    await pageTitle.waitFor({ state: "visible", timeout: elementTimeout });
    await expect(pageTitle).toBeVisible({ timeout: elementTimeout });
  }

  async verifyLogoOnPage(navButton, pageTitle, logoSelector, elementTimeout) {
    // Use clickAndVerifyElement to navigate and verify the page title
    await this.clickAndVerifyElement(navButton, pageTitle, elementTimeout);
    // Verify the logo is visible on the page
    await logoSelector.waitFor({ state: "visible", timeout: elementTimeout });
    await expect(logoSelector).toBeVisible({ timeout: elementTimeout });
  }

  async verifyBlueBtnColorAndAllNavigationOptions(navElement) {
    const elementTimeout = 2000;
    await this.verifyButtonBlueColor(navElement);
    //verify all navigation options are visible on particular page
    await this.dashboardSideNav.waitFor({ state: "visible" });
    await expect(this.dashboardSideNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.pendingTxnsSideNav.waitFor({ state: "visible" });
    await expect(this.pendingTxnsSideNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.completedTxnsSideNav.waitFor({ state: "visible" });
    await expect(this.completedTxnsSideNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.viewPaymentsSideNav.waitFor({ state: "visible" });
    await expect(this.viewPaymentsSideNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.bankAccountsSideNav.waitFor({ state: "visible" });
    await expect(this.bankAccountsSideNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.userOptionsSideNav.waitFor({ state: "visible" });
    await expect(this.userOptionsSideNav).toBeVisible({
      timeout: elementTimeout,
    });
  }

  async verifyIconAndTextOnPage(
    navButton,
    expectedText,
    iconSelector,
    elementTimeout
  ) {
    await iconSelector.waitFor({ state: "visible", timeout: elementTimeout });
    await expect(iconSelector).toBeVisible({ timeout: elementTimeout });
    await expect(navButton).toContainText(expectedText, {
      timeout: elementTimeout,
    });
  }

  async verifyNavigationOptionsOnPage(
    navButton,
    pageTitle,
    iconSelector,
    expectedText,
    elementTimeout
  ) {
    try {
      await this.page.waitForTimeout(elementTimeout);
      await this.clickAndVerifyElement(navButton, pageTitle, elementTimeout);
      await this.verifyIconAndTextOnPage(
        navButton,
        expectedText,
        iconSelector,
        elementTimeout
      );
      await this.verifyBlueBtnColorAndAllNavigationOptions(navButton);
    } catch (error) {
      console.error("Error during navigation options verification:", error);
      throw error;
    }
  }

  async searchAndVerifyTxn({
    pageLocator,
    columnIndex,
    searchVariants,
    noRecordsSearchValue,
    clearBtnLocator,
  }) {
    const elementTimeout = 2000;
    await pageLocator.waitFor({ state: "visible" });
    await expect(pageLocator).toBeVisible({ timeout: elementTimeout });
    await pageLocator.click();
    await this.page.setViewportSize({ width: 1600, height: 1300 });
    await this.page.waitForLoadState("domcontentloaded");
    const performSearchAndVerify = async () => {
      const randomValue = await this.getRandomValuesFromFirstTable(columnIndex);
      for (const variant of searchVariants) {
        await this.searchForValue(randomValue[variant]);
        await this.verifySearchResultWithClear(
          columnIndex,
          randomValue[variant],
          clearBtnLocator
        );
      }
      await this.searchRandomDataAndVerifyNoRecords(noRecordsSearchValue);
    }; // Search random data and verify 'No Records Available'
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await performSearchAndVerify();
        return;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
  }

  async verifySearchResultWithClear(
    columnIndex,
    expectedValue,
    clearBtnLocator
  ) {
    await this.verifySearchResult(columnIndex, expectedValue);
    await clearBtnLocator.click();
    await this.page.waitForTimeout(1000);
  }

  async waitForAndVerifyVisibility(element) {
    const elementTimeout = 1500;
    await element.waitFor({ state: "visible" });
    await expect(element).toBeVisible({
      timeout: elementTimeout,
    });
  }

  async performSearchWithCurrencySymbols({ tabName, symbols, columnIndex }) {
    for (const symbol of symbols) {
      await this.page.waitForTimeout(2000);
      await tabName.searchForValue(symbol);
      try {
        const noRecordsVisible = await this.noRecordsAvailable.isVisible({
          timeout: 1000,
        });
        if (noRecordsVisible) {
          await expect(this.noRecordsAvailable).toBeVisible({ timeout: 1000 });
        }
      } catch (e) {
        await this.page.waitForTimeout(1000);
        await this.verifySearchResult(columnIndex, symbol);
      }
    }
  }
}
