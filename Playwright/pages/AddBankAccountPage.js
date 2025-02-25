import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { BasePage } from "./BasePage";
import { MyBankAccountsPage } from "../pages/MyBankAccountsPage";
import { CommonTestResources } from "../shared/CommonTestResources";

export class AddBankAccountPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.page = page;
    this.resources = new CommonTestResources();
    this.myBankAccounts = new MyBankAccountsPage(page);
    this.countryHeader = page.getByRole("heading", { name: "Country" });
    this.selectCountryDropdown = page.getByLabel("Country");
    this.directdebitMandate = page.getByLabel("By selecting this box you");
    this.ibanHeader = page.getByRole("heading", { name: "IBAN" });
    this.ibanTextField = page
      .locator("span")
      .filter({ hasText: "IBAN *" })
      .getByRole("textbox");
    this.bankAccountHeader = page.getByRole("heading", {
      name: "Bank Account",
    });
    this.accountNumberTextField = page
      .locator("span")
      .filter({ hasText: "Account Number *" })
      .getByRole("textbox");
    this.furtherInformationHeader = page.getByRole("heading", {
      name: "Further Information",
    });
    this.bsbNumberField = page
      .locator("span")
      .filter({ hasText: "BSB Number *" })
      .getByRole("textbox");
    this.accountNameField = page
      .locator("span")
      .filter({ hasText: "Account Name *" })
      .getByRole("textbox");
    this.financialInstitutionField = page
      .locator("span")
      .filter({ hasText: "Financial Institution *" })
      .getByRole("textbox");
    this.branchNameField = page
      .locator("span")
      .filter({ hasText: "Branch Name *" })
      .getByRole("textbox");
    this.routingNumberTextField = page
      .locator("span")
      .filter({ hasText: "Routing Number" })
      .getByRole("textbox");
    this.accountTypeDropDown = page.locator("#accountType");
    this.currencyDropDown = page.getByLabel("Currency");
    this.nameHeader = page.getByRole("heading", { name: "Name" });
    this.firstNameTextField = page
      .locator("span")
      .filter({ hasText: "First Name *" })
      .getByRole("textbox");
    this.lastNameTextField = page
      .locator("span")
      .filter({ hasText: "Last Name *" })
      .getByRole("textbox");
    this.companyNameTextField = page
      .locator("span")
      .filter({ hasText: "Company Name *" })
      .getByRole("textbox");
    this.addressInformationHeader = page.getByRole("heading", {
      name: "Address Information",
    });
    this.addressTextField = page
      .locator("span")
      .filter({ hasText: "Address *" })
      .getByRole("textbox");
    this.cityTextField = page
      .locator("span")
      .filter({ hasText: "City" })
      .getByRole("textbox");
    this.stateTextField = page
      .locator("span")
      .filter({ hasText: "State" })
      .getByRole("textbox");
    this.zipCodeTextField = page
      .locator("span")
      .filter({ hasText: "Zip Code *" })
      .getByRole("textbox");
    this.cancelBtn = page.getByRole("button", { name: "Cancel" });
    this.createBtn = page.getByRole("button", { name: "Create" });
    this.errorBankAccVerification = page.getByText("Bank account verification");
    this.errorDoNotNavigateAway = page.getByText("Do not navigate away or");
    this.dublicateAccountCreateError = page.getByText(
      "Account number is already in"
    );
  }

  async randomlySelectAndVerifyCountryWithIBAN() {
    // Select a random country, except Australia
    const countryOptions = await this.selectCountryDropdown.evaluate(
      (dropdown) => {
        return Array.from(dropdown.options)
          .filter((option) => option.value && option.value !== "au")
          .map((option) => ({
            value: option.value,
            text: option.innerText.trim(),
          }));
      }
    );
    if (countryOptions.length === 0) {
      throw new Error("No suitable country options found.");
    }
    const randomCountry =
      countryOptions[
        faker.number.int({ min: 0, max: countryOptions.length - 1 })
      ];
    // Select the random country
    await this.selectCountryDropdown.selectOption(randomCountry.value);
    await this.page.waitForTimeout(1000);
    // Verify the selected country is displayed
    await this.verifySelectedOption(
      this.selectCountryDropdown,
      randomCountry.text
    );
  }

  async verifySelectedOption(dropdownLocator, expectedText) {
    const selectedText = await dropdownLocator.evaluate((dropdown) => {
      const selectedOption = dropdown.querySelector("option:checked");
      return selectedOption ? selectedOption.innerText.trim() : null;
    });
    expect(selectedText).toBe(expectedText);
  }

  async createNewAusBankAccountBECS() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.selectCountryDropdown.selectOption(
      this.resources.countryCodes.AUSTRALIA
    );
    const isDirectDebitMandateVisible = await this.directdebitMandate.isVisible(
      { timeout: elementTimeout }
    );
    if (!isDirectDebitMandateVisible) {
      await this.selectCountryDropdown.selectOption(
        this.resources.countryCodes.AUSTRALIA
      );
    }
    await this.directdebitMandate.check();
    await this.verifySelectedOption(this.selectCountryDropdown, "Australia");
    await this.accountNumberTextField.fill(this.resources.validAccNoAus);
    await this.bsbNumberField.fill(this.resources.validBSBNoAus);
    await this.accountNameField.fill(this.resources.accNameAus);
    await this.financialInstitutionField.fill(
      this.resources.financialInstutionAus
    );
    await this.branchNameField.fill(this.resources.branchNameAus);
    await this.verifySelectedOption(
      this.currencyDropDown,
      "AUD-Australian Dollar"
    );
    await this.firstNameTextField.fill(this.resources.firstNameAus);
    await this.lastNameTextField.fill(this.resources.lastNameAus);
    await this.companyNameTextField.fill(this.resources.companyNameAus);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(1000);
    await this.myBankAccounts.bankTokenCreatedSuccessfully.waitFor({
      state: "visible",
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      this.resources.successMessage.BANK_TOKEN_CREATED
    );
    expect(this.myBankAccounts.bankAccountsHeader).toBeVisible({
      timeout: elementTimeout,
    });
    await this.myBankAccounts.verifyAccountInTable(
      this.resources.validAccNoAus
    );
  }

  async createDuplicateAusBankAccountBECS() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.selectCountryDropdown.selectOption(
      this.resources.countryCodes.AUSTRALIA
    );
    const isDirectDebitMandateVisible = await this.directdebitMandate.isVisible(
      { timeout: elementTimeout }
    );
    if (!isDirectDebitMandateVisible) {
      await this.selectCountryDropdown.selectOption(
        this.resources.countryCodes.AUSTRALIA
      );
    }
    await this.directdebitMandate.check();
    await this.verifySelectedOption(this.selectCountryDropdown, "Australia");
    await this.accountNumberTextField.fill(this.resources.validAccNoAus);
    await this.bsbNumberField.fill(this.resources.validBSBNoAus);
    await this.accountNameField.fill(this.resources.accNameAus);
    await this.financialInstitutionField.fill(
      this.resources.financialInstutionAus
    );
    await this.branchNameField.fill(this.resources.branchNameAus);
    await this.verifySelectedOption(
      this.currencyDropDown,
      "AUD-Australian Dollar"
    );
    await this.firstNameTextField.fill(this.resources.firstNameAus);
    await this.lastNameTextField.fill(this.resources.lastNameAus);
    await this.companyNameTextField.fill(this.resources.companyNameAus);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(elementTimeout);
    await this.dublicateAccountCreateError.waitFor({ state: "visible" });
    await expect(this.dublicateAccountCreateError).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.dublicateAccountCreateError).toHaveText(
      this.resources.errorMessages.DUPLICATE_ACCOUNT
    );
    await this.page.waitForTimeout(elementTimeout);
  }

  async createNewIBANBankAccRandomCountry() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.randomlySelectAndVerifyCountryWithIBAN();
    await this.page.waitForTimeout(3000);
    await this.ibanTextField.waitFor({ state: "visible" });
    await expect(this.ibanTextField).toBeVisible({
      timeout: elementTimeout,
    });
    await this.ibanTextField.fill(this.resources.validIBANdata);
    await expect(this.accountTypeDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(
      this.accountTypeDropDown,
      "Consumer checking"
    );
    await this.accountNameField.fill(this.resources.accNameEUR);
    await expect(this.currencyDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(this.currencyDropDown, "EUR-Euro");
    await this.firstNameTextField.fill(this.resources.firstNameEUR);
    await this.lastNameTextField.fill(this.resources.lastNameEUR);
    await this.companyNameTextField.fill(this.resources.companyNameEUR);
    await this.addressTextField.fill(this.resources.companyNameEUR);
    await this.cityTextField.fill(this.resources.companyNameEUR);
    await this.stateTextField.fill(this.resources.companyNameEUR);
    await this.zipCodeTextField.fill(this.resources.companyNameEUR);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(1000);
    // Validate the account creation
    await this.myBankAccounts.bankTokenCreatedSuccessfully.waitFor({
      state: "visible",
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toBeVisible({
      timeout: elementTimeout,
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      this.resources.successMessage.BANK_TOKEN_CREATED
    );
    await this.myBankAccounts.bankAccountsHeader.waitFor({ state: "visible" });
    await expect(this.myBankAccounts.bankAccountsHeader).toBeVisible({
      timeout: elementTimeout,
    });
    // Verify the created account is in the table
    await this.myBankAccounts.verifyAccountInTable(
      this.resources.validIBANdata
    );
  }

  async createDuplicateIBANBankAccRandomCountry() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.randomlySelectAndVerifyCountryWithIBAN();
    await this.page.waitForTimeout(3000);
    await this.ibanTextField.waitFor({ state: "visible" });
    await expect(this.ibanTextField).toBeVisible({
      timeout: elementTimeout,
    });
    await this.ibanTextField.fill(this.resources.validIBANdata);
    await expect(this.accountTypeDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(
      this.accountTypeDropDown,
      "Consumer checking"
    );
    await this.accountNameField.fill(this.resources.accNameEUR);
    await expect(this.currencyDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(this.currencyDropDown, "EUR-Euro");
    await this.firstNameTextField.fill(this.resources.firstNameEUR);
    await this.lastNameTextField.fill(this.resources.lastNameEUR);
    await this.companyNameTextField.fill(this.resources.companyNameEUR);
    await this.addressTextField.fill(this.resources.companyNameEUR);
    await this.cityTextField.fill(this.resources.companyNameEUR);
    await this.stateTextField.fill(this.resources.companyNameEUR);
    await this.zipCodeTextField.fill(this.resources.companyNameEUR);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(elementTimeout);

    // Validate the duplicate account creation error
    await this.dublicateAccountCreateError.waitFor({ state: "visible" });
    await expect(this.dublicateAccountCreateError).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.dublicateAccountCreateError).toHaveText(
      this.resources.errorMessages.DUPLICATE_ACCOUNT
    );
    await this.page.waitForTimeout(elementTimeout);
  }

  async createNewGermanBankAccountIBAN() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.selectCountryDropdown.selectOption(
      this.resources.countryCodes.GERMANY
    );
    await this.verifySelectedOption(this.selectCountryDropdown, "Germany");
    await expect(this.ibanTextField).toBeVisible({ timeout: elementTimeout });
    await this.ibanTextField.fill(this.resources.validIBANdata);
    await expect(this.accountTypeDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(
      this.accountTypeDropDown,
      "Consumer checking"
    );
    await this.accountNameField.fill(this.resources.accNameEUR);
    await expect(this.currencyDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(this.currencyDropDown, "EUR-Euro");
    await this.firstNameTextField.fill(this.resources.firstNameEUR);
    await this.lastNameTextField.fill(this.resources.lastNameEUR);
    await this.companyNameTextField.fill(this.resources.companyNameEUR);
    await this.addressTextField.fill(this.resources.companyNameEUR);
    await this.cityTextField.fill(this.resources.companyNameEUR);
    await this.stateTextField.fill(this.resources.companyNameEUR);
    await this.zipCodeTextField.fill(this.resources.companyNameEUR);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(1000);
    await this.myBankAccounts.bankTokenCreatedSuccessfully.waitFor({
      state: "visible",
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      this.resources.successMessage.BANK_TOKEN_CREATED
    );
    expect(this.myBankAccounts.bankAccountsHeader).toBeVisible({
      timeout: elementTimeout,
    });
    await this.myBankAccounts.verifyAccountInTable(
      this.resources.validIBANdata
    );
  }

  async createDuplicateGermanBankAccountIBAN() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.selectCountryDropdown.selectOption(
      this.resources.countryCodes.GERMANY
    );
    await this.verifySelectedOption(this.selectCountryDropdown, "Germany");
    await expect(this.ibanTextField).toBeVisible({ timeout: elementTimeout });
    await this.ibanTextField.fill(this.resources.validIBANdata);
    await expect(this.accountTypeDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(
      this.accountTypeDropDown,
      "Consumer checking"
    );
    await this.accountNameField.fill(this.resources.accNameEUR);
    await expect(this.currencyDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(this.currencyDropDown, "EUR-Euro");
    await this.firstNameTextField.fill(this.resources.firstNameEUR);
    await this.lastNameTextField.fill(this.resources.lastNameEUR);
    await this.companyNameTextField.fill(this.resources.companyNameEUR);
    await this.addressTextField.fill(this.resources.companyNameEUR);
    await this.cityTextField.fill(this.resources.companyNameEUR);
    await this.stateTextField.fill(this.resources.companyNameEUR);
    await this.zipCodeTextField.fill(this.resources.companyNameEUR);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(elementTimeout);
    await this.dublicateAccountCreateError.waitFor({ state: "visible" });
    await expect(this.dublicateAccountCreateError).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.dublicateAccountCreateError).toHaveText(
      this.resources.errorMessages.DUPLICATE_ACCOUNT
    );
    await this.page.waitForTimeout(elementTimeout);
  }

  async createNewAusBankAccountBECSWithRandomData() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.selectCountryDropdown.selectOption(
      this.resources.countryCodes.AUSTRALIA
    );
    const isDirectDebitMandateVisible = await this.directdebitMandate.isVisible(
      { timeout: elementTimeout }
    );
    if (!isDirectDebitMandateVisible) {
      await this.selectCountryDropdown.selectOption(
        this.resources.countryCodes.AUSTRALIA
      );
    }
    await this.directdebitMandate.check();
    await this.verifySelectedOption(this.selectCountryDropdown, "Australia");
    // Generate random data
    const randomAccountNumber = faker.finance
      .accountNumber({ length: 10 })
      .toString();
    const randomBSBNumber = faker.number
      .int({ min: 100000, max: 999999 })
      .toString();
    const randomAccountName = faker.person.fullName();
    const randomFinancialInstitution = faker.company.name();
    const randomBranchName = faker.location.city();
    const randomFirstName = faker.person.firstName();
    const randomLastName = faker.person.lastName();
    const randomCompanyName = faker.company.name();
    // Fill in the form with random data
    await this.accountNumberTextField.fill(randomAccountNumber);
    await this.bsbNumberField.fill(randomBSBNumber);
    await this.accountNameField.fill(randomAccountName);
    await this.financialInstitutionField.fill(randomFinancialInstitution);
    await this.branchNameField.fill(randomBranchName);
    await this.verifySelectedOption(
      this.currencyDropDown,
      "AUD-Australian Dollar"
    );
    await this.firstNameTextField.fill(randomFirstName);
    await this.lastNameTextField.fill(randomLastName);
    await this.companyNameTextField.fill(randomCompanyName);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(1000);
    await this.myBankAccounts.bankTokenCreatedSuccessfully.waitFor({
      state: "visible",
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toBeVisible({
      timeout: elementTimeout,
    });
    expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      this.resources.successMessage.BANK_TOKEN_CREATED
    );
    expect(this.myBankAccounts.bankAccountsHeader).toBeVisible({
      timeout: elementTimeout,
    });
    // Verify that the newly created account is present in the table
    await this.myBankAccounts.verifyAccountInTable(randomAccountNumber);
  }

  async createNewIBANBankAccWithRandomData() {
    const elementTimeout = 2000;
    await this.page.waitForTimeout(elementTimeout);
    await this.addBankAccountSubNav.click();
    await this.page.waitForTimeout(elementTimeout);
    await expect(this.selectCountryDropdown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.randomlySelectAndVerifyCountryWithIBAN();
    await this.page.waitForTimeout(3000);
    await this.ibanTextField.waitFor({ state: "visible" });
    await expect(this.ibanTextField).toBeVisible({ timeout: elementTimeout });
    // Generate a random IBAN (at least 15 digits)
    const randomIBAN = faker.finance.accountNumber({ length: 15 }).toString();
    // Fill in the form with random data
    await this.ibanTextField.fill(randomIBAN);
    await expect(this.accountTypeDropDown).toBeVisible({
      timeout: elementTimeout,
    });
    await this.verifySelectedOption(
      this.accountTypeDropDown,
      "Consumer checking"
    );
    const randomAccountName = faker.person.fullName();
    const randomFirstName = faker.person.firstName();
    const randomLastName = faker.person.lastName();
    const randomCompanyName = faker.company.name();
    const randomAddress = faker.location.streetAddress();
    const randomCity = faker.location.city();
    const randomState = faker.location.state();
    const randomZipCode = faker.location.zipCode();
    await this.accountNameField.fill(randomAccountName);
    await this.verifySelectedOption(this.currencyDropDown, "EUR-Euro");
    await this.firstNameTextField.fill(randomFirstName);
    await this.lastNameTextField.fill(randomLastName);
    await this.companyNameTextField.fill(randomCompanyName);
    await this.addressTextField.fill(randomAddress);
    await this.cityTextField.fill(randomCity);
    await this.stateTextField.fill(randomState);
    await this.zipCodeTextField.fill(randomZipCode);
    await this.page.waitForTimeout(elementTimeout);
    await this.createBtn.click();
    await this.page.waitForTimeout(1000);
    // Validate the account creation
    await this.myBankAccounts.bankTokenCreatedSuccessfully.waitFor({
      state: "visible",
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toBeVisible({
      timeout: elementTimeout,
    });
    await expect(this.myBankAccounts.bankTokenCreatedSuccessfully).toHaveText(
      this.resources.successMessage.BANK_TOKEN_CREATED
    );
    await this.myBankAccounts.bankAccountsHeader.waitFor({ state: "visible" });
    await expect(this.myBankAccounts.bankAccountsHeader).toBeVisible({
      timeout: elementTimeout,
    });
    // Verify the created account is in the table
    await this.myBankAccounts.verifyAccountInTable(randomIBAN);
  }
}
