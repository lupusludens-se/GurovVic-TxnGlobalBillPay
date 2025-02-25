using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Credential;
using CustomerPortal.Models.ProcessorAssignment;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class CredentialService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public CredentialService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<string> GetProcessorAssignment(string type)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/processor-assignments/get";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.GetAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            if (response.StatusCode == HttpStatusCode.OK)
            {
                var content = await response.Content.ReadAsStringAsync();
                var processorResponse = JsonConvert.DeserializeObject<ProcessorAssignments>(content);

                switch (type)
                {
                    case "ach":
                        return processorResponse.ACH.Credentials;
                }
            }
                
            return string.Empty;
        }

        public async Task<string> GetSettingAsync(string name)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/settings/get/{name}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.GetAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            if (response.StatusCode == HttpStatusCode.OK)
            {
                var content = await response.Content.ReadAsStringAsync();
                var credential = JsonConvert.DeserializeObject<CredentialResponse>(content);
                return credential?.value;
            }
                
            return string.Empty;
        }
    }
}
