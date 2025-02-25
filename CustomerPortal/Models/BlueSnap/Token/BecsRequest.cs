namespace CustomerPortal.Models.BlueSnap.Token
{
    public class BecsRequest
    {
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string country { get; set; }
        public string zip { get; set; }
        public string phone { get; set; }
        public string shopperCurrency { get; set; }
        public BecsPaymentSources paymentSources { get; set; }
    }
}
