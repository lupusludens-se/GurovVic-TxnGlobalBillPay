namespace CustomerPortal.Common.Settings
{
    public interface IApplicationSettings
    {
        ApplicationDetails Application { get; set; }
        HostingConfiguration Hosting { get; set; }
        Service GlobalBillPayService { get; set; }
        Twilio Twilio { get; set; }
    }

    #region Classes

    #region Application

    public class ApplicationDetails
    {
        public string Name { get; set; }
    }

    #endregion

    #region Services

    public class Service
    {
        public string ApiUrl { get; set; }
        public string ApiKeyName { get; set; }
        public string ApiKeyValue { get; set; }
    }

    public class Twilio
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string VerificationSid { get; set; }
    }

    #endregion

    #region Hosting

    /// <summary>
    /// Only used in Azure WebApp hosted deployments.
    /// Returns info on the WebApp instance for the current process. 
    /// Can be used to log which WebApp instance a process ran on.
    /// </summary>
    public class HostingConfiguration
    {

        public string SiteName { get; set; }
        public string InstanceId { get; set; }
    }

    #endregion

    #endregion
}
