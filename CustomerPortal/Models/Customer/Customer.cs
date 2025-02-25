using System;

namespace CustomerPortal.Models.Customer
{
    public class Customer
    {
        public string id { get; set; }
        public string fullName { get; set; }
        public string accountEmail { get; set; }
        public string accountPhone { get; set; }
        public string accountCountryCode { get; set; }
        public string paymentEmail { get; set; }
        public string paymentPhone { get; set; }
        public DateTime createdDate { get; set; }
        public DateTime lastActiveDate { get; set; }
    }
}
