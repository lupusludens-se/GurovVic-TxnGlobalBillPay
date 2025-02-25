using CustomerPortal.Common.Methods;
using CustomerPortal.Models.Transaction;
using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;

namespace CustomerPortal.Pages.Transactions
{
    public partial class TransactionDetail
    {
        [Parameter]
        public string TransactionId { get; set; }
        public string CurrencyWithSymbol;
        public CompletedTransaction CompletedTransaction { get; set; } = new CompletedTransaction();

        protected override async Task OnInitializedAsync()
        {
            CompletedTransaction = await transactionService.GetCompletedTransactionAsync(TransactionId);
            CurrencyWithSymbol = CultureInfoUtils.GetCurrencySymbolWithAmount(CompletedTransaction.Currency, CompletedTransaction.amount);
            StateHasChanged();
        }
    }
}
