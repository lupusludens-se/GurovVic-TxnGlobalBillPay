using CustomerPortal.Common.Enums;
using CustomerPortal.Models.Payment;
using Microsoft.AspNetCore.Components;
using System;
using System.Linq;
using System.Threading.Tasks;
using Telerik.Blazor.Components;
using Telerik.DataSource;

namespace CustomerPortal.Pages.Payments
{
    public partial class PaymentsList
    {
        [Parameter]
        public string CustomerId { get; set; }
        public bool TransactionsHidden { get; set; }

        protected async override Task OnInitializedAsync()
        {
            if (appService.AppCustomerId != null || CustomerId != null)
            {
                var customer = await customerService.GetCustomerEmailAsync(Session.Email);

                if (customer.id != null)
                {
                    TransactionsHidden = false;
                }
            }
            else
            {
                TransactionsHidden = true;
            }

            StateHasChanged();
        }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (Session.IsAuthenticated == false)
            {
                if (NavigationManager.Uri != null)
                {
                    Session.NavigationPage = NavigationManager.Uri; ;
                    appService.AppURL = navigationManager.Uri;
                }

                NavigateLogin();
                return;
            }

            await base.OnAfterRenderAsync(firstRender);
        }

        private static void OnGridStateInit(GridStateEventArgs<PaymentTransaction> args)
        {
            // Sort by Created Date (Date payment was initiated)
            args.GridState.SortDescriptors.Add(new SortDescriptor()
            {
                Member = nameof(PaymentTransaction.CreatedDate),
                SortDirection = ListSortDirection.Descending
            });
        }

        void SelectTransaction(PaymentTransaction transaction)
        {
            if (transaction != null)
            {
                var baseURI = new Uri(NavigationManager.BaseUri) + "paymentdetail/" + transaction.ID;
                NavigationManager.NavigateTo(baseURI);
            }

            StateHasChanged();
        }

        public void NavigateLogin()
        {
            var path = NavigationManager.ToBaseRelativePath(NavigationManager.Uri);
            var uri = NavigationManager.BaseUri + "Login/path/" + path;
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }

        protected async Task ReadItems(GridReadEventArgs args)
        {
            // Create customer search filters
            if (args.Request.Filters.Any() && args.Request.Filters[0]?.GetType() == typeof(CompositeFilterDescriptor))
            {
                var cfd = args.Request.Filters[0] as CompositeFilterDescriptor;
                var fd = cfd.FilterDescriptors[0] as FilterDescriptor;
                var origFilterValue = fd.Value.ToString();

                var newCFD = new CompositeFilterDescriptor()
                {
                    LogicalOperator = FilterCompositionLogicalOperator.Or,
                };

                if (decimal.TryParse(origFilterValue, out var value))
                {
                    newCFD.FilterDescriptors.Add(new FilterDescriptor() { Member = nameof(PaymentTransaction.Amount), Value = value, MemberType = typeof(decimal) });
                }
                else if (DateTime.TryParse(origFilterValue, out var dateTime))
                {
                    newCFD.LogicalOperator = FilterCompositionLogicalOperator.And;
                    newCFD.FilterDescriptors.Add(new FilterDescriptor() { Member = "CreatedDate", Value = dateTime, MemberType = typeof(DateTime), Operator = FilterOperator.IsGreaterThanOrEqualTo });
                    newCFD.FilterDescriptors.Add(new FilterDescriptor() { Member = "CreatedDate", Value = dateTime.AddDays(1), MemberType = typeof(DateTime), Operator = FilterOperator.IsLessThanOrEqualTo });
                }
                else if (Enum.TryParse<PaymentMethod>(origFilterValue, out var paymentMethod))
                {
                    newCFD.FilterDescriptors.Add(new FilterDescriptor() { Member = nameof(PaymentTransaction.PaymentMethod), Value = paymentMethod });
                }
                else
                {
                    foreach (FilterDescriptor d in cfd.FilterDescriptors.Cast<FilterDescriptor>())
                    {
                        if (d.Member != nameof(PaymentTransaction.StrAmount) && d.Member != nameof(PaymentTransaction.StrCreatedDate))
                        {
                            newCFD.FilterDescriptors.Add(new FilterDescriptor() { Member = d.Member, Value = d.Value, MemberType = typeof(string), Operator = FilterOperator.IsEqualTo });
                        }
                    }
                }

                // Replace the default filters with the custom filters
                args.Request.Filters[0] = newCFD;
            }

            // Handle sorting on custom data columns
            if (args.Request.Sorts.Count > 0)
            {
                var sortMember = args.Request.Sorts[0].Member;
                var sortDirection = args.Request.Sorts[0].SortDirection;

                if (sortMember == nameof(PaymentTransaction.StrAmount))
                    args.Request.Sorts[0] = new SortDescriptor() { Member = nameof(PaymentTransaction.Amount), SortDirection = sortDirection };
                else if (sortMember == nameof(PaymentTransaction.StrCreatedDate))
                    args.Request.Sorts[0] = new SortDescriptor() { Member = nameof(PaymentTransaction.CreatedDate), SortDirection = sortDirection };
            }

            var request = new GetPaymentTransactionsByCustomerQuery() { CardHolderId = Session.CustomerId, GridRequest = args.Request };

            // We pass the request to the service, and there Telerik DataSource Extension methods will shape the data
            // then the service returns our project-specific envelope so that the data can be serialized by the framework
            var dataSourceResult = await paymentsService.GetCustomerPayments(request);

            args.Data = dataSourceResult.CurrentPageData.Cast<object>().ToList();
            args.Total = dataSourceResult.TotalItemCount;
        }
    }
}
