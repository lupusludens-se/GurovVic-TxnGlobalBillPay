using CustomerPortal.Common.Constants;
using CustomerPortal.Common.Enums;
using CustomerPortal.Common.Settings;
using CustomerPortal.Models.Token;
using CustomerPortal.Services.Processors.BlueSnap;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CustomerPortal.Services
{
    public class TokenService
    {
        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }
        private IHttpClientFactory HttpClientFactory { get; }
        private ILogger<TokenService> Logger { get; }

        public TokenService(
            IApplicationSettings appSettings,
            IHttpClientFactory httpClientFactory,
            ILogger<TokenService> logger
            )
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
            HttpClientFactory = httpClientFactory;
            Logger = logger;
        }

        public async Task<TokenResponse> DeleteBankToken(string customerId, string tokenId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/bankingtoken/delete?customerId={customerId}&bankingTokenId={tokenId}";
            var response = new HttpResponseMessage();

            try
            {
                response = await HttpClient.DeleteAsync(url);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            return json.ToObject<TokenResponse>();
        }

        public async Task<TokenResponse> CreateBankToken(BankAccountToken tokenRequest)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/bankingtoken/store";
            var response = new HttpResponseMessage();

            try
            {
                var localjson = JsonConvert.SerializeObject(tokenRequest);
                var httpContent = new StringContent(localjson, Encoding.UTF8, "application/json");

                response = await HttpClient.PostAsync(url, httpContent);
            }
            catch (Exception exc)
            {
                Console.Write(exc.Message);
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            return json.ToObject<TokenResponse>();
        }

        public async Task<BankAccountTokens> GetCustomerBankTokens(string customerId)
        {
            var url = $"{AppSettings.GlobalBillPayService.ApiUrl}/bankingtoken/customer/{customerId}";
            var response = await HttpClient.GetAsync(url);
            var responseObject = new BankAccountTokens();

            try
            {
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                var bankingTokensJson = (JArray)json["bankingTokens"];
                responseObject = json.ToObject<BankAccountTokens>();
                var bankAccountTokens = new List<BankAccountToken>();

                foreach (var tokenJson in bankingTokensJson)
                {
                    var bankingTokenJson = tokenJson.ToString();
                    var bankAccountToken = JsonConvert.DeserializeObject<BankAccountToken>(bankingTokenJson);
                    bankAccountTokens.Add(bankAccountToken);
                }

                responseObject.tokens = bankAccountTokens;
            }
            catch (Exception exc)
            {
                Console.WriteLine(exc.Message);
            }

            return responseObject;
        }

        /// <summary>
        /// Registers an account with the specified payment processor
        /// Creates a bank token to reference the third party account for our records
        /// </summary>
        public async Task<BankAccountToken> SubmitBankToken(BankAccountTokenCreate bankAccountTokenCreate)
        {
            var bankAccountToken = new BankAccountToken();
            var tokenAvailable = false;

            Logger.LogInformation($"Tokenizing for processor ID: {bankAccountTokenCreate.processorId}");

            switch (bankAccountTokenCreate.processorId)
            {
                case PaymentProcessor.BlueSnap:
                    {
                        var blueSnapService = new BlueSnapService(AppSettings, HttpClientFactory);
                        bankAccountToken = await blueSnapService.SubmitVaultedShopper(bankAccountTokenCreate);
                        tokenAvailable = true;
                        break;
                    }
            }

            if (!bankAccountToken.isSuccess || !tokenAvailable)
            {
                Logger.LogWarning($"Failed to create bank token for processor ID: {bankAccountTokenCreate.processorId}");
                return bankAccountToken;
            }

            if (bankAccountTokenCreate.bankAccountType == "CONSUMER_CHECKING" || bankAccountTokenCreate.bankAccountType == "CONSUMER_SAVINGS")
            {
                bankAccountToken.customerName = $"{bankAccountTokenCreate.firstName} {bankAccountTokenCreate.lastName}";
            }
            else
            {
                bankAccountToken.customerName = bankAccountTokenCreate.companyName;
            }

            bankAccountToken.id ??= Guid.NewGuid().ToString();
            bankAccountToken.paymentProfileId ??= Guid.NewGuid().ToString();

            Console.WriteLine("Sending token to API");
            await CreateBankToken(bankAccountToken);

            return bankAccountToken;
        }

        public async Task<PreDebitAgreement> GetMandate(int processor, AccountType accountType, string countryId = null, bool oneTime = false)
        {
            if (PaymentProcessor.BlueSnap != processor)
            {
                Console.WriteLine($"Invalid processor selected for retrieving mandate. Processor ID: {processor}");
                return null;
            }

            switch (accountType)
            {
                case AccountType.BECS:
                    {
                        var blueSnapService = new BlueSnapService(AppSettings, HttpClientFactory);
                        var mandate = await blueSnapService.GetBECSMandate(countryId);
                        return new PreDebitAgreement { AgreementID = mandate?.agreementId.ToString(), AgreementText = mandate?.agreementText };
                    }
                case AccountType.SEPA:
                    {
                        var blueSnapService = new BlueSnapService(AppSettings, HttpClientFactory);
                        var mandate = await blueSnapService.GetSEPAMandate();
                        return new PreDebitAgreement { AgreementText = mandate?.translations?.FirstOrDefault()?.translationText };
                    }
                default:
                    {
                        Console.WriteLine($"Invalid account type selected for retrieving mandate. Account Type: {accountType}");
                        return null;
                    }
            }
        }
    }
}
