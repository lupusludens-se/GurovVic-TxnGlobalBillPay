export class CommonTestResources {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor() {
    this.environmentURL = process.env.ENVIRONMENT_URL;
    this.email = process.env.EMAIL;
    this.mfaEmail = process.env.MFA_EMAIL;
    this.password = process.env.PASSWORD;
    this.phoneNumber = process.env.PHONE_NO;
    //test data for Australian bank account
    this.validAccNoAus = "9990000001";
    this.accNameAus = "Malindas";
    this.financialInstutionAus = "Company";
    this.branchNameAus = "Melbourne";
    this.firstNameAus = "Malindas";
    this.lastNameAus = "Benson";
    this.companyNameAus = "Benson Corp";
    this.validBSBNoAus = "980201";
    //test data for Germany
    this.validIBANdata = "DE09100100101234567893";
    this.accNameEUR = "Johnny Roberts";
    this.firstNameEUR = "Johnny";
    this.lastNameEUR = "Roberts";
    this.companyNameEUR = "Johnson Inc.";
    this.addressData = "123 Maple st";
    this.cityData = "Boston";
    this.stateData = "MA";
    this.zipcodeData = "02108";
    // Country codes
    this.countryCodes = {
      AUSTRALIA: "AU",
      GERMANY: "DE",
    };
    // bank Account types
    this.bankAccountTypes = {
      AUS_bankAccType: "BECS",
      Euro_bankAccType: "SEPA",
    };
    // invoice currency
    this.currencyOfInvoice = {
      AUS_currency: "AUD",
      Euro_currency: "EUR",
    };
    // messages pops up in UI
    this.errorMessages = {
      DUPLICATE_ACCOUNT:
        "Account number is already in use. Please enter a unique account number.",
      BANK_ACC_VERIFICATION_FAILED:
        "Bank account verification failed, please check your information and try again.",
    };
    this.successMessage = {
      BANK_TOKEN_CREATED: "Bank token created successfully.",
      Successful_Payment: "Your transaction has processed successfully",
    };
    this.commonUItext = {
      ENTER_EMAIL: "Enter your email",
      USE_EMAIL_FOR_PAYMENT: "Use your email to begin payment",
      EMAIL_ADDRESS: "Email address",
    };
    this.textOfAllNavigationOptions = {
      dashboard: "Dashboard",
      pendingTxns: "Pending Transactions",
      completedTxns: "Completed Transactions",
      viewPayments: "View Payments",
      bankAccounts: "Bank Accounts",
      myBankAccounts: "My Bank Accounts",
      addBankAccount: "Add Bank Account",
      userOptions: "User Options",
      editMyInfo: "Edit My Info",
      signOut: "Sign Out",
    };
    this.apiDetails = {
      Transaction_start_endpoint: "/transaction/start",
      Invoice_file:
        "https://core.stg1.resourceadvisor.schneider-electric.com/imgserver/InternalImage.aspx?cbmsimgid=wcTESd2ACbn3HGYrGHXF2Q==&mode=View",
    };
  }
}
