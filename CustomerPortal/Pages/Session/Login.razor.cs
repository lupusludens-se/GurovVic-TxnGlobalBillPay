using CustomerPortal.Models.Customer;
using CustomerPortal.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using MudBlazor;
using System;
using System.Threading.Tasks;

namespace CustomerPortal.Pages.Session
{
    public partial class Login
    {
        [Parameter]
        public string ReturnURL { get; set; }
        public string CustomerId { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PIN { get; set; }
        public string IPAddress { get; set; }
        public string LogoURL { get; set; }
        ElementReference PinReference;
        public bool PhoneNumberHidden { get; set; }
        public string SubmitButtonEnabledClass { get; set; }
        public bool WindowVisible { get; set; } //--> PIN Entry
        public CustomerBase Customer { get; set; }
        private string ContactType { get; } = "SMS";

        //For develop branch only; for automation testing purposes
        public bool ShowPasswordField { get; set; }
        public string Password { get; set; }

        /// <summary>
        /// Initialize
        /// </summary>
        protected async override void OnInitialized()
        {
            PhoneNumberHidden = true;
            LogoURL ??= "../images/SchneiderLogo.jpg";

            SetButtonSubmitEnabled();

            // Set load setting
            var loadAmountSetting = await credentialService.GetSettingAsync("LoadAmount");
            if (!string.IsNullOrWhiteSpace(loadAmountSetting))                
            {
                Session.LoadAmount = int.Parse(loadAmountSetting);
            }

            // Set page size setting
            var pageSizeSetting = await credentialService.GetSettingAsync("PageSize");
            if (!string.IsNullOrWhiteSpace(pageSizeSetting))
            {
                Session.PageSize = int.Parse(pageSizeSetting);
            }

            StateHasChanged();
        }

        /// <summary>
        /// Handle enter key for pin
        /// </summary>
        public void OnEnter(KeyboardEventArgs e)
        {
            if (e.Code == "Enter" || e.Code == "NumpadEnter")
            {
                string locPin = PIN;
                ValidatePIN();
            }
        }

        /// <summary>
        /// Handle enter key for email
        /// </summary>
        public void OnEnterEmail(KeyboardEventArgs e)
        {
            if (e.Code == "Enter" || e.Code == "NumpadEnter")
            {
                CheckEmailHandler();
            }
        }

        /// <summary>
        /// After render override
        /// </summary>
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (WindowVisible)
            {
                try
                {
                    await Task.Delay(100);
                    await PinReference.FocusAsync();
                }
                catch (Exception)
                {
                    WindowVisible = false;
                    // Had a bug where closing the pin window after it autofocuses the pin entry causes an unhandled error. From what i can tell it only happens when you close the window, so 
                    // This should fix it.
                }                
            }
            
            await base.OnAfterRenderAsync(firstRender);
        }

        /// <summary>
        /// Disable submit button
        /// </summary>
        public void SetButtonSubmitDisabled()
        {
            SubmitButtonEnabledClass = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-200 hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
        }

        /// <summary>
        /// Enable submit button
        /// </summary>
        public void SetButtonSubmitEnabled()
        {
            SubmitButtonEnabledClass = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
        }

        /// <summary>
        /// Lookup customer via email address
        /// </summary>
        public async void CheckEmailHandler()
        {
            Session.IPAddress = IPAddress;

            Console.Write("Twilio beginning");
            if (IsValidEmail(Email))
            {
                Customer = await customerService.GetCustomerEmailAsync(Email);
                if (Customer != null)
                {
                    if (string.IsNullOrWhiteSpace(Customer.sharedCustomerId))
                    {
                        CustomerId = Customer.id;
                        Session.CustomerId = Customer.id;
                        Session.Email = Email;
                    }
                    else
                    {
                        CustomerId = Customer.sharedCustomerId;
                        Session.CustomerId = Customer.sharedCustomerId;
                        Session.Email = Email;
                        Session.SharedCustomerId = CustomerId;
                    }
                }

                //For develop branch only; for automation testing purposes; if user is setup to require password, show password field
                if (Customer != null && Customer.RequirePassword)
                {
                    if (ShowPasswordField)
                    {
                        if (Password == Environment.GetEnvironmentVariable("AUTOMATION_PASSWORD"))
                        {
                            Session.SignInCustomerId = Customer.id;

                            SetButtonSubmitDisabled();
                            WindowVisible = false;
                            PhoneNumberHidden = true;
                            ShowPasswordField = false;
                            Password = string.Empty;

                            appService.AppCustomerId = CustomerId;
                            appService.AppEmailId = Email;
                            appService.AppPhoneNumber = PhoneNumber;

                            Session.Authenticate(Email);
                            NavigateOrigin();
                            StateHasChanged();

                            snackbar.Add("Verification completed. Welcome, power user! \ud83d\ude0e", Severity.Success);
                        }
                        else
                        {
                            snackbar.Add("The password entered is incorrect.", Severity.Warning);
                        }
                    }
                    else //the first time the submit button is clicked and user is configured for password, show the password field
                    {
                        ShowPasswordField = true;
                        StateHasChanged();
                    }

                    return;
                }
                else //in case password field was enabled and user enters a different email address afterwards that isn't configured to use password
                {
                    ShowPasswordField = false;
                    Password = string.Empty;
                    StateHasChanged();
                }
                //End development branch only code

                var customerKnown = false;
                if (Customer != null)
                {
                    customerKnown = true;
                    if (string.IsNullOrWhiteSpace(Customer.accountPhone))
                    {
                        customerKnown = false;
                    }
                    if (!string.IsNullOrWhiteSpace(Customer.accountEmail) && Customer.contactType == "Email")
                    {
                        customerKnown = true;
                    }
                }
                else if (Customer == null && Session.CustomerId != null)
                {
                    //--> Here for Checkout where we knew the customer and needed to transfer it over
                    //--> to the login screen.  But once we have the customer, remove it from the session, as it might be 
                    //--> a sub customer
                    Customer = await CustomerService.GetCustomerAsync(Session.CustomerId);
                    Session.CustomerId = null;
                }

                if (customerKnown == true)
                {
                    twilioService.SendCode(Customer.accountPhone, Email, ContactType);
                    WindowVisible = true;
                    PhoneNumber = Customer.accountPhone;
                    StateHasChanged();
                }
                else if (customerKnown == false && Customer != null)
                {
                    //--> store customer id
                    appService.AppCustomerId = CustomerId;
                    snackbar.Add("In order to continue, please enter a contact type. We will send you a code to validate your account", Severity.Warning);
                    PhoneNumberHidden = false;
                    StateHasChanged();
                }
                else
                {
                    var createCustomer = await credentialService.GetSettingAsync("CreateCustomer");
                    if (!string.IsNullOrWhiteSpace(createCustomer) && bool.Parse(createCustomer))
                    {
                        //--> store customer id
                        appService.AppCustomerId = CustomerId;
                        snackbar.Add("In order to continue, please enter a contact type. We will send you a code to validate your account", Severity.Warning);
                        PhoneNumberHidden = false;
                        StateHasChanged();
                    }
                    else
                    {
                        snackbar.Add("You are not a current customer. Please reach out to our administrator to sign up", Severity.Warning);
                    }
                }
            }
            else
            {
                snackbar.Add("Invalid email, please try again.", Severity.Warning);
            }
        }

