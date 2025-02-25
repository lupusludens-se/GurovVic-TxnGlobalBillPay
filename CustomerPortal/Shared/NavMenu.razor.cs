using CustomerPortal.Models;
using System.Threading.Tasks;

namespace CustomerPortal.Shared
{
    public partial class NavMenu
    {
        private string LogoUrl { get; set; }

        // Icon Strings
        private string AddBank { get; } = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M17,14H19V17H22V19H19V22H17V19H14V17H17V14M11.5,1L21,6V8H2V6L11.5,1M16,10H19V12.08L18,12C17.3,12 16.63,12.12 16,12.34V10M2,22V19H12.08C12.27,20.14 12.79,21.17 13.53,22H2M10,10H13V14.68C12.54,15.37 12.22,16.15 12.08,17H10V10M4,10H7V17H4V10Z\" /></svg>";
        private string BankAccount { get; } = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M11 8C11 10.21 9.21 12 7 12C4.79 12 3 10.21 3 8C3 5.79 4.79 4 7 4C9.21 4 11 5.79 11 8M11 14.72V20H0V18C0 15.79 3.13 14 7 14C8.5 14 9.87 14.27 11 14.72M24 20H13V3H24V20M16 11.5C16 10.12 17.12 9 18.5 9C19.88 9 21 10.12 21 11.5C21 12.88 19.88 14 18.5 14C17.12 14 16 12.88 16 11.5M22 7C20.9 7 20 6.11 20 5H17C17 6.11 16.11 7 15 7V16C16.11 16 17 16.9 17 18H20C20 16.9 20.9 16 22 16V7Z\" /></svg>";

        protected async override Task OnInitializedAsync()
        {
            if (LogoUrl == null)
            {
                SessionState Session = new SessionState();
                LogoUrl = "../images/SchneiderLogo.jpg";
                Session.LogoURL = LogoUrl;
                StateHasChanged();
            }

            if (Session.CustomerId != null && Session.CustomerId != string.Empty)
            {
                var customer = await customerService.GetCustomerAsync(Session.CustomerId);
            }

            StateHasChanged();
        }
    }
}
