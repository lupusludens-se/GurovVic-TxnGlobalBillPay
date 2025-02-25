using System;

namespace CustomerPortal.Models.ProcessorAssignment
{
    public class ProcessorAssignments
    {
        public ProcessorAssignment ACH { get; set; }
        public ProcessorAssignment Card { get; set; }
        public DateTime LastModified { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
