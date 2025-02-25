using Common.ServerGrouping;
using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Payment;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class PaymentsService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public PaymentsService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<DataEnvelope<PaymentTransaction>> GetCustomerPayments(GetPaymentTransactionsByCustomerQuery query)
        {
            // Helper class is used to transport JSON string to API, so we can control deserialization
            var helper = new JSONStringHelper() { JSONString = JsonSerializer.Serialize(query) };
            var content = JsonSerializer.Serialize(helper);

            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/paymentTransaction/listByCustomer";
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Accept", "*/*");
            request.Content = new StringContent(content, Encoding.UTF8, "application/json");

            var response = await HttpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<DataEnvelope<PaymentTransaction>>(
                    responseString,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );

                return data;
            }

            throw new Exception($"The service returned with status {response.StatusCode}");
        }

        public async Task<PaymentTransaction> GetPaymentTransaction(string transactionId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/paymentTransaction/id?id={transactionId}";
            var response = await HttpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                if (!string.IsNullOrWhiteSpace(responseContent))
                {
                    return JsonSerializer.Deserialize<PaymentTransaction>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }

                return new PaymentTransaction
                {
                    Description = response.StatusCode.ToString(),
                };
            }

            throw new Exception($"The service returned with status {response.StatusCode}");
        }
    }
}
