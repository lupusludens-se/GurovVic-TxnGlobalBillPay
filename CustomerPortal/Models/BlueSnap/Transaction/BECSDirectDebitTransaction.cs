namespace CustomerPortal.Models.BlueSnap.Transaction
{
    public class BECSDirectDebitTransaction
    {
        public string bsbNumber { get; set; }
        public string accountName { get; set; }
        public string financialInstitution { get; set; }
        public string branchName { get; set; }
        public string publicAccountNumber { get; set; }
        public string agreementId { get; set; }
        public string preNotificationRef { get; set; }
    }
}
