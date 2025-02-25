using CustomerPortal.Common.Methods;
using System;

namespace CustomerPortal.Models.Transaction
{
    public class CompletedTransaction
    {
        public string transactionId { get; set; }
        public int processorId { get; set; }
        public decimal amount { get; set; }
        public int status { get; set; }
        public string message { get; set; }
        public DateTime CompletedDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime dueDate { get; set; }
        public string customerId { get; set; }
        public string customerAccountEmail { get; set; }
        public string Currency { get; set; }
        public string CurrencySymbol
        {
            get
            {
                var cultureInfo = CultureInfoUtils.GetCultureInfo(Currency);
                return cultureInfo.NumberFormat.CurrencySymbol;
            }
            set { Currency = value; }
        }

        public string description { get; set; }
        public string orderId { get; set; }
        public string completionMethod { get; set; }
        public string paymentStatus { get; set; }
        public string customerRef { get; set; }
        public string processorReferenceId { get; set; }
        public decimal invoiceAmount { get; set; }
        public string processorTransactionId { get; set; }
        public string invoiceFile { get; set; }

        public string StrAmount //for grid filtering (filtering only uses Contains() for string types)
        {
            get
            {
                return $"{CurrencySymbol}{amount:0.00}";
            }
        }

        public string StrDueDate //for grid filtering (filtering only uses Contains() for string types)
        {
            get
            {
                return dueDate.ToString("dd MMM yyyy");
            }
        }

        public string StrCreatedDate //for grid filtering (filtering only uses Contains() for string types)
        {
            get
            {
                return CreatedDate.ToString("dd MMM yyyy");
            }
        }
    }
}
