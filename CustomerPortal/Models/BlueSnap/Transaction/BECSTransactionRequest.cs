namespace CustomerPortal.Models.BlueSnap.Transaction
{
    public class BECSTransactionRequest
    {
        public BECSDirectDebitTransaction becsDirectDebitTransaction { get; set; }
        public decimal amount { get; set; }
        public string currency { get; set; }
        public string vaultedShopperId { get; set; }
        public bool authorizedByShopper { get; set; }
        public VendorsInfo vendorsInfo { get; set; }
    }
}
