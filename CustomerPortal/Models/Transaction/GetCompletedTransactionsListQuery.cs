using Telerik.DataSource;

namespace CustomerPortal.Models.Transaction
{
    public class GetCompletedTransactionListQuery
    {
        public string CustomerId { get; set; } = string.Empty;
        public DataSourceRequest GridRequest { get; set; }
        public string OrigFilterValue { get; set; } = string.Empty;
    }
}
