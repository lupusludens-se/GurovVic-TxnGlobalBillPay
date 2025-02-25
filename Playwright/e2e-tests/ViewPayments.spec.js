import { test, expect, page } from "@playwright/test";
import { ViewPaymentsPage } from "../pages/ViewPaymentsPage";
import { LoginPage } from "../pages/LoginPage";
import { DashBoardPage } from "../pages/DashBoardPage";
import { CommonTestResources } from "../shared/CommonTestResources";

test.describe("UI Tests for View Payments section in Customer Portal", () => {
  let viewPayments;
  let login;
  let dashboard;
  let resources;
  let columnIndex;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    viewPayments = new ViewPaymentsPage(page);
    login = new LoginPage(page);
    dashboard = new DashBoardPage(page);
    resources = new CommonTestResources();
    await login.loginAsUser(resources.email, resources.password);
    await dashboard.waitForAndVerifyVisibility(dashboard.dashboardSection);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.viewPaymentsSideNav
    );
    await viewPayments.viewPaymentsSideNav.click();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-46
  test("should verify the content of the View Payments tab", async () => {
    await viewPayments.verifyButtonBlueColor(viewPayments.viewPaymentsSideNav);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.paymentHistoryTitle
    );
    await viewPayments.waitForAndVerifyVisibility(viewPayments.searchField);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.txnIdColumn);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.amountColumn);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.completedDateColumn
    );
    await viewPayments.waitForAndVerifyVisibility(viewPayments.currencyColumn);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.paymentMethodColumn
    );
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.paymentStatusColumn
    );
    await viewPayments.waitForAndVerifyVisibility(viewPayments.detailsColumn);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.pagination);
  });

  //QGBP-47
  test("should verify the UI of the View button located in the Details column", async ({
    page,
  }) => {
    await page.waitForTimeout(elementTimeout);
    // Pick randomly any invoice, click on View button and observe UI
    columnIndex = 7;
    await viewPayments.clickRandomElementInColumnTableWithInvoices(
      columnIndex,
      viewPayments.viewButtonSelector
    );
    await page.waitForTimeout(elementTimeout);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.paymentDetailTitle
    );
    await viewPayments.waitForAndVerifyVisibility(viewPayments.bankTitle);
    // UI of Payment detail section
    await viewPayments.waitForAndVerifyVisibility(viewPayments.paymentID);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.settledTxn);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.paymentStatus);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.paymentMethod);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.paymentAmount);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.currency);
    await viewPayments.waitForAndVerifyVisibility(viewPayments.settledDateTime);
    // UI of Bank section
    await viewPayments.waitForAndVerifyVisibility(viewPayments.account);
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.paymentDetailContent
    );
    await viewPayments.waitForAndVerifyVisibility(viewPayments.bankContent);
  });

  //QGBP-48
  test("should verify the data in 'View' button is correct", async ({
    page,
  }) => {
    columnIndex = 7;
    //click randomly on View button in the details column, observe the Amount, Currency, Payment Status
    const initialRowData =
      await viewPayments.pickRandomInvoiceDataFromPaymentHistory(
        columnIndex,
        viewPayments.viewButtonSelector
      );
    const paymentDetailData =
      await viewPayments.getInvoiceDataFromPaymentDetailSection();
    // check the invoice data before/after clicking the View button is matching
    expect(paymentDetailData.paymentAmount).toBe(initialRowData.amount);
    expect(paymentDetailData.currency).toBe(initialRowData.currency);
    expect(paymentDetailData.paymentStatus).toBe(initialRowData.paymentStatus);
    await page.waitForTimeout(elementTimeout);
  });

  //QGBP-424
  test("should verify search functionality for view payments tab to filter out based on 'Amount'", async () => {
    const searchVariants = ["amountWithoutCurrency"];
    await viewPayments.searchAndVerifyTxn({
      pageLocator: viewPayments.viewPaymentsSideNav,
      columnIndex: 2,
      searchVariants,
      noRecordsSearchValue: 7,
      clearBtnLocator: viewPayments.clearBtnViewPayments,
    });
  });

  //QGBP-423
  test("should verify search functionality for view payments tab to filter out based on 'Currency'", async ({
    page,
  }) => {
    await viewPayments.waitForAndVerifyVisibility(
      viewPayments.viewPaymentsSideNav
    );
    await viewPayments.viewPaymentsSideNav.click();
    await page.setViewportSize({ width: 1600, height: 1300 });
    await page.waitForLoadState("domcontentloaded");
    const currencySymbols = ["AUD", "BRL", "EUR", "USD"];
    await viewPayments.performSearchWithCurrencySymbols({
      tabName: viewPayments,
      symbols: currencySymbols,
      columnIndex: 4,
    });
  });
});
