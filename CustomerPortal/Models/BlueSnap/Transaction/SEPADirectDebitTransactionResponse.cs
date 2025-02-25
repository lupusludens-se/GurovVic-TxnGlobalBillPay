namespace CustomerPortal.Models.BlueSnap.Transaction
{
    public class SEPADirectDebitTransactionResponse
    {
        public string ibanFirstFour { get; set; }
        public string ibanLastFour { get; set; }
        public string mandateId { get; set; }
        public string mandateDate { get; set; }
        public string preNotificationText { get; set; }
        public string preNotificationTranslationRef { get; set; }
    }
}
