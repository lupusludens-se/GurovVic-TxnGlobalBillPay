using Telerik.DataSource;

namespace CustomerPortal.Models.Payment
{
    public class GetPaymentTransactionsByCustomerQuery
    {
        public string CardHolderId { get; set; }
        public DataSourceRequest GridRequest { get; set; }
    }
}
