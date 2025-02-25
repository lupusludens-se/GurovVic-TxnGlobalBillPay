import { BasePage } from "./BasePage";

export class ViewPaymentsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.paymentHistoryTitle = page.getByRole("heading", {
      name: "Payment History",
    });
    this.txnIdColumn = page.getByRole("columnheader", {
      name: "Transaction Id",
    });
    this.completedDateColumn = page.getByText("Completed Date");
    this.paymentMethodColumn = page.getByRole("columnheader", {
      name: "Payment method",
    });
    this.paymentStatusColumn = page.getByRole("columnheader", {
      name: "Payment status",
    });
    this.detailsColumn = page.getByRole("columnheader", { name: "Details" });
    this.clearBtnViewPayments = page
      .getByLabel("Grid toolbar")
      .locator("svg")
      .nth(1);
    this.paymentDetailTitle = page.getByRole("heading", {
      name: "Payment detail",
    });
    this.paymentID = page.getByText("Payment Id");
    this.settledTxn = page.getByText("Settled transaction");
    this.paymentStatus = page.getByText("Payment status");
    this.paymentMethod = page.getByText("Payment method");
    this.paymentAmount = page.getByText("Payment amount");
    this.currency = page.getByText("Currency");
    this.settledDateTime = page.getByText("Settled date/time");
    this.paymentAmountValue = page.locator('dd[id="PaymentAmountId"]');
    this.currencyValue = page.locator('dd[id="PaymentCurrencyId"]');
    this.paymentStatusValue = page.locator('dd[id="PaymentStatusId"]');
    this.bankTitle = page.getByRole("heading", { name: "Bank" });
    this.account = page.getByText("Account", { exact: true });
    this.paymentDetailContent = page.getByText("Information on the payment is");
    this.bankContent = page.getByText("Bank information");
  }

  async verifyInvoiceInViewPayments(expectedAmount, expectedCurrency) {
    const elementTimeout = 4000;
    await this.page.waitForTimeout(elementTimeout);
    const viewPaymentsTable = await this.page.$(this.tableWithInvoiceDetails);
    const rows = await viewPaymentsTable.$$("tbody tr");
    const numericExpectedAmount = expectedAmount.trim();
    for (const row of rows) {
      const amountCell = await row.$("td:nth-child(2)");
      const currencyCell = await row.$("td:nth-child(4)");
      if (!amountCell || !currencyCell) {
        continue;
      }
      const amountText = await amountCell.innerText();
      const currencyText = await currencyCell.innerText();
      let normalizedAmountText = amountText.trim();
      let normalizedCurrencyText = currencyText.trim();
      // Check if the normalized amount is a whole number without decimals
      if (!numericExpectedAmount.includes(".")) {
        numericExpectedAmount += ".00";
      }
      if (!normalizedAmountText.includes(".")) {
        normalizedAmountText += ".00";
      }
      // Check if the row matches the expected invoice details
      if (
        normalizedAmountText === numericExpectedAmount &&
        normalizedCurrencyText === expectedCurrency
      ) {
        return true;
      }
    }
    throw new Error(
      "The expected invoice total amount was not found in the View Payments table."
    );
  }

  async pickRandomInvoiceDataFromPaymentHistory(columnIndex, selector) {
    const selectedRow = await this.clickRandomElementInColumnTableWithInvoices(
      columnIndex,
      selector
    );
    const amountCell = await selectedRow.$(`td:nth-child(2)`);
    const currencyCell = await selectedRow.$(`td:nth-child(4)`);
    const paymentStatusCell = await selectedRow.$(`td:nth-child(6)`);
    await this.page.waitForTimeout(2000);
    const amountText = await amountCell.innerText();
    const currencyText = await currencyCell.innerText();
    const paymentStatusText = await paymentStatusCell.innerText();
    // Return the extracted data
    return {
      amount: amountText.trim(),
      currency: currencyText.trim(),
      paymentStatus: paymentStatusText.trim(),
    };
  }

  async getInvoiceDataFromPaymentDetailSection() {
    await this.page.waitForTimeout(2000);
    const paymentAmount = await this.paymentAmountValue.textContent();
    const currency = await this.currencyValue.textContent();
    const paymentStatus = await this.paymentStatusValue.textContent();
    return {
      paymentAmount: paymentAmount.trim(),
      currency: currency.trim(),
      paymentStatus: paymentStatus.trim(),
    };
  }
}
