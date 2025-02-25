using CustomerPortal.Models.Customer;
using CustomerPortal.Services;
using MudBlazor;
using PhoneNumbers;
using System;
using System.Threading.Tasks;

namespace CustomerPortal.Pages.Session
{
    public partial class CustomerUpdate
    {
        public string Email { get; set; }
        public string ContactType { get; set; }
        public string PhoneNumber { get; set; }
        public string PIN { get; set; }
        public string NewPhone { get; set; }
        public string NewEmail { get; set; }
        public string ConfirmPhone { get; set; }
        public string ConfirmEmail { get; set; }
        public bool PinWindowVisible { get; set; }
        public bool SecondaryAuth { get; private set; }
        public CustomerBase Customer { get; set; }

        public bool SubmitDisabled { get; set; } = true;
        public string SubmitClass { get; set; }
        public bool ShowPhoneUpdate { get; set; }
        public string PhoneUpdate { get; set; }
        public bool ShowEmailUpdate { get; set; }
        public string EmailUpdate { get; set; }
        public bool StartValidationDisabled { get; set; } = false;

        /// <summary>
        /// Initialize
        /// </summary>
        protected override async Task OnInitializedAsync()
        {
            if (Session.SignInCustomerId == null)
            {
                NavigateLogin();
                return;
            }

            Customer = await CustomerService.GetCustomerAsync(Session.SignInCustomerId);
            PhoneNumber = Customer.accountPhone;
            Email = Customer.accountEmail;

            DisableButton();

            PhoneUpdate = await credentialService.GetSettingAsync("AllowPhoneEdit");
            ShowPhoneUpdate = PhoneUpdate == "True";

            EmailUpdate = await credentialService.GetSettingAsync("AllowEmailEdit");
            ShowEmailUpdate = EmailUpdate == "True";
        }

        public void DisableButton()
        {
            SubmitDisabled = true;
            SubmitClass = "btn btn-light disabled";
        }

        public void EnableButton()
        {
            SubmitDisabled = false;
            SubmitClass = "btn btn-primary";
        }

        public async void StartPhoneValidation()
        {
            ContactType ??= "text";
            Email = Session.Email;
            var customer = await CustomerService.GetCustomerEmailAsync(Email);
            Console.Write("Twilio beginning");
            twilioService.SendCode(customer.accountPhone, Email, ContactType);
            PinWindowVisible = true;
            StateHasChanged();
        }

        public async void ValidatePIN()
        {
            if (PIN == null)
            {
                snackbar.Add("PIN validation canceled");
                PinWindowVisible = false;
                return;
            }

            if (PIN.Length > 4)
            {
                var response = await twilioService.VerifyCode(PhoneNumber, Email, ContactType, PIN);
                if (response != "approved")
                {
                    snackbar.Add("A problem occured validating the PIN", Severity.Warning);
                }
                else
                {
                    PinWindowVisible = false;
                    snackbar.Add("Verification completed.", Severity.Success);
                    SubmitDisabled = false;
                    StartValidationDisabled = true;
                    EnableButton();
                    StateHasChanged();
                }
            }
        }

        public void ClosePinWindow()
        {
            ValidatePIN();
            PinWindowVisible = false;
        }

        public void SendCode()
        {
            twilioService.SendCode(AppService.AppPhoneNumber, Email, ContactType);
        }

        public async void SubmitInfo()
        {
            snackbar.Add("Do not navigate from this page until notified that all changes have been made.", Severity.Warning);
            SubmitDisabled = true;
            var edited = false;

            // Phone Update
            if (NewPhone == ConfirmPhone && NewPhone != null)
            {
                var formattedNumber = string.Empty;
                var phoneUtil = PhoneNumberUtil.GetInstance();
                var confirmedPhoneNumber = phoneUtil.Parse(ConfirmPhone, "US");
                if (phoneUtil.IsValidNumber(confirmedPhoneNumber))
                {
                    formattedNumber = phoneUtil.Format(confirmedPhoneNumber, PhoneNumberFormat.E164);
                    ConfirmPhone = formattedNumber;
                    await CustomerService.UpdateCustomerPhone(Session.SignInCustomerId, formattedNumber);
                    Console.WriteLine($"Changed phone number from {PhoneNumber} to {ConfirmPhone}");
                    snackbar.Add("Phone number has been updated", Severity.Normal);
                    edited = true;
                }
                else
                {
                    snackbar.Add("Phone number is not a valid number", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                }
            }
            if (NewEmail == ConfirmEmail && NewEmail != null)
            {
                // Need Email Validation? 
                await CustomerService.UpdateAccountEmail(Session.SignInCustomerId, ConfirmEmail);
                Console.WriteLine($"Changed email from {Email} to {ConfirmEmail}");
                snackbar.Add("Successfully changed email address", Severity.Normal);
                edited = true;

            }
            if (edited)
            {
                Session.Dispose();
                NavigateLogin();
            }

            SubmitDisabled = false;
        }

        public void NavigateLogin()
        {
            Session.NavigationPage = NavigationManager.Uri;
            var uri = NavigationManager.BaseUri + "Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), false);
        }
    }
}