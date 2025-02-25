using CustomerPortal.Common.Settings;
using CustomerPortal.Models.ProcessorAssignment;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class ProcessorAssignmentsService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public ProcessorAssignmentsService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<ProcessorAssignments> GetProcessorAssignments()
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/processor-assignments/get";
            var response = await HttpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProcessorAssignments>(content);
        }
    }
}
