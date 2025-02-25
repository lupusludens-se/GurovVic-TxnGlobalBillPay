using CustomerPortal.Models.BlueSnap.Token;
using CustomerPortal.Models.BlueSnap.Transaction;

namespace CustomerPortal.Models.Transaction
{
    public class BankTransactionResponse
    {
        public EcpTransaction ecpTransaction { get; set; }
        public BECSDirectDebitTransaction becsDirectDebitTransaction { get; set; }
        public SEPADirectDebitTransactionResponse sepaDirectDebitTransaction { get; set; }
        public string amount { get; set; }
        public PayerInfo payerInfo { get; set; }
        public int vaultedShopperId { get; set; }
        public BankProcessingInfo processingInfo { get; set; }
        public string softDescriptor { get; set; }
        public string currency { get; set; }
        public int transactionId { get; set; }
        public FraudResultInfo fraudResultInfo { get; set; }
    }
}
