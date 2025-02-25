namespace CustomerPortal.Models.BlueSnap.Token
{
    public class BecsDirectDebitInfo
    {
        public BillingContactInfo billingContactInfo { get; set; }
        public BecsDirectDebit becsDirectDebit { get; set; }
        public string dateCreated { get; set; }
        public string timeCreated { get; set; }
        public string dateModified { get; set; }
        public string timeModified { get; set; }
    }
}
