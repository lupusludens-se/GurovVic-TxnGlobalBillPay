using CustomerPortal.Common.Enums;

namespace CustomerPortal.Models.BlueSnap.Transaction
{
    public class BankTransactionComplete
    {
        public string merchantId { get; set; }
        public string customerId { get; set; }
        public string transactionId { get; set; }
        public BankTransactionType transactionType { get; set; }
        public string paymentMethod { get; set; }
        public string card { get; set; }
        public string processorReferenceId { get; set; }
        public string customerProfileId { get; set; }
        public string paymentProfileId { get; set; }
        public bool isSuccess { get; set; }
        public string error { get; set; }
        public CompletionMethod completionMethod { get; set; }
        public PaymentStatus paymentStatus { get; set; }
        public string bankAccount { get; set; }
        public string currency { get; set; }
        public string paymentId { get; set; }
        public string customerRef { get; set; }
        public decimal invoiceAmount { get; set; }
        public decimal surchargeAmount { get; set; }
        public string cardType { get; set; }
        public string processorTransactionId { get; set; }
        public SEPADirectDebitTransactionResponse sepaDirectDebitTransaction { get; set; }
    }
}
