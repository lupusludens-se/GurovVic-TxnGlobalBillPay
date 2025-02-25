using CustomerPortal.Models.Transaction;
using CustomerPortal.Services;
using Microsoft.AspNetCore.Components;
using System;
using System.Linq;
using System.Threading.Tasks;
using Telerik.Blazor.Components;
using Telerik.DataSource;

namespace CustomerPortal.Pages.Transactions
{
    public partial class TransactionListComplete
    {
        bool ShowLoading { get; set; }

        private static void OnGridStateInit(GridStateEventArgs<CompletedTransaction> args)
        {
            //Sort by Completed Date(Date transaction was completed in Customer Portal)
            args.GridState.SortDescriptors.Add(new SortDescriptor()
            {
                Member = nameof(CompletedTransaction.StrCreatedDate),
                SortDirection = ListSortDirection.Descending
            });
        }

        protected async Task ReadItems(GridReadEventArgs args)
        {
            ShowLoading = true;
            string origFilterValue = string.Empty;

            //save original filter value so that it can be referenced in the service if necessary
            if (args.Request.Filters.Any() && args.Request.Filters[0]?.GetType() == typeof(CompositeFilterDescriptor))
            {
                var cfd = args.Request.Filters[0] as CompositeFilterDescriptor;
                var fd = cfd.FilterDescriptors[0] as FilterDescriptor;
                origFilterValue = fd.Value.ToString();
            }

            if (args.Request.Sorts.Count > 0)
            {
                string sortMember = args.Request.Sorts[0].Member;
                ListSortDirection sortDirection = args.Request.Sorts[0].SortDirection;

                if (sortMember == "StrAmount")
                    args.Request.Sorts[0] = new SortDescriptor() { Member = "Amount", SortDirection = sortDirection };
                else if (sortMember == "StrDueDate")
                    args.Request.Sorts[0] = new SortDescriptor() { Member = "DueDate", SortDirection = sortDirection };
                else if (sortMember == "StrCreatedDate")
                    args.Request.Sorts[0] = new SortDescriptor() { Member = "CreatedDate", SortDirection = sortDirection };
            }

            var request = new GetCompletedTransactionListQuery() { CustomerId = Session.CustomerId, GridRequest = args.Request, OrigFilterValue = origFilterValue };

            // we pass the request to the service, and there Telerik DataSource Extension methods will shape the data
            // then the service returns our project-specific envelope so that the data can be serialized by the framework
            var datasourceResult = await transactionService.GetCompleteCustomerTransactions(request);

            args.Data = datasourceResult.CurrentPageData.Cast<object>().ToList();
            args.Total = datasourceResult.TotalItemCount;
            ShowLoading = false;
        }

        void SelectTransaction(CompletedTransaction transaction)
        {
            if (transaction != null)
            {
                var baseURI = new Uri(NavigationManager.BaseUri) + "transactiondetail/" + transaction.transactionId;
                NavigationManager.NavigateTo(baseURI);
            }

            StateHasChanged();
        }

        public void NavigateLogin()
        {
            var tmpStr = NavigationManager.ToBaseRelativePath(NavigationManager.Uri);
            string uri = NavigationManager.BaseUri + "Login/path/" + tmpStr;
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }
    }
}
