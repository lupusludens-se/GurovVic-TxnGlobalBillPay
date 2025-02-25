import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { MyBankAccountsPage } from "../pages/MyBankAccountsPage";
import { AddBankAccountPage } from "../pages/AddBankAccountPage";
import { CommonTestResources } from "../shared/CommonTestResources";

test.describe("UI Tests for 'My Bank Accounts' section in Customer Portal", () => {
  let resources;
  let login;
  let addBankAccount;
  let myBankAccounts;
  let isNoRecordsAvailable;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    login = new LoginPage(page);
    myBankAccounts = new MyBankAccountsPage(page);
    addBankAccount = new AddBankAccountPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await page.setViewportSize({ width: 1600, height: 1200 });
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.bankAccountsSideNav
    );
    await myBankAccounts.bankAccountsSideNav.click();
    await page.waitForLoadState("domcontentloaded");
  });
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-286
  test("@not_parallel should verify user is able to successfully delete a Bank Account", async ({
    page,
  }) => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await page.waitForTimeout(elementTimeout);
    await myBankAccounts.ensureAccountsExist({ locatorPage: addBankAccount });
    // Delete an account
    const deletedAccountNumber = await myBankAccounts.deleteRandomAccount({
      locatorPage: addBankAccount,
    });
    // Verify that the account is deleted by checking the table again
    await myBankAccounts.verifyAccountDeletion(deletedAccountNumber);
    await page.waitForTimeout(elementTimeout);
  });

  //QGBP-372
  test("should verify user is able to search for Bank Account based on Customer Name", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 3,
      locatorPage: addBankAccount,
    });
  });

  //QGBP-373
  test("should verify user is able to search for Bank Account based on Account Name", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 4,
      locatorPage: addBankAccount,
    });
  });

  //QGBP-370
  test("should verify user is able to search for Bank Account based on Account Number", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 2,
      locatorPage: addBankAccount,
      verifyPartialValue: true,
    });
  });

  //QGBP-376
  test("should verify user is able to search for Bank Account based on the Country", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 5,
      locatorPage: addBankAccount,
    });
  });

  //QGBP-350
  test("should verify user is able to search for Bank Account based on Bank Account Type", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 1,
      locatorPage: addBankAccount,
    });
  });

  //QGBP-380
  test("should verify user is able to search for Bank Account based on Currency", async () => {
    await myBankAccounts.searchAndVerifyBankAccount({
      columnIndex: 6,
      locatorPage: addBankAccount,
    });
  });

  //QGBP-351
  test("should verify Cancel button works on delete bank account modal", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    const accountNumber = await myBankAccounts.cancelRandomAccountDeletion({
      locatorPage: addBankAccount,
    });
    const accountExists = await myBankAccounts.verifyAccountInTable(
      accountNumber
    );
    expect(accountExists).toBe(true);
  });

  //QGBP-356 - part 1
  test("should verify user is able to sort by column in Bank Accounts page, part 1", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.bankAccountTypeTableHeader,
      columnIndex: 1,
    });
  });

  //QGBP-356 - part 2
  test("should verify user is able to sort by column in Bank Accounts page, part 2", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.accountNumberTableHeader,
      columnIndex: 2,
    });
  });

  //QGBP-356 - part 3
  test("should verify user is able to sort by column in Bank Accounts, part 3", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.customerNameTableHeader,
      columnIndex: 3,
    });
  });

  //QGBP-356 - part 4
  test("should verify user is able to sort by column in Bank Accounts, part 4", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.accountNameTableHeader,
      columnIndex: 4,
    });
  });

  //QGBP-356 - part 5
  test("should verify user is able to sort by column in Bank Accounts, part 5", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.countryTableHeader,
      columnIndex: 5,
    });
  });

  //QGBP-356 - part 6
  test("should verify user is able to sort by column in Bank Accounts, part 6", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.sortingInColumn({
      headerLocator: myBankAccounts.currencyTableHeader,
      columnIndex: 6,
    });
  });

  //QGBP-357
  test("@not_parallel should verify pagination works on in the 'My Bank Accounts' grid", async () => {
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.myBankAccountsSubNav
    );
    await myBankAccounts.myBankAccountsSubNav.click();
    await myBankAccounts.ensureMinAccountsPerOnePageInTable({
      minimumCount: 20,
      pageLocator: addBankAccount,
    });
    await myBankAccounts.checkSecondPageInPagination({
      pageLocator: addBankAccount,
    });
  });
});
