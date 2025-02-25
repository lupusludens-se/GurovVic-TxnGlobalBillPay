using CustomerPortal.Models.Error;
using System.Collections.Generic;

namespace CustomerPortal.Models.Communication
{
    public class EmailCommunicationResponse
    {
        public bool isSuccess { get; set; }
        public string message { get; set; }
        public IEnumerable<ValidationIssue> validationIssues { get; set; }
    }
}
