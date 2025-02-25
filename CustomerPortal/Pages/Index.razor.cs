using CustomerPortal.Models.Reporting;
using CustomerPortal.Models.Transaction;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace CustomerPortal.Pages
{
    public partial class Index
    {
        public ILookup<string, CompletedTransaction> CompletedTransactionsData { get; set; }
        public PendingTransactionModelData Data { get; set; } = new PendingTransactionModelData();

        // Completed Transactions History
        public static List<HistorySpanData> HistorySpanDataList { get; set; } = PopulateHistorySpanData();
        public HistorySpanData SelectedSpan { get; set; } = HistorySpanDataList.FirstOrDefault();

        protected override async Task OnInitializedAsync()
        {
            if (Session.IsAuthenticated == false)
            {
                if (NavigationManager.Uri != null)
                {
                    Session.NavigationPage = NavigationManager.Uri; ;
                }

                NavigateLogin();
                return;
            }

            var customerDashboardResponse = await reportingService.GetCustomerDashboard(Session.CustomerId);

            // DONUT GRAPH
            Data.CurrencyDict = customerDashboardResponse.DashboardData;
            Data.ModelData = new List<ModelData>()
            {
                new()
                {
                    Category = "Last 7 Days",
                    Count = customerDashboardResponse.Last7DaysCount
                },
                new()
                {
                    Category = "Last 30 Days",
                    Count = customerDashboardResponse.Last30DaysCount
                },
                new()
                {
                    Category = "Over 30 Days",
                    Count = customerDashboardResponse.Over30DaysCount,
                    SegmentColor = "#8B0000"
                }
            };

            var completedTransactions = await TransactionService.GetCompleteCustomerTransactions(Session.CustomerId);

            if (completedTransactions != null && completedTransactions.Any())
            {
                CompletedTransactionsData = completedTransactions.ToLookup(key => key.Currency);
            }

            StateHasChanged();
        }

        List<CompletedTransaction> GetDataPointsFromCategory(DateTime currentCategory, string currency)
        {
            return CompletedTransactionsData[currency].Where(x => x.CreatedDate.Month == currentCategory.Month).ToList();
        }

        protected override void OnAfterRender(bool firstRender)
        {
            base.OnAfterRender(firstRender);
        }

        #region Completed Transactions History

        public static List<HistorySpanData> PopulateHistorySpanData()
        {
            var historySpanDataList = new List<HistorySpanData>();
            var currentYear = DateTime.Now.Year;

            historySpanDataList.Add(new HistorySpanData()); //default constructor, Last 6 Months
            historySpanDataList.Add(new HistorySpanData(-1, "Last 12 Months", DateTime.Now.AddMonths(-11), DateTime.Now));
            historySpanDataList.Add(new HistorySpanData(0, "FY " + currentYear.ToString(), new DateTime(currentYear, 1, 1), new DateTime(currentYear, 12, 31, 23, 59, 59, 999)));

            //hardcoded to 2023; likely do not ever need to look further back than that
            for (var numberOfYearsToPopulate = currentYear - 2023; numberOfYearsToPopulate > 0; numberOfYearsToPopulate--)
            {
                var pastYear = currentYear - numberOfYearsToPopulate;
                historySpanDataList.Add(new HistorySpanData(numberOfYearsToPopulate, "FY " + pastYear.ToString(), new DateTime(pastYear, 1, 1), new DateTime(pastYear, 12, 31, 23, 59, 59, 999)));
            }

            return historySpanDataList;
        }

        void ValueChangedHandler(int v)
        {
            SelectedSpan = HistorySpanDataList.Where(d => d.ID == v).FirstOrDefault();
        }

        #endregion

        #region Navigation

        public void NavigateLogin()
        {
            Session.NavigationPage = NavigationManager.Uri;
            var uri = NavigationManager.BaseUri + "Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }

        public void NavigatePending()
        {
            Session.NavigationPage = NavigationManager.Uri;
            var uri = NavigationManager.BaseUri + "/transactions/transactionlist";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), false);
        }

        public void NavigateComplete()
        {
            Session.NavigationPage = NavigationManager.Uri;
            var uri = NavigationManager.BaseUri + "/transactions/transactionlistcomplete";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), false);
        }

        #endregion
    }
}
