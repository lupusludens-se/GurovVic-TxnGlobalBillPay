namespace CustomerPortal.Models.BlueSnap.Transaction
{
    public class SEPARequest
    {
        public SEPADirectDebitTransactionRequest sepaDirectDebitTransaction { get; set; }
        public string vaultedShopperId { get; set; }
        public decimal amount { get; set; }
        public string currency { get; set; }
        public string softDescriptor { get; set; }
        public bool authorizedByShopper { get; set; }
        public VendorsInfo vendorsInfo { get; set; }
    }
}
