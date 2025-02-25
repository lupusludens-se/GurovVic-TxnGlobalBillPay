import { test, expect } from "@playwright/test";
import { UserOptionsPage } from "../pages/UserOptionsPage";
import { CommonTestResources } from "../shared/CommonTestResources";
import { LoginPage } from "../pages/LoginPage";

test.describe("UI Tests for User Options section in Customer Portal", () => {
  let userOptions;
  let resources;
  let login;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    userOptions = new UserOptionsPage(page);
    resources = new CommonTestResources();
    login = new LoginPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await userOptions.waitForAndVerifyVisibility(
      userOptions.userOptionsSideNav
    );
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-49
  test("should verify the Default View of the User Options tab when the user logs in and the state of User Options once the User clicks on it.", async ({
    page,
  }) => {
    //check Invisibility of Edit My Info and Sign Out buttons
    await expect(userOptions.userOptionsSideNav).not.toHaveClass(
      userOptions.userOptionsSubNavBtnsSelector
    );
    //click on "User Options" and check visibility of Edit My Info and Sign Out buttons
    await userOptions.userOptionsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await userOptions.waitForAndVerifyVisibility(userOptions.editMyInfoSideNav);
    await userOptions.waitForAndVerifyVisibility(userOptions.signOutSideNav);
    await expect(userOptions.userOptionsSideNav).toHaveClass(
      userOptions.userOptionsSubNavBtnsSelector
    );
    //click on "User Options" again and check invisibility of Edit My Info and Sign Out buttons
    await userOptions.userOptionsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await expect(userOptions.userOptionsSideNav).not.toHaveClass(
      userOptions.userOptionsSubNavBtnsSelector
    );
  });
});
