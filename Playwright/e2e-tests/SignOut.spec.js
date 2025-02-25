import { test, expect, page } from "@playwright/test";
import { SignOutPage } from "../pages/SignOutPage";
import { UserOptionsPage } from "../pages/UserOptionsPage";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";

test.describe("UI Tests for Sign Out section in Customer Portal", () => {
  let signOut;
  let login;
  let userOptions;
  let resources;

  test.beforeEach(async ({ page }) => {
    userOptions = new UserOptionsPage(page);
    signOut = new SignOutPage(page);
    resources = new CommonTestResources();
    login = new LoginPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await signOut.waitForAndVerifyVisibility(signOut.userOptionsSideNav);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-66
  test("should verify a user is able to Sign Out from the customer portal", async ({
    page,
  }) => {
    await signOut.userOptionsSideNav.click();
    await signOut.waitForAndVerifyVisibility(signOut.signOutSideNav);
    await signOut.signOutSideNav.click();
    await signOut.waitForAndVerifyVisibility(signOut.schneiderLogoInSignOut);
    await signOut.waitForAndVerifyVisibility(signOut.areYouSureToSignOut);
    await signOut.waitForAndVerifyVisibility(signOut.confirmBtn);
    //verify user is able to sign out
    await signOut.confirmBtn.click();
    await login.waitForAndVerifyVisibility(login.logo);
    await login.waitForAndVerifyVisibility(login.enterYourEmailHeader);
    expect(await login.enterYourEmailHeader.innerText()).toEqual(
      resources.commonUItext.ENTER_EMAIL
    );
  });
});
