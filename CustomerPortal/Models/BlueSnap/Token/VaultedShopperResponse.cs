namespace CustomerPortal.Models.BlueSnap.Token
{
    public class VaultedShopperResponse
    {
        public int vaultedShopperId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string country { get; set; }
        public string zip { get; set; }
        public string shopperCurrency { get; set; }
        public PaymentSources paymentSources { get; set; }
        public FraudResultInfo fraudResultInfo { get; set; }
        public string dateCreated { get; set; }
        public string timeCreated { get; set; }
    }
}
