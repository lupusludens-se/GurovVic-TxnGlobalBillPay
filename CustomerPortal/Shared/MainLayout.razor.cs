using MudBlazor;
using System;
using System.Threading.Tasks;

namespace CustomerPortal.Shared
{
    public partial class MainLayout
    {
        private bool DrawerState { get; set; } = true;
        private string LogoUrl { get; set; }

        readonly MudTheme CustomerPortal = new()
        {
            Palette = new Palette()
            {
                Primary = "#007bff",
                AppbarBackground = "#ffffff"
            }
        };

        protected override async Task OnInitializedAsync()
        {
            if (LogoUrl == null)
            {
                LogoUrl = "../images/SchneiderLogo.jpg";
                Session.LogoURL = LogoUrl;
            }

            if (!Session.IsAuthenticated)
            {
                var uri = $"{NavigationManager.BaseUri}Login/";
                var baseURI = new Uri(uri);
                NavigationManager.NavigateTo(baseURI.ToString(), true);
            }

            await base.OnInitializedAsync();
            StateHasChanged();
        }
    }
}
