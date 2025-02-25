using System.Collections.Generic;
using System.Linq;

namespace CustomerPortal.Services
{
    public class NavigationHelper
    {
        private List<string> PreviousPages { get; set; }
        public bool CreatedBankToken { get; set; } = false;

        public NavigationHelper()
        {
            PreviousPages ??= new List<string>();
        }

        public void AddPageToHistory(string pageName)
        {
            PreviousPages.Add(pageName);
        }

        public string GetGoBackPage()
        {
            if (PreviousPages.Count > 1)
            {
                // You add a page on initialization, so you need to return the 2nd from the last
                return PreviousPages.ElementAt(PreviousPages.Count - 2);
            }

            // Can't go back because you didn't navigate enough
            var page = PreviousPages.FirstOrDefault();
            page ??= string.Empty;

            return page;
        }
    }
}
