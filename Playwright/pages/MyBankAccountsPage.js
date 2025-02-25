import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { BasePage } from "./BasePage";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";

export class MyBankAccountsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.resources = new CommonTestResources();
    this.login = new LoginPage(page);
    this.bankAccountsHeader = page.getByRole("heading", {
      name: "Bank Accounts",
    });
    this.bankAccountTypeTableHeader = page.getByText("Bank Account Type");
    this.accountNumberTableHeader = page.getByText("Account Number");
    this.customerNameTableHeader = page.getByText("Customer Name");
    this.accountNameTableHeader = page.getByText("Account Name");
    this.countryTableHeader = page.getByText("Country");
    this.currencyTableHeader = page.getByText("Currency");
    this.pagination = page.getByTitle("1");
    this.okButton = page.getByRole("button", { name: "OK" });
    this.bankTokenCreatedSuccessfully = page.getByText("Bank token created");
    this.bankTokenDeleted = page.getByText("Bank token deleted");
    this.clearBtn = page.getByLabel("Grid toolbar").locator("svg").nth(1);
    this.cancelBtn = page.getByRole("button", { name: "Cancel" });
    this.arrowAscendingOrder = page
      .getByLabel("Sorted in ascending order")
      .locator("svg");
    this.arrowDescendingOrder = page
      .getByLabel("Sorted in descending order")
      .locator("svg");
    //selectors
    this.deleteBtnSelector = "td:nth-child(7) button.k-button-solid";
  }

  async deleteAccountIfItExists(accountNumber, locatorPage) {
    const elementTimeout = 2000;
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(elementTimeout);
    // Return early if "No records available" is visible
    const noRecordsVisible = await this.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (noRecordsVisible) return;
    // Function to handle deletion process from a row
    const deleteAccountFromRow = async (row) => {
      const deleteButton = await row.$("td:nth-child(7) button.k-button-solid");
      if (deleteButton) {
        try {
          await deleteButton.click();
          await this.okButton.waitFor({
            state: "visible",
            timeout: elementTimeout,
          });
          await this.okButton.click();
          await this.page.waitForTimeout(elementTimeout);
          await this.addBankAccountSubNav.click();
          // Handle re-login if required after interacting with addBankAccountSubNav
          const isSelectCountryDropdownVisible =
            await locatorPage.selectCountryDropdown.isVisible({
              timeout: elementTimeout,
            });
          if (!isSelectCountryDropdownVisible) {
            await this.login.loginAsUser(
              this.resources.email,
              this.resources.password
            );
            await this.bankAccountsSideNav.click();
          }
          return true;
        } catch (error) {
          console.error("Error during deletion process:", error);
          return false;
        }
      }
      return false;
    };
    // Function to check rows and delete the account if found
    const checkAndDeleteAccountInRows = async (rows) => {
      await this.page.waitForTimeout(elementTimeout); // Add the timeout before looping over rows
      for (const row of rows) {
        const cell = await row.$('td[data-col-index="1"]');
        if (cell && (await cell.innerText()).trim() === accountNumber) {
          if (await deleteAccountFromRow(row)) return true;
        }
      }
      return false;
    };
    let accountFound;
    do {
      accountFound = await checkAndDeleteAccountInRows(
        await this.page.$$(this.tableInvoiceDetailsFullSelector)
      );
      if (!accountFound) {
        accountFound = await this.checkSecondPageForAccount(accountNumber);
        if (accountFound) {
          accountFound = await checkAndDeleteAccountInRows(
            await this.page.$$(this.tableInvoiceDetailsFullSelector)
          );
        }
      }
    } while (accountFound);
    return !accountFound;
  }

  async deleteRandomAccount({ locatorPage }) {
    const elementTimeout = 2000;
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(elementTimeout);
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    if (rows.length === 0) {
      return;
    }
    // Select a random row
    const randomRowIndex = faker.number.int({ min: 0, max: rows.length - 1 });
    const randomRow = rows[randomRowIndex];
    // Get the account number from the selected row
    const accountNumberCell = await randomRow.$("td:nth-child(2)");
    await this.page.waitForTimeout(elementTimeout);
    const accountNumber = await accountNumberCell.innerText();
    // Delete the selected account
    const deleteButton = await randomRow.$(this.deleteBtnSelector);
    await deleteButton.click();
    await this.okButton.waitFor({ state: "visible", timeout: elementTimeout });
    await this.okButton.click();
    await this.page.waitForTimeout(elementTimeout);
    await this.bankTokenDeleted.waitFor({ state: "visible" });
    await expect(this.bankTokenDeleted).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.bankTokenDeleted).toHaveText(
      "Bank token deleted successfully."
    );
    await this.addBankAccountSubNav.click();
    const isSelectCountryDropdownVisible =
      await locatorPage.selectCountryDropdown.isVisible({
        timeout: elementTimeout,
      });
    if (!isSelectCountryDropdownVisible) {
      // Re-login to avoid page freeze after deletion
      await this.login.loginAsUser(
        this.resources.email,
        this.resources.password
      );
      await this.bankAccountsSideNav.click();
      await this.page.waitForTimeout(elementTimeout);
      await this.myBankAccountsSubNav.click();
    }
    return accountNumber.trim();
  }

  async verifyAccountDeletion(accountNumber) {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);
    // Check if the "No records available." message is visible
    const noRecordsVisible = await this.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (noRecordsVisible) {
      return;
    }
    // Scroll the table and check the first page
    await this.scrollTableToLoadAllRows();
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    for (const row of rows) {
      const cell = await row.$("td:nth-child(2)");
      const cellText = await cell.innerText();
      if (cellText.trim() === accountNumber) {
        throw new Error(`Account number ${accountNumber} was not deleted.`);
      }
    }
    // Check the second page if the account is not found on the first page
    const accountOnSecondPage = await this.checkSecondPageForAccount(
      accountNumber
    );
    if (accountOnSecondPage) {
      throw new Error(`Account number ${accountNumber} was not deleted.`);
    }
    return true;
  }

  async verifySearchResultWithClear(columnIndex, expectedValue) {
    await this.verifySearchResult(columnIndex, expectedValue);
    await this.clearBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async searchAndVerifyBankAccount({
    columnIndex,
    locatorPage,
    verifyPartialValue = null,
  }) {
    const elementTimeout = 2000;
    await this.myBankAccountsSubNav.waitFor({ state: "visible" });
    await expect(this.myBankAccountsSubNav).toBeVisible({
      timeout: elementTimeout,
    });
    await this.myBankAccountsSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await this.ensureAccountsExist({ locatorPage });
    // Perform the search and verification
    const performSearchAndVerify = async () => {
      const randomValue = await this.getRandomValuesFromFirstTable(columnIndex);
      await this.searchForValue(randomValue.fullValue);
      await this.verifySearchResultWithClear(
        columnIndex,
        randomValue.fullValue
      );
      if (verifyPartialValue) {
        await this.searchForValue(randomValue.first3Values);
        await this.verifySearchResultWithClear(
          columnIndex,
          randomValue.first3Values
        );
      }
    };
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await performSearchAndVerify();
        return;
      } catch (error) {
        if (attempt === 2) throw error;
        console.log("First attempt failed, retrying...");
      }
    }
  }

  async cancelRandomAccountDeletion({ locatorPage }) {
    const elementTimeout = 2000;
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(elementTimeout);
    await this.ensureAccountsExist({ locatorPage });
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    if (rows.length === 0) {
      return;
    }
    // Select a random row
    const randomRowIndex = faker.number.int({ min: 0, max: rows.length - 1 });
    const randomRow = rows[randomRowIndex];
    // Get the account number from the selected row
    const accountNumberCell = await randomRow.$("td:nth-child(2)");
    await this.page.waitForTimeout(elementTimeout);
    const accountNumber = await accountNumberCell.innerText();
    const deleteButton = await randomRow.$(this.deleteBtnSelector);
    await deleteButton.click();
    await this.okButton.waitFor({ state: "visible", timeout: elementTimeout });
    await this.cancelBtn.waitFor({ state: "visible", timeout: elementTimeout });
    // Click on the Cancel button instead of deleting
    await this.cancelBtn.click();
    return accountNumber.trim();
  }

  async verifyAccountInTable(accountNumber) {
    const elementTimeout = 3000;
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(elementTimeout);
    await this.scrollTableToLoadAllRows();
    // Check the first page of the table
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    for (const row of rows) {
      const cell = await row.$("td:nth-child(2)");
      const cellText = await cell.innerText();
      if (cellText.trim() === accountNumber) {
        return true;
      }
    }
    // Check the second page if the account is not found on the first page
    return await this.checkSecondPageForAccount(accountNumber);
  }

  async ensureAccountsExist({ locatorPage }) {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    // Check if rows exist in the table
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    if (rows.length > 0) {
      return;
    }
    const isNoRecordsAvailable = await this.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (isNoRecordsAvailable) {
      // Create two new accounts if none are available
      await locatorPage.createNewAusBankAccountBECSWithRandomData();
      await locatorPage.createNewIBANBankAccWithRandomData();
    }
  }

  async getAllColumnData(columnIndex) {
    const elementTimeout = 3000;
    const columnData = [];
    // Collect data from the first page
    await this.page.waitForTimeout(elementTimeout);
    const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
    for (const row of rows) {
      const cell = await row.$(`td:nth-child(${columnIndex})`);
      const cellText = await cell.innerText();
      columnData.push(cellText.trim());
    }
    // Check if there are more pages and collect data
    const isPaginationButtonVisible = await this.paginationSecondBtn
      .isVisible()
      .catch(() => false);
    if (isPaginationButtonVisible) {
      await this.paginationSecondBtn.click();
      await this.page.waitForTimeout(elementTimeout);
      const secondPageRows = await this.page.$$(
        this.tableInvoiceDetailsFullSelector
      );
      for (const row of secondPageRows) {
        const cell = await row.$(`td:nth-child(${columnIndex})`);
        const cellText = await cell.innerText();
        columnData.push(cellText.trim());
      }
      await this.paginationFirstBtn.click();
      await this.page.waitForTimeout(1000);
    }
    return columnData;
  }

  isColumnSorted(beforeSort, afterSort) {
    const normalize = (str) => str.trim().toLowerCase();
    const normalizedBeforeSort = beforeSort.map(normalize);
    const normalizedAfterSort = afterSort.map(normalize);
    const ascending = [...normalizedBeforeSort].sort((a, b) =>
      a.localeCompare(b)
    );
    const descending = [...normalizedBeforeSort].sort((a, b) =>
      b.localeCompare(a)
    );
    // Compare the afterSort array to the expected ascending and descending orders
    const isMatchingAscending = normalizedAfterSort.every((value, index) => {
      const comparison = value === ascending[index];
      return comparison;
    });
    const isMatchingDescending = normalizedAfterSort.every((value, index) => {
      const comparison = value === descending[index];
      return comparison;
    });
    return isMatchingAscending || isMatchingDescending;
  }

  async resetSortingIfAscendingVisible(headerLocator) {
    const elementTimeout = 500;
    // Check if the arrowAscendingOrder is already visible, click twice to reset sorting
    const isAscendingVisible = await this.arrowAscendingOrder
      .isVisible()
      .catch(() => false);
    if (isAscendingVisible) {
      await headerLocator.click();
      await this.page.waitForTimeout(elementTimeout);
      await headerLocator.click();
    }
  }

  async sortingInColumn({ headerLocator, columnIndex }) {
    const elementTimeout = 1000;
    await this.resetSortingIfAscendingVisible(headerLocator);
    const maxAttempts = 2;
    const originalOrder = await this.getAllColumnData(columnIndex);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.waitForTimeout(elementTimeout);
        await headerLocator.waitFor({
          state: "visible",
          timeout: elementTimeout,
        });
        for (let i = 0; i < 3; i++) {
         let beforeSort = originalOrder;
          await headerLocator.click();
          await this.page.waitForTimeout(elementTimeout);
          let afterSort = await this.getAllColumnData(columnIndex);
          let isSorted;
          if (i === 2) {
            isSorted =
              JSON.stringify(afterSort) === JSON.stringify(originalOrder);
          } else {
            isSorted = this.isColumnSorted(beforeSort, afterSort);
          }
          expect(isSorted).toBe(true);
          if (i === 0) {
            const ascendingVisible = await this.arrowAscendingOrder
              .isVisible()
              .catch(() => false);
            expect(ascendingVisible).toBe(true);
          } else if (i === 1) {
            const descendingVisible = await this.arrowDescendingOrder
              .isVisible()
              .catch(() => false);
            expect(descendingVisible).toBe(true);
          } else if (i === 2) {
            const isAscendingVisible = await this.arrowAscendingOrder
              .isVisible()
              .catch(() => false);
            const isDescendingVisible = await this.arrowDescendingOrder
              .isVisible()
              .catch(() => false);
            expect(isAscendingVisible || isDescendingVisible).toBe(false);
          }
        }
        break;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
  }

  async ensureMinAccountsPerOnePageInTable({
    minimumCount = 20,
    pageLocator,
  } = {}) {
    const elementTimeout = 2000;
    // Continuously check and create accounts until the minimum count is met
    for (;;) {
      await this.addBankAccountSubNav.waitFor({ state: "visible" });
      await this.addBankAccountSubNav.click();
      await this.myBankAccountsSubNav.waitFor({ state: "visible" });
      await this.myBankAccountsSubNav.click();
      await this.page.waitForTimeout(elementTimeout);
      await this.page.evaluate((selector) => {
        const table = document.querySelector(selector);
        table.scrollIntoView({ block: "end" });
      }, this.tableForScrollingSelector);
      await this.page.waitForTimeout(elementTimeout);
      // Re-check how many accounts are currently in the table
      const rows = await this.page.$$(this.tableInvoiceDetailsFullSelector);
      const currentCount = rows.length;
      if (currentCount >= minimumCount) {
        break;
      }
      if (currentCount % 2 === 0) {
        // Create an Australian account on even iterations
        await pageLocator.createNewAusBankAccountBECSWithRandomData();
      } else {
        // Create a European account on odd iterations
        await pageLocator.createNewIBANBankAccWithRandomData();
      }
    }
  }

  async checkSecondPageInPagination({ pageLocator }) {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    let isPaginationButtonVisible = await this.paginationSecondBtn
      .isVisible()
      .catch(() => false);
    // If the pagination button for the second page is not visible, create a new random bank account
    if (!isPaginationButtonVisible) {
      await pageLocator.createNewIBANBankAccWithRandomData();
      await this.page.waitForTimeout(elementTimeout);
      isPaginationButtonVisible = await this.paginationSecondBtn
        .isVisible()
        .catch(() => false);
    }
    if (isPaginationButtonVisible) {
      await this.paginationSecondBtn.click();
      await this.page.waitForTimeout(elementTimeout);
      await this.scrollTableToLoadAllRows();
      // Re-check the table on the second page
      const secondPageRows = await this.page.$$(
        this.tableInvoiceDetailsFullSelector
      );
      return secondPageRows;
    }
    return null;
  }

  async scrollTableToLoadAllRows() {
    const elementTimeout = 2000;
    await this.page.evaluate((selector) => {
      const table = document.querySelector(selector);
      table.scrollIntoView({ block: "end" });
    }, this.tableForScrollingSelector);
    await this.page.waitForTimeout(elementTimeout);
  }

  async checkSecondPageForAccount(accountNumber) {
    const elementTimeout = 2000;
    const isPaginationButtonVisible = await this.paginationSecondBtn
      .isVisible()
      .catch(() => false);
    if (isPaginationButtonVisible) {
      // Click on the pagination button to go to the second page
      await this.paginationSecondBtn.click();
      await this.page.waitForTimeout(elementTimeout);
      await this.scrollTableToLoadAllRows();
      // Re-check the table on the second page for the account number
      const secondPageRows = await this.page.$$(
        this.tableInvoiceDetailsFullSelector
      );
      for (const row of secondPageRows) {
        const cell = await row.$("td:nth-child(2)");
        const cellText = await cell.innerText();
        if (cellText.trim() === accountNumber) {
          return true;
        }
      }
    }
    return false;
  }
}
