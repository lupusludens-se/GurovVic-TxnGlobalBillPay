using CustomerPortal.Common.Enums;
using CustomerPortal.Models.BlueSnap.Token;
using Newtonsoft.Json;
using System;

namespace CustomerPortal.Models.Token
{
    public class BankAccountTokenCreate
    {
        public string accountNumber { get; set; }
        public string routingNumber { get; set; }
        public string customerId { get; set; }
        public string merchantId { get; set; }
        public int processorId { get; set; }
        public string accountType { get; set; }
        public string iBan { get; set; }
        public string bankAccountType { get; set; }
        public string country { get; set; }
        public string currency { get; set; }
        public string swift { get; set; }
        public string tokenId { get; set; }
        public string paymentProfileId { get; set; }
        public string zip { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string companyName { get; set; }
        public string bsbNumber { get; set; }
        public string financialInstituation { get; set; }
        public string accountName { get; set; }
        public string branchName { get; set; }
        public string agreementId { get; set; }

        public AccountType AccountType { get { return GetAccountType(); } }
        public string JSON { get { return GetJSON(); } }

        #region Private Helpers

        private string GetJSON()
        {
            return AccountType switch
            {
                AccountType.BECS => GetBecsJson(),
                AccountType.SEPA => GetSepaJson(),
                _ => throw new Exception("Unexpected account type"),
            };
        }

        private AccountType GetAccountType()
        {
            if (!string.IsNullOrWhiteSpace(iBan))
            {
                return AccountType.SEPA;
            }
            
            if(!string.IsNullOrWhiteSpace(bsbNumber))
            {
                return AccountType.BECS;
            }

            throw new Exception("Unexpected account type");
        }

        /// <summary>
        /// Parse BECS account token into JSON
        /// </summary>
        private string GetBecsJson()
        {
            var becs = new BecsDirectDebit
            {
                accountName = accountName,
                accountNumber = accountNumber,
                agreementId = Convert.ToInt32(agreementId),
                branchName = branchName,
                bsbNumber = bsbNumber,
                financialInstitution = financialInstituation
            };

            var becsInfo = new BecsDirectDebitInfo[]
            {
                new() { becsDirectDebit = becs }
            };

            var paymentSources = new BecsPaymentSources
            {
                becsDirectDebitInfo = becsInfo
            };

            var becsRequest = new BecsRequest
            {
                country = country,
                paymentSources = paymentSources,
                zip = zip,
                firstName = firstName,
                lastName = lastName,
                shopperCurrency = currency
            };

            return JsonConvert.SerializeObject(becsRequest);
        }

        /// <summary>
        /// Parse SEPA account token into JSON
        /// </summary>
        private string GetSepaJson()
        {
            var sepa = new SepaDirectDebit
            {
                iban = iBan
            };

            var sepaInfo = new SepaDirectDebitInfo[]
            {
                new() { sepaDirectDebit = sepa }
            };

            var paymentSources = new SepaPaymentSources
            {
                sepaDirectDebitInfo = sepaInfo
            };

            var sepaRequest = new SepaRequest
            {
                country = country,
                paymentSources = paymentSources,
                zip = zip,
                firstName = firstName,
                lastName = lastName,
                companyName = companyName,
                shopperCurrency = currency
            };

            return JsonConvert.SerializeObject(sepaRequest);
        }

        #endregion
    }
}
