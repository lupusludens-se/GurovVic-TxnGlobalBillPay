import { test, expect, page } from "@playwright/test";
import { EditMyInfoPage } from "../pages/EditMyInfoPage";
import { SignOutPage } from "../pages/SignOutPage";
import { UserOptionsPage } from "../pages/UserOptionsPage";
import { LoginPage } from "../pages/LoginPage";
import { CommonTestResources } from "../shared/CommonTestResources";

test.describe("UI Tests for 'Edit My Info' section in Customer Portal", () => {
  let signOut;
  let login;
  let userOptions;
  let resources;
  let editMyInfo;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    userOptions = new UserOptionsPage(page);
    editMyInfo = new EditMyInfoPage(page);
    resources = new CommonTestResources();
    signOut = new SignOutPage(page);
    login = new LoginPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await editMyInfo.waitForAndVerifyVisibility(editMyInfo.userOptionsSideNav);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-5
  test("should verify the customer email provided in the login is displayed in Edit My Info sub tab of User Options", async ({
    page,
  }) => {
    await editMyInfo.userOptionsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await editMyInfo.waitForAndVerifyVisibility(editMyInfo.editMyInfoSideNav);
    await editMyInfo.editMyInfoSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await editMyInfo.waitForAndVerifyVisibility(editMyInfo.accountEmail);
    await editMyInfo.verifyUserDetails(
      editMyInfo.accountEmail,
      resources.email,
      "Account Email: "
    );
  });

  //QGBP-6
  test("should verify the customer phone number is displayed correctly in Edit My Info sub tab of User Options", async ({
    page,
  }) => {
    await editMyInfo.userOptionsSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await editMyInfo.waitForAndVerifyVisibility(editMyInfo.editMyInfoSideNav);
    await editMyInfo.editMyInfoSideNav.click();
    await page.waitForTimeout(elementTimeout);
    await editMyInfo.waitForAndVerifyVisibility(editMyInfo.phoneNo);
    await editMyInfo.verifyUserDetails(
      editMyInfo.phoneNo,
      resources.phoneNumber,
      "Phone Number: "
    );
  });
});
