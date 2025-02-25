using System;

namespace CustomerPortal.Models.Transaction
{
    public class PendingTransaction
    {
        public decimal amount { get; set; }
        public int status { get; set; }
        public string id { get; set; }
        public int processorId { get; set; }
        public string orderId { get; set; }
        public string cardHolderId { get; set; }
        public string merchantId { get; set; }
        public string description { get; set; }
        public DateTime lastModified { get; set; }
        public DateTime createdDate { get; set; }
        public string currency { get; set; }
        public DateTime dueDate { get; set; }
        public string customerRef { get; set; }
        public bool autoProcess { get; set; }
        public string state { get; set; }
        public string currencySymbol { get; set; }
        public string notificationEmail { get; set; }
        public decimal invoiceAmount { get; set; }
        public string vendorId { get; set; }
        public string countryRegionId { get; set; }
        public string invoiceFile { get; set; }
        public string StrAmount //for grid filtering (filtering only uses Contains() for string types)
        {
            get
            {
                return $"{currencySymbol}{amount:0.00}";
            }
        }

        public string StrDueDate //for grid filtering (filtering only uses Contains() for string types)
        {
            get
            {
                return dueDate.ToString("dd MMM yyyy");
            }
        }
    }
}
