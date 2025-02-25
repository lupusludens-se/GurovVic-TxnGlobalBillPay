using Microsoft.WindowsAzure.Storage.Table;
using System.Collections.Generic;

namespace CustomerPortal.Models.Transaction
{
    public class CompletedTransactions
    {
        public List<CompletedTransaction> completedTransactions { get; set; }
        public int count { get; set; }
        public bool hasMoreResults { get; set; }
        public TableContinuationToken continuationToken { get; set; }
    }
}
