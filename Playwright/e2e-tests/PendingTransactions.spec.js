import { test, expect, chromium, firefox, webkit } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { PendingTransactionsPage } from "../pages/PendingTransactionsPage";
import { LoginPage } from "../pages/LoginPage";
import { DashBoardPage } from "../pages/DashBoardPage";
import { AddBankAccountPage } from "../pages/AddBankAccountPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { ViewPaymentsPage } from "../pages/ViewPaymentsPage";
import { CompletedTransactionsPage } from "../pages/CompletedTransactionsPage";
import { InvoiceAPI } from "../pages/InvoiceAPI";

test.describe("UI Tests for 'Pending Transactions' section in Customer Portal", () => {
  let resources;
  let login;
  let pendingTxns;
  let dashboard;
  let addBankAccount;
  let completedTxns;
  let viewPayments;
  let searchVariants;
  const elementTimeout = 2000;
  let context;
  let api;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    login = new LoginPage(page);
    pendingTxns = new PendingTransactionsPage(page);
    dashboard = new DashBoardPage(page);
    addBankAccount = new AddBankAccountPage(page);
    completedTxns = new CompletedTransactionsPage(page);
    viewPayments = new ViewPaymentsPage(page);
    api = new InvoiceAPI();
    await login.loginAsUser(resources.email, resources.password);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
/*
  //QGBP-54
  test("should verify UI of the Pending Transactions Tab", async ({ page }) => {
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.setViewportSize({ width: 1500, height: 1300 });
    //verify The "Pending Transactions" tab button is changed to blue color after clicking on it
    await pendingTxns.verifyButtonBlueColor(pendingTxns.pendingTxnsSideNav);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.pendingTxnsTitle);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.bankAccountsTitle);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.selectedTotalsTitle
    );
    //observe UI of Pending transactions section
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.currencyColumnPendingInvoicesTab
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueDateColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.referenceColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.invoiceColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.searchField);
    //observe UI of Bank Accounts section
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.bankAccountTypeColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.accountNumberColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.customerNameColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.accountNameColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.countryColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.currencyColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.searchField);
    //observe UI of Selected Totals section
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.amountIsDisplayedInSelectedTotals
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.paySelectedBtn);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.toPayAnInvoiceTitle
    );
  });

  //QGBP-55
  test("should verify search functionality for pending transactions to filter out based on 'Order/Invoice'", async () => {
    searchVariants = [
      "fullValue",
      "first3Values",
      "first2Values",
      "middle2Values",
      "last2Values",
    ];
    await pendingTxns.searchAndVerifyTxn({
      pageLocator: pendingTxns.pendingTxnsSideNav,
      columnIndex: 2,
      searchVariants,
      noRecordsSearchValue: 7,
      clearBtnLocator: pendingTxns.clearBtnPendingTxns,
    });
  });

  //QGBP-57
  test("should verify search functionality for pending transactions to filter out based on 'Reference'", async () => {
    searchVariants = [
      "fullValue",
      "first6Values",
      "first3Values",
      "middle2Values",
      "last2Values",
    ];
    await pendingTxns.searchAndVerifyTxn({
      pageLocator: pendingTxns.pendingTxnsSideNav,
      columnIndex: 6,
      searchVariants,
      noRecordsSearchValue: 16,
      clearBtnLocator: pendingTxns.clearBtnPendingTxns,
    });
  });

  //QGBP-58
  test("should verify search functionality for pending transactions to filter out based on 'Currency'", async ({
    page,
  }) => {
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.setViewportSize({ width: 1600, height: 1300 });
    await page.waitForLoadState("domcontentloaded");
    const currencySymbols = ["AUD", "BRL", "EUR", "USD"];
    await pendingTxns.performSearchWithCurrencySymbols({
      tabName: pendingTxns,
      symbols: currencySymbols,
      columnIndex: 4,
    });
  });

  //QGBP-59
  test("should verify the user is able to open the 'Invoice Image' for any particular 'Order/Invoice'", async ({
    page,
  }) => {
    const browserName = test.info().project.name;
    if (browserName === "chromium") {
      const browserInstance = await chromium.launch({ headless: false });
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
    pendingTxns = new PendingTransactionsPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.setViewportSize({ width: 1600, height: 1300 });
    await page.waitForTimeout(4000);
    await page.waitForLoadState("domcontentloaded");
    const columnIndex = 7;
    const selector = "a.text-primary";
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      //click on randomly selected "Invoice Image" hyperlink for any particular "Order/Invoice"
      pendingTxns.clickRandomElementInColumnTableWithInvoices(
        columnIndex,
        selector
      ),
    ]);
    // verify the user is navigated to a new tab which opens the image of the invoice the user clicked
    await pendingTxns.verifyNewPageContent(newPage);
  });

  //QGBP-65
  test("should verify the behavior of the field under 'Selected Totals' labelled 'Amount'", async ({
    page,
  }) => {
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.setViewportSize({ width: 1600, height: 1300 });
    await page.waitForLoadState("domcontentloaded");
    //select any no of invoices (e.g. 1,2 or more) using the checkbox,
    //verify all the checkboxes for invoices selected by the user get marked as blue ticks and the complete row of the invoices checked are highlighted in blue
    const totalAmountFewInvoicesFromTable =
      await pendingTxns.getTotalAmountOfFewSelectedInvoices(); //Total amount of few invoices from table
    await page.waitForTimeout(elementTimeout);
    const amountFewInvTextSelectedTotals =
      pendingTxns.amountIsDisplayedInSelectedTotals;
    const amountFewInvInSelectedTotals =
      await amountFewInvTextSelectedTotals.inputValue();
    //Total amount of few invoices from "Selected Totals" section
    const totalAmountFewInvInSelectedTotals = pendingTxns.parseAmount(
      amountFewInvInSelectedTotals
    );
    try {
      // Verify the "Amount" field in "Selected Totals" shows the sum of amounts(Column "Amount") for the invoices the user selected
      if (
        totalAmountFewInvoicesFromTable !== totalAmountFewInvInSelectedTotals
      ) {
        throw new Error(
          "Test failed. Total amount from table does not match amount in selected totals."
        );
      }
    } catch (error) {
      throw error;
    }
    //verify total amount from "Selected Totals" section is matching total amount of all invoices from table.
    const totalAmountFromTable =
      await pendingTxns.getTotalAmountOfAllinvoices(); //total amount of all invoices from table
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.amountIsDisplayedInSelectedTotals
    );
    await page.waitForTimeout(elementTimeout);
    const amountTextSelectedTotals =
      pendingTxns.amountIsDisplayedInSelectedTotals;
    const amountInSelectedTotals = await amountTextSelectedTotals.inputValue();
    //total amount of all invoices from "Selected Totals" section
    const totalAmountFromSelectedTotals = pendingTxns.parseAmount(
      amountInSelectedTotals
    );
    try {
      // Compare total amount from table and amount in "Selected Totals" section
      if (totalAmountFromTable !== totalAmountFromSelectedTotals) {
        throw new Error(
          "Test failed. Total amount from table does not match amount in selected totals."
        );
      }
    } catch (error) {
      throw error;
    }
  });

  //QGBP-69
  test("should verify a new column called 'View' is getting displayed on Resize and it has 'Blue buttons with an eye icon' in the column ", async ({
    page,
  }) => {
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.currencyColumnPendingInvoicesTab
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueDateColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.referenceColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.invoiceColumn);
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.waitForTimeout(3500);
    // check columns once main browser window is resized
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.viewColumn);
    // Verify all view buttons with eye icon are enabled and visible
    const allViewButtonsAreVerified =
      await pendingTxns.viewEyeIconButtonsVerified(5);
    expect(allViewButtonsAreVerified).toBe(true);
  });

  //QGBP-72
  test("should verify the user is able to open the 'Invoice Image' for any particular 'Order/Invoice' in the 'Transaction Info' tab seen during resize of the browser window", async ({
    page,
  }) => {
    // Instantiate browsers within the test due to existing issue the same as for test QGBP-59 with verifying order invoice loading in new pages for some browsers
    const browserName = test.info().project.name;
    if (browserName === "chromium") {
      const browserInstance = await chromium.launch({ headless: false }); // Need to run in headless: false mode to avoid detection as a bot which restricts loading images/PDFs.
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
    pendingTxns = new PendingTransactionsPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.waitForTimeout(3500);
    // observe columns once main browser window is resized
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.viewColumn);
    const columnIndex = 5;
    //randomly click on any view button with eye icon
    await pendingTxns.clickRandomElementInColumnTableWithInvoices(
      columnIndex,
      pendingTxns.viewButtonEyeIconSelector
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.txnInfoTitlePopUp);
    await page.waitForTimeout(3000);
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      pendingTxns.invoiceImagePopUp.click(),
    ]);
    await page.waitForTimeout(elementTimeout);
    // Verify new page content after clicking on invoice Image on Transaction Info pop up window
    await pendingTxns.verifyNewPageContent(newPage);
  });

  //QGBP-70
  test("should verify UI and functionality of the 'Blue button with the eye icon' in the view column created on resize of the browser window and make sure invoice data is not lost or changed", async ({
    page,
  }) => {
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.currencyColumnPendingInvoicesTab
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueDateColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.referenceColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.invoiceColumn);
    const columnIndex = 1;
    //Pick randomly any invoice and keep track of all data listed there
    const initialRowData = await pendingTxns.pickRandomAllInvoiceDataFromTable(
      columnIndex,
      pendingTxns.checkboxSelector
    );
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.waitForTimeout(3500);
    //Observe UI after main window is resized
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.orderInvoiceColumn
    );
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueColumn);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.viewColumn);
    // Locate the same row using the Order/Invoice ID
    const sameRow = await pendingTxns.getRowByOrderInvoiceId(
      initialRowData.orderInvoiceId
    );
    const resizedRowData = await pendingTxns.getInvoiceDataInsResizedwindow(
      sameRow
    );
    await page.waitForTimeout(elementTimeout);
    // Compare the invoice data from the visible columns before/after resizing main window
    expect(resizedRowData.orderInvoiceId).toBe(initialRowData.orderInvoiceId);
    expect(resizedRowData.amount).toBe(initialRowData.amount);
    expect(resizedRowData.dueDate).toBe(initialRowData.dueDate);
    // Click the view button in the last column and observe UI
    await pendingTxns.clickViewButtonInSameRow(sameRow);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.orderInvoicePopUp);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.currencyPopUp);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.dueDatePopUp);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.invoiceImagePopUp);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.amountPopUp);
    await pendingTxns.waitForAndVerifyVisibility(pendingTxns.referencePopUp);
    const popUpData = await pendingTxns.getDataFromPopUpWindow();
    // Compare all data fields with the initial data
    expect(popUpData.orderInvoiceId).toBe(initialRowData.orderInvoiceId);
    expect(popUpData.amount).toBe(initialRowData.amount);
    expect(popUpData.currency).toBe(initialRowData.currency);
    expect(popUpData.dueDate).toBe(initialRowData.dueDate);
    expect(popUpData.reference).toBe(initialRowData.reference);
    //verify invoice contains Invoice Image hyperlink
    await pendingTxns.verifyInvoiceImageHasHyperlink();
  });
*/
  //QGBP-283 - part 1
  test("@not_parallel should verify user is able to make the payment for a Single invoice (BECS - AUD Currency), use new randomly selected invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random Australian invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.AUS_currency
    );
    // Try to select the specified Australian bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.AUS_bankAccType,
      resources.validAccNoAus,
      resources.currencyOfInvoice.AUS_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewAusBankAccountBECS();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoice
      invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
        resources.currencyOfInvoice.AUS_currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.AUS_bankAccType,
        resources.validAccNoAus,
        resources.currencyOfInvoice.AUS_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-283 - part 2, need to add one more scenario: pay specific invoice, if it's not in table, create it by API through postman and use it for payment
  test("@not_parallel should verify user is able to make the payment for a Single invoice (BECS - AUD Currency), reselect invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    // Select a random Australian invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.AUS_currency
    );
    // Store the initial invoice details
    const initialInvoiceDetails = invoiceDetails;
    // Try to select the specified Australian bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.AUS_bankAccType,
      resources.validAccNoAus,
      resources.currencyOfInvoice.AUS_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewAusBankAccountBECS();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoice
      await pendingTxns.reselectInvoice(
        initialInvoiceDetails.orderInvoiceId,
        initialInvoiceDetails.amount,
        initialInvoiceDetails.currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.AUS_bankAccType,
        resources.validAccNoAus,
        resources.currencyOfInvoice.AUS_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-219 - part 1
  test("@not_parallel should verify  user is able to make the payment for Multiple invoices (BECS - AUD Currency), use new randomly selected invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    // Select multiple Australian invoices
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.AUS_currency,
        3 // Number of invoices to select
      );
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.AUS_bankAccType,
      resources.validAccNoAus,
      resources.currencyOfInvoice.AUS_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewAusBankAccountBECS();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoices
      ({ selectedInvoices, amount, currency } =
        await pendingTxns.selectMultipleInvoicesByCurrency(
          resources.currencyOfInvoice.AUS_currency,
          3 // Number of invoices to select
        ));
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.AUS_bankAccType,
        resources.validAccNoAus,
        resources.currencyOfInvoice.AUS_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    // Verify all invoices in completed transactions tab
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    // Verify all invoices in view payments tab
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });

  //QGBP-219 - part 2
  test("@not_parallel should verify  user is able to make the payment for Multiple invoices (BECS - AUD Currency), reselect invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    // Select a random Australian invoice
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.AUS_currency,
        4 // Number of invoices to select
      );
    const initialInvoicesDetails = selectedInvoices;
    // Try to select the specified Australian bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.AUS_bankAccType,
      resources.validAccNoAus,
      resources.currencyOfInvoice.AUS_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewAusBankAccountBECS();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoices
      await pendingTxns.reselectInvoices(initialInvoicesDetails);
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.AUS_bankAccType,
        resources.validAccNoAus,
        resources.currencyOfInvoice.AUS_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    // Verify all invoices in completed transactions tab
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    // Verify all invoices in view payments tab
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });

  //QGBP-235 - part 1
  test("@not_parallel should verify user is able to make the payment for a Single invoice (SEPA) randomly selected, use new randomly selected invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.Euro_currency
    );
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewIBANBankAccRandomCountry();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoice
      invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
        resources.currencyOfInvoice.Euro_currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-235 - part 2, need to add one more scenario: pay specific invoice, if it's not in table, create it by API through postman and use it for payment
  test("@not_parallel should verify user is able to make the payment for a Single invoice (SEPA) randomly selected, reselect invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.Euro_currency
    );
    // Store the initial invoice details
    const initialInvoiceDetails = invoiceDetails;
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewIBANBankAccRandomCountry();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoice
      await pendingTxns.reselectInvoice(
        initialInvoiceDetails.orderInvoiceId,
        initialInvoiceDetails.amount,
        initialInvoiceDetails.currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-236 - part 1
  test("@not_parallel should verify user is able to make the payment for Multiple invoices (SEPA), use new randomly selected invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.Euro_currency,
        3
      );
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewIBANBankAccRandomCountry();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoices
      ({ selectedInvoices, amount, currency } =
        await pendingTxns.selectMultipleInvoicesByCurrency(
          resources.currencyOfInvoice.Euro_currency,
          3 // Number of invoices to select
        ));
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });

  //QGBP-236 - part 2
  test("@not_parallel should verify user is able to make the payment for Multiple invoices (SEPA), reselect invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.Euro_currency,
        4
      );
    const initialInvoicesDetails = selectedInvoices;
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewIBANBankAccRandomCountry();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoices
      await pendingTxns.reselectInvoices(initialInvoicesDetails);
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });

  //QGBP-235 - part 3
  test("@not_parallel should verify user is able to make the payment for a Single invoice (SEPA) Germany account, use new randomly selected invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.Euro_currency
    );
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewGermanBankAccountIBAN();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoice
      invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
        resources.currencyOfInvoice.Euro_currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-235 - part 4
  test("@not_parallel should verify user is able to make the payment for a Single invoice (SEPA) Germany account, reselect invoice after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let invoiceDetails = await pendingTxns.selectRandomInvoiceByCurrency(
      resources.currencyOfInvoice.Euro_currency
    );
    // Store the initial invoice details
    const initialInvoiceDetails = invoiceDetails;
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewGermanBankAccountIBAN();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoice
      await pendingTxns.reselectInvoice(
        initialInvoiceDetails.orderInvoiceId,
        initialInvoiceDetails.amount,
        initialInvoiceDetails.currency
      );
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    await completedTxns.verifyInvoiceInCompletedTransactions(invoiceDetails);
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(
      invoiceDetails.amount,
      invoiceDetails.currency
    );
  });

  //QGBP-236 - part 3
  test("@not_parallel should verify user is able to make the payment for Multiple invoices (SEPA) Germany account, use new randomly selected invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.Euro_currency,
        3
      );
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewGermanBankAccountIBAN();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, select new invoices
      ({ selectedInvoices, amount, currency } =
        await pendingTxns.selectMultipleInvoicesByCurrency(
          resources.currencyOfInvoice.Euro_currency,
          3 // Number of invoices to select
        ));
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });

  //QGBP-236 - part 4
  test("@not_parallel should verify user is able to make the payment for Multiple invoices (SEPA) Germany account, reselect invoices after creating bank account (if it's not there)", async ({
    page,
  }) => {
    await api.generateInvoices();
    await page.setViewportSize({ width: 1700, height: 1300 });
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.pendingTxnsSideNav
    );
    await pendingTxns.pendingTxnsSideNav.click();
    //select a random IBAN (SEPA) invoice
    let { selectedInvoices, amount, currency } =
      await pendingTxns.selectMultipleInvoicesByCurrency(
        resources.currencyOfInvoice.Euro_currency,
        4
      );
    const initialInvoicesDetails = selectedInvoices;
    // Try to select the specified EURO bank account
    const accountFound = await pendingTxns.selectAccountByDetails(
      resources.bankAccountTypes.Euro_bankAccType,
      resources.validIBANdata,
      resources.currencyOfInvoice.Euro_currency,
      pendingTxns.paginationSecondBtnPendingTxns
    );
    if (!accountFound) {
      // No matching bank account found, create a new one
      await pendingTxns.waitForAndVerifyVisibility(
        addBankAccount.bankAccountsSideNav
      );
      await addBankAccount.bankAccountsSideNav.click();
      await addBankAccount.createNewGermanBankAccountIBAN();
      await pendingTxns.pendingTxnsSideNav.click();
      await page.waitForLoadState("domcontentloaded");
      // Re-run the method to select the newly created account, re-select the initially selected invoices
      await pendingTxns.reselectInvoices(initialInvoicesDetails);
      await pendingTxns.selectAccountByDetails(
        resources.bankAccountTypes.Euro_bankAccType,
        resources.validIBANdata,
        resources.currencyOfInvoice.Euro_currency,
        pendingTxns.paginationSecondBtnPendingTxns
      );
    }
    await pendingTxns.successfulProcessOfPayment();
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.completedTxnsSideNav
    );
    await pendingTxns.completedTxnsSideNav.click();
    for (const invoice of selectedInvoices) {
      await completedTxns.verifyInvoiceInCompletedTransactions(invoice);
    }
    await page.waitForTimeout(elementTimeout);
    await pendingTxns.waitForAndVerifyVisibility(
      pendingTxns.viewPaymentsSideNav
    );
    await pendingTxns.viewPaymentsSideNav.click();
    await viewPayments.verifyInvoiceInViewPayments(amount, currency);
  });
/*
  //QGBP-369
  test("should verify search functionality for pending transactions to filter out based on 'Amount'", async () => {
    const searchVariants = [
      "fullValue",
      "amountWithoutCurrency",
      "currencySymbol",
    ];
    await pendingTxns.searchAndVerifyTxn({
      pageLocator: pendingTxns.pendingTxnsSideNav,
      columnIndex: 3,
      searchVariants,
      noRecordsSearchValue: 7,
      clearBtnLocator: pendingTxns.clearBtnPendingTxns,
    });
  });
*/
});
