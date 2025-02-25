using System.Collections.Generic;

namespace CustomerPortal.Models.BlueSnap.Error
{
    public class ErrorDetails
    {
        public string errorName { get; set; }
        public int? code { get; set; }
        public string description { get; set; }
        public ErrorProperty invalidProperty { get; set; }
    }
}
