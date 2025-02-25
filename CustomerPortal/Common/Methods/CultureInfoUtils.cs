using CustomerPortal.Models.Transaction;
using Microsoft.AspNetCore.Components;
using System.Globalization;

namespace CustomerPortal.Common.Methods
{
    public class CultureInfoUtils
    {
        //Add Countries CultureInfo
        static readonly CultureInfo GermanyCultureInfo = new ("de-DE");
        static readonly CultureInfo AustraliaCultureInfo = new ("en-AU");
        static readonly CultureInfo BrazilCultureInfo = new ("pt-BR");
        static readonly CultureInfo UnitedStatesInfo = new ("en-US");

        /// <summary>
        /// Sets the CultureInfo based on the currency passed in.
        /// This is where to can add more CultureInfo to expand the
        /// symbols list for difference currencies.
        /// </summary>
        public static CultureInfo GetCultureInfo(string currency)
        {
            if (!string.IsNullOrWhiteSpace(currency))
            {
                switch (currency)
                {
                    case "EUR":
                        {
                            return GermanyCultureInfo;
                        }
                    case "AUD":
                        {
                            return AustraliaCultureInfo;
                        }
                    case "BRL":
                        {
                            return BrazilCultureInfo;
                        }
                }
            }
            //Defaults to returning the United State dollar symbol.
            //This prevents a null exception from happening if the currency field is null.
            //I don't think that field should ever be null though.
            return UnitedStatesInfo;
        }

        /// <summary>
        /// Handles the formatting and logic to be able to render currency specific symbols
        /// </summary>
        public static RenderFragment<object> FormatMonetaryValuesToShowCorrectSymbols(decimal amountToRender) => (dataItem) => builder =>
        {
            if (dataItem == null)
            {
                builder.AddContent(0, "");
            }
            else
            {
                if (dataItem is CompletedTransaction completedItem)
                {
                    builder.AddContent(0, $"{completedItem.CurrencySymbol}{completedItem.invoiceAmount:0.00}");
                }
                else if (dataItem is PendingTransaction pendingItem)
                {
                    //Edge case if invoiceAmount can be a different value than amount.
                    if (amountToRender == pendingItem.invoiceAmount)
                    {
                        builder.AddContent(0, $"{pendingItem.currencySymbol}{pendingItem.invoiceAmount:0.00}");
                    }
                    else
                    {
                        builder.AddContent(0, $"{pendingItem.currencySymbol}{pendingItem.amount:0.00}");
                    }
                }
                else if (dataItem is Models.Payment.PaymentTransaction paymentItem)
                {
                    builder.AddContent(0, $"{paymentItem.CurrencySymbol}{paymentItem.Amount:0.00}");
                }
            }
        };

        /// <summary>
        /// Returns a string based off currency and the amount passed in
        /// Used for formatting data to send to the front-end
        /// </summary>
        public static string GetCurrencySymbolWithAmount(string currency, decimal amount)
        {
            var currencySymbol = GetCultureInfo(currency);
            var currencyWithSymbol = $"{currencySymbol.NumberFormat.CurrencySymbol}{amount:0.00}";
            return currencyWithSymbol;
        }
    }
}
