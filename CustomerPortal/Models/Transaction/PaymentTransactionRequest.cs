using CustomerPortal.Common.Enums;
using System.Collections.Generic;

namespace CustomerPortal.Models.Transaction
{
    public class PaymentTransactionRequest
    {
        public decimal amount { get; set; }
        public decimal surchargeAmount { get; set; }
        public decimal percent { get; set; }
        public string currency { get; set; }
        public string settledTransactionId { get; set; }
        public PaymentMethod paymentMethod { get; set; }
        public PaymentStatus paymentStatus { get; set; }
        public string accountNumber { get; set; }
        public string cardType { get; set; }
        public string card { get; set; }
        public string merchantId { get; set; }
        public string source { get; set; }
        public string sourceId { get; set; }
        public string cardHolderId { get; set; }
        public List<PendingTransactionEntity> pendingTransactionList { get; set; }
        public string processorReferenceId { get; set; }
        public string processorTransactionId { get; set; }
        public string paymentTransactionStage { get; set; }
    }
}
