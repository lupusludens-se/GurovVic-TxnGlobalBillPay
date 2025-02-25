using System;

namespace CustomerPortal.Models.Credential
{
    public class CredentialResponse
    {
        public string id { get; set; }
        public string name { get; set; }
        public string nameKey { get; set; }
        public string value { get; set; }
        public DateTime createdDate { get; set; }
        public DateTime lastUpdatedDate { get; set; }
    }
}
