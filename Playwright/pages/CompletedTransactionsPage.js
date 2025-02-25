import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { faker } from "@faker-js/faker";

export class CompletedTransactionsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.completedTxnsTitle = page.getByRole("heading", {
      name: "Completed Transactions",
    });
    this.completedDateColumn = page.getByText("Completed Date");
    this.invoiceColumn = page.getByText("Invoice", { exact: true });
    this.detailsColumn = page.getByRole("columnheader", {
      name: "Details",
    });
    this.viewBtn1 = page.locator('button.btn-primary:has-text("View")').first(); //need to recheck when start writing tests
    this.txnInfoTitle = page.getByRole("heading", {
      name: "Transaction Information",
    });
    this.txnID = page.getByText("Transaction Id");
    this.amount = page.getByText("Amount");
    this.completionDate = page.getByText("Completion Date");
    this.completionMethod = page.getByText("Completion method");
    this.paymentStatus = page.getByText("Payment Status");
    this.processorReferenceID = page.getByText("Processor Reference Id");
    this.amountInput = page.locator('input[id="Amount"]');
    this.completionDateInput = page.locator('input[id="CompletedDate"]');
    this.clearBtnCompletedTxns = page
      .getByLabel("Grid toolbar")
      .locator("svg")
      .nth(1);
    //selectors
    this.invoiceImageSelector = `a:text("Invoice Image")`;
  }

  async verifyInvoiceInCompletedTransactions(expectedInvoice) {
    const elementTimeout = 5000;
    await this.page.waitForTimeout(elementTimeout);
    const completedTransactionsTable = await this.page.$(
      'table[data-role="grid"]'
    );
    const rows = await completedTransactionsTable.$$("tbody tr");
    for (const row of rows) {
      const orderInvoiceCell = await row.$("td:nth-child(1)");
      const amountCell = await row.$("td:nth-child(2)");
      const currencyCell = await row.$("td:nth-child(3)");
      if (!orderInvoiceCell || !amountCell || !currencyCell) {
        continue;
      }
      const orderInvoiceText = await orderInvoiceCell.innerText();
      const amountText = await amountCell.innerText();
      const currencyText = await currencyCell.innerText();
      let normalizedExpectedAmount = expectedInvoice.amount.trim();
      let normalizedAmountText = amountText.trim();
      // Check if the normalized amount is a whole number without decimals
      if (!normalizedExpectedAmount.includes(".")) {
        normalizedExpectedAmount += ".00";
      }
      if (!normalizedAmountText.includes(".")) {
        normalizedAmountText += ".00";
      }
      // Check if the row matches the expected invoice details
      if (
        orderInvoiceText.trim() === expectedInvoice.orderInvoiceId &&
        normalizedAmountText === normalizedExpectedAmount &&
        currencyText.trim() === expectedInvoice.currency
      ) {
        return true;
      }
    }
    throw new Error(
      "The expected invoice was not found in the Completed Transactions table."
    );
  }

  async pickRandomInvoiceData(columnIndex, selector) {
    const selectedRow = await this.clickRandomElementInColumnTableWithInvoices(
      columnIndex,
      selector
    );
    const amountCell = await selectedRow.$(`td:nth-child(2)`);
    const completionDateCell = await selectedRow.$(`td:nth-child(5)`);
    await this.page.waitForTimeout(2000);
    const amountText = await amountCell.innerText();
    const completionDateText = await completionDateCell.innerText();
    // Return the extracted data
    return {
      amount: amountText.trim(),
      completionDate: completionDateText.trim(),
    };
  }

  async getInvoiceDataFromTransactionInfoPage() {
    await this.page.waitForTimeout(4000);
    const amountValue = await this.amountInput.inputValue();
    const completionDateValue = await this.completionDateInput.inputValue();

    return {
      amount: amountValue.trim(),
      completionDate: completionDateValue.trim(),
    };
  }
}
