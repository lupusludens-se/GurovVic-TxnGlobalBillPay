import { test, expect, chromium, firefox, webkit } from "@playwright/test";
import { CompletedTransactionsPage } from "../pages/CompletedTransactionsPage";
import { LoginPage } from "../pages/LoginPage";
import { DashBoardPage } from "../pages/DashBoardPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { faker } from "@faker-js/faker";

test.describe("UI Tests for 'Completed Transactions' section in Customer Portal", () => {
  let resources;
  let login;
  let dashboard;
  let completedtxns;
  let context;
  let columnIndex;
  let searchVariants;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    login = new LoginPage(page);
    dashboard = new DashBoardPage(page);
    completedtxns = new CompletedTransactionsPage(page);
    await login.loginAsUser(resources.email, resources.password);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-36
  test("should verify the content of the Completed Transactions page", async () => {
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completedTxnsSideNav
    );
    await completedtxns.completedTxnsSideNav.click();
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completedTxnsTitle
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.searchField);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.orderInvoiceColumn
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.amountColumn);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.currencyColumn
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.dueDateColumn);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completedDateColumn
    );
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.referenceColumn
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.invoiceColumn);
    await completedtxns.waitForAndVerifyVisibility(completedtxns.detailsColumn);
  });

  //QGBP-39
  test("should verify the user is able to open the 'Invoice Image' of a completed transaction", async ({
    page,
  }) => {
    // Instantiate browsers within the test due to existing issue the same as for test QGBP-59 with verifying order invoice loading in new pages for some browsers
    const browserName = test.info().project.name;
    if (browserName === "chromium") {
      const browserInstance = await chromium.launch({ headless: false }); // Need to run in headless: false mode in Chrome to avoid detection as a bot which restricts loading images/PDFs.
      context = await browserInstance.newContext();
      page = await context.newPage();
    } else if (browserName === "firefox") {
      const browserInstance = await firefox.launch();
      context = await browserInstance.newContext();
      page = await context.newPage();
    } else if (browserName === "webkit") {
      const browserInstance = await webkit.launch();
      context = await browserInstance.newContext();
      page = await context.newPage();
    } else {
      throw new Error(`Unsupported browser: ${browserName}`);
    }
    login = new LoginPage(page);
    completedtxns = new CompletedTransactionsPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completedTxnsSideNav
    );
    await completedtxns.completedTxnsSideNav.click();
    await page.setViewportSize({ width: 1600, height: 1300 });
    await page.waitForTimeout(3000);
    await page.waitForLoadState("domcontentloaded");
    columnIndex = 7;
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      //click on randomly selected "Invoice Image" hyperlink for any particular "Order/Invoice"
      completedtxns.clickRandomElementInColumnTableWithInvoices(
        columnIndex,
        completedtxns.invoiceImageSelector
      ),
    ]);
    // verify the user is navigated to a new tab which opens the image of the invoice the user clicked
    await completedtxns.verifyNewPageContent(newPage);
  });

  //QGBP-40
  test("should verify clicking 'View' button in the Details column opens the relevant Transaction Information", async ({
    page,
  }) => {
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completedTxnsSideNav
    );
    await completedtxns.completedTxnsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    // Pick randomly any invoice, click on View button and keep track of it's data
    columnIndex = 8;
    const initialRowData = await completedtxns.pickRandomInvoiceData(
      columnIndex,
      completedtxns.viewButtonSelector
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.txnID);
    await completedtxns.waitForAndVerifyVisibility(completedtxns.amount);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completionDate
    );
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.completionMethod
    );
    await completedtxns.waitForAndVerifyVisibility(completedtxns.paymentStatus);
    await completedtxns.waitForAndVerifyVisibility(
      completedtxns.processorReferenceID
    );
    const transactionInfoData =
      await completedtxns.getInvoiceDataFromTransactionInfoPage();
    // check the invoice data before/after clicking the View button is matching
    expect(transactionInfoData.amount).toBe(initialRowData.amount);
    expect(transactionInfoData.completionDate).toBe(
      initialRowData.completionDate
    );
  });

  //QGBP-37
  test("should verify search functionality for Completed transactions to filter out based on 'Order/Invoice'", async () => {
    searchVariants = [
      "fullValue",
      "first3Values",
      "first2Values",
      "middle2Values",
      "last2Values",
    ];
    await completedtxns.searchAndVerifyTxn({
      pageLocator: completedtxns.completedTxnsSideNav,
      columnIndex: 1,
      searchVariants,
      noRecordsSearchValue: 7,
      clearBtnLocator: completedtxns.clearBtnCompletedTxns,
    });
  });

  //QGBP-38
  test("should verify search functionality for Completed transactions to filter out based on 'Reference'", async () => {
    searchVariants = [
      "fullValue",
      "first6Values",
      "first3Values",
      "middle2Values",
      "last2Values",
    ];
    await completedtxns.searchAndVerifyTxn({
      pageLocator: completedtxns.completedTxnsSideNav,
      columnIndex: 6,
      searchVariants,
      noRecordsSearchValue: 16,
      clearBtnLocator: completedtxns.clearBtnCompletedTxns,
    });
  });
});
