using CustomerPortal.Models.Error;
using System.Collections.Generic;

namespace CustomerPortal.Models.Customer
{
    public class CustomerResponse
    {
        public Customer customer { get; set; }
        public bool isSuccess { get; set; }
        public string message { get; set; }
        public IEnumerable<ValidationIssue> validationIssues { get; set; }
    }
}
