using Azure.Core;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.Extensions.Configuration;
using System;

namespace CustomerPortal.Common.Settings
{
    /// <summary>
    /// We use the IApplicationSettings type as a way to inject settings
    /// and resource connections into our classes from our main entry points.
    /// </summary>
    public class ApplicationSettings : IApplicationSettings
    {
        public ApplicationDetails Application { get; set; }
        public HostingConfiguration Hosting { get; set; }
        public Service GlobalBillPayService { get; set; }
        public Twilio Twilio { get; set; }

        public ApplicationSettings(IConfiguration configuration)
        {
            // Create settings classes
            Application = new ApplicationDetails();
            Hosting = new HostingConfiguration();
            GlobalBillPayService = new Service();
            Twilio = new Twilio();

            // Map appsettings.json
            Application.Name = configuration.GetSection("Application").GetSection("Name").Value;
            GlobalBillPayService.ApiKeyName = configuration.GetSection("GlobalBillPayService").GetSection("ApiKeyName").Value;

            // Map KeyVault Values
            SecretClientOptions options = new SecretClientOptions()
            {
                Retry =
                {
                    Delay= TimeSpan.FromSeconds(2),
                    MaxDelay = TimeSpan.FromSeconds(16),
                    MaxRetries = 5,
                    Mode = RetryMode.Exponential
                 }
            };
            var vaultName = configuration.GetSection("KEY_VAULT_NAME").Value;
            var secretsUrl = $"https://{vaultName}.vault.azure.net";
            var keyVaultClient = new SecretClient(new Uri(secretsUrl), new DefaultAzureCredential(), options);

            // Services ---------
            GlobalBillPayService.ApiUrl = keyVaultClient.GetSecretAsync("GlobalBillPayService-ApiUrl").GetAwaiter().GetResult().Value.Value;
            GlobalBillPayService.ApiKeyValue = keyVaultClient.GetSecretAsync("GlobalBillPayService-PrimaryApiKey").GetAwaiter().GetResult().Value.Value;

            //Twilio -----            
            Twilio.AccountSid = keyVaultClient.GetSecretAsync("TwilioSettings-AccountSID").GetAwaiter().GetResult().Value.Value;
            Twilio.AuthToken = keyVaultClient.GetSecretAsync("Twilio-AuthToken").GetAwaiter().GetResult().Value.Value;
            Twilio.VerificationSid = keyVaultClient.GetSecretAsync("TwilioSettings-VerificationSID").GetAwaiter().GetResult().Value.Value;

            #region Hosting configuration details (if available)

            try
            {
                // Azure WebApp provides these settings when deployed.
                Hosting.SiteName = configuration["WEBSITE_SITE_NAME"];
                Hosting.InstanceId = configuration["WEBSITE_INSTANCE_ID"];
            }
            catch
            {
            }

            #endregion
        }
    }
}
