using CustomerPortal.Common.Enums;
using CustomerPortal.Common.Settings;
using CustomerPortal.Models.BlueSnap.Error;
using CustomerPortal.Models.BlueSnap.Mandate;
using CustomerPortal.Models.BlueSnap.Token;
using CustomerPortal.Models.BlueSnap.Transaction;
using CustomerPortal.Models.ProcessorAssignment;
using CustomerPortal.Models.Token;
using CustomerPortal.Models.Transaction;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace CustomerPortal.Services.Processors.BlueSnap
{
    public class BlueSnapService
    {
        private CredentialService CredentialService { get; }
        private IHttpClientFactory HttpClientFactory { get; }

        /// <summary>
        /// Blue Snap Service Constructor
        /// </summary>
        public BlueSnapService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            CredentialService = new CredentialService(appSettings, httpClientFactory);
            HttpClientFactory = httpClientFactory;
        }

        #region Mandate

        /// <summary>
        /// Get SEPA Mandate text from Blue Snap
        /// </summary>
        public async Task<SEPAMandate> GetSEPAMandate()
        {
            var credResponse = await CredentialService.GetProcessorAssignment("ach");
            var assignmentResponse = JsonConvert.DeserializeObject<ProcessorAssignmentResponse>(credResponse);

            var clearBytes = Encoding.ASCII.GetBytes($"{assignmentResponse.UserName}:{assignmentResponse.Password}");
            var base64Text = Convert.ToBase64String(clearBytes);
            var httpClient = HttpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Text);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var requestUri = assignmentResponse.URL.EndsWith("/")
                ? $"{assignmentResponse.URL}translations/sepa/mandate?language=en"
                : $"{assignmentResponse.URL}/translations/sepa/mandate?language=en";

            try
            {
                var response = await httpClient.GetAsync(requestUri);
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                return json.ToObject<SEPAMandate>();
            }
            catch (Exception ex) 
            {
                Console.WriteLine($"Error making request for SEPA Mandate: {ex.Message}");
            }

            return null;
        }

        /// <summary>
        /// Get BECS Mandate text from Blue Snap
        /// </summary>
        public async Task<BECSMandate> GetBECSMandate(string country, bool oneTime = false)
        {
            var credResponse = await CredentialService.GetProcessorAssignment("ach");
            var assignmentResponse = JsonConvert.DeserializeObject<ProcessorAssignmentResponse>(credResponse);

            var clearBytes = Encoding.ASCII.GetBytes($"{assignmentResponse.UserName}:{assignmentResponse.Password}");
            var base64Text = Convert.ToBase64String(clearBytes);
            var httpClient = HttpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Text);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var type = oneTime ? "onetime" : "ondemand";
            var requestUri = assignmentResponse.URL.EndsWith("/")
               ? $"{assignmentResponse.URL}agreements/debit/{country}/{type}"
               : $"{assignmentResponse.URL}/agreements/debit/{country}/{type}";

            try
            {
                var response = await httpClient.PostAsync(requestUri, null);
                var content = await response.Content.ReadAsStringAsync();
                var decoded = HttpUtility.HtmlDecode(content);
                return JsonConvert.DeserializeObject<BECSMandate>(decoded);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error making request for BECS Mandate: {ex.Message}");
            }

            return null;
        }

        #endregion

        #region Bank Token

        /// <summary>
        /// Submits account details to Blue Snap to create a vaulted shopper
        /// Returns a filled out bank account token to save for our records
        /// </summary>
        public async Task<BankAccountToken> SubmitVaultedShopper(BankAccountTokenCreate bankAccountTokenCreate)
        {
            try
            {
                var response = await CreateVaultedShopper(bankAccountTokenCreate);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var vaultedShopperResponse = JsonConvert.DeserializeObject<VaultedShopperResponse>(responseContent);

                    return new BankAccountToken
                    {
                        accountNumber = bankAccountTokenCreate.accountNumber,
                        routingNumber = bankAccountTokenCreate.routingNumber,
                        customerId = bankAccountTokenCreate.customerId,
                        currency = bankAccountTokenCreate.currency,
                        processorId = bankAccountTokenCreate.processorId,
                        merchantId = bankAccountTokenCreate.merchantId,
                        iBan = bankAccountTokenCreate.iBan,
                        bankAccountType = bankAccountTokenCreate.bankAccountType,
                        country = bankAccountTokenCreate.country,
                        paymentProfileId = vaultedShopperResponse.vaultedShopperId.ToString(),
                        accountType = bankAccountTokenCreate.AccountType.ToString(),
                        bsbNumber = bankAccountTokenCreate.bsbNumber,
                        branchName = bankAccountTokenCreate.branchName,
                        agreementId = bankAccountTokenCreate.agreementId,
                        financialInstitution = bankAccountTokenCreate.financialInstituation,
                        accountName = bankAccountTokenCreate.accountName,
                        isSuccess = true,
                        customerName = bankAccountTokenCreate.companyName,
                    };
                }
                else
                {
                    var error = JsonConvert.DeserializeObject<Error>(responseContent);

                    var errorMessage = "An error occured when submitting account details. Please review and try again.";
                    Console.Write(errorMessage);

                    // Replace error message with detailed error description if one is provided in the response
                    var errorDescription = error.message.FirstOrDefault(m => m.code != null);
                    if (errorDescription != null)
                    {
                        errorMessage = errorDescription.description;
                        Console.Write(errorMessage);
                    }

                    return new BankAccountToken
                    {
                        Message = errorMessage,
                    };
                }
            }
            catch (Exception ex)
            {
                Console.Write(ex.InnerException);
                return new BankAccountToken
                {
                    Message = ex.Message,
                };
            }
        }

        /// <summary>
        /// Create vaulted shopper request
        /// </summary>
        private async Task<HttpResponseMessage> CreateVaultedShopper(BankAccountTokenCreate bankAccountTokenCreate)
        {
            var credResponse = await CredentialService.GetProcessorAssignment("ach");
            var assignmentResponse = JsonConvert.DeserializeObject<ProcessorAssignmentResponse>(credResponse);

            var clearBytes = Encoding.ASCII.GetBytes($"{assignmentResponse.UserName}:{assignmentResponse.Password}");
            var base64Text = Convert.ToBase64String(clearBytes);
            var httpClient = HttpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Text);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var requestUri = assignmentResponse.URL.EndsWith("/") 
                ? $"{assignmentResponse.URL}vaulted-shoppers" 
                : $"{assignmentResponse.URL}/vaulted-shoppers";

            var requestContent = new StringContent(bankAccountTokenCreate.JSON, Encoding.UTF8, "application/json");
            return await httpClient.PostAsync(requestUri, requestContent);
        }

        #endregion

        #region Transaction

        /// <summary>
        /// Create and process bank transaction
        /// </summary>
        public async Task<BankTransactionComplete> CreateBankTransaction(BankAccountTransaction bankAccountTransaction)
        {
            try
            {
                var response = await ProcessBankTransactionAsync(bankAccountTransaction);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var bankTransactionResponse = JsonConvert.DeserializeObject<BankTransactionResponse>(responseContent);
                    var isPending = bankTransactionResponse.processingInfo.processingStatus == "PENDING";

                    return new BankTransactionComplete
                    {
                        transactionId = bankAccountTransaction.transactionId,
                        transactionType = BankTransactionType.Authorization,
                        processorReferenceId = bankTransactionResponse.transactionId.ToString(),
                        paymentProfileId = bankTransactionResponse.vaultedShopperId.ToString(),
                        isSuccess = isPending,
                        error = isPending ? null : bankTransactionResponse.processingInfo.processingStatus,
                        paymentStatus = isPending ? PaymentStatus.Pending : PaymentStatus.None,
                        completionMethod = CompletionMethod.Bank,
                        bankAccount = isPending ? bankAccountTransaction.account : null,
                        sepaDirectDebitTransaction = bankTransactionResponse.sepaDirectDebitTransaction,
                    };
                }
                else
                {
                    var error = JsonConvert.DeserializeObject<Error>(responseContent);
                    var errorMessage = error.message.Any()
                            ? error.message.First().description
                            : "An error occured submitting payment information";

                    Console.Write(errorMessage);
                    return new BankTransactionComplete
                    {
                        isSuccess = false,
                        error = errorMessage,
                    };
                }
            }
            catch (Exception ex)
            {
                Console.Write(ex.InnerException);
                return new BankTransactionComplete
                {
                    isSuccess = false,
                    error = ex.Message
                };
            }
        }

        /// <summary>
        /// Process bank transaction
        /// </summary>
        private async Task<HttpResponseMessage> ProcessBankTransactionAsync(BankAccountTransaction bankAccountTransaction)
        {
            var credResponse = await CredentialService.GetProcessorAssignment("ach");
            var assignmentResponse = JsonConvert.DeserializeObject<ProcessorAssignmentResponse>(credResponse);

            var clearBytes = Encoding.ASCII.GetBytes($"{assignmentResponse.UserName}:{assignmentResponse.Password}");
            var base64Text = Convert.ToBase64String(clearBytes);
            var httpClient = HttpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", base64Text);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var requestUri = assignmentResponse.URL.EndsWith("/")
                ? $"{assignmentResponse.URL}alt-transactions"
                : $"{assignmentResponse.URL}/alt-transactions";

            var requestContent = new StringContent(bankAccountTransaction.JSON, Encoding.UTF8, "application/json");
            return await httpClient.PostAsync(requestUri, requestContent);
        }

        #endregion
    }
}
