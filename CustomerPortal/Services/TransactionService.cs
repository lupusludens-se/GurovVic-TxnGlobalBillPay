using Common.ServerGrouping;
using CustomerPortal.Common.Constants;
using CustomerPortal.Common.Methods;
using CustomerPortal.Common.Settings;
using CustomerPortal.Models.BlueSnap.Transaction;
using CustomerPortal.Models.Transaction;
using CustomerPortal.Services.Processors.BlueSnap;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Telerik.DataSource;

namespace CustomerPortal.Services
{
    public class TransactionService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }
        private IHttpClientFactory HttpClientFactory { get; }

        public TransactionService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
            HttpClientFactory = httpClientFactory;
        }

        public async Task<CompletedTransaction> GetCompletedTransactionAsync(string transactionId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/transaction/completed?transactionId={transactionId}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.GetAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            var responseObject = new CompletedTransaction();
            if (response.StatusCode == HttpStatusCode.OK)
            {
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                return json.ToObject<CompletedTransaction>();
            }
                
            responseObject.description = response.StatusCode.ToString();
            return responseObject;
        }

        public async Task<PendingTransactions> GetCustomerTransactions(string customerId, int count = 20, string continuationToken = null)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/transaction/pending/listByCustomer?cardHolderId={customerId}&pagesize={count.ToString()}";
            HttpClient.DefaultRequestHeaders.Remove("ContinuationToken");

            if (continuationToken != null)
            {
                HttpClient.DefaultRequestHeaders.Add("ContinuationToken", continuationToken);
            }

            var response = await HttpClient.GetAsync(url);

            var responseObject = new PendingTransactions();
            try
            {
                if (response.IsSuccessStatusCode == true)
                {
                    string content = await response.Content.ReadAsStringAsync();
                    var json = JObject.Parse(content);
                    responseObject = json.ToObject<PendingTransactions>();

                    var jarr = (JArray)json["pendingTransactions"];
                    var transactionList = new List<PendingTransaction>();

                    if (jarr != null)
                    {
                        foreach (var item in jarr)
                        {
                            string js = item.ToString();
                            var transaction = JsonConvert.DeserializeObject<PendingTransaction>(js);
                            var cultureInfo = CultureInfoUtils.GetCultureInfo(transaction.currency);
                            transaction.currencySymbol = cultureInfo.NumberFormat.CurrencySymbol;
                            transactionList.Add(transaction);
                        }
                    }

                    responseObject.Transactions = transactionList;
                }
            }
            catch (Exception exc)
            {
                Console.WriteLine(exc.Message);
            }

            return responseObject;
        }

        public async Task<List<CompletedTransaction>> GetCompleteCustomerTransactions(string customerId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/transaction/customer" +
                "?customerId=" + customerId + "&pageSize=1000";

            var response = await HttpClient.GetAsync(url);

            var content = await response.Content.ReadAsStringAsync();
            var completedTransactionsResult = new List<CompletedTransaction>();
            if (content != string.Empty)
            {
                var completedTransactions = JsonConvert.DeserializeObject<CompletedTransactions>(content);
                if (completedTransactions.count > 0)
                {
                    var jobj = JObject.Parse(content);
                    var jarr = (JArray)jobj["transactions"];

                    foreach (var item in jarr)
                    {
                        string js = item.ToString();
                        var completedTransaction = JsonConvert.DeserializeObject<CompletedTransaction>(js);                      
                        var cultureInfo= CultureInfoUtils.GetCultureInfo(completedTransaction.Currency);
                        completedTransaction.CurrencySymbol = cultureInfo.NumberFormat.CurrencySymbol;
                        completedTransactionsResult.Add(completedTransaction);
                    }
                }
            }

            // Converting UTC time to Local Time
            foreach (var transaction in completedTransactionsResult)
            {
                var convertTime = transaction.CreatedDate;
                convertTime = convertTime.ToLocalTime();
                transaction.CreatedDate = convertTime;
            }

            return completedTransactionsResult;
        }

        public async Task<DataEnvelope<CompletedTransaction>> GetCompleteCustomerTransactions(GetCompletedTransactionListQuery query)
        {
            //helper class is used to transport JSON string to API, so we can control deserialization
            JSONStringHelper helper = new JSONStringHelper() { JSONString = System.Text.Json.JsonSerializer.Serialize(query) };
            var content = System.Text.Json.JsonSerializer.Serialize(helper);

            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/completed-transactions/list";
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Accept", "*/*");
            request.Content = new StringContent(content, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await HttpClient.SendAsync(request);

            #region Parse Results
            try
            {
                if (response.IsSuccessStatusCode == true)
                {
                    string responseString = await response.Content.ReadAsStringAsync();
                    DataEnvelope<CompletedTransaction> data = System.Text.Json.JsonSerializer.Deserialize<DataEnvelope<CompletedTransaction>>(
                        responseString,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );

                    return data;
                }
            }
            catch (Exception exc)
            {
                Console.WriteLine(exc.Message);
            }

            #endregion

            throw new Exception($"The service returned with status {response.StatusCode}");
        }

        public async Task<BankTransactionComplete> processBankNoComplete(BankAccountTransaction bankTransaction)
        {
            switch (bankTransaction.processorId)
            {
                case PaymentProcessor.BlueSnap:
                    var blueSnapService = new BlueSnapService(AppSettings, HttpClientFactory);
                    return await blueSnapService.CreateBankTransaction(bankTransaction);
            }

            return null;
        }

        public async Task<BankTransactionCompleteResponse> CompleteTransaction(BankTransactionComplete transactionComplete)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/transaction/pending/complete";
            var localjson = JsonConvert.SerializeObject(transactionComplete);
            var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");

            try
            {
                var response = await HttpClient.PostAsync(url, httpContent);
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                return json.ToObject<BankTransactionCompleteResponse>();
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            return new BankTransactionCompleteResponse();
        }

        public async Task<PaymentTransactionResponse> postPayment(PaymentTransactionRequest paymentTransaction)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/paymentTransaction/create";
            var localjson = JsonConvert.SerializeObject(paymentTransaction);
            var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");

            try
            {
                var response = await HttpClient.PostAsync(url, httpContent);

                string content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                return json.ToObject<PaymentTransactionResponse>();
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            return null;
        }
    }
}
