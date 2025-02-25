import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { LoginPage } from "../pages/LoginPage";
import { MyBankAccountsPage } from "../pages/MyBankAccountsPage";
import { AddBankAccountPage } from "../pages/AddBankAccountPage";
import { CommonTestResources } from "../shared/CommonTestResources";

test.describe("UI Tests for 'Add Bank Account' section in Customer Portal", () => {
  let resources;
  let login;
  let addBankAccount;
  let myBankAccounts;
  const elementTimeout = 2000;

  test.beforeEach(async ({ page }) => {
    resources = new CommonTestResources();
    login = new LoginPage(page);
    myBankAccounts = new MyBankAccountsPage(page);
    addBankAccount = new AddBankAccountPage(page);
    await login.loginAsUser(resources.email, resources.password);
    await page.setViewportSize({ width: 1600, height: 1200 });
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.bankAccountsSideNav
    );
    await addBankAccount.bankAccountsSideNav.click();
    await page.waitForLoadState("domcontentloaded");
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  //QGBP-158
  test("should verify the content of the 'Add Bank Account' tab for countries using BSB and Account No (Australian Accounts BECS)", async ({
    page,
  }) => {
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addBankAccountSubNav
    );
    await addBankAccount.addBankAccountSubNav.click();
    await page.waitForTimeout(elementTimeout);
    //observe the content of the Add Bank Account page for Australia
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.countryHeader
    );
    await addBankAccount.selectCountryDropdown.selectOption(
      resources.countryCodes.AUSTRALIA
    );
    const isDirectDebitMandateVisible =
      await addBankAccount.directdebitMandate.isVisible({
        timeout: elementTimeout,
      });
    if (!isDirectDebitMandateVisible) {
      await addBankAccount.selectCountryDropdown.selectOption(
        resources.countryCodes.AUSTRALIA
      );
    }
    await addBankAccount.directdebitMandate.check();
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.bankAccountHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.furtherInformationHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.nameHeader);
    // Country section. Verify Australia is displayed in the selectCountryDropdown field
    await addBankAccount.verifySelectedOption(
      addBankAccount.selectCountryDropdown,
      "Australia"
    );
    //Bank Account section
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountNumberTextField
    );
    //Further Information section
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.bsbNumberField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountNameField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.financialInstitutionField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.branchNameField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.currencyDropDown
    );
    // Verify that Australian currency (AUD) is displayed in the currency dropdown
    await addBankAccount.verifySelectedOption(
      addBankAccount.currencyDropDown,
      "AUD-Australian Dollar"
    );
    //Name section
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.firstNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.lastNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.companyNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.cancelBtn);
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.createBtn);
  });

  //QGBP-159
  test("@not_parallel should verify user receives error when providing incorrect BSB number for Australian Bank Account and is able to create an account after correcting it", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Delete bank account if it's in the list to avoid dublication error
    await myBankAccounts.deleteAccountIfItExists(
      resources.validAccNoAus,
      addBankAccount
    );
    await addBankAccount.addBankAccountSubNav.click();
    await addBankAccount.selectCountryDropdown.waitFor({ state: "visible" });
    await addBankAccount.selectCountryDropdown.selectOption(
      resources.countryCodes.AUSTRALIA
    );
    // Check if directdebitMandate is visible, retry Aus country selection if not
    const isDirectDebitMandateVisible =
      await addBankAccount.directdebitMandate.isVisible({
        timeout: elementTimeout,
      });
    if (!isDirectDebitMandateVisible) {
      await addBankAccount.selectCountryDropdown.selectOption(
        resources.countryCodes.AUSTRALIA
      );
    }
    await addBankAccount.directdebitMandate.check();
    await addBankAccount.accountNumberTextField.fill(resources.validAccNoAus);
    // Generate a random invalid BSB Number
    const invalidBSBNo = await addBankAccount.generateInvalidData(10);
    await addBankAccount.bsbNumberField.fill(invalidBSBNo);
    await addBankAccount.accountNameField.fill(resources.accNameAus);
    await addBankAccount.financialInstitutionField.fill(
      resources.financialInstutionAus
    );
    await addBankAccount.branchNameField.fill(resources.branchNameAus);
    // Verify Australian currency (AUD) is displayed in the currency dropdown
    await addBankAccount.verifySelectedOption(
      addBankAccount.currencyDropDown,
      "AUD-Australian Dollar"
    );
    await addBankAccount.firstNameTextField.fill(resources.firstNameAus);
    await addBankAccount.lastNameTextField.fill(resources.lastNameAus);
    await addBankAccount.companyNameTextField.fill(resources.companyNameAus);
    await addBankAccount.createBtn.click();
    //verify error message after creating account with invalid BSB Number
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.errorBankAccVerification
    );
    await expect(addBankAccount.errorBankAccVerification).toHaveText(
      resources.errorMessages.BANK_ACC_VERIFICATION_FAILED
    );
    // Clear the BSB number field and verify it's empty
    await addBankAccount.bsbNumberField.fill("");
    const bsbNumberValue = await addBankAccount.bsbNumberField.inputValue();
    expect(bsbNumberValue).toBe("");
    //input valid BSB number
    await addBankAccount.bsbNumberField.fill(resources.validBSBNoAus);
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.createBtn.click();
    // Verify the account just created is in the table
    await myBankAccounts.verifyAccountInTable(resources.validAccNoAus);
  });

  //QGBP-157, part 1
  test("should verify the content of the 'Add Bank Account' tab for Countries using IBAN (SEPA Accounts), i.e. Germany", async ({
    page,
  }) => {
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addBankAccountSubNav
    );
    await addBankAccount.addBankAccountSubNav.click();
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.countryHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.selectCountryDropdown
    );
    //observe the content of the Add Bank Account page for Countries using IBAN (SEPA Accounts), i.e. Germany
    await addBankAccount.selectCountryDropdown.selectOption(
      resources.countryCodes.GERMANY
    );
    // Verify the selected country 'Germany' is displayed
    await addBankAccount.verifySelectedOption(
      addBankAccount.selectCountryDropdown,
      "Germany"
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.ibanHeader);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.ibanTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.furtherInformationHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountTypeDropDown
    );
    // Verify default selected option  for Account Type is 'Consumer checking'
    await addBankAccount.verifySelectedOption(
      addBankAccount.accountTypeDropDown,
      "Consumer checking"
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountNameField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.currencyDropDown
    );
    // Verify  European currency (EUR-Euro) is displayed in the currency dropdown
    await addBankAccount.verifySelectedOption(
      addBankAccount.currencyDropDown,
      "EUR-Euro"
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.nameHeader);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.firstNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.lastNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.companyNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addressInformationHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addressTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.cityTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.stateTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.zipCodeTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.cancelBtn);
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.createBtn);
  });

  //QGBP-157,  part 2
  test("should verify the content of the 'Add Bank Account' tab for Countries using IBAN (SEPA Accounts), randomly selected country", async ({
    page,
  }) => {
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addBankAccountSubNav
    );
    await addBankAccount.addBankAccountSubNav.click();
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.countryHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.selectCountryDropdown
    );
    //observe the content of the Add Bank Account page for randomly selected country using IBAN (SEPA Accounts)
    // Randomly select a country with SEPA(IBAN) account and verify it is displayed
    await addBankAccount.randomlySelectAndVerifyCountryWithIBAN();
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.ibanHeader);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.ibanTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.furtherInformationHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountTypeDropDown
    );
    // Verify default selected option  for Account Type is 'Consumer checking'
    await addBankAccount.verifySelectedOption(
      addBankAccount.accountTypeDropDown,
      "Consumer checking"
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.accountNameField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.currencyDropDown
    );
    // Verify  European currency (EUR-Euro) is displayed in the currency dropdown
    await addBankAccount.verifySelectedOption(
      addBankAccount.currencyDropDown,
      "EUR-Euro"
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.nameHeader);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.firstNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.lastNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.companyNameTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addressInformationHeader
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.addressTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.cityTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.stateTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.zipCodeTextField
    );
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.cancelBtn);
    await addBankAccount.waitForAndVerifyVisibility(addBankAccount.createBtn);
  });

  //QGBP-234
  test("@not_parallel should verify when user inputs invalid data (Account No. and BSB Number) into the Australia Bank Account, and then corrects it, the user should be able to proceed with creating the account", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Delete bank account if it's in the list to avoid dublication error
    await myBankAccounts.deleteAccountIfItExists(
      resources.validAccNoAus,
      addBankAccount
    );
    await addBankAccount.addBankAccountSubNav.click();
    await addBankAccount.selectCountryDropdown.waitFor({ state: "visible" });
    await addBankAccount.selectCountryDropdown.selectOption(
      resources.countryCodes.AUSTRALIA
    );
    // Check if directdebitMandate is visible, retry Aus country selection if not
    const isDirectDebitMandateVisible =
      await addBankAccount.directdebitMandate.isVisible({
        timeout: elementTimeout,
      });
    if (!isDirectDebitMandateVisible) {
      await addBankAccount.selectCountryDropdown.selectOption(
        resources.countryCodes.AUSTRALIA
      );
    }
    await addBankAccount.directdebitMandate.check();
    // Generate invalid Account Number
    const invalidAccNo = await addBankAccount.generateInvalidData(10);
    await addBankAccount.accountNumberTextField.fill(invalidAccNo);
    // Generate invalid BSB Number
    const invalidBSBNo = await addBankAccount.generateInvalidData(10);
    await addBankAccount.bsbNumberField.fill(invalidBSBNo);
    await addBankAccount.accountNameField.fill(resources.accNameAus);
    await addBankAccount.financialInstitutionField.fill(
      resources.financialInstutionAus
    );
    await addBankAccount.branchNameField.fill(resources.branchNameAus);
    // Verify that Australian currency (AUD) is displayed by default in the currency dropdown
    await addBankAccount.verifySelectedOption(
      addBankAccount.currencyDropDown,
      "AUD-Australian Dollar"
    );
    await addBankAccount.firstNameTextField.fill(resources.firstNameAus);
    await addBankAccount.lastNameTextField.fill(resources.lastNameAus);
    await addBankAccount.companyNameTextField.fill(resources.companyNameAus);
    await addBankAccount.createBtn.click();
    //verify error message
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.errorBankAccVerification
    );
    await expect(addBankAccount.errorBankAccVerification).toHaveText(
      resources.errorMessages.BANK_ACC_VERIFICATION_FAILED
    );
    // Clear the Account Number and the BSB number fields, verify they are empty
    await addBankAccount.accountNumberTextField.fill("");
    const accNumberValue =
      await addBankAccount.accountNumberTextField.inputValue();
    expect(accNumberValue).toBe("");
    await addBankAccount.bsbNumberField.fill("");
    const bsbNumberValue = await addBankAccount.bsbNumberField.inputValue();
    expect(bsbNumberValue).toBe("");
    //input valid Account Number and BSB number
    await addBankAccount.accountNumberTextField.fill(resources.validAccNoAus);
    await addBankAccount.bsbNumberField.fill(resources.validBSBNoAus);
    await page.waitForTimeout(elementTimeout);
    await addBankAccount.createBtn.click();
    await page.waitForTimeout(elementTimeout);
    await myBankAccounts.waitForAndVerifyVisibility(
      myBankAccounts.bankTokenCreatedSuccessfully
    );
    expect(myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      resources.successMessage.BANK_TOKEN_CREATED
    );
    // Verify the account just created is in the table
    await myBankAccounts.verifyAccountInTable(resources.validAccNoAus);
  });

  //QGBP-137 - part 1
  test("@not_parallel should verify user add Germany Bank Account successfully", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Delete bank account if it's in the list to avoid dublication error
    await myBankAccounts.deleteAccountIfItExists(
      resources.validIBANdata,
      addBankAccount
    );
    // create a new German bank account and verify it's creation
    await addBankAccount.createNewGermanBankAccountIBAN();
  });

  //QGBP-137 - part 2
  test("@not_parallel should verify user add Bank Account for randomly selected country using IBAN (SEPA Accounts) successfully", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Delete bank account if it's in the list to avoid dublication error
    await myBankAccounts.deleteAccountIfItExists(
      resources.validIBANdata,
      addBankAccount
    );
    // create a new IBAN bank account for randomly selected country and verify it's creation
    await addBankAccount.createNewIBANBankAccRandomCountry();
  });

  //QGBP-155
  test("@not_parallel should verify user add Australia Bank Account successfully", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Delete bank account if it's in the list to avoid dublication error
    await myBankAccounts.deleteAccountIfItExists(
      resources.validAccNoAus,
      addBankAccount
    );
    // create a new Australian bank account and verify it's creation
    await addBankAccount.createNewAusBankAccountBECS();
  });

  //QGBP-284
  test("@not_parallel should verify user cannot create duplicate bank accounts with the same account number for BECS accounts", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Check if there are no records available
    await page.waitForTimeout(elementTimeout);
    const noRecordsAvailable = await addBankAccount.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (noRecordsAvailable) {
      await addBankAccount.createNewAusBankAccountBECS();
      await addBankAccount.createDuplicateAusBankAccountBECS();
    } else {
      const isAccountExisting = await myBankAccounts.verifyAccountInTable(
        resources.validAccNoAus
      );
      if (isAccountExisting) {
        await addBankAccount.createDuplicateAusBankAccountBECS();
      } else {
        await addBankAccount.createNewAusBankAccountBECS();
        await addBankAccount.createDuplicateAusBankAccountBECS();
      }
    }
  });

  //QGBP-285 - part 1
  test("@not_parallel should verify user cannot create duplicate bank accounts with the same IBAN number for SEPA/EURO based accounts, randomly selected EURO country", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    await page.waitForTimeout(elementTimeout);
    const noRecordsAvailable = await addBankAccount.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (noRecordsAvailable) {
      await addBankAccount.createNewIBANBankAccRandomCountry();
      await addBankAccount.createDuplicateIBANBankAccRandomCountry();
    } else {
      const isAccountExisting = await myBankAccounts.verifyAccountInTable(
        resources.validIBANdata
      );
      if (isAccountExisting) {
        await addBankAccount.createDuplicateIBANBankAccRandomCountry();
      } else {
        await addBankAccount.createNewIBANBankAccRandomCountry();
        await addBankAccount.createDuplicateIBANBankAccRandomCountry();
      }
    }
  });

  //QGBP-285 - part 2
  test("@not_parallel should verify user cannot create duplicate bank accounts with the same IBAN number for SEPA/EURO based accounts, i.e. Germany", async ({
    page,
  }) => {
    await addBankAccount.waitForAndVerifyVisibility(
      addBankAccount.myBankAccountsSubNav
    );
    await addBankAccount.myBankAccountsSubNav.click();
    // Check if there are no records available
    await page.waitForTimeout(elementTimeout);
    const noRecordsAvailable = await addBankAccount.noRecordsAvailable
      .isVisible()
      .catch(() => false);
    if (noRecordsAvailable) {
      await addBankAccount.createNewGermanBankAccountIBAN();
      await addBankAccount.createDuplicateGermanBankAccountIBAN();
    } else {
      const isAccountExisting = await myBankAccounts.verifyAccountInTable(
        resources.validIBANdata
      );
      if (isAccountExisting) {
        await addBankAccount.createDuplicateGermanBankAccountIBAN();
      } else {
        await addBankAccount.createNewGermanBankAccountIBAN();
        await addBankAccount.createDuplicateGermanBankAccountIBAN();
      }
    }
  });
});
