using CustomerPortal.Models.Communication;
using CustomerPortal.Models.Token;
using Microsoft.AspNetCore.Components;
using MudBlazor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CustomerPortal.Pages.BankAccount
{
    public partial class CreateBankToken
    {
        // Address
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CompanyName { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country
        {
            get { return selectedCountry; }
            set
            {
                selectedCountry = value;
                ChangeCountry();
            }
        }
        private string selectedCountry;
        public List<string> Countries = new List<string>();

        // BECS
        public string BSBNumber { get; set; }
        public string AccountName { get; set; }
        public string FinancialInstitution { get; set; }
        public string BranchName { get; set; }
        public string AgreementId { get; set; }
        public bool SectionBECSHidden { get; set; }

        // SEPA
        public string Iban { get; set; }
        public bool HideIBAN { get; set; }

        // Shared settings and fields
        public bool SectionAccountHidden { get; set; }
        public bool SectionAddressHidden { get; set; }        
        public bool SectionNameHidden { get; set; }
        public bool SectionButtonsHidden { get; set; }
        public bool SubmitButtonDisabled { get; set; }
        public string SubmitDisabled { get; set; }
        public bool ShowBankAccount { get; set; }
        public bool ShowRoutingNumber { get; set; }        
        public bool SectionAccountType { get; set; }
        public string SubmitButtonEnabledClass { get; set; }
        public bool PhoneNumberHidden { get; set; }
        public string AccountNumber { get; set; }
        public string RoutingNumber { get; set; }
        public string AccountType { get; set; }
        public string Currency { get; set; }

        private HashSet<string> UsedAccountNumbers = new HashSet<string>();

        //Mandate
        public bool PresentMandate { get; set; }
        public bool MandateRendered { get; set; }
        public bool TermsAccepted { get; set; }
        public string TermsText { get; set; }
        public bool TermsReady { get; set; }

        protected override async Task OnInitializedAsync()
        {
            PhoneNumberHidden = true;
            SectionAddressHidden = true;
            SectionNameHidden = true;
            SectionAccountHidden = true;
            SectionButtonsHidden = true;

            SubmitDisabled = "disabled";
            SetButtonSubmitDisabled();

            AccountType = "CONSUMER_CHECKING";

            await LoadBankTokens();
        }

        /// <summary>
        /// Load bank tokens
        /// </summary>
        private async Task LoadBankTokens()
        {
            if (Session.CustomerId == null) { return; }

            var bankAccountTokens = await tokenService.GetCustomerBankTokens(Session.CustomerId);

            if (bankAccountTokens != null)
            {
                UsedAccountNumbers = bankAccountTokens.tokens.Select(t => BankAccountValidationFormat(t.DisplayAccountNumber)).ToHashSet();
            }
        }

        public void SetButtonSubmitDisabled()
        {
            SubmitButtonDisabled = true;
            SubmitButtonEnabledClass = "btn btn-primary disabled";
        }

        public void SetButtonSubmitEnabled()
        {
            SubmitButtonDisabled = false;
            SubmitButtonEnabledClass = "btn btn-primary";
            StateHasChanged();
        }

        public void ClickCancel()
        {
            var baseURI = new Uri(NavigationManager.BaseUri);
            NavigationManager.NavigateTo(baseURI.ToString());
        }

        public void ChangeCountry()
        {
            switch (Country)
            {
                case "AU":
                    {
                        // Get mandate for display
                        ShowMandate();

                        // Set AU interface settings
                        ShowBankAccount = false;
                        ShowRoutingNumber = true;
                        PresentMandate = true;
                        HideIBAN = true;
                        SectionBECSHidden = false;
                        SectionAddressHidden = true;
                        SectionAccountType = true;
                        Currency = "AUD";
                        break;
                    }
                default:
                    {
                        // Set EU interface settings
                        ShowBankAccount = true;
                        ShowRoutingNumber = true;
                        SectionAccountType = false;
                        HideIBAN = false;
                        ShowBankAccount = true;
                        SectionAddressHidden = false;
                        SectionBECSHidden = true;
                        PresentMandate = false;
                        Currency = "EUR";
                        break;
                    }
            }

            // Set common interface settings
            SectionNameHidden = false;
            SectionAccountHidden = false;
            SectionButtonsHidden = false;
            TermsAccepted = false;
            SetButtonSubmitEnabled();

            StateHasChanged();
        }

        /// <summary>
        /// Submit token to register new bank account
        /// </summary>
        private async void SubmitToken()
        {
            SetButtonSubmitDisabled();
            if (TermsAccepted == false && MandateRendered && Country == "AU")
            {
                SetButtonSubmitEnabled();
                snackbar.Add("A mandate must be accepted to continue.");
                PresentMandate = true;
                return;
            }

            if (string.IsNullOrWhiteSpace(Session.CustomerId))
            {
                SetButtonSubmitEnabled();
                snackbar.Add("Customer is null. Log out and back in, please.");
                return;
            }

            var accountNumberToValidate = string.IsNullOrEmpty(Iban) ? BankAccountValidationFormat(AccountNumber) : BankAccountValidationFormat(Iban);
            if (UsedAccountNumbers.Contains(accountNumberToValidate))
            {
                SetButtonSubmitEnabled();
                snackbar.Add("Account number is already in use. Please enter a unique account number.");
                return;
            }

            var validSuccess = true;
            if (Iban != null)
            {
                if (new[] { Iban, Address1, PostalCode, Country, FirstName, LastName }.Any(x => x == null))
                {
                    validSuccess = false;
                }
            }
            else if (MandateRendered && Country == "AU")
            {
                if (new[] { AccountNumber, AccountName, FinancialInstitution, BranchName, BSBNumber }.Any(x => x == null))
                {
                    validSuccess = false;
                }
            }
            else if (new[] { AccountNumber, RoutingNumber, Address1, City, State, PostalCode, Country, FirstName, LastName }.Any(x => x == null))
            {
                validSuccess = false;
            }

            if (validSuccess)
            {
                snackbar.Add("Do not navigate away or refresh this page until the token is processed.");

                var processor = Common.Constants.PaymentProcessor.BlueSnap; // Hard coded to BlueSnap
                var bankAccountToken = new BankAccountTokenCreate
                {
                    accountNumber = AccountNumber,
                    routingNumber = RoutingNumber,
                    country = Country,
                    currency = Currency,
                    bankAccountType = AccountType,
                    customerId = Session.CustomerId,
                    processorId = processor,
                    firstName = FirstName,
                    lastName = LastName,
                    zip = PostalCode,
                    companyName = CompanyName,
                    iBan = Iban,
                    accountName = AccountName,
                    bsbNumber = BSBNumber,
                    financialInstituation = FinancialInstitution,
                    branchName = BranchName,
                    agreementId = AgreementId
                };

                Console.WriteLine("Submitting token");
                var bankAccountResponse = await tokenService.SubmitBankToken(bankAccountToken);

                if (bankAccountResponse.isSuccess)
                {
                    await SendMandateEmail();
                    NavigateBankAccountList();
                    return;
                }

                Console.WriteLine($"Error submitting bank token: {bankAccountResponse.Message}");
                snackbar.Add($"Error submitting bank token: {bankAccountResponse.Message}", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
            }
            else
            {
                snackbar.Add("All fields have not been filled in. Please check and resubmit.");
            }

            snackbar.Add("Bank account verification failed, please check your information and try again.", Severity.Warning);
            SetButtonSubmitEnabled();
        }

        /// <summary>
        /// Email copy of mandate agreement to user
        /// </summary>
        private async Task SendMandateEmail()
        {
            if (TermsAccepted && MandateRendered && Country == "AU")
            {
                var emailRequest = new CommunicationEmailRequest
                {
                    message = TermsText,
                    htmlMessage = emailHelper.GetHTMLEmail(TermsText),
                    subject = "BECS Direct Debit Authorization",
                    toEmail = Session.Email,
                    toName = $"{FirstName} {LastName}"
                };

                await communicationService.CreateCommunicationEmail(emailRequest);
            }
        }

        public void NavigateLogin()
        {
            var uri = NavigationManager.BaseUri + "Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }

        public void NavigateBankAccountList()
        {
            navigationHelper.CreatedBankToken = true;

            var uri = navigationManager.BaseUri + "BankAccount/List";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), false);
        }

        public void CloseTermsWindow()
        {
            PresentMandate = false;
        }

        public async void ShowMandate()
        {
            if (string.IsNullOrWhiteSpace(TermsText) || string.IsNullOrWhiteSpace(AgreementId))
            {
                TermsReady = false;
                var response = await tokenService.GetMandate(Common.Constants.PaymentProcessor.BlueSnap, Common.Enums.AccountType.BECS, Country, false);

                TermsText = response.AgreementText;
                AgreementId = response.AgreementID;
            }

            if (!string.IsNullOrWhiteSpace(TermsText))
            {
                MandateRendered = true;
                TermsReady = true;
            }

            StateHasChanged();
        }

        private void TermsChanged(bool value)
        {
            PresentMandate = false;

            if (value == true)
            {
                TermsAccepted = true;
            }

            StateHasChanged();
        }

        /// <summary>
        /// Format account number string for validation
        /// </summary>
        private static string BankAccountValidationFormat(string accountNumber)
        {
            return accountNumber?.Trim().Replace(" ", string.Empty).ToLower();
        }
    }
}
