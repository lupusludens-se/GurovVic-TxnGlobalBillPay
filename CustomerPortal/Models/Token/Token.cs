using System;

namespace CustomerPortal.Models.Token
{
    public class Token
    {
        public string id { get; set; }
        public string paymentProfileId { get; set; }
        public string customerProfileId { get; set; }
        public string customerId { get; set; }
        public string merchantId { get; set; }
        public string cardNumberSecured { get; set; }
        public int expMonth { get; set; }
        public int expYear { get; set; }
        public string cardType { get; set; }
        public string cardMediaType { get; set; }
        public DateTime createdDate { get; set; }
        public bool debit { get; set; }
        public bool prepaid { get; set; }
        public bool primary { get; set; }
        public string name { get; set; }
        public bool oneTime { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }

        public override string ToString()
        {
            return $"{cardType} {cardNumberSecured} {expMonth}/{expYear}";
        }
    }
}