        /// <summary>
        /// Validate login pin number
        /// </summary>
        public async void ValidatePIN()
        {
            if (PIN == null)
            {
                snackbar.Add("PIN validation canceled");
                WindowVisible = false;
                return;
            }
            
            if (PIN.Length > 4)
            {
                var response = await twilioService.VerifyCode(PhoneNumber, Email, ContactType, PIN);
                if (response == "Locked")
                {
                    snackbar.Add("Account locked due to multiple incorrect PIN attempts. Please try again in 10 minutes. ", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                }
                else if (response != "approved")
                {
                    snackbar.Add("A problem occurred validating the Code", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                }
                else
                {
                    if (Session.CustomerId == null)
                    {   
                        var customerBase = await CustomerService.GetCustomerEmailAsync(Email);
                        if (customerBase == null)
                        {
                            var createCustomer = await credentialService.GetSettingAsync("CreateCustomer");
                            if (!string.IsNullOrWhiteSpace(createCustomer) && bool.Parse(createCustomer))
                            {
                                var customerResponse = await CustomerService.CreateCustomer(Email, Email);
                                Session.CustomerId = customerResponse.customer.id;
                                Session.SignInCustomerId = Customer.id;
                                Session.Email = Email;
                            }
                            else
                            {
                                snackbar.Add("A problem occurred creating a sub Customer", Severity.Warning);
                                return;
                            }
                        }
                        else
                        {
                            Session.CustomerId = customerBase.id;
                            Session.Email = Email;
                            Session.SignInCustomerId = Customer.id;
                        }
                    }
                    else
                    {
                        var customerBase = await CustomerService.GetCustomerEmailAsync(Email);
                        if (customerBase != null)
                        {
                            Session.SignInCustomerId = Customer.id;
                        }
                    }

                    SetButtonSubmitDisabled();
                    WindowVisible = false;
                    PhoneNumberHidden = true;
                    snackbar.Add("Verification completed.", Severity.Success);

                    appService.AppCustomerId = CustomerId;
                    appService.AppEmailId = Email;
                    appService.AppPhoneNumber = PhoneNumber;

                    Session.Authenticate(Email);

                    this.NavigateOrigin();

                    StateHasChanged();
                }
            }
            else
            {
                snackbar.Add("A problem occurred validating the PIN. Click Submit to try again.");
            }
        }

        /// <summary>
        /// Close pin window
        /// </summary>
        public void ClosePinWindow()
        {
            ValidatePIN();
            WindowVisible = false;
        }

        /// <summary>
        /// Send login code
        /// </summary>
        public void SendCode()
        {
            twilioService.SendCode(PhoneNumber, Email, ContactType);
        }

        /// <summary>
        /// Navigate back to home page
        /// </summary>
        public void NavigateOrigin()
        {
            ReturnURL ??= "#";

            var uri = NavigationManager.BaseUri + ReturnURL;

            if (uri != null)
            {
                NavigationManager.NavigateTo(uri);
            }
        }

        /// <summary>
        /// Validates email address
        /// </summary>
        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return false;
            }

            var trimmedEmail = email.Trim();

            if (trimmedEmail.EndsWith("."))
            {
                return false;
            }
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == trimmedEmail;
            }
            catch
            {
                return false;
            }
        }
    }
}
