using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Communication;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class CommunicationService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public CommunicationService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<EmailCommunicationResponse> CreateCommunicationEmail(CommunicationEmailRequest emailRequest)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/communication/email";
            var response = new HttpResponseMessage();

            try
            {
                var localjson = JsonConvert.SerializeObject(emailRequest);
                var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");

                response = await HttpClient.PostAsync(url, httpContent);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            var responseObject = json.ToObject<EmailCommunicationResponse>();

            return responseObject;
        }
    }
}
