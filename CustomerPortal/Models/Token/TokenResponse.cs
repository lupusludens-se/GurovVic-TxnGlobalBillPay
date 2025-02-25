using CustomerPortal.Models.Error;
using System.Collections.Generic;

namespace CustomerPortal.Models.Token
{
    public class TokenResponse
    {
        public Token token { get; set; }
        public bool isSuccess { get; set; }
        public string message { get; set; }
        public IEnumerable<ValidationIssue> validationIssues { get; set; }
        public string customerProfileId { get; set; }
        public string paymentProfileId { get; set; }
        public string cardType { get; set; }
        public int expMonth { get; set; }
        public int expYear { get; set; }
        public string cardNumberSecured { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
    }
}
