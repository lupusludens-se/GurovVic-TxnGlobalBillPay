import { test, expect } from "@playwright/test";
import { GenericPage } from "../pages/GenericPage";
import { DashBoardPage } from "../pages/DashBoardPage";
import { PendingTransactionsPage } from "../pages/PendingTransactionsPage";
import { CompletedTransactionsPage } from "../pages/CompletedTransactionsPage";
import { MyBankAccountsPage } from "../pages/MyBankAccountsPage";
import { AddBankAccountPage } from "../pages/AddBankAccountPage";
import { ViewPaymentsPage } from "../pages/ViewPaymentsPage";
import { UserOptionsPage } from "../pages/UserOptionsPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { EditMyInfoPage } from "../pages/EditMyInfoPage";
import { SignOutPage } from "../pages/SignOutPage";
import { LoginPage } from "../pages/LoginPage";

test.describe("UI Tests for Customer Portal", () => {
  let resources;
  let login;
  let generic;
  let dashboard;
  let pendingTxns;
  let completedtxns;
  let addBankAccount;
  let myBankAccounts;
  let viewPayments;
  let userOptions;
  let editMyInfo;
  let signOut;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    generic = new GenericPage(page);
    resources = new CommonTestResources();
    login = new LoginPage(page);
    dashboard = new DashBoardPage(page);
    pendingTxns = new PendingTransactionsPage(page);
    completedtxns = new CompletedTransactionsPage(page);
    viewPayments = new ViewPaymentsPage(page);
    myBankAccounts = new MyBankAccountsPage(page);
    addBankAccount = new AddBankAccountPage(page);
    userOptions = new UserOptionsPage(page);
    editMyInfo = new EditMyInfoPage(page);
    signOut = new SignOutPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await page.waitForLoadState("domcontentloaded");
    await dashboard.waitForAndVerifyVisibility(dashboard.dashboardSection);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-31
  test("should verify that the Schneider Electric logo is displayed on all the pages", async ({
    page,
  }) => {
    // Verifying the logo on various pages
    await generic.verifyLogoOnPage(
      generic.dashboardSideNav,
      dashboard.dashboardTitle,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.pendingTxnsSideNav,
      pendingTxns.pendingTxnsTitle,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.completedTxnsSideNav,
      completedtxns.completedTxnsTitle,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.viewPaymentsSideNav,
      viewPayments.paymentHistoryTitle,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.bankAccountsSideNav,
      viewPayments.paymentHistoryTitle,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.myBankAccountsSubNav,
      myBankAccounts.bankAccountsHeader,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.addBankAccountSubNav,
      addBankAccount.countryHeader,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.userOptionsSideNav,
      addBankAccount.countryHeader,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.editMyInfoSideNav,
      editMyInfo.profileInformationHeader,
      generic.genericSchneiderLogo,
      elementTimeout
    );
    await generic.verifyLogoOnPage(
      generic.signOutSideNav,
      signOut.schneiderLogoInSignOut,
      signOut.genericLogo,
      elementTimeout
    );
  });

  //QGBP-32
  test("should verify the navigation is visible on all the pages", async ({
    page,
  }) => {
    // Verifying the navigation options, icons, navigation text on various pages
    await generic.verifyNavigationOptionsOnPage(
      generic.dashboardSideNav,
      dashboard.dashboardTitle,
      generic.dashboardIconSelector,
      resources.textOfAllNavigationOptions.dashboard,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.pendingTxnsSideNav,
      pendingTxns.pendingTxnsTitle,
      generic.pendingTxnsIconSelector,
      resources.textOfAllNavigationOptions.pendingTxns,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.completedTxnsSideNav,
      completedtxns.completedTxnsTitle,
      completedtxns.completedTxnsIconSelector,
      resources.textOfAllNavigationOptions.completedTxns,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.viewPaymentsSideNav,
      viewPayments.paymentHistoryTitle,
      generic.viewPaymentsIconSelector,
      resources.textOfAllNavigationOptions.viewPayments,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.bankAccountsSideNav,
      viewPayments.paymentHistoryTitle,
      generic.bankAccountsIconSelector,
      resources.textOfAllNavigationOptions.bankAccounts,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.myBankAccountsSubNav,
      myBankAccounts.bankAccountsHeader,
      generic.myBankAccountsIconSelector,
      resources.textOfAllNavigationOptions.myBankAccounts,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.addBankAccountSubNav,
      addBankAccount.countryHeader,
      generic.addBankAccountIconSelector,
      resources.textOfAllNavigationOptions.addBankAccount,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.userOptionsSideNav,
      addBankAccount.countryHeader,
      generic.userOptionsIconSelector,
      resources.textOfAllNavigationOptions.userOptions,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.editMyInfoSideNav,
      editMyInfo.profileInformationHeader,
      generic.editMyInfoIconSelector,
      resources.textOfAllNavigationOptions.editMyInfo,
      elementTimeout
    );
    await generic.verifyNavigationOptionsOnPage(
      generic.signOutSideNav,
      signOut.schneiderLogoInSignOut,
      generic.signOutIconSelector,
      resources.textOfAllNavigationOptions.signOut,
      elementTimeout
    );
  });
});
