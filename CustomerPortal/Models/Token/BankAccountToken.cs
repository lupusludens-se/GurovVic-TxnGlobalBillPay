using System;

namespace CustomerPortal.Models.Token
{
    public class BankAccountToken
    {
        public string id { get; set; }
        public string accountNumber { get; set; }
        public string DisplayAccountNumber
        {
            get
            {
                if (this.accountType == "SEPA")
                    return this.iBan;

                return this.accountNumber;
            }
        }
        public string routingNumber { get; set; }
        public string customerId { get; set; }
        public string merchantId { get; set; }
        public int processorId { get; set; }
        public string accountType { get; set; }
        public string iBan { get; set; }
        public string bankAccountType { get; set; }
        public string country { get; set; }
        public string currency { get; set; }
        public string tokenId { get; set; }
        public string paymentProfileId { get; set; }
        public string customerName { get; set; }
        public string bsbNumber { get; set; }
        public string accountName { get; set; }
        public string financialInstitution { get; set; }
        public string branchName { get; set; }
        public string agreementId { get; set; }
        public Boolean isSuccess { get; set; }
        public string Message { get; set; }
    }
}
