import { test, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { faker } from "@faker-js/faker";
import { CommonTestResources } from "../shared/CommonTestResources";
import { AddBankAccountPage } from "../pages/AddBankAccountPage";

export class PendingTransactionsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    //main Pending Txns page
    super(page);
    this.page = page;
    this.resources = new CommonTestResources();
    this.addBankAccount = new AddBankAccountPage(page);
    this.pendingTxnsTitle = page.getByRole("heading", {
      name: "Pending Transactions ",
    });
    this.toPayAnInvoiceTitle = page.getByText("To pay an invoice, select the");
    this.checkBoxColumn = page.getByRole("columnheader", {
      name: "Select all rows",
    });
    this.checkboxSelectAllRowsBtn = page.getByLabel("Select all rows");
    this.currencyColumnPendingInvoicesTab = page.getByText("Currency").first();
    this.dueDateColumn = page.getByText("Due date");
    this.referenceColumn = page.getByText("Reference");
    this.invoiceColumn = page.getByRole("columnheader", {
      name: "Invoice",
      exact: true,
    });
    this.paginationSecondBtnPendingTxns = page
      .getByLabel("Page navigation, page 1 of 2")
      .getByRole("button", { name: "2" });
    this.viewColumn = page.getByRole("columnheader", { name: "View" });
    this.clearBtnPendingTxns = page.locator(
      ".k-clear-value > .telerik-blazor > svg"
    );
    //after resizing main window
    this.dueColumn = page.getByText("Due");
    this.txnInfoTitlePopUp = page.getByText("Transaction Info");
    this.orderInvoicePopUp = page.getByText("Order/Invoice");
    this.currencyPopUp = page.getByText("Currency");
    this.dueDatePopUp = page.getByText("Due Date");
    this.invoiceImagePopUp = page.getByTestId("invoiceImageSmallLayout");
    this.amountPopUp = page.getByLabel("Transaction Info").getByText("Amount");
    this.invoiceAmountPopUp = page.getByText("Invoice Amount");
    this.referencePopUp = page.getByText("Reference");
    this.orderInvoiceIdPopUpValue = page.locator(
      'div:has-text("Order/Invoice") > p'
    );
    this.amountPopUpValue = page.locator('div:has-text("Amount") > p');
    this.currencyPopUpValue = page.locator('div:has-text("Currency") > p');
    this.dueDatePopUpValue = page.locator('div:has-text("Due Date") > p');
    this.referencePopUpValue = page.locator('div:has-text("Reference") > p');
    this.closeBtnWindowPopUp = page.locator(
      'button.k-button-flat[title="Close"]'
    );
    //Bank Accounts section
    this.bankAccountsTitle = page.getByRole("heading", {
      name: "Bank Accounts",
    });
    this.bankAccountTypeColumn = page.getByText("Bank Account Type");
    this.accountNumberColumn = page.getByText("Account Number");
    this.customerNameColumn = page.getByText("Customer Name");
    this.accountNameColumn = page.getByText("Account Name");
    this.countryColumn = page.getByText("Country");
    this.currencyColumn = page.getByText("Currency").nth(1);
    //Selected Totals section
    this.selectedTotalsTitle = page.getByRole("heading", {
      name: "Selected Totals",
    });
    this.amountIsDisplayedInSelectedTotals = page.locator(
      "#selectedTotalsNumericField"
    );
    this.paySelectedBtn = page.getByRole("button", {
      name: "Pay selected items",
    });
    this.sepaDirectDebitMandateTitle = page.getByText(
      "SEPA Direct Debit Mandate",
      { exact: true }
    );
    this.directDebitMandateFullTextForm = page.getByText(
      "By signing this mandate form"
    );
    this.okBtnSEPApayment = page.getByRole("button", { name: "OK" });
    this.cancelBtnSEPApayment = page.getByRole("button", { name: "Cancel" });
    this.sepaDirectDebitMandateErrorMessage = page
      .getByText("The SEPA Direct Debit Mandate")
      .first();
    this.processingWheelOfPayment = page.getByText("Processing transaction...");
    this.messageSuccessfulPayment = page.getByText(
      "Your transaction has processed successfully"
    );
    this.paymentItem = page.getByRole("heading", { name: "Payment" });
    this.txnCompleteItem = page.getByText("Transaction Complete");
    this.yourTxnHasBeenProcessedItem = page.getByText(
      "Your transaction has been"
    );
    // Define selectors
    this.pdfColumnSelector = "button.telerik-blazor.k-button-solid";
    this.messageUIselector = "div.mud-snackbar-content-message";
    this.viewButtonEyeIconSelector =
      '[data-testid="smallLayoutViewTransactionButton"]';
    this.checkboxFullSelector =
      "td:nth-child(1) input[aria-label='Select a row']";
    this.checkboxSelector = "input[aria-label='Select a row']";
  }

  async viewEyeIconButtonsVerified(columnIndex) {
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; // Assuming the first table is Pending Txns one
    const rows = await firstTable.$$("tbody tr");
    for (const row of rows) {
      const cellSelector = `td:nth-child(${columnIndex})`;
      const cell = await row.$(cellSelector);
      if (!cell) {
        return false;
      }
      const button = await cell.$(
        '[data-testid="smallLayoutViewTransactionButton"]'
      );
      if (!button) {
        return false;
      }
      const isEnabled = await button.evaluate((b) => !b.disabled);
      if (!isEnabled) {
        return false;
      }
      const isVisible = await button.isVisible();
      if (!isVisible) {
        return false;
      }
    }
    return true;
  }

  parseAmount(amountText) {
    let sanitizedAmount = amountText.replace(/[^0-9.,]/g, "");
    // Find the last comma and dot in the sanitized amount
    let commaIndex = sanitizedAmount.lastIndexOf(",");
    let dotIndex = sanitizedAmount.lastIndexOf(".");
    if (commaIndex > dotIndex) {
      // Comma is used as decimal separator, remove dots used as thousand separators
      sanitizedAmount = sanitizedAmount.replace(/\./g, "");
      // Re-check the position of the last comma after removing dots
      commaIndex = sanitizedAmount.lastIndexOf(",");
      // Replace the last comma with a dot to use it as the decimal separator
      sanitizedAmount =
        sanitizedAmount.substring(0, commaIndex) +
        "." +
        sanitizedAmount.substring(commaIndex + 1);
    } else if (dotIndex > commaIndex) {
      // Dot is used as decimal separator, remove commas used as thousand separators
      sanitizedAmount = sanitizedAmount.replace(/,/g, "");
    }
    const parsedAmount = parseFloat(sanitizedAmount);
    return Math.round(parsedAmount * 100) / 100;
  }

  async pickRandomAllInvoiceDataFromTable(columnIndex, selector) {
    const selectedRow = await this.clickRandomElementInColumnTableWithInvoices(
      columnIndex,
      selector
    );
    // Extract data from the selected row
    const orderInvoiceIdCell = await selectedRow.$("td:nth-child(2)");
    const amountCell = await selectedRow.$("td:nth-child(3)");
    const currencyCell = await selectedRow.$("td:nth-child(4)");
    const dueDateCell = await selectedRow.$("td:nth-child(5)");
    const referenceCell = await selectedRow.$("td:nth-child(6)");
    const invoiceCell = await selectedRow.$("td:nth-child(7)");
    await this.page.waitForTimeout(2000);
    // Extract text from each cell
    const orderInvoiceIdText = await orderInvoiceIdCell.innerText();
    const amountText = await amountCell.innerText();
    const currencyText = await currencyCell.innerText();
    const dueDateText = await dueDateCell.innerText();
    const referenceText = await referenceCell.innerText();
    const invoiceText = await invoiceCell.innerText();
    // Return the extracted data
    return {
      orderInvoiceId: orderInvoiceIdText.trim(),
      amount: amountText.trim(),
      currency: currencyText.trim(),
      dueDate: dueDateText.trim(),
      reference: referenceText.trim(),
      invoice: invoiceText.trim(),
    };
  }

  async getRowByOrderInvoiceId(orderInvoiceId) {
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; // Assuming the first table is Pending Txns one
    const rows = await firstTable.$$("tbody tr");
    for (const row of rows) {
      const orderInvoiceCell = await row.$("td:nth-child(2)");
      const orderInvoiceText = await orderInvoiceCell.innerText();
      if (orderInvoiceText.trim() === orderInvoiceId) {
        return row;
      }
    }
    throw new Error(`Row with Order/Invoice ID ${orderInvoiceId} not found.`);
  }

  async getInvoiceDataInsResizedwindow(rowElement) {
    const orderInvoiceCell = await rowElement.$("td:nth-child(2)");
    const amountCell = await rowElement.$("td:nth-child(3)");
    const dueDateCell = await rowElement.$("td:nth-child(4)");
    return {
      orderInvoiceId: (await orderInvoiceCell.innerText()).trim(),
      amount: (await amountCell.innerText()).trim(),
      dueDate: (await dueDateCell.innerText()).trim(),
    };
  }

  async clickViewButtonInSameRow(rowElement) {
    const viewButtonSelector = this.viewButtonEyeIconSelector;
    // Find the last column's cell containing the view button and click on it
    const viewButtonCell = await rowElement.$(`td:nth-child(5)`);
    if (!viewButtonCell) {
      throw new Error(
        "Could not find the cell with the view button in the specified row."
      );
    }
    const viewButton = await viewButtonCell.$(viewButtonSelector);
    if (!viewButton) {
      throw new Error("Could not find the view button in the specified row.");
    }
    await viewButton.click();
  }

  async getDataFromPopUpWindow() {
    const orderInvoiceId = await this.orderInvoiceIdPopUpValue.innerText();
    const amount = await this.amountPopUpValue.innerText();
    const currency = await this.currencyPopUpValue.innerText();
    const dueDate = await this.dueDatePopUpValue.innerText();
    const reference = await this.referencePopUpValue.innerText();
    return {
      orderInvoiceId: orderInvoiceId.trim(),
      amount: amount.trim(),
      currency: currency.trim(),
      dueDate: dueDate.trim(),
      reference: reference.trim(),
    };
  }

  async verifyInvoiceImageHasHyperlink() {
    const href = await this.invoiceImagePopUp.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toContain(
      "https://core.stg1.resourceadvisor.schneider-electric.com/imgserver/InternalImage.asp"
    );
  }

  async getTotalAmountOfAllinvoices() {
    await this.page.waitForTimeout(4000);
    await this.uncheckAllRows();
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; // Assuming the first table is Pending Txns one
    const rows = await firstTable.$$("tbody tr");
    let totalAmount = 0;
    // Define a mapping between currency symbols and their respective text forms
    const currencyMapping = {
      "€": "EUR",
      $: "AUD",
    };
    let selectedCurrencyText = null;
    for (const row of rows) {
      const amountCell = await row.$("td:nth-child(3)");
      const currencyCell = await row.$("td:nth-child(4)");
      if (!amountCell || !currencyCell) {
        continue;
      }
      const amountText = await amountCell.innerText();
      const amount = this.parseAmount(amountText);
      const currencySymbol = amountText.trim()[0]; // Get the currency symbol from the amount text
      const currencyText = currencyMapping[currencySymbol]; // Map the currency symbol to its text form
      // Set the selectedCurrencyText if it is not set
      if (!selectedCurrencyText) {
        selectedCurrencyText = currencyText;
      }
      // Ensure the currency matches the selectedCurrencyText
      if (currencyText !== selectedCurrencyText) {
        continue;
      }
      const checkbox = await row.$(this.checkboxSelector);
      if (checkbox) {
        await this.checkCheckboxWithRetry(checkbox);
        totalAmount += amount;
        // Verify the checkbox background color has blue shade after clicking on it
        await this.verifyButtonBlueColor(checkbox);
        // Verify the row background color has blue shade after clicking on checkbox in that row
        await this.verifyButtonBlueColor(row);
      }
    }
    totalAmount = Math.round(totalAmount * 100) / 100;
    return totalAmount;
  }

  async uncheckAllRows() {
    const checkboxes = await this.page.$$(
      "table[data-role='grid'] tbody tr td:nth-child(1) input[aria-label='Select a row']"
    );
    for (const checkbox of checkboxes) {
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.uncheck();
      }
    }
  }

  async checkCheckboxWithRetry(checkbox, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await checkbox.waitForElementState("visible", { timeout: 2000 });
        await checkbox.waitForElementState("enabled", { timeout: 2000 });
        await checkbox.check();
        const isChecked = await checkbox.isChecked();
        if (isChecked) {
          return;
        }
      } catch (error) {
        if (i === retries - 1) {
          throw new Error(
            `Failed to check checkbox after ${retries} attempts: ${error}`
          );
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async getTotalAmountOfFewSelectedInvoices() {
    await this.page.waitForTimeout(3000);
    await this.uncheckAllRows();
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; // Assuming the first table is Pending Txns one
    const rows = await firstTable.$$("tbody tr");
    let totalAmount = 0;
    // Define a mapping between currency symbols and their respective text forms
    const currencyMapping = {
      "€": "EUR",
      $: "AUD",
    };
    // Determine the number of rows to select randomly
    const numRowsToSelect = faker.number.int({ min: 1, max: rows.length });
    const selectedRowsIndexes = new Set();
    while (selectedRowsIndexes.size < numRowsToSelect) {
      const randomIndex = faker.number.int({ min: 0, max: rows.length - 1 });
      selectedRowsIndexes.add(randomIndex);
    }
    await this.page.waitForTimeout(1000);
    let selectedCurrencyText = null;
    for (const index of selectedRowsIndexes) {
      const row = rows[index];
      const amountCell = await row.$("td:nth-child(3)");
      const currencyCell = await row.$("td:nth-child(4)");
      if (!amountCell || !currencyCell) {
        continue;
      }
      const amountText = await amountCell.innerText();
      const amount = this.parseAmount(amountText);
      const currencySymbol = amountText.trim()[0]; // Get the currency symbol from the amount text
      const currencyText = currencyMapping[currencySymbol]; // Map the currency symbol to its text form
      // Set the selectedCurrencyText if it is not set
      if (!selectedCurrencyText) {
        selectedCurrencyText = currencyText;
      }
      // Ensure the currency matches the selectedCurrencyText
      if (currencyText !== selectedCurrencyText) {
        continue;
      }
      const checkbox = await row.$(this.checkboxSelector);
      if (checkbox) {
        await this.checkCheckboxWithRetry(checkbox);
        totalAmount += amount;
        // Verify the checkbox background color has blue shade after clicking on it
        await this.verifyButtonBlueColor(checkbox);
        // Verify the row background color has blue shade after clicking on checkbox in that row
        await this.verifyButtonBlueColor(row);
      }
    }
    totalAmount = Math.round(totalAmount * 100) / 100;
    return totalAmount;
  }

  async selectRandomInvoiceByCurrency(currency) {
    await this.page.waitForTimeout(4000);
    await this.uncheckAllRows();
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; 
    const rows = await firstTable.$$("tbody tr");
    let selectedRows = [];
    for (const row of rows) {
      const currencyCell = await row.$("td:nth-child(4)");
      if (!currencyCell) {
        continue;
      }
      const currencyText = await currencyCell.innerText();
      // Check for the specified currency
      if (currencyText.trim() === currency) {
        selectedRows.push(row);
      }
    }
    if (selectedRows.length === 0) {
      throw new Error(`No invoices with ${currency} currency found.`);
    }
    // Select a random invoice with the specified currency
    const randomRowIndex = faker.number.int({
      min: 0,
      max: selectedRows.length - 1,
    });
    const selectedRow = selectedRows[randomRowIndex];
    // Retrieve Order/Invoice value, Amount, and Currency
    const orderInvoiceCell = await selectedRow.$("td:nth-child(2)");
    const amountCell = await selectedRow.$("td:nth-child(3)");
    const currencyCell = await selectedRow.$("td:nth-child(4)");
    const orderInvoiceText = await orderInvoiceCell.innerText();
    const amountText = await amountCell.innerText();
    const currencyText = await currencyCell.innerText();
    const checkbox = await selectedRow.$(this.checkboxSelector);
    if (checkbox) {
      await this.checkCheckboxWithRetry(checkbox);
      await this.verifyButtonBlueColor(checkbox);
      await this.verifyButtonBlueColor(selectedRow);
    } else {
      throw new Error("Checkbox not found in the selected row.");
    }
    return {
      orderInvoiceId: orderInvoiceText.trim(),
      amount: amountText.trim(),
      currency: currencyText.trim(),
    };
  }

  async reselectInvoice(orderInvoiceId, amount, currency) {
    const elementTimeout = 3000;
    await this.page.waitForTimeout(elementTimeout);
    const invoiceRows = await this.page.$$(
      this.tableInvoiceDetailsFullSelector
    );
    for (const row of invoiceRows) {
      const orderInvoiceCell = await row.$("td:nth-child(2)");
      const amountCell = await row.$("td:nth-child(3)");
      const currencyCell = await row.$("td:nth-child(4)");
      if (!orderInvoiceCell || !amountCell || !currencyCell) {
        continue;
      }
      const orderInvoiceText = await orderInvoiceCell.innerText();
      const amountText = await amountCell.innerText();
      const currencyText = await currencyCell.innerText();
      if (
        orderInvoiceText.trim() === orderInvoiceId &&
        amountText.trim() === amount &&
        currencyText.trim() === currency
      ) {
        // Select the matching row
        const checkbox = await row.$(this.checkboxSelector);
        if (checkbox) {
          await this.checkCheckboxWithRetry(checkbox);
          await this.verifyButtonBlueColor(checkbox);
          await this.verifyButtonBlueColor(row);
          break;
        }
      }
    }
  }

  async selectMultipleInvoicesByCurrency(currency, count) {
    await this.page.waitForTimeout(3500);
    await this.uncheckAllRows();
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0]; // Assuming the first table is Pending Txns one
    const rows = await firstTable.$$("tbody tr");
    let selectedRows = [];
    for (const row of rows) {
      const currencyCell = await row.$("td:nth-child(4)");
      if (!currencyCell) {
        continue;
      }
      const currencyText = await currencyCell.innerText();
      // Check for the specified currency
      if (currencyText.trim() === currency) {
        selectedRows.push(row);
      }
    }
    if (selectedRows.length === 0) {
      throw new Error(`No invoices with ${currency} currency found.`);
    }
    // Ensure we don't try to select more invoices than are available
    const invoicesToSelect = Math.min(count, selectedRows.length);
    const selectedInvoices = [];
    let totalAmount = 0;
    for (let i = 0; i < invoicesToSelect; i++) {
      // Randomly select an invoice from the remaining list
      const randomRowIndex = faker.number.int({
        min: 0,
        max: selectedRows.length - 1,
      });
      const selectedRow = selectedRows.splice(randomRowIndex, 1)[0];
      // Retrieve Order/Invoice value, Amount, and Currency
      const orderInvoiceCell = await selectedRow.$("td:nth-child(2)");
      const amountCell = await selectedRow.$("td:nth-child(3)");
      const currencyCell = await selectedRow.$("td:nth-child(4)");
      const orderInvoiceText = await orderInvoiceCell.innerText();
      const amountText = await amountCell.innerText();
      const currencyText = await currencyCell.innerText();
      const amountValue = parseFloat(amountText.replace(/[^\d.]/g, ""));
      totalAmount += amountValue;
      const checkbox = await selectedRow.$(this.checkboxSelector);
      if (checkbox) {
        await this.checkCheckboxWithRetry(checkbox);
        await this.verifyButtonBlueColor(checkbox);
        await this.verifyButtonBlueColor(selectedRow);
        selectedInvoices.push({
          orderInvoiceId: orderInvoiceText.trim(),
          amount: amountText.trim(),
          currency: currencyText.trim(),
        });
      } else {
        throw new Error("Checkbox not found in the selected row.");
      }
    }
    // Define a mapping of currencies to their symbols
    const currencySymbols = {
      AUD: "$",
      EUR: "€",
    };
    // Get the correct currency symbol or default to an empty string
    const currencySymbol = currencySymbols[currency] || "";
    const formattedTotalAmount = `${currencySymbol}${totalAmount.toFixed(2)}`;
    return {
      selectedInvoices,
      amount: formattedTotalAmount.trim(),
      currency,
    };
  }

  async reselectInvoices(initialInvoicesDetails) {
    await this.page.waitForTimeout(3000);
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const firstTable = tables[0];
    const rows = await firstTable.$$("tbody tr");
    for (const invoice of initialInvoicesDetails) {
      const { orderInvoiceId, amount, currency } = invoice;
      let invoiceFound = false;
      for (const row of rows) {
        const orderInvoiceCell = await row.$("td:nth-child(2)");
        const amountCell = await row.$("td:nth-child(3)");
        const currencyCell = await row.$("td:nth-child(4)");
        if (!orderInvoiceCell || !amountCell || !currencyCell) {
          continue;
        }
        const orderInvoiceText = await orderInvoiceCell.innerText();
        const amountText = await amountCell.innerText();
        const currencyText = await currencyCell.innerText();
        if (
          orderInvoiceText.trim() === orderInvoiceId &&
          amountText.trim() === amount &&
          currencyText.trim() === currency
        ) {
          const checkbox = await row.$(this.checkboxSelector);
          if (checkbox) {
            await this.checkCheckboxWithRetry(checkbox);
            await this.verifyButtonBlueColor(checkbox);
            await this.verifyButtonBlueColor(row);
            invoiceFound = true;
            break;
          }
        }
      }
      if (!invoiceFound) {
        throw new Error(
          `Invoice with ID ${orderInvoiceId} and amount ${amount} not found in Pending Transactions table.`
        );
      }
    }
  }

  async selectAccountByDetails(
    bankAccountType,
    accountNumber,
    currency,
    elementLocator
  ) {
    const elementTimeout = 3000;
    await this.page.waitForTimeout(elementTimeout);
    const tables = await this.page.$$(this.tableWithInvoiceDetails);
    const accountFound = await this.findAccountInTable(
      bankAccountType,
      accountNumber,
      currency,
      tables[1] // Second table
    );
    if (accountFound) {
      return true;
    }
    const isPaginationVisible = await elementLocator.isVisible();
    if (isPaginationVisible) {
      //Go to second page to find ban account
      await elementLocator.click();
      await this.page.waitForTimeout(elementTimeout);
      return await this.findAccountInTable(
        bankAccountType,
        accountNumber,
        currency,
        tables[1] // Second table after pagination
      );
    }
    return false; // If pagination button is not visible, no need to check the second page
  }

  async findAccountInTable(
    bankAccountType,
    accountNumber,
    currency,
    tableElement
  ) {
    const rows = await tableElement.$$("tbody tr");
    for (const row of rows) {
      const bankAccountTypeCell = await row.$("td:nth-child(2)");
      const accountNumberCell = await row.$("td:nth-child(3)");
      const currencyCell = await row.$("td:nth-child(7)");
      if (!bankAccountTypeCell || !accountNumberCell || !currencyCell) {
        continue;
      }
      const bankAccountTypeText = await bankAccountTypeCell.innerText();
      const accountNumberText = await accountNumberCell.innerText();
      const currencyText = await currencyCell.innerText();
      // Check for the specified bank account
      if (
        bankAccountTypeText.includes(bankAccountType) &&
        accountNumberText.trim() === accountNumber &&
        currencyText.trim() === currency
      ) {
        const checkbox = await row.$(this.checkboxSelector);
        if (checkbox) {
          await this.checkCheckboxWithRetry(checkbox);
          await this.verifyButtonBlueColor(checkbox);
          await this.verifyButtonBlueColor(row);
          return true;
        }
      }
    }
    return false;
  }

  async successfulProcessOfPayment() {
    const elementTimeout = 1000;
    // Click on the 'Pay Selected' button and verify all successful payment messages
    await this.paySelectedBtn.click();
    await this.page.waitForTimeout(elementTimeout);
    // Check for the presence of SEPA Direct Debit Mandate
    const sepaDirectDebitMandateTitleVisible =
      await this.sepaDirectDebitMandateTitle
        .isVisible({
          timeout: elementTimeout,
        })
        .catch(() => false);
    const directDebitMandateFullTextFormVisible =
      await this.directDebitMandateFullTextForm
        .isVisible({
          timeout: elementTimeout,
        })
        .catch(() => false);
    // If SEPA Direct Debit elements are visible, click the 'OK' button for SEPA payment
    if (
      sepaDirectDebitMandateTitleVisible &&
      directDebitMandateFullTextFormVisible
    ) {
      await this.page.waitForTimeout(elementTimeout);
      await this.okBtnSEPApayment.click();
      await this.page.waitForTimeout(elementTimeout);
    }
    await this.processingWheelOfPayment.waitFor({ state: "visible" });
    await expect(this.processingWheelOfPayment).toBeVisible({
      timeout: elementTimeout,
    });
    await this.messageSuccessfulPayment.waitFor({ state: "visible" });
    await expect(this.messageSuccessfulPayment).toBeVisible({
      timeout: elementTimeout,
    });
    await this.page.waitForTimeout(elementTimeout);
    expect(this.messageSuccessfulPayment).toHaveText(
      this.resources.successMessage.Successful_Payment
    );
    await this.paymentItem.waitFor({ state: "visible" });
    await expect(this.paymentItem).toBeVisible({
      timeout: elementTimeout,
    });
    await this.txnCompleteItem.waitFor({ state: "visible" });
    await expect(this.txnCompleteItem).toBeVisible({
      timeout: elementTimeout,
    });
    await this.yourTxnHasBeenProcessedItem.waitFor({ state: "visible" });
    await expect(this.yourTxnHasBeenProcessedItem).toBeVisible({
      timeout: elementTimeout,
    });
  }
}
