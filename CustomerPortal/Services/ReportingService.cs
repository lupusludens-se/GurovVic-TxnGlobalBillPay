using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Reporting;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class ReportingService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public ReportingService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<GetCustomerDashboardResponse> GetCustomerDashboard(string customerId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/dashboard?customerId={customerId}";

            var response = await HttpClient.GetAsync(url);
            var customerDashboard = new GetCustomerDashboardResponse();

            var content = await response.Content.ReadAsStringAsync();
            
            if (content != string.Empty)
            {
                customerDashboard = JsonConvert.DeserializeObject<GetCustomerDashboardResponse>(content);
            }

            return customerDashboard;
        }
    }
}
