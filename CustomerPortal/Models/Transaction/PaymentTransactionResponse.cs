using CustomerPortal.Models.Error;
using System.Collections.Generic;

namespace CustomerPortal.Models.Transaction
{
    public class PaymentTransactionResponse
    {
        public PaymentTransaction paymentTransaction { get; set; }
        public bool isSuccess { get; set; }
        public string message { get; set; }
        public IEnumerable<ValidationIssue> validationIssues { get; set; }
    }
}
