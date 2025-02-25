namespace CustomerPortal.Models.Communication
{
    public class CommunicationEmailRequest
    {
        public string toEmail { get; set; }
        public string toName { get; set; }
        public string subject { get; set; }
        public string message { get; set; }
        public string htmlMessage { get; set; }
    }
}
