import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashBoardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.merchantInfoSection = page.getByText("Merchant Information Select");
    this.merchantInfoTitle = page.getByRole("heading", {
      name: "Merchant Information",
    });
    this.selectTheCompanyYouWantToView = page.getByText(
      "Select the company you want"
    );
    this.dashboardSection = page.getByText("Dashboard Trending");
    this.dashboardTitle = page.getByRole("heading", { name: "Dashboard" });
    this.trendingInfoTitle = page.getByRole("heading", {
      name: "Trending Information",
    });
    this.trendingInfoSection = page
      .locator(".flex > .card > .card-body")
      .first(); //need to update once dev is ready with it
    this.pendingInvoicesTitle = page.getByText("Pending Invoices");
    this.last7DaysItem = page.locator("path:nth-child(3)").first(); //need to update once devs is ready
    this.last30DaysItem = page
      .locator("g:nth-child(2) > path:nth-child(3)")
      .first(); //need to update once devs is ready
    this.over30DaysItem = page.locator("g:nth-child(3) > path:nth-child(3)"); //need to update once devs is ready
    this.totalItem = page.locator("g:nth-child(3) > path:nth-child(3)"); //need to update once dev is ready with it
    this.pendingInvoicesChart = page
      .locator('g > g[transform="matrix(1,0,0,1,0,0)"] > path')
      .first(); //need to update once dev is ready with it
    this.noPendingInvoicesTitle = page.getByRole("heading", {
      name: "No Pending Invoices",
    });
    this.historyTitle = page.getByRole("heading", { name: "History" });
    this.historySection = page.locator(
      "div:nth-child(2) > .card > .card-body > .telerik-blazor > svg > g > path:nth-child(2)"
    ); //need to update once dev is ready with it!
    this.viewPendingTxnsBtn = page.locator(
      'button[title="View Pending Transactions"]'
    );
    this.viewCompletedTxnsBtn = page.locator(
      'button[title="View Completed Transactions"]'
    );
    this.completedTxnsTitle = page.locator(
      'a:has-text("Completed transactions")'
    ); //need to update once dev is ready with it
    this.completedTxnsBarChart = page
      .locator(
        'g path[stroke="none"][fill="#fff"], g path[stroke="none"][fill="rgb(255, 255, 255)"]'
      )
      .first(); //need to update once dev is ready with it!
    this.eurTxnsTitle = page
      .locator(
        "div:nth-child(2) > .card > .card-body > .telerik-blazor > svg > g > g:nth-child(6) > g > g > path:nth-child(3)"
      )
      .first(); //need to update once dev is ready with it
    this.audTxnsTitle = page.locator(
      "div:nth-child(2) > .card > .card-body > .telerik-blazor > svg > g > g:nth-child(6) > g > g:nth-child(2) > path:nth-child(3)"
    ); //need to update once dev is ready with it
    this.monthTextLocator = page.locator("g text");
    // Locator for the tooltip that contains the totals
    this.tooltipEUROLocator = page.locator(
      'div.k-chart-tooltip[style*="background-color: rgb(13, 110, 253);"][style*="border-color: rgb(13, 110, 253);"]'
    );
    this.tooltipAUDLocator = page.locator(
      'div.k-chart-tooltip[style*="background-color: rgb(111, 66, 193);"][style*="border-color: rgb(111, 66, 193);"]'
    );
    this.completedTxnsTooltipPathEURO = page.locator(
      'path[stroke="#0a58ca"][fill="rgb(13, 110, 253)"]'
    ); //need to update later
    this.completedTxnsTooltipPathAUD = page.locator(
      'path[stroke="#59359a"][fill="rgb(111, 66, 193)"]'
    ); //need to update later
    this.dropdownOpenBtn = page.getByLabel("Open");
    this.last6MonthsDropDownOption = page.getByText("Last 6 Months");
    this.last12MonthsDropDownOption = page.getByText("Last 12 Months");
    this.fyCurrentYearDropDownOption = page.getByText("FY 2024"); //need to update this locator every year once NEW YEAR've been started
    this.fyLastYearDropDownOption = page.getByText("FY 2023"); //need to update this locator every year once NEW YEAR've been started
  }

  async verifyPieChartMonths(expectedMonthCount) {
    const elementTimeout = 3000;
    await this.page.waitForTimeout(elementTimeout);
    // Count the number of valid months/years format elements
    let validMonthCount = 0;
    const validMonths = [];
    const secondPieChartStartIndex = 7;
    const valuesToSkip = [
      "50000",
      "100000",
      "150000",
      "200000",
      "250000",
      "300000",
    ];
    const textCount = await this.monthTextLocator.count();
    for (let i = secondPieChartStartIndex; i < textCount; i++) {
      const monthText = await this.monthTextLocator.nth(i).textContent();
      // Check if the text contains any of the values to skip
      if (valuesToSkip.some((value) => monthText.includes(value))) {
        continue;
      }
      // Check if the text matches the MM/YY format
      await this.page.waitForTimeout(500);
      if (/^\d{2}\/\d{2}$/.test(monthText.trim())) {
        validMonthCount += 1;
        validMonths.push(monthText.trim());
      }
    }
    expect(validMonthCount).toBe(expectedMonthCount);
  }

  async verifyAllCompletedTransactionsTooltips() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    // Define arrays for paths and corresponding tooltip locators
    const tooltipPaths = [
      {
        pathLocator: this.completedTxnsTooltipPathAUD,
        tooltipLocator: this.tooltipAUDLocator,
      },
      {
        pathLocator: this.completedTxnsTooltipPathEURO,
        tooltipLocator: this.tooltipEUROLocator,
      },
    ];
    for (const { pathLocator, tooltipLocator } of tooltipPaths) {
      const sectionCount = await pathLocator.count();
      if (sectionCount === 0) {
        throw new Error(
          "No elements found for the completed transactions section."
        );
      }
      for (let i = 0; i < sectionCount; i++) {
        const element = pathLocator.nth(i);
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          let tooltipVisible = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            // Move the mouse to the center of the element
            await this.page.mouse.move(
              boundingBox.x + boundingBox.width / 2,
              boundingBox.y + boundingBox.height / 2
            );
            // Optionally, click to ensure interaction
            await this.page.mouse.click(
              boundingBox.x + boundingBox.width / 2,
              boundingBox.y + boundingBox.height / 2
            );
            await this.page.waitForTimeout(elementTimeout);
            try {
              await tooltipLocator
                .first()
                .waitFor({ state: "visible", timeout: 5000 });
              tooltipVisible = true;
              break;
            } catch (error) {
              throw error;
            }
          }
          if (!tooltipVisible) {
            throw new Error(
              `Tooltip did not appear for element ${i + 1} after retries.`
            );
          }
          // Verify that the tooltip contains "Total amount:" and "Total invoices:"
          const tooltipText = await tooltipLocator.textContent();
          if (
            !tooltipText.includes("Total amount:") ||
            !tooltipText.includes("Total invoices:")
          ) {
            throw new Error(
              `Tooltip is missing required information: "Total amount:" or "Total invoices:" in completed transactions for element ${
                i + 1
              }.`
            );
          }
          // Click somewhere else to reset the state before moving to the next element
          await this.page.mouse.click(0, 0);
          await this.page.waitForTimeout(elementTimeout);
        } else {
          throw new Error(
            `Could not retrieve bounding box for element ${
              i + 1
            } in the completed transactions section.`
          );
        }
      }
    }
  }
}
