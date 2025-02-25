namespace CustomerPortal.Models.Error
{
    public class ValidationIssue
    {
        public string propertyName { get; set; }
        public string[] propertyFailures { get; set; }
    }
}
