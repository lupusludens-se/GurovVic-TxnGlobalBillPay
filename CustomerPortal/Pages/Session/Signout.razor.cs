using System;

namespace CustomerPortal.Pages.Session
{
    public partial class Signout
    {
        public string LogoUrl { get; set; }

        /// <summary>
        /// Init
        /// </summary>
        protected override void OnInitialized()
        {
            LogoUrl = "../images/SchneiderLogo.jpg"; ;
        }

        /// <summary>
        /// Log off
        /// </summary>
        public void LogOff()
        {
            Session.Dispose();
            var uri = NavigationManager.BaseUri + "Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }
    }
}
