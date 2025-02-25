using CustomerPortal.Common.Enums;
using CustomerPortal.Common.Methods;
using System;
using System.Text.Json.Serialization;

namespace CustomerPortal.Models.Payment
{
    public class PaymentTransaction
    {
        public string ID { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string SettledTransactionId { get; set; }
        public decimal SurchargeAmount { get; set; }
        public decimal Percent { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public string CardHolderId { get; set; }
        public string AccountNumber { get; set; }
        public string CardType { get; set; }
        public string Card { get; set; }
        public string Source { get; set; }
        public string SourceId { get; set; }
        public string State { get; set; }
        public string MerchantId { get; set; }
        public string MerchantName { get; set; }
        public string MerchantNameKey { get; set; }
        public string Description { get; set; }
        public DateTime LastModified { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime SettledDateTime { get; set; }
        public PDF PDF { get; set; }

        public string CurrencySymbol
        {
            get
            {
                var cultureInfo = CultureInfoUtils.GetCultureInfo(Currency);
                return cultureInfo.NumberFormat.CurrencySymbol;
            }
        }

        public string StrAmount
        {
            get
            {
                return $"{CurrencySymbol}{Amount:0.00}";
            }
        }

        public string StrCreatedDate
        {
            get
            {
                return CreatedDate.ToString("dd MMM yyyy");
            }
        }
    }
}
