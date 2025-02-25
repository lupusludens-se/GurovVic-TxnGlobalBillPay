using CustomerPortal.Common.Methods;
using CustomerPortal.Models.Payment;
using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;

namespace CustomerPortal.Pages.Payments
{
    public partial class PaymentDetail
    {
        [Parameter]
        public string TransactionId { get; set; }
        public string currencyWithSymbol;
        public PaymentTransaction PaymentTransaction { get; set; }

        /// <summary>
        /// Initialize
        /// </summary>
        protected async override Task OnInitializedAsync()
        {
            PaymentTransaction = await paymentsService.GetPaymentTransaction(TransactionId);
            currencyWithSymbol = CultureInfoUtils.GetCurrencySymbolWithAmount(PaymentTransaction.Currency, PaymentTransaction.Amount);
            StateHasChanged();
        }
    }
}
