using System;
using System.Collections.Generic;

namespace CustomerPortal.Models.Customer
{
    public class CustomerBase
    {
        public string id { get; set; }
        public string accountEmail { get; set; }
        public string accountPhone { get; set; }
        public string accountCountryCode { get; set; }
        public string paymentEmail { get; set; }
        public string paymentPhone { get; set; }
        public DateTime lasActiveDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string fullName { get; set; }

        public string contactType { get; set; }
        public bool cardDisabled { get; set; }
        public bool bankDisabled { get; set; }
        public bool acceptedTermsConditions { get; set; }
        public string acceptedTermsConditionsId { get; set; }
        public string acceptedTermsConditionsDate { get; set; }
        public string billingCountry { get; set; }
        public string languageId { get; set; }
        public string sharedCustomerId { get; set; }
        public List<CustomerCategoryFilterEntity> filterCategoryList { get; set; }

        public bool RequirePassword { get; set; }
    }
}
