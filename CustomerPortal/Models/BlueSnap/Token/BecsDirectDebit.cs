namespace CustomerPortal.Models.BlueSnap.Token
{
    public class BecsDirectDebit
    {
        public string bsbNumber { get; set; }
        public string accountName { get; set; }
        public string financialInstitution { get; set; }
        public string branchName { get; set; }
        public string publicAccountNumber { get; set; }
        public string accountNumber { get; set; }
        public int agreementId { get; set; }
    }
}
