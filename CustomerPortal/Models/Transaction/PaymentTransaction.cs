using System.Collections.Generic;
using System;

namespace CustomerPortal.Models.Transaction
{
    public class PaymentTransaction
    {
        public string id { get; set; }
        public decimal amount { get; set; }
        public string currency { get; set; }
        public string settledTransactionId { get; set; }
        public decimal surchargeAmount { get; set; }
        public int percent { get; set; }
        public string paymentMethod { get; set; }
        public string paymentStatus { get; set; }
        public string cardHolderId { get; set; }
        public string accountNumber { get; set; }
        public string cardType { get; set; }
        public string card { get; set; }
        public string source { get; set; }
        public string sourceId { get; set; }
        public string description { get; set; }
        public DateTime lastModified { get; set; }
        public DateTime createdDate { get; set; }
        public DateTime settledDateTime { get; set; }
        public List<PendingTransactionEntity> pendingTransactionList { get; set; }
        public string processorReferenceId { get; set; }
        public string processorTransactionId { get; set; }
        public string paymentTransactionStage { get; set; }
        public string currencySymbol { get; set; }
    }
}
