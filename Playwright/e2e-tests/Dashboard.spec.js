import { test, expect } from "@playwright/test";
import { DashBoardPage } from "../pages/DashBoardPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { LoginPage } from "../pages/LoginPage";
import { PendingTransactionsPage } from "../pages/PendingTransactionsPage";
import { CompletedTransactionsPage } from "../pages/CompletedTransactionsPage";

test.describe("UI Tests for Dashboard section in Customer Portal", () => {
  let dashboard;
  let resources;
  let login;
  let pendingTxns;
  let completedTxns;
  const elementTimeout = 3000;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    dashboard = new DashBoardPage(page);
    login = new LoginPage(page);
    pendingTxns = new PendingTransactionsPage(page);
    completedTxns = new CompletedTransactionsPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await page.waitForLoadState("domcontentloaded");
    await dashboard.waitForAndVerifyVisibility(dashboard.dashboardSection);
    await dashboard.waitForAndVerifyVisibility(dashboard.dashboardTitle);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-34
  test("should verify the content of the Dashboard page", async () => {
    await dashboard.waitForAndVerifyVisibility(dashboard.trendingInfoSection);
    await dashboard.waitForAndVerifyVisibility(dashboard.trendingInfoTitle);
    await dashboard.waitForAndVerifyVisibility(dashboard.historySection);
    await dashboard.waitForAndVerifyVisibility(dashboard.historyTitle);
  });

  //QGBP-35
  test("should verify the functionality of the 'View Pending Transactions' icon in the Trending Information section", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1300 });
    await dashboard.waitForAndVerifyVisibility(dashboard.viewPendingTxnsBtn);
    await dashboard.viewPendingTxnsBtn.hover();
    await expect(dashboard.viewPendingTxnsBtn).toHaveAttribute(
      "title",
      "View Pending Transactions",
      {
        timeout: elementTimeout,
      }
    );
    await expect(dashboard.viewPendingTxnsBtn).toBeEnabled({
      timeout: elementTimeout,
    });
    await dashboard.viewPendingTxnsBtn.click();
    await expect(page).toHaveURL(
      `${resources.environmentURL}//transactions/transactionlist`,
      {
        timeout: elementTimeout,
      }
    );
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.pendingTxnsTitle);
  });

  //QGBP-41
  test("should verify the functionality of the 'View Completed Transactions' icon in the History section", async ({
    page,
  }) => {
    await dashboard.waitForAndVerifyVisibility(dashboard.viewCompletedTxnsBtn);
    await dashboard.viewCompletedTxnsBtn.hover();
    await expect(dashboard.viewCompletedTxnsBtn).toHaveAttribute(
      "title",
      "View Completed Transactions",
      {
        timeout: elementTimeout,
      }
    );
    await expect(dashboard.viewCompletedTxnsBtn).toBeEnabled({
      timeout: elementTimeout,
    });
    await dashboard.viewCompletedTxnsBtn.click();
    await expect(page).toHaveURL(
      `${resources.environmentURL}//transactions/transactionlistcomplete`,
      {
        timeout: elementTimeout,
      }
    );
    await completedTxns.waitForAndVerifyVisibility(
      completedTxns.completedTxnsTitle
    );
  });

  //QGBP-42, QGBP-359
  test("should verify the Pending Invoices chart in the Trending Information section", async ({
    page,
  }) => {
    // Verify the Pending Invoices chart when data available/not available for the customer
    await page.waitForTimeout(4000);
    const isChartVisible = await dashboard.pendingInvoicesChart.isVisible({
      timeout: elementTimeout,
    });
    if (!isChartVisible) {
      try {
        await dashboard.waitForAndVerifyVisibility(
          dashboard.noPendingInvoicesTitle
        );
        await expect(dashboard.pendingInvoicesChart).not.toBeVisible();
        await dashboard.pendingTxnsSideNav.click();
        await page.waitForTimeout(elementTimeout);
        await dashboard.waitForAndVerifyVisibility(
          dashboard.noRecordsAvailable
        );
      } catch (error) {
        throw new Error("Error when chart is not visible ");
      }
    } else {
      try {
        await dashboard.waitForAndVerifyVisibility(
          dashboard.pendingInvoicesTitle
        );
        await page.waitForTimeout(elementTimeout);
        await dashboard.waitForAndVerifyVisibility(dashboard.last7DaysItem);
        await expect(dashboard.last7DaysItem).toBeEnabled({
          timeout: elementTimeout,
        });
        await dashboard.waitForAndVerifyVisibility(dashboard.last30DaysItem);
        await expect(dashboard.last30DaysItem).toBeEnabled({
          timeout: elementTimeout,
        });
        await dashboard.waitForAndVerifyVisibility(dashboard.over30DaysItem);
        await expect(dashboard.over30DaysItem).toBeEnabled({
          timeout: elementTimeout,
        });
        await dashboard.waitForAndVerifyVisibility(
          dashboard.pendingInvoicesChart
        );
        await dashboard.pendingTxnsSideNav.click();
        await page.waitForTimeout(elementTimeout);
        await expect(dashboard.noRecordsAvailable).not.toBeVisible({
          timeout: elementTimeout,
        });
      } catch (error) {
        throw new Error("Error when chart is visible");
      }
    }
  });

  //QGBP-43
  test("should verify the Completed Transactions chart in the History section", async ({
    page,
  }) => {
    await dashboard.waitForAndVerifyVisibility(dashboard.completedTxnsTitle);
    await dashboard.waitForAndVerifyVisibility(dashboard.eurTxnsTitle);
    await expect(dashboard.eurTxnsTitle).toBeEnabled({
      timeout: elementTimeout,
    });
    await dashboard.waitForAndVerifyVisibility(dashboard.audTxnsTitle);
    await expect(dashboard.audTxnsTitle).toBeEnabled({
      timeout: elementTimeout,
    });
    // Verify the Completed Txns chart when data available/not available for the customer
    await page.waitForTimeout(elementTimeout);
    const isCompletedTxnsChartVisible =
      await dashboard.completedTxnsBarChart.isVisible({
        timeout: elementTimeout,
      });
    if (!isCompletedTxnsChartVisible) {
      try {
        await expect(dashboard.completedTxnsBarChart).not.toBeVisible();
        await dashboard.completedTxnsSideNav.click();
        await page.waitForTimeout(elementTimeout);
        await dashboard.waitForAndVerifyVisibility(
          dashboard.noRecordsAvailable
        );
      } catch (error) {
        throw error;
      }
    } else {
      try {
        await dashboard.waitForAndVerifyVisibility(
          dashboard.completedTxnsBarChart
        );
        await dashboard.completedTxnsSideNav.click();
        await page.waitForTimeout(elementTimeout);
        await expect(dashboard.noRecordsAvailable).not.toBeVisible({
          timeout: elementTimeout,
        });
      } catch (error) {
        throw error;
      }
    }
  });

  //QGBP-45
  test("should verify the Completed transactions chart has data when there are completed transactions", async ({
    page,
  }) => {
    //Verify the data in the history section has 6 months showing
    await page.waitForTimeout(elementTimeout);
    await dashboard.verifyPieChartMonths(6);
    // Verify that the tooltip contains "Total amount:" and "Total invoices:"
    await dashboard.verifyAllCompletedTransactionsTooltips();
  });

  //QGBP-358
  test("should verify the user can sort Completed Transaction data using the drop down list", async ({
    page,
  }) => {
    //Verify the data in the history section has 6 months showing and the dropdown box shows "Last 6 Months"
    await page.waitForTimeout(elementTimeout);
    await dashboard.verifyPieChartMonths(6);
    await dashboard.waitForAndVerifyVisibility(
      dashboard.last6MonthsDropDownOption
    );
    //Verify the data in the history section has 12 months showing and the dropdown box shows "Last 12 Months"
    await dashboard.dropdownOpenBtn.click();
    await dashboard.last12MonthsDropDownOption.click();
    await dashboard.verifyPieChartMonths(12);
    await dashboard.waitForAndVerifyVisibility(
      dashboard.last12MonthsDropDownOption
    );
    //Verify the data in the history section has 12 months showing and the dropdown box shows "FY" + current year title
    await dashboard.dropdownOpenBtn.click();
    await dashboard.fyCurrentYearDropDownOption.click();
    await dashboard.verifyPieChartMonths(12);
    await dashboard.waitForAndVerifyVisibility(
      dashboard.fyCurrentYearDropDownOption
    );
    //Verify the data in the history section has 12 months showing and the dropdown box shows "FY" + last year title
    await dashboard.dropdownOpenBtn.click();
    await dashboard.fyLastYearDropDownOption.click();
    await dashboard.verifyPieChartMonths(12);
    await dashboard.waitForAndVerifyVisibility(
      dashboard.fyLastYearDropDownOption
    );
  });
});
