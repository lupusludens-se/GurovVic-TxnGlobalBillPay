using System.Collections.Generic;

namespace CustomerPortal.Models.Transaction
{
    public class PendingTransactions
    {
        public List<PendingTransaction> Transactions { get; set; }
        public int Count { get; set; }
        public bool HasMoreResults { get; set; }
        public string ContinuationToken { get; set; }
    }
}
