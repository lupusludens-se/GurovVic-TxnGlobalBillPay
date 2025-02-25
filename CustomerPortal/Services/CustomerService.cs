using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Customer;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class CustomerService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public CustomerService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public async Task<CustomerBase> GetCustomerAsync(string customerId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/id?customerid={customerId}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.GetAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            var responseObject = json.ToObject<CustomerBase>();

            return responseObject;
        }

        public async Task<CustomerBase> GetCustomerEmailAsync(string email)
        {

            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/email?&email={email}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.GetAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            string content = await response.Content.ReadAsStringAsync();
            if (content != string.Empty)
            {
                var json = JObject.Parse(content);
                return json.ToObject<CustomerBase>();
            }

            return null;
        }

        public async Task<bool> UpdateCustomerPhone(string customerId, string phone)
        {
            var updatePhone = new CustomerUpdatePhone
            {
                accountPhone = phone,
                customerId = customerId
            };

            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/accountPhone";
            var response = new HttpResponseMessage();

            try
            {
                var localjson = JsonConvert.SerializeObject(updatePhone);
                var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");
                response = await HttpClient.PutAsync(url, httpContent);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            return response.StatusCode == HttpStatusCode.OK;
        }

        public async Task<bool> UpdateAccountEmail(string customerId, string email)
        {
            var updateEmail = new CustomerUpdateEmail
            {
                accountEmail = email,
                customerId = customerId,
            };

            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/accountEmail";
            var response = new HttpResponseMessage();

            try
            {
                var localjson = JsonConvert.SerializeObject(updateEmail);
                var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");

                response = await HttpClient.PutAsync(url, httpContent);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            return response.StatusCode == HttpStatusCode.OK;
        }

        public async Task<CustomerResponse> CreateCustomer(string email, string fullName = null)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/customer/create?accountemail={email}&fullname={fullName}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.PostAsync(url, null);
                Console.WriteLine("ClevDiv: Response received");

                if (response.StatusCode == HttpStatusCode.OK)
                {

                    var content = await response.Content.ReadAsStringAsync();
                    var json = JObject.Parse(content);

                    Console.WriteLine("ClevDiv: Response received");
                    return json.ToObject<CustomerResponse>();
                }
            }
            catch (Exception exc)
            {
                Console.WriteLine("ClevDiv: Customer add error");
                Console.WriteLine(exc.Message);
            }

            return new CustomerResponse();
        }
    }
}
