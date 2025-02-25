using CustomerPortal.Common.Enums;
using CustomerPortal.Models.BlueSnap.Transaction;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace CustomerPortal.Models.Transaction
{
    public class BankAccountTransaction
    {
        public decimal amount { get; set; }
        public string transactionId { get; set; }
        public string paymentProfileId { get; set; }
        public string customerProfileId { get; set; }
        public string merchantId { get; set; }
        public int processorId { get; set; }
        public string customerId { get; set; }
        public string bankAccountType { get; set; }
        public string account { get; set; }
        public AccountType accountType { get; set; }
        public string routingNumber { get; set; }
        public string iBan { get; set; }
        public bool isSuccess { get; set; }
        public string error { get; set; }
        public string postalCode { get; set; }
        public string currency { get; set; }
        public string customerRef { get; set; }
        public string accountName { get; set; }
        public string vendorId { get; set; }
        public string countryRegionId { get; set; }
        public string bsbNumber { get; set; }
        public string agreementId { get; set; }
        public IEnumerable<VendorInfo> VendorsInfo { get; set; }

        public string JSON { get { return GetJson(); } }

        #region Private Helpers

        private string GetJson()
        {
            return accountType switch
            {
                AccountType.BECS => GetBecsJson(),
                AccountType.SEPA => GetSepaJson(),
                _ => throw new Exception("Unexpected account type"),
            };
        }

        /// <summary>
        /// Parse BECS transaction into JSON
        /// </summary>
        private string GetBecsJson()
        {
            var vendorInfos = new List<BlueSnap.Transaction.VendorInfo>();
            foreach (var info in VendorsInfo)
            {
                var vendorInfo = new BlueSnap.Transaction.VendorInfo
                {
                    vendorId = info.VendorID,
                    commissionAmount = info.Amount,
                };
                vendorInfos.Add(vendorInfo);
            }

            var vendorsInfo = new VendorsInfo
            {
                vendorInfo = vendorInfos,
            };

            var becsRequest = new BECSTransactionRequest
            {
                becsDirectDebitTransaction = new BECSDirectDebitTransaction(),
                amount = amount,
                currency = currency,
                vaultedShopperId = paymentProfileId,
                authorizedByShopper = true,
                vendorsInfo = vendorsInfo,
            };

            return JsonConvert.SerializeObject(becsRequest);
        }

        /// <summary>
        /// Parse SEPA transaction into JSON
        /// </summary>
        private string GetSepaJson()
        {
            var vendorInfos = new List<BlueSnap.Transaction.VendorInfo>();
            foreach (var info in VendorsInfo)
            {
                var vendorInfo = new BlueSnap.Transaction.VendorInfo
                {
                    vendorId = info.VendorID,
                    commissionAmount = info.Amount,
                };
                vendorInfos.Add(vendorInfo);
            }

            var vendorsInfo = new VendorsInfo
            {
                vendorInfo = vendorInfos,
            };

            var sepaRequest = new SEPARequest
            {
                sepaDirectDebitTransaction = new SEPADirectDebitTransactionRequest(),
                amount = amount,
                authorizedByShopper = true,
                currency = currency,
                vaultedShopperId = paymentProfileId,
                vendorsInfo = vendorsInfo,
            };

            return JsonConvert.SerializeObject(sepaRequest);
        }

        #endregion
    }
}
