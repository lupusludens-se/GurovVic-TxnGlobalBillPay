namespace CustomerPortal.Models.BlueSnap.Token
{
    public class SepaDirectDebitInfo
    {
        public BillingContactInfo billingContactInfo { get; set; }
        public SepaDirectDebit sepaDirectDebit { get; set; }
        public string dateCreated { get; set; }
        public string timeCreated { get; set; }
        public string dateModified { get; set; }
        public string timeModified { get; set; }
    }
}
